// Build-time export of Wanxing's public service figures for the constellation
// line page's entry strip (surface-constellation-entry-strip).
//
// Source: GET https://wanxing.finddatatech.cloud/api/wanxing/v1/status
//   { agents: { value, stale }, turns7d: { value, stale }, settlement_pending: {...} }
//
// Truthful degradation: on ANY failure (unreachable, non-200, shape mismatch,
// missing value) this writes NOTHING and exits 0 — the previous committed
// snapshot survives and the build stays green. That is deliberately different
// from fetch-calibers.mjs (which writes null so the page can say "unknown"):
// these two figures are running operational counts, not a quota or a promise,
// so a few hours-old snapshot is not a lie, while a fresh `0` would be.
//
// Env:
//   WANXING_STATUS_URL   default https://wanxing.finddatatech.cloud/api/wanxing/v1/status
import { writeFile, readFile } from 'node:fs/promises';

const OUT = new URL('../src/data/constellation-status.json', import.meta.url);
const URL_ = process.env.WANXING_STATUS_URL ?? 'https://wanxing.finddatatech.cloud/api/wanxing/v1/status';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

async function currentSnapshot() {
  try {
    return await readFile(OUT, 'utf8');
  } catch {
    return null;
  }
}

async function main() {
  let payload;
  try {
    const res = await fetch(URL_, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.json();
  } catch (err) {
    console.warn(`[constellation-status] fetch failed (${err?.message || err}) — keeping the previous snapshot`);
    return;
  }

  const agents = num(payload?.agents?.value);
  const turns7d = num(payload?.turns7d?.value);
  if (agents === null || turns7d === null) {
    console.warn('[constellation-status] response shape carries no agents/turns7d value — keeping the previous snapshot');
    return;
  }
  // A zero here is almost always a LIE, not a fact. The endpoint answers with
  // zeros when its own upstream is unreachable (measured 2026-11-21: the
  // platform pod sat on a downed node and /status cheerfully returned
  // agents:0, turns7d:0 — which then overwrote a good 27/134 snapshot and
  // shipped "0 agents in service" onto the public line page). A fleet that
  // really has zero agents is not a state this site needs to render: the
  // line page simply omits the figures (see the strip's null handling).
  // `stale: true` is the endpoint's own marker for "I could not compute it".
  const stale = payload?.agents?.stale === true || payload?.turns7d?.stale === true;
  if (stale || agents === 0 || turns7d === 0) {
    console.warn(
      `[constellation-status] refusing (agents=${agents} turns7d=${turns7d} stale=${stale}) — ` +
        'zero or stale reads are the endpoint failing to compute, not a fact; keeping the previous snapshot',
    );
    return;
  }

  const next = JSON.stringify({ agents, turns7d, generated_at: new Date().toISOString() }, null, 2) + '\n';
  const prev = await currentSnapshot();
  if (prev === next) {
    console.log('[constellation-status] unchanged');
    return;
  }
  await writeFile(OUT, next);
  console.log(`[constellation-status] agents=${agents} turns7d=${turns7d}`);
}

await main();
