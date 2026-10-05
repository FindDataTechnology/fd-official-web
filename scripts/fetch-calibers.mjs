// Build-time export of the indicator-caliber aggregates ("calibers") from the
// fd-find-data-business-mcp `registry_coverage` tool into
// src/data/calibers.json, for the /data page's three-caliber band.
//
// registry_coverage (task group 1 of indicator-caliber-unification) returns a
// top-level `calibers` key next to its per-source rows:
//   { results, count, census_as_of,
//     calibers: { registered_total, verified_total, servable_total, notes } }
// The numbers move with the registry — they are never hardcoded here; this
// script only validates the shape and persists what the tool returned.
//
// Truthful degradation: on ANY failure (no token, gateway unreachable, auth,
// missing/shape-broken `calibers`) this writes calibers: null and exits 0, so
// the page renders "unknown" instead of a stale or invented number. Unlike
// indicators.json there is deliberately NO last-good fallback for calibers —
// an old total presented as current would be exactly the lie this change
// removes. The committed file only exists so a fresh checkout builds.
//
// Speaks MCP JSON-RPC over HTTP (same handshake as scripts/fetch-indicators.mjs;
// gateway routes are Logto-gated — see docs/SERVICE-CATALOG.md).
//
// Env:
//   FD_CALIBERS_MCP_URL    default https://mcp.finddatatech.cloud/fd-find-data-business-mcp
//                          (/mcp suffix appended when missing)
//   FD_CALIBERS_MCP_TOKEN  bearer token for the gateway (required for live export)
import { mkdir, writeFile } from 'node:fs/promises';
import { normalizeCalibers } from './data-module-utils.mjs';

const OUT = new URL('../src/data/calibers.json', import.meta.url);
// Gateway path requires a per-user Logto JWT (168h cap) — unusable for the
// unattended 6h cron. The business-mcp service lane (FDBIZ_INTERNAL_TOKEN,
// same credential fd-open-data-mcp's federation already uses) is static.
const BASE_URL = process.env.FD_CALIBERS_MCP_URL ?? 'http://106.55.20.23:30803';
const MCP_URL = BASE_URL.endsWith('/mcp') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/mcp`;
const TOKEN = process.env.FD_CALIBERS_MCP_TOKEN ?? '';

async function writeSnapshot(source, calibers, error) {
  await mkdir(new URL('./', OUT), { recursive: true });
  await writeFile(
    OUT,
    `${JSON.stringify({ generated_at: new Date().toISOString(), source, calibers, ...(error ? { error } : {}) }, null, 2)}\n`,
  );
}

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

// fastmcp serves dict returns as structuredContent (lists get wrapped in
// {result: [...]}) and always mirrors them as JSON text in content[0].text.
function extractToolPayload(result) {
  const sc = result?.structuredContent;
  if (sc && typeof sc === 'object' && !Array.isArray(sc)) {
    if (sc.calibers !== undefined || sc.results !== undefined) return sc;
    const inner = sc.result;
    if (inner && typeof inner === 'object' && !Array.isArray(inner) && (inner.calibers !== undefined || inner.results !== undefined)) {
      return inner;
    }
  }
  const text = result?.content?.find((c) => c.type === 'text')?.text;
  if (text == null) throw new Error('registry_coverage: no text or structured content');
  return JSON.parse(text);
}

// All three aggregates must be present, finite and non-negative — a partial or
// malformed body is treated as "authority unreachable", not partially trusted.
// (Shape rule lives in data-module-utils.normalizeCalibers, shared with the
// snapshot builder.)

async function fetchCalibers() {
  const init = await mcpRequest(null, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'fd-web-calibers-export', version: '1.0.0' },
    },
  });
  const sessionId = init.sessionId;
  await mcpRequest(sessionId, { jsonrpc: '2.0', method: 'notifications/initialized' });

  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const call = await mcpRequest(sessionId, {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'registry_coverage', arguments: {} },
      });
      const result = call.json.result ?? call.json;
      if (result?.isError) throw new Error(result.content?.[0]?.text ?? 'registry_coverage tool error');
      const calibers = normalizeCalibers(extractToolPayload(result)?.calibers);
      if (!calibers) throw new Error('registry_coverage returned no usable calibers aggregate');
      return calibers;
    } catch (err) {
      lastErr = err;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

try {
  if (!TOKEN) throw new Error('FD_CALIBERS_MCP_TOKEN unset');
  const calibers = await fetchCalibers();
  await writeSnapshot('mcp', calibers);
  console.log(
    `[calibers] registered=${calibers.registered_total} verified=${calibers.verified_total} servable=${calibers.servable_total} → src/data/calibers.json`,
  );
} catch (err) {
  console.warn(`[calibers] registry_coverage unavailable (${err.message}); writing calibers: null`);
  await writeSnapshot('unavailable', null, err.message);
}
