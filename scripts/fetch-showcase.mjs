// Build-time export of the Wire showcase dashboards into src/data/showcase.json
// for the /showcase pages.
//
// Two responsibilities:
//   1. Fetch the anonymous showcase endpoint (list + per-dashboard detail).
//   2. **Pre-render every raw_option panel to a static SVG string** using
//      echarts in SSR mode — so the site stays a zero-JS static build (design
//      D1: no chart runtime ships to the browser).
//
// List metadata and detail payloads are stored in SEPARATE files: the list page
// never needs the multi-hundred-KB SVG bodies, and Astro generates each detail
// page as its own HTML anyway (design D5 / risk note).
//
// Fallback policy (design D3, matching fetch-indicators.mjs / fetch-repos.mjs):
// on network error, non-2xx, or an empty result we log a warning and exit 0
// WITHOUT touching the committed snapshots — `astro build` never breaks because
// the API was down, and a stale snapshot beats no site. The page surfaces the
// snapshot's capture time so staleness is visible rather than silent.
//
// Env:
//   FD_SHOWCASE_API_BASE   default https://wire.finddatatech.cloud
//   FD_SHOWCASE_RENDER_WIDTH  SVG render width in px (default 1000)
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const API_BASE = (process.env.FD_SHOWCASE_API_BASE ?? 'https://wire.finddatatech.cloud').replace(/\/+$/, '');
const RENDER_WIDTH = Number(process.env.FD_SHOWCASE_RENDER_WIDTH ?? 1000);

const LIST_OUT = new URL('../src/data/showcase.json', import.meta.url);
const DETAIL_DIR = new URL('../src/data/showcase-details/', import.meta.url);

/** Default chart height when a panel doesn't declare one (matches the renderer). */
const DEFAULT_HEIGHT = 220;

/** Below this a rendered SVG is treated as empty (echarts emits a bare shell). */
const MIN_SVG_LENGTH = 200;

