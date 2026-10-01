# fd-official-web

The official website for [FindDataTechnology](https://github.com/FindDataTechnology) — 寻数 FindData, an open-data ontology MCP for AI agents. This repo is the catalog layer of the five product lines (not a line member itself); it carries no line tag.

- **Bilingual** EN / 中文 (`astro:i18n`, `/` = EN, `/zh/...` = 中文)
- **Five product lines** — `/products` tabs: 壹座 Base / 识律 Lex / 柏讯 Wire / 谦面 Facet / 萬星 Constellation (slugs are a public contract, never renamed)
- **Platform product tour** — `/demo` showcases the Platform assistant with a published demo account
- **Auto repo grid** — `/repos` is generated from the GitHub API at build time (never hardcoded); commercial repos are private and never listed
- **Indicator catalog** — `/indicators` exports the live MCP concept catalog at build time
- **Data modules** — `/data` groups curated datasets by domain/database and links into `/indicators`
- **Updates & releases** — `/updates` two-layer feed + `/releases` bilingual release notes (sourced from OpenSpec archives)
- **Roadmap** — `/roadmap` three codename phases (蝉蜕 → 卧龙 → 九天) with per-phase deliverable items
- **Docs** — quickstart, protocol overview, add-a-datasource

## Stack

[Astro](https://astro.build) (static output) served behind **nginx** on the Tencent CN box, live at `www.finddatatech.cloud` — see [`OPS.md`](OPS.md) for deployment, env vars, and HTTPS setup.

## Develop

```bash
npm install
npm run dev        # local dev at localhost:4321
npm run build      # fetches repos.json from GitHub API, then builds dist/
./deploy.sh        # rsync dist/ → server, nginx reload (needs SSH_PASSWORD or SSH key)
```

## Structure

```
src/
  i18n.ts               UI strings (en/zh)
  content.config.ts     docs content collections (Content Layer API)
  content/docs/{en,zh}/*.md
  content/apps/{en,zh}/*.md      product-line app entries (frontmatter: line/order/kind)
  content/roadmap/*.md           codename phases (bilingual frontmatter, optional items_en/items_zh)
  components/           Layout, RepoCard, TourMockup, TourTrial, ProductCatalog
  pages/                en default, zh/ prefixed
scripts/fetch-repos.mjs       build-time GitHub API fetch (last-good fallback)
scripts/fetch-indicators.mjs  build-time MCP catalog export (last-good fallback)
scripts/build-data-modules.mjs build-time curated module aggregation (last-good snapshot)
```
