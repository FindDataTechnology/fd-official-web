## Why

FindDataTechnology is a 2-week-old open-source org with 8 data-for-AI Python projects but **no official presence** — no description, no homepage, no way for users or agents to discover or *run* the flagship `fd-open-data-mcp`. The org has real product value ("one protocol, one MCP, every source") that a repo list can't communicate. A bilingual product/docs site with a **live** MCP demo closes that gap: it makes the org discoverable, installable, and usable from the web.

## What Changes

- Create the **`fd-official-web`** site: a static Astro build, **English + 中文** (astro:i18n, `en` default + `zh` routes), self-hosted behind **nginx on the user's Tencent CN server** (not GitHub Pages).
- Site structure: hero (value prop for the open-data ontology MCP), `/repos` auto-generated grid, `/docs` (quickstart, protocol, add-a-datasource), `/demo` playground, footer.
- **Auto repo grid**: fetch `api.github.com/orgs/FindDataTechnology/repos` at build time and render — never hardcoded.
- **Live MCP backend**: deploy `fd-open-data-mcp` (Python FastMCP, 16 tools) as a **remote MCP server over streamable-http at `/mcp`**, reverse-proxied by nginx, with sqlite (`daas.db`) and datasource credentials on the server.
- **Access model B**: `/demo` playground works in-browser without signup; the raw `/mcp` endpoint is gated behind a **bearer token**.
- **Deployment is IP-first**: site + backend go live on the Tencent IP (`124.220.7.175`) immediately, served over plain HTTP (Let's Encrypt can't issue certs for bare IPs). Once the custom domain resolves to the server, switch nginx to HTTPS via Let's Encrypt in one step.

## Capabilities

### New Capabilities

- `site-shell`: bilingual static site framework — Astro, astro:i18n (en/zh), layout, nav, hero, footer, theme
- `repo-showcase`: build-time repo grid auto-generated from the GitHub API
- `docs-site`: docs pages — install/quickstart for `fd-open-data-mcp`, protocol spec overview, add-a-datasource guide
- `demo-playground`: `/demo` browser playground that queries the live MCP backend
- `mcp-live-service`: deployed `fd-open-data-mcp` as a remote MCP server at `/mcp` (streamable-http) with bearer-token gating and rate limiting
- `deploy-infra`: nginx reverse proxy, TLS cert, DNS, and deployment on the Tencent server

### Modified Capabilities

_(none — greenfield repo, no existing specs)_

## Impact

- **New repo**: `fd-official-web` (this workspace), pushed to the FindDataTechnology org.
- **Server**: Tencent Shanghai box `124.220.7.175` (ubuntu) — nginx `:443`, TLS, the MCP backend, sqlite DB.
- **External APIs**: GitHub API (repo grid at build), datasources at runtime (akshare, yfinance, edgar — needs `EDGAR_IDENTITY`), live on the server.
- **Domain**: custom domain DNS → server; **name TBD by user** (not blocking — IP-first).
- **Security**: public `/mcp` behind bearer token; rate limiting; no secret in the static build; HTTPS enforced once the domain is live.
