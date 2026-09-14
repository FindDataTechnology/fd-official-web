## Why

The flagship product `fd-open-data-mcp` exposes a rich catalog of indicators ("concepts": ~255 in dev, more in prod, ~1,498 World Bank indicators enumerable), but the official site only *talks* about them — the homepage hardcodes "15 indicator concepts" and the flagship page describes a handful narratively. There is no generated catalog anywhere (the `concepts` DB table is the only source of truth), and no page where a visitor can browse, search, or visualize what the product actually offers. A public, chart-driven indicators page turns the catalog into a showcase and makes the "15" claim checkable.

## What Changes

- **NEW** `scripts/fetch-indicators.mjs` — build-time export (modeled on `fetch-repos.mjs`): speaks MCP JSON-RPC to the data server (reuse the `demo-proxy.mjs` handshake pattern), calls `list_concepts` per entity type (bypasses the 500-row cap), and writes `src/data/indicators.json` with bilingual metadata, coverage stats, and (where cheaply available) a capped sample series per concept. Falls back to the last committed snapshot when the endpoint is unreachable or no token is configured — the build never fails on data access.
- **NEW** `src/data/indicators.json` — committed snapshot (last-good fallback, same policy as `repos.json`).
- **NEW** `src/pages/indicators.astro` + **NEW** `src/pages/zh/indicators.astro` — the indicators page, both locales: a stats strip, distribution dashboard (charts by category / entity type / frequency / source), instant client-side search over code + `name_en` + `name_zh`, and a drill-down detail view with a time-series chart when sample observations exist (metadata view otherwise, plus a "try it live in the demo" link).
- **NEW** `src/scripts/indicators/charts.ts` — hand-rolled SVG chart primitives (horizontal bars, donut, line chart with hover tooltip), themed via existing CSS custom properties. No new dependencies.
- **MODIFIED** `src/components/Layout.astro` — add an "Indicators / 数据指标" nav entry (both locales).
- **MODIFIED** `src/i18n.ts` — EN + 中文 strings for the nav item and the page.
- **MODIFIED** `public/global.css` — styles for search box, charts, drill-down panel, empty states.
- **MODIFIED** `package.json` — add `indicators:fetch` script; chain it into `build` after `repos:fetch`. No new dependencies.

## Capabilities

### New Capabilities
- `indicator-catalog`: A public, bilingual, searchable, chart-driven introduction of the indicators exposed by `fd-open-data-mcp`, generated at build time from the live concept catalog with a committed fallback snapshot.

### Modified Capabilities
- `site-shell`: The core site structure gains the `/indicators` + `/zh/indicators` pages, and the header navigation gains an "Indicators / 数据指标" entry in both locales.

## Impact

- **Code**: one new build script, one new client script module, two new pages (EN/ZH), light edits to `Layout.astro`, `i18n.ts`, `global.css`, `package.json`.
- **Dependencies**: none added — charts are hand-rolled SVG in vanilla TS, consistent with the zero-dependency ethos (`DemoWidget.astro` pattern).
- **Secrets**: the export token stays in env/CI secrets (`FD_INDICATORS_MCP_TOKEN`), same policy as `GITHUB_TOKEN` for `repos:fetch`; it is never embedded in built output. The published JSON contains catalog metadata only.
- **Build**: `npm run build` gains one step; it succeeds offline via the committed fallback.
- **Deploy**: live on `www.finddatatech.cloud/indicators` + `/zh/indicators` after `./deploy.sh`, per repo policy.
