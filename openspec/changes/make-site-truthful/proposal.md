## Why

The site copy asserts facts that are provably false. The live domain moved to `www.finddatatech.cloud` (the `setup-finddatatech-domains` change shipped and was browser-verified 2026-08-21), yet authored copy still references `finddata.cn` and describes the HTTPS swap as a future event. The MCP tool count is stated as 16 in four places; the deployed image exposes 45 (OPS.md k3s Deployment comment: "all 45 tools"). The data-source count is stated as 8; the `fd-open-data-mcp` runner table lists 13 production (network-backed) adapters plus 10 explicit stubs that return placeholder data. These are not taste calls — they are claims a visitor or agent will act on (a remote MCP URL, an integration choice) that point at the wrong host or misrepresent the product.

This change makes the authored copy match reality. Scope is strictly the three provable lies: domain, tools, sources. It does not invent a build-time stat source the repo does not have, and does not touch GitHub-side repo descriptions (out of this repo) or roadmap copy (taste, not truth).

## What Changes

- **Domain**: `finddata.cn` → `www.finddatatech.cloud` in `astro.config.mjs` (`site`), both `quickstart.md` docs (EN + ZH, the `/mcp` remote URL), and the repo-root `README.md` (whose "finddata.cn HTTPS swap" line is past-tense future and feeds the gitignored `/repos/fd-official-web` page).
- **Tools**: `16` → `45` in `index.astro` + `zh/index.astro` (homepage stat), `flagship/en.md` + `flagship/zh.md` (the "By the numbers" bullet and its stale parenthetical).
- **Sources**: `8` → `13` in `index.astro` + `zh/index.astro` (homepage stat). 13 = the production / network-backed adapters from the `fd-open-data-mcp` runner table (`akshare`, `yfinance`, `edgar`, `edinet`, `dartlab`, `wbgapi`, `nbs-gdp`, `cisa-industry`, `ckan`, `cnstats`, `cn-report`, `polygon`, `datacommons`). The 10 stubs and 2 read-only registries are not counted as "data sources" because they do not return usable data.
- **Concepts (926)**: left in place. It is the one number this repo cannot verify — it lives in the MCP's `daas.db`, not in code. The change records this as a known-drift surface in `design.md` rather than asserting a different unverified number.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `mcp-live-service`: the live MCP endpoint requirement is corrected to reflect the deployed tool surface (45 tools, not 16). Spec-level: the scenario asserting "16 tools available" is updated.
- `docs-site`: the remote-usage docs requirement is corrected so the documented remote MCP URL is the live `www.finddatatech.cloud` host (was `finddata.cn`), and the "requires HTTPS … available after the domain swap" framing is updated to past-tense (the swap shipped).

## Impact

- **Authored copy** (the fix lands here): `astro.config.mjs`, `src/i18n.ts` is NOT touched (the stat strings are labels only; the numbers are in the pages), `src/pages/index.astro`, `src/pages/zh/index.astro`, `src/content/flagship/en.md`, `src/content/flagship/zh.md`, `src/content/docs/en/quickstart.md`, `src/content/docs/zh/quickstart.md`, `README.md` (repo root).
- **Generated copy** (NOT touched — correct by construction): `src/data/repos.json`, `src/data/updates.json`, `src/content/repos/*.md` are regenerated from GitHub at build and are gitignored. The `fd-official-web` description `null` and `scraw-fd-open-data-mcp` = "Scrapy crawler" are GitHub-org-side; flagged as out-of-repo follow-up, not in scope.
- **`src/i18n.ts`**: the `stat.concepts/sources/tools` strings are labels ("indicator concepts", "data sources", "MCP tools") — unchanged. Only the hardcoded numbers in the pages change.
- **SEO/canonical**: changing `astro.config.mjs` `site` corrects every canonical/sitemap URL Astro emits; no separate SEO work in this change.
- **No behavior change**: no routes, no build pipeline, no deploy mechanics, no secrets. A content-only diff that makes the site stop lying.
