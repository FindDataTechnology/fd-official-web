# fd-official-web

The official website for [FindDataTechnology](https://github.com/FindDataTechnology) — an open-data ontology MCP for AI agents.

- **Bilingual** EN / 中文 (`astro:i18n`, `/` = EN, `/zh/...` = 中文)
- **Platform product tour** — `/demo` showcases the Platform assistant with a published demo account
- **Auto repo grid** — `/repos` is generated from the GitHub API at build time (never hardcoded)
- **Indicator catalog** — `/indicators` exports the live MCP concept catalog at build time
- **Data modules** — `/data` groups curated datasets by domain/database and links into `/indicators`
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
  components/           Layout, RepoCard, TourMockup, TourTrial
  pages/                en default, zh/ prefixed
scripts/fetch-repos.mjs       build-time GitHub API fetch (last-good fallback)
scripts/fetch-indicators.mjs  build-time MCP catalog export (last-good fallback)
scripts/build-data-modules.mjs build-time curated module aggregation (last-good snapshot)
```
