## 1. Site scaffold (Astro + i18n)

- [ ] 1.1 Initialize Astro project in `fd-official-web` with static output and `astro:i18n` (default `en`, non-default `zh` prefix)
- [ ] 1.2 Create shared layout, header/nav, footer, and language switcher (EN ↔ 中文)
- [ ] 1.3 Add locale UI-string dicts (`en`, `zh`) and wire them through the layout
- [ ] 1.4 Build the homepage hero with the "one protocol, one MCP, every source" positioning in both locales
- [ ] 1.5 Set up per-locale content collections for docs (`src/content/docs/en`, `src/content/docs/zh`)

## 2. Repo showcase

- [ ] 2.1 Add a build-time step that fetches `api.github.com/orgs/FindDataTechnology/repos?per_page=100` and writes the result to a local JSON
- [ ] 2.2 Implement the `/repos` page grid rendering name/description/language/stars/updated + GitHub link from that JSON
- [ ] 2.3 Add a small featured-repo list (flagship `fd-open-data-mcp` first), rendered before the fetched remainder
- [ ] 2.4 Handle build-time API failure: fall back to an empty grid + logged warning (build still ships)
- [ ] 2.5 Verify: adding a made-up repo to the fixture changes the grid without editing page source

## 3. Docs pages

- [ ] 3.1 Write the EN quickstart page (uv sync `--extra data`, migrate, import-catalog, consume-concepts, propose-bindings, seed-entities, generate-schedules, read/serve)
- [ ] 3.2 Write the 中文 quickstart page
- [ ] 3.3 Write the protocol overview page (`fd-open-data-protocol` manifest contract) in EN + 中文
- [ ] 3.4 Write the add-a-datasource guide in EN + 中文
- [ ] 3.5 Wire docs into the `/docs` index with locale routing (verify `/docs` and `/zh/docs` render)

## 4. Demo playground

- [ ] 4.1 Build the `/demo` page: form (concept + entity + date), results view, error messaging, both locales
- [ ] 4.2 Implement the same-origin `/demo-api` proxy route on the server that injects the bearer token (token never reaches the browser)
- [ ] 4.3 Verify: playground query works against the live backend over HTTP with no visitor credentials

## 5. Backend deployment (mcp-live-service)

- [ ] 5.1 On the Tencent box (`124.220.7.175`), install Python/uv, clone `fd-open-data-mcp` into `/opt/fd/mcp`, `uv sync --extra data`
- [ ] 5.2 Create `/opt/fd/web/.env` with `MCP_TOKEN`, `EDGAR_IDENTITY`, `FD_OPEN_DATA_MCP_DATABASE_URL`, `FINDDATA_ROOT`
- [ ] 5.3 Run migrate + import-catalog + consume-concepts + propose-bindings + seed-entities + generate-schedules on the server
- [ ] 5.4 Verify datasource reachability from the CN box (akshare, yfinance, wbgapi, edgar); note any providers that fail
- [ ] 5.5 Run the MCP server over streamable-http (confirm exact `serve` transport flag), listening on `127.0.0.1:8899`
- [ ] 5.6 Create a systemd unit `fd-mcp` (starts on boot, restarts on failure); health-check the process

## 6. nginx + IP-first infra

- [ ] 6.1 Install/configure nginx: `/` → static site dir, `/demo-api` → token-injecting proxy, `/mcp` → `127.0.0.1:8899` with `Authorization: Bearer` check + `limit_req` (per-IP)
- [ ] 6.2 Build Astro site, copy `dist/` to `/opt/fd/web`, reload nginx
- [ ] 6.3 Verify over HTTP by IP: homepage, `/repos`, `/docs`, `/demo` playground, and `/mcp` (401 without token, works with token)
- [ ] 6.4 Confirm the static build contains no secrets (grep build output for token/identity values)

## 7. Domain + HTTPS swap (finddata.cn)

- [ ] 7.1 Point `finddata.cn` A record at `124.220.7.175` (user DNS action)
- [ ] 7.2 Run certbot HTTP-01 for `finddata.cn` and reconfigure nginx to HTTPS with HTTP→HTTPS redirect
- [ ] 7.3 Verify `https://finddata.cn` (site, docs, demo) and the remote MCP URL `https://finddata.cn/mcp` with token
- [ ] 7.4 Set the GitHub org profile website field to the live URL (org admin)

## 8. Rollout polish

- [ ] 8.1 Add a redeploy script (rsync `dist/` + `nginx -s reload`) and note the rollback path (previous dist / `systemctl restart fd-mcp` / nginx backup)
- [ ] 8.2 Write a short ops README in the repo covering deploy, env vars, token rotation, and the HTTP→HTTPS swap
