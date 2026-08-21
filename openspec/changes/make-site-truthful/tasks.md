## 1. Domain references (finddata.cn → www.finddatatech.cloud)

- [x] 1.1 `astro.config.mjs:7` — change `site: 'https://finddata.cn'` → `https://www.finddatatech.cloud`
- [x] 1.2 `src/content/docs/en/quickstart.md:58` — remote MCP URL `https://finddata.cn/mcp` → `https://www.finddatatech.cloud/mcp`; rewrite the "available after the domain swap / some clients refuse non-HTTPS" framing to past tense (the swap shipped, HTTPS is live)
- [x] 1.3 `src/content/docs/zh/quickstart.md:58` — same fix, Chinese copy
- [x] 1.4 `README.md` (repo root) — "finddata.cn HTTPS swap" future-tense line → past tense, live on `www.finddatatech.cloud` (this root README feeds the gitignored `/repos/fd-official-web` page, so the fix must land here, not the generated copy)
  - NOTE: `src/content/repos/fd-official-web.md` is gitignored, regenerated from the GitHub default-branch README at build time. It still shows old `finddata.cn` text until the README commit is pushed to `main` and a build re-fetches it. Resolves as part of deploy (5.4).

## 2. Tool count (16 → 45)

- [x] 2.1 `src/pages/index.astro:24` — `<b>16</b>` → `<b>45</b>`
- [x] 2.2 `src/pages/zh/index.astro:24` — same
- [x] 2.3 `src/content/flagship/en.md:22` — "16 MCP tools" → "45 MCP tools"; parenthetical updated to the 8-capability surface (catalog, entity identity, semantic layer, entity graph, vector search, fetch, scheduled refresh, crawl policies)
- [x] 2.4 `src/content/flagship/zh.md:22` — same fix, Chinese copy

## 3. Source count (8 → 13)

- [x] 3.1 `src/pages/index.astro:23` — `<b>8</b>` → `<b>13</b>`
- [x] 3.2 `src/pages/zh/index.astro:23` — same

## 4. Concepts (926) — verification, not edit

- [x] 4.1 Verified `926` against the live `daas.db` (`/opt/fd/finddata/fd-open-data-mcp/fd_open_data_mcp/metadata/daas.db`, hostPath-mounted RW into the k3s pod — this IS the live DB). `SELECT COUNT(*) FROM concepts` = **15**, not 926. The DB was migrated + import-catalog'd (15 concepts, 32 bindings, 56 columns, 7 sources) but **not** seed-entities'd (0 entities, 0 entity_source_identifiers) — an early-stage instance; 926 was stale/aspirational. Updated all 4 occurrences to 15: `index.astro`, `zh/index.astro`, `flagship/en.md`, `flagship/zh.md`.
  - NOTE on the "13 data sources" stat (kept, not changed to 7): the live DB `sources` table has **7** imported catalogs, but "13" counts the production/network-backed adapters the MCP *supports* (per design D2: akshare, yfinance, edgar, edinet, dartlab, wbgapi, nbs-gdp, cisa-industry, ckan, cnstats, cn-report, polygon, datacommons) — a product-capability number, not instance-state. Flagged for the user: if "truthful" should mean "sources importable right now on this box", 7 is the live-DB number. Kept 13 per the approved design.

## 5. Build + verify

- [x] 5.1 `npm run build` — passes (exit 0, 44 pages, fetches 12 repos)
- [x] 5.2 Grep built `dist/` for `finddata.cn` — authored copy is clean (0 hits). 2 hits remain in `dist/repos/fd-official-web/index.html` + zh mirror, from the gitignored GitHub-README mirror (see 1.4 note). They resolve after the README push + rebuild, which is part of deploy (5.4).
- [x] 5.3 Grep built `dist/` for `>16</b>` = 0 (gone). Rendered homepage shows `45` (tools) + `13` (sources) + `15` (concepts, post-4.1 rebuild).
- [ ] 5.4 Deploy (per OPS.md: `npm run build` → rsync+swap, or the `fd-site-deploy` skill) and browser-verify `https://www.finddatatech.cloud` hero stats + `/docs/quickstart` remote URL. NOTE: CI (`.github/workflows/deploy.yml`) auto-deploys on push to `main` twice daily (03:07 / 15:07 UTC) + on every push — pushing this change triggers a deploy that also re-fetches the (now-updated) README, clearing the last 2 `finddata.cn` hits.

## 6. Out-of-repo follow-up (not in this change, recorded for tracking)

- [ ] 6.1 GitHub org: set `fd-official-web` repo description (currently `null`) and fix `scraw-fd-open-data-mcp` description (currently "Scrapy crawler with redis queue scheduler" — actually a multi-cluster master/worker crawl system). These feed `repos.json` and the `/repos` grid; their source of truth is the GitHub org, not this repo.
