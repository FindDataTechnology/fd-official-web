# Design — add-indicators-page

## Context

`fd-open-data-mcp` models indicators as rows in the `concepts` table (`code, name_en, name_zh, category, unit, measure, frequency, entity_type, source, verified, deprecated`), exposed via the MCP tool `list_concepts` (capped at `limit(500)` per call) and readable per-concept via `read`/`fetch`. The dev SQLite DB holds 255 concepts; live Postgres holds more (funds, persons). The official site (`fd-official-web`) is a fully static, bilingual (EN/中文), zero-runtime-dependency Astro 7 site with two established data patterns: build-time fetch with committed fallback (`scripts/fetch-repos.mjs` → `src/data/repos.json`) and a runtime MCP proxy for the demo (`server/demo-proxy.mjs`). There are no charts anywhere in the codebase today.

## Decision 1 — Build-time snapshot, not runtime proxy

The catalog is embedded at build time into `src/data/indicators.json`.

- **Why**: the site is static; 255–1,600 rows is trivial in-browser (instant search, works offline, no server round-trips, no rate limits on the MCP endpoint). `fetch-repos.mjs` already proves the pattern, including the committed last-good fallback that lets CI build offline.
- **Trade-off accepted**: values go stale between exports. Acceptable for an *introduction* page; the drill-down links to `/demo` for live queries.
- **Rejected**: extending `demo-proxy.mjs` to serve `list_concepts` at runtime — every search keystroke would hit the server, and the page would break whenever the MCP endpoint has issues.

## Decision 2 — Dashboard + drill-down page shape

```
/indicators
├── stats strip        (total indicators · categories · sources · entity types)
├── dashboard          SVG charts: by category / entity_type / frequency / source
├── search box         instant filter over code, name_en, name_zh (client-side)
└── results list       ── click ──▶ drill-down panel
                          ├── metadata table (bilingual names, unit, frequency, …)
                          ├── time-series line chart (IF sample series was exported)
                          └── "Try it live → /demo" link (always)
```

The drill-down chart renders **only when the export captured a sample series**; otherwise the panel degrades to metadata + demo link (no broken or empty chart). This keeps the export script honest: series are best-effort, never a build blocker.

## Decision 3 — Hand-rolled SVG charts, zero new dependencies

Chart needs are modest: horizontal bar charts, one donut, one line chart with a hover tooltip. All render from ≤2k data points. A vanilla-TS SVG module (themed with the existing `--bg/--panel/--accent` CSS variables) matches the site's ethos and `DemoWidget.astro`'s plain-`<script>` style. **Rejected**: echarts (~300KB+, the site's first heavy dep) — not justified for these chart types; revisit only if zoomable multi-series exploration becomes a requirement.

## Decision 4 — Export script mechanics

`scripts/fetch-indicators.mjs` (Node, run as `npm run indicators:fetch`, chained into `build`):

1. MCP streamable-HTTP handshake exactly as `demo-proxy.mjs` does (initialize → notifications/initialized → tools/call).
2. Calls `list_concepts` **once per entity type** (country, city, stock, symbol, industry, fund, person) and merges — avoids the 500-row cap without touching the server.
3. Best-effort coverage/sample enrichment: when a values source is reachable, capture per-concept coverage (row count, latest date) and a **sample series capped at the last ~100 points** for at most one representative entity per concept. Any failure here degrades to metadata-only entries.
4. Emits `src/data/indicators.json`:

```jsonc
{
  "generated_at": "ISO-8601",
  "source": "mcp|fallback",
  "concepts": [
    {
      "id": 234, "code": "PS_REVENUE",
      "name_en": "Revenue", "name_zh": "营业收入",
      "category": "利润表", "unit": "currency", "measure": null,
      "frequency": "quarterly", "entity_type": "symbol", "source": "akshare",
      "coverage": { "rows": 40, "latest_date": "2025-06-30" },
      "sample": { "entity": "000001", "points": [["2024-01-02", "7.74"], …] }  // optional
    }
  ]
}
```

5. **Fallback**: on network error, missing token, or empty result → keep/commit the previous `indicators.json` and exit 0 (log a warning), so `npm run build` and CI never fail on data access. Mirrors `repos.json` policy.

Env: `FD_INDICATORS_MCP_URL` (default: the public `https://www.finddatatech.cloud/mcp`; localhost in dev) and `FD_INDICATORS_MCP_TOKEN` (CI secret; local `.env`). The token is used by the export only and never appears in built output.

## Decision 5 — Bilingual, mirrored, like every other page

`src/pages/indicators.astro` + `src/pages/zh/indicators.astro` (hardcoded `locale` consts, as the rest of the site does); all strings in `src/i18n.ts` under both `en` and `zh`; category names keep their original language (many are Chinese-only in the DB — shown verbatim, not translated). Nav label: "Indicators" / "数据指标".

## Risks / open notes

- **Build env reachability**: CI (GitHub Actions) can only reach the *public* MCP endpoint; the internal Postgres is unreachable. The export therefore speaks MCP over HTTPS, never SQL.
- **No description field on concepts**: the page composes introductions from name/category/unit/frequency; a future backfill script (precedent: `scripts/backfill_concept_metadata.py` in fd-open-data-mcp) could add prose later without schema change here (additive `description` key).
- **JSON size**: with 1,600 concepts × capped samples the JSON stays in the low hundreds of KB — acceptable for a static page; if World-Bank-scale enumeration lands, cap samples to top concepts by coverage and drop the rest to metadata-only.
- **Stale counts elsewhere**: homepage/flagship still hardcode "15 indicator concepts" — updating those numbers is deliberately out of scope here (separate truthfulness change), but this page makes them checkable.
- **Optional follow-up** (not in this change): deep-link from the drill-down into `/demo?q=<concept> <entity>` with a prefilled DemoWidget query for live values.