async function getJson(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

/**
 * Render one raw_option panel to a static SVG string.
 * echarts SSR needs an explicit width/height (there is no DOM to measure).
 */
async function renderPanelSvg(echarts, rawOption, height) {
  const h = Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;
  const chart = echarts.init({ clientWidth: RENDER_WIDTH, clientHeight: h }, null, {
    renderer: 'svg',
    ssr: true,
    width: RENDER_WIDTH,
    height: h,
  });
  try {
    chart.setOption(rawOption, true);
    return chart.renderToSVGString({ width: RENDER_WIDTH, height: h });
  } finally {
    chart.dispose();
  }
}

/** KPI panels become plain text — no SVG, no chart runtime needed (design D2). */
function kpiEntry(panel) {
  const value = panel?.snapshot?.rows?.[0]?.[0];
  return {
    id: panel?.id ?? '',
    type: 'kpi',
    label: panel?.title ?? '',
    value: value === undefined || value === null ? null : String(value),
    unit: panel?.config?.unit ?? '',
    subtitle: panel?.config?.subtitle ?? '',
  };
}

async function buildDetail(echarts, card, detail) {
  const spec = detail?.spec ?? {};
  const body = spec?.spec && typeof spec.spec === 'object' ? spec.spec : spec;
  const panels = Array.isArray(body?.panels) ? body.panels : [];

  const outPanels = [];
  for (const panel of panels) {
    if (!panel || typeof panel !== 'object') continue;

    if (panel.type === 'kpi') {
      outPanels.push(kpiEntry(panel));
      continue;
    }

    // Chart panel: only raw_option panels carry their own echarts config.
    const rawOption = panel.raw_option;
    if (!rawOption || typeof rawOption !== 'object') {
      // Typed (encoding-based) panels have no baked config — the showcase
      // importer only ever produces raw_option charts, so this is a guard
      // rather than an expected path.
      outPanels.push({
        id: panel.id ?? '',
        type: panel.type ?? 'chart',
        title: panel.title ?? '',
        svg: null,
        seriesCount: 0,
        note: 'no-static-config',
      });
      continue;
    }

    let svg = null;
    let renderError = null;
    try {
      svg = await renderPanelSvg(echarts, rawOption, panel.height);
      if (!svg || svg.length < MIN_SVG_LENGTH) {
        svg = null;
        renderError = 'empty-svg';
      }
    } catch (err) {
      renderError = String(err?.message ?? err).slice(0, 200);
    }

    const series = Array.isArray(rawOption.series) ? rawOption.series : [];
    outPanels.push({
      id: panel.id ?? '',
      type: panel.type ?? 'chart',
      title: panel.title ?? '',
      source: panel.source ?? '',
      svg,
      // Text fallback for screen readers / print (design D2).
      seriesCount: series.length,
      seriesNames: series
        .map((s) => (typeof s?.name === 'string' ? s.name : ''))
        .filter(Boolean)
        .slice(0, 12),
      ...(renderError ? { renderError } : {}),
    });
  }

  return {
    id: card.id,
    title: detail?.title ?? card.title,
    version: detail?.version ?? card.version,
    publishedAt: detail?.published_at ?? card.published_at ?? null,
    refreshedAt: detail?.refreshed_at ?? null,
    panels: outPanels,
  };
}

async function previousSnapshot() {
  try {
    return JSON.parse(await readFile(LIST_OUT, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  let list;
  try {
    list = await getJson('/api/v1/showcase/dashboards');
  } catch (err) {
    console.warn(`[showcase:fetch] list unavailable (${err.message}) — keeping existing snapshot`);
    return;
  }

  const items = Array.isArray(list?.items) ? list.items : [];
  if (items.length === 0) {
    // Empty upstream must not blank the site (spec: 空结果不清空).
    console.warn('[showcase:fetch] upstream returned 0 dashboards — keeping existing snapshot');
    return;
  }

  let echarts;
  try {
    echarts = (await import('echarts')).default ?? (await import('echarts'));
  } catch (err) {
    console.warn(`[showcase:fetch] echarts unavailable (${err.message}) — keeping existing snapshot`);
    return;
  }

  const cards = [];
  const details = {};
  let rendered = 0;
  let failed = 0;

  for (const card of items) {
    let detail;
    try {
      detail = await getJson(`/api/v1/showcase/dashboards/${card.id}`);
    } catch (err) {
      console.warn(`[showcase:fetch] detail ${card.id} unavailable (${err.message}) — skipping`);
      failed += 1;
      continue;
    }
    const built = await buildDetail(echarts, card, detail);
    cards.push({
      id: built.id,
      title: built.title,
      panelCount: built.panels.length,
      version: built.version,
      publishedAt: built.publishedAt,
      refreshedAt: built.refreshedAt,
    });
    details[String(built.id)] = built;
    for (const panel of built.panels) {
      if (panel.svg) rendered += 1;
      else if (panel.type !== 'kpi') failed += 1;
    }
  }

  if (cards.length === 0) {
    console.warn('[showcase:fetch] no dashboard could be fetched — keeping existing snapshot');
    return;
  }

  await mkdir(DETAIL_DIR, { recursive: true });
  const capturedAt = new Date().toISOString();
  await writeFile(
    LIST_OUT,
    `${JSON.stringify({ capturedAt, apiBase: API_BASE, total: cards.length, dashboards: cards }, null, 2)}\n`,
    'utf8',
  );
  for (const [id, detail] of Object.entries(details)) {
    await writeFile(
      new URL(`../src/data/showcase-details/${id}.json`, import.meta.url),
      `${JSON.stringify(detail, null, 2)}\n`,
      'utf8',
    );
  }

  console.log(
    `[showcase:fetch] wrote ${cards.length} dashboards, ${rendered} SVG charts` +
      (failed ? `, ${failed} skipped/failed` : ''),
  );
}

// Guard against a partially-written snapshot: only the final writes above touch
// disk, so any throw before them leaves the committed files intact.
main().catch((err) => {
  console.warn(`[showcase:fetch] unexpected error (${err?.message ?? err}) — snapshot untouched`);
  process.exitCode = 0; // never break `astro build`
});
