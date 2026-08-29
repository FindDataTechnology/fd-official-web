# Tasks — add-indicators-page

## 1. Data export

- [x] 1.1 Create `scripts/fetch-indicators.mjs`: MCP streamable-HTTP handshake (copy the pattern from `server/demo-proxy.mjs`), call `list_concepts` once per entity type (country, city, stock, symbol, industry, fund, person) and merge results; env `FD_INDICATORS_MCP_URL` (default `https://www.finddatatech.cloud/mcp`) and `FD_INDICATORS_MCP_TOKEN`; on network error / missing token / empty result, log a warning and exit 0 without touching the existing file.
- [x] 1.2 Add best-effort enrichment: per-concept coverage (rows, latest_date) and, where reachable, a sample series capped at the last ~100 points for at most one representative entity per concept; every enrichment failure degrades the entry to metadata-only (never blocks the export).
- [x] 1.3 Emit `src/data/indicators.json` per the design schema (`generated_at`, `source`, `concepts[]`) and commit an initial snapshot as the offline fallback.
- [x] 1.4 `package.json`: add `"indicators:fetch": "node scripts/fetch-indicators.mjs"` and chain it into `build` between `repos:fetch` and `astro build`. Verify the build succeeds with the token unset (fallback path).

## 2. Chart primitives (no new dependencies)

- [x] 2.1 Create `src/scripts/indicators/charts.ts`: vanilla-TS SVG helpers — horizontal bar chart, donut chart, line chart with x/y axes and a hover tooltip showing date + value; colors/typography via existing CSS custom properties (`--panel`, `--accent`, etc.); readable at mobile width.
- [x] 2.2 Add chart container, legend, tooltip, and empty-state styles to `public/global.css`.

## 3. English page

- [x] 3.1 Create `src/pages/indicators.astro`: import `indicators.json`; hero + stats strip (total indicators, categories, sources, entity types) computed from the data.
- [x] 3.2 Dashboard section: render four distribution charts (category, entity_type, frequency, source) client-side; top-12 + "other" for high-cardinality dimensions.
- [x] 3.3 Search box + results list: instant client-side filter on `code`, `name_en`, `name_zh` (case-insensitive), result rows show code + bilingual names + category/unit/frequency badges; explicit empty state.
- [x] 3.4 Drill-down panel on selection: metadata table, line chart when `sample` exists (else a visible note, no chart), and a "Try it live → /demo" link.

## 4. Chinese mirror

- [x] 4.1 Create `src/pages/zh/indicators.astro` mirroring 3.1–3.4 with `locale = 'zh'` and 中文 strings; keep category names from the data verbatim (many are Chinese-only).

## 5. Shell integration

- [x] 5.1 Add EN + 中文 strings to `src/i18n.ts`: `nav.indicators` ("Indicators" / "数据指标") and all page strings (title, subtitle, search placeholder, empty state, drill-down labels, demo link).
- [x] 5.2 Add the indicators entry to the nav array in `src/components/Layout.astro` via `getRelativeLocaleUrl`, positioned after Docs.

## 6. Verify and deploy

- [x] 6.1 `npm run build` — fallback path verified twice (token unset; unreachable endpoint). Live-export path untested: no `FD_INDICATORS_MCP_TOKEN` credential available in this environment.
- [x] 6.2 Smoke-test in dev/preview: dashboard renders, search filters in EN and ZH (try "GDP" and "营业"), drill-down chart + tooltip, locale switch stays on the page, mobile width usable.
- [x] 6.3 `./deploy.sh`; verify `https://www.finddatatech.cloud/indicators` and `/zh/indicators` return 200 and render charts.
- [x] 6.4 `openspec validate add-indicators-page --strict` passes; check off all tasks.
