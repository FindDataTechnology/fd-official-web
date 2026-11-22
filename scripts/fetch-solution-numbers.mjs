#!/usr/bin/env node
// Build-time derivation of the numbers the solution package quotes
// (openspec: reanchor-solution-package, design D3).
//
// Why this exists: the package used to carry hand-written counts that went stale
// silently — 53 MCP tools when the live server had 87, 12 registered servers when
// the ledger said 29, 16 dashboards when the repo held 50. Hardcoded totals are
// wrong the day after they are written. So each number is now DERIVED and ships
// with an `as_of` + `source` next to it, and the page renders the as_of.
//
// Truthful degradation (same policy as scripts/fetch-calibers.mjs): when an
// authority is unreachable we write `null`, never the previous value. An old
// number presented as current is exactly the lie this change removes. The page
// then shows the threshold form ("500+") or "未知", never a stale exact count.
//
// Two of the keys come from committed snapshots (indicators.json /
// calibers.json) rather than the network, so `astro build` stays deterministic
// across environments; their as_of is the snapshot's own timestamp and the
// 90-day freshness gate below is what flags them when they rot.
//
// Env:
//   FD_SOLUTION_OPEN_DATA_URL   default http://chengsi.mesh.finddata.cn:30899/mcp
//   FD_SOLUTION_SHOWCASE_BASE   default https://wire.finddatatech.cloud
//   FD_SOLUTION_MAX_AGE_DAYS    freshness gate for derived entries (default 90)
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = new URL('../src/data/solution-numbers.json', import.meta.url);
const INDICATORS = new URL('../src/data/indicators.json', import.meta.url);
const CALIBERS = new URL('../src/data/calibers.json', import.meta.url);

const OPEN_DATA_URL = process.env.FD_SOLUTION_OPEN_DATA_URL ?? 'http://chengsi.mesh.finddata.cn:30899/mcp';
const SHOWCASE_BASE = (process.env.FD_SOLUTION_SHOWCASE_BASE ?? 'https://wire.finddatatech.cloud').replace(/\/+$/, '');
const MAX_AGE_DAYS = Number(process.env.FD_SOLUTION_MAX_AGE_DAYS ?? 90);

const now = () => new Date().toISOString();
const entry = (value, source, as_of) => ({ value, source, as_of: as_of ?? now() });

async function readJson(url, fallback = null) {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch {
    return fallback;
  }
}

// --- MCP JSON-RPC (same handshake as fetch-indicators.mjs) ------------------
async function mcpRequest(url, sessionId, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${text.slice(0, 120)}`);
  const session = res.headers.get('mcp-session-id') ?? sessionId;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('text/event-stream')) {
    const data = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('');
    return { json: JSON.parse(data || '{}'), session };
  }
  return { json: JSON.parse(text || '{}'), session };
}

async function countMcpTools(url) {
  const init = await mcpRequest(url, null, {
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'fd-web-solution-numbers', version: '1.0.0' } },
  });
  const sid = init.session;
  await mcpRequest(url, sid, { jsonrpc: '2.0', method: 'notifications/initialized' });
  const list = await mcpRequest(url, sid, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const tools = list.json?.result?.tools;
  if (!Array.isArray(tools) || tools.length === 0) throw new Error('tools/list returned no tools');
  return tools.length;
}

// --- derived entries -------------------------------------------------------
const numbers = {};

// Open-data ontology: concept count + distinct sources, from the committed
// indicator snapshot the /indicators pages already read. Deterministic across
// build environments; rot surfaces through the freshness gate.
const indicators = await readJson(INDICATORS);
if (indicators?.concepts?.length) {
  const asOf = indicators.generated_at;
  numbers.concepts = entry(indicators.active_concepts ?? indicators.concepts.length, 'src/data/indicators.json (active_concepts)', asOf);
  const sources = new Set(indicators.concepts.map((c) => c.source).filter(Boolean));
  numbers.sources = entry(sources.size, 'src/data/indicators.json (distinct concept sources)', asOf);
} else {
  numbers.concepts = entry(null, 'indicators.json missing', null);
  numbers.sources = entry(null, 'indicators.json missing', null);
}

// Unified indicator registry: the calibers snapshot already carries
// census_as_of; when the export ran without a token it holds null and we
// propagate the unknown rather than inventing a total.
const calibers = await readJson(CALIBERS);
const registered = calibers?.calibers?.registered_total;
numbers.registry_total = entry(
  Number.isFinite(registered) ? registered : null,
  registered != null ? 'src/data/calibers.json (registered_total)' : 'src/data/calibers.json (unavailable — export ran without FD_CALIBERS_MCP_TOKEN)',
  calibers?.generated_at ?? null,
);

// Live counts.
try {
  numbers.open_data_tools = entry(await countMcpTools(OPEN_DATA_URL), `${OPEN_DATA_URL} tools/list`);
} catch (err) {
  console.warn(`[solution-numbers] open-data tools unavailable (${err.message}) — writing null`);
  numbers.open_data_tools = entry(null, `${OPEN_DATA_URL} tools/list (unreachable)`, null);
}

try {
  const res = await fetch(`${SHOWCASE_BASE}/api/v1/showcase/dashboards`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const total = Number.isFinite(body?.total) ? body.total : body?.items?.length;
  if (!Number.isFinite(total)) throw new Error('no total in showcase response');
  numbers.public_dashboards = entry(total, `${SHOWCASE_BASE}/api/v1/showcase/dashboards (total)`);
} catch (err) {
  console.warn(`[solution-numbers] public dashboards unavailable (${err.message}) — writing null`);
  numbers.public_dashboards = entry(null, `${SHOWCASE_BASE}/api/v1/showcase/dashboards (unreachable)`, null);
}

await mkdir(new URL('./', OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ generated_at: now(), numbers }, null, 2)}\n`);

// --- freshness gate --------------------------------------------------------
// A derived number older than MAX_AGE_DAYS is not evidence any more. Fail loud
// and name it; the fix is to re-run the export that owns it, not to bump a date.
const stale = [];
for (const [key, e] of Object.entries(numbers)) {
  if (e.value == null || !e.as_of) continue;
  const ageDays = (Date.now() - new Date(e.as_of).getTime()) / 86_400_000;
  if (Number.isFinite(ageDays) && ageDays > MAX_AGE_DAYS) stale.push(`${key} (as_of ${e.as_of.slice(0, 10)}, ${Math.round(ageDays)}d > ${MAX_AGE_DAYS}d)`);
}

const printable = Object.fromEntries(Object.entries(numbers).map(([k, e]) => [k, e.value ?? 'null']));
console.log(`[solution-numbers] ${JSON.stringify(printable)} → src/data/solution-numbers.json`);

if (stale.length) {
  console.error(`[solution-numbers] stale derived numbers — refresh their source export:\n  ${stale.join('\n  ')}`);
  process.exit(1);
}
