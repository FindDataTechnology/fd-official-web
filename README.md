# fd-official-web

The official website for [FindDataTechnology](https://github.com/FindDataTechnology) — an open-data ontology MCP for AI agents.

- **Bilingual** EN / 中文 (`astro:i18n`, `/` = EN, `/zh/...` = 中文)
- **Live demo** — query the deployed MCP server from the browser at `/demo`
- **Auto repo grid** — `/repos` is generated from the GitHub API at build time (never hardcoded)
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
  components/           Layout, RepoCard, DemoWidget
  pages/                en default, zh/ prefixed
scripts/fetch-repos.mjs build-time GitHub API fetch (resilient fallback)
server/demo-proxy.mjs   same-origin proxy → MCP ai_search (token stays server-side)
```
