// Build-time export of the fd-open-data-mcp indicator catalog ("concepts")
// into src/data/indicators.json for the /indicators pages.
//
// Speaks MCP JSON-RPC over HTTP (same handshake as server/demo-proxy.mjs),
// calls list_concepts per entity type to bypass the server-side 500-row cap,
// and enriches entries with a best-effort sample series (capped, per design).
//
// Falls back gracefully: on network error, missing token, or empty result it
// logs a warning and exits 0 WITHOUT touching the existing committed snapshot
// (same policy as scripts/fetch-repos.mjs), so `astro build` never breaks.
//
// Env:
//   FD_INDICATORS_MCP_URL        default https://www.finddatatech.cloud/mcp
//   FD_INDICATORS_MCP_TOKEN      bearer token (required for live export)
//   FD_INDICATORS_SAMPLE_MAX     max concepts to enrich with a sample series (default 40, 0 disables)
//   FD_INDICATORS_ENTITY_TYPES   comma-separated extra entity types to query
import { mkdir, writeFile, access } from 'node:fs/promises';

const OUT = new URL('../src/data/indicators.json', import.meta.url);
const MCP_URL = process.env.FD_INDICATORS_MCP_URL ?? 'https://www.finddatatech.cloud/mcp';
const TOKEN = process.env.FD_INDICATORS_MCP_TOKEN ?? '';
const SAMPLE_MAX = Number(process.env.FD_INDICATORS_SAMPLE_MAX ?? 40);
const ENTITY_TYPES = [
  'country',
  'city',
  'stock',
  'symbol',
  'industry',
  'fund',
  'person',
  ...(process.env.FD_INDICATORS_ENTITY_TYPES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
];

const KEEP = ['id', 'code', 'name_en', 'name_zh', 'category', 'unit', 'measure', 'frequency', 'entity_type', 'source'];

async function mcpRequest(sessionId, body) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${TOKEN}`,
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${text.slice(0, 200)}`);
  const ct = res.headers.get('content-type') ?? '';
  const session = res.headers.get('mcp-session-id');
  if (ct.includes('text/event-stream')) {
    const data = text
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('');
    return { json: JSON.parse(data || '{}'), sessionId: session };
  }
  return { json: JSON.parse(text || '{}'), sessionId: session };
}

async function callTool(sessionId, name, args) {
  const call = await mcpRequest(sessionId, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name, arguments: args },
  });
  const result = call.json.result ?? call.json;
  if (result?.isError) throw new Error(result.content?.[0]?.text ?? 'MCP tool error');
  const text = result?.content?.find((c) => c.type === 'text')?.text;
  if (text == null) throw new Error(`tool ${name}: no text content`);
  return JSON.parse(text);
}

// Frequency → spacing between sample dates (ms). Daily/weekly fall back to 7d
// so a window of dates stays small; read() is read-through cache first.
function dateWindow(frequency, count = 12) {
  const stepMs =
    { yearly: 365, quarterly: 91, monthly: 30, weekly: 7, daily: 7, irregular: 30, unknown: 30 }[frequency] ?? 30;
  const days = stepMs;
  const out = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    out.push(new Date(now - i * days * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

function normalizeObservations(rows) {
  const points = [];
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    const d = r.date ?? r.datetime ?? r.ds ?? r.day;
    const v = r.value ?? r.val ?? r.close ?? r.price;
    if (d == null || v == null) continue;
    points.push([String(d).slice(0, 10), String(v)]);
  }
  points.sort((a, b) => a[0].localeCompare(b[0]));
  return points.slice(-100);
}

async function main() {
  if (!TOKEN) {
    console.warn('[indicators] FD_INDICATORS_MCP_TOKEN unset; keeping existing indicators.json');
    return;
  }

  // 1. Initialize a session (same handshake as demo-proxy).
  const init = await mcpRequest(null, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'fd-web-indicators-export', version: '1.0.0' },
    },
  });
  const sessionId = init.sessionId;
  await mcpRequest(sessionId, { jsonrpc: '2.0', method: 'notifications/initialized' });

  // 2. list_concepts: one unfiltered call + one per entity type, merged by id
  //    (the server caps each call at 500 rows).
  const byId = new Map();
  const batches = await Promise.all(
    [null, ...ENTITY_TYPES].map((et) =>
      callTool(sessionId, 'list_concepts', et ? { entity_type: et } : {}).catch(() => null),
    ),
  );
  for (const batch of batches) {
    if (!Array.isArray(batch)) continue;
    for (const c of batch) if (c?.id != null) byId.set(c.id, c);
  }
  if (byId.size === 0) throw new Error('list_concepts returned no concepts');

  let concepts = [...byId.values()].map((c) => Object.fromEntries(KEEP.map((k) => [k, c[k] ?? null])));
  concepts.sort((a, b) => (a.entity_type ?? '').localeCompare(b.entity_type ?? '') || (a.code ?? '').localeCompare(b.code ?? ''));

  // 3. Best-effort sample enrichment: one representative entity per concept,
  //    capped; abort after 5 consecutive failures (read() may hit live sources).
  let enriched = 0;
  let failures = 0;
  for (const c of concepts) {
    if (SAMPLE_MAX <= 0 || enriched >= SAMPLE_MAX || failures >= 5) break;
    try {
      const entities = await callTool(sessionId, 'list_entities', { entity_type: c.entity_type, limit: 1 });
      const entity = Array.isArray(entities) ? entities[0] : null;
      if (!entity?.id) throw new Error('no entity');
      const rows = await callTool(sessionId, 'read', {
        concept_id: c.id,
        entity_type: c.entity_type,
        entity_id: entity.id,
        dates: dateWindow(c.frequency),
      });
      const points = normalizeObservations(rows);
      if (!points.length) throw new Error('no points');
      c.sample = { entity: entity.code ?? entity.name_en ?? String(entity.id), points };
      c.coverage = { rows: points.length, latest_date: points[points.length - 1][0] };
      enriched++;
      failures = 0;
    } catch {
      failures++;
    }
  }

  // 4. Write (only on success — a flaky build keeps last-good data).
  const payload = {
    generated_at: new Date().toISOString(),
    source: 'mcp',
    concepts,
  };
  await mkdir(new URL('./', OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n');
  console.log(
    `[indicators] exported ${concepts.length} concepts (${enriched} with sample series) → src/data/indicators.json`,
  );
}

try {
  await main();
} catch (err) {
  console.warn(`[indicators] export failed (${err.message}); keeping existing indicators.json`);
  try {
    await access(OUT);
  } catch {
    // No snapshot exists at all — write a minimal empty one so the build works.
    await mkdir(new URL('./', OUT), { recursive: true });
    await writeFile(
      OUT,
      JSON.stringify({ generated_at: new Date().toISOString(), source: 'fallback', concepts: [] }, null, 2) + '\n',
    );
  }
}
