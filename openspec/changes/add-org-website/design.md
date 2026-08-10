## Context

FindDataTechnology is a new open-source org (8 Python repos, all data-for-AI). It has no website, description, or homepage. The flagship `fd-open-data-mcp` is a serious system: an open-data ontology MCP with 16 tools, 926 indicator concepts, concept→source ranking, failover, and caching — but it currently runs only via `uv` on the author's machine with stdio transport.

This change creates the org's official site (`fd-official-web`): a bilingual (EN + 中文) product/docs site whose centerpiece is a **live remote MCP server** that people can actually connect to from the web. The site and backend are self-hosted on the user's Tencent Shanghai box (`124.220.7.175`, Ubuntu, 4h4g, 3Mbps), served by nginx.

Deployment is **IP-first**: everything goes live on the bare IP over plain HTTP immediately, then flips to HTTPS+Let's Encrypt once the custom domain resolves. (Let's Encrypt cannot issue certificates for bare IP addresses.)

## Goals / Non-Goals

**Goals:**
- Static bilingual site (EN + 中文) — hero, `/repos`, `/docs`, `/demo`, footer.
- `/repos` auto-generated from the GitHub API at build time.
- `fd-open-data-mcp` deployed as a remote MCP server over streamable-http at `/mcp`, reverse-proxied by nginx, with sqlite (`daas.db`) + datasource creds on the server.
- Access model B: `/demo` playground open without signup; raw `/mcp` gated behind a bearer token.
- Live on the Tencent IP within the first deploy; HTTPS swap after domain DNS.

**Non-Goals:**
- No GitHub Pages (rejected by user).
- No user accounts / signup flow (keys are not self-serve for v1 — a single shared token, rotated manually).
- No multi-region, no CDN, no autoscaling.
- No full docs-site for every repo — docs cover the flagship MCP + protocol only.

## Decisions

**D1 — Stack: Astro (static) + nginx, not Next.js, not GitHub Pages.**
- Rationale: the site is mostly static content + one small playground page; Astro gives content collections for docs, first-class `astro:i18n` for en/zh, and a pure static output that nginx serves trivially. User rejected GitHub Pages; self-hosting gives one origin for site + backend + domain + CN performance. Next.js SSR was considered — rejected: no per-user rendering needed, static is simpler to host and faster to deploy, and the live dynamic part lives at `/mcp`, not in the page render.
- Alternative considered: raw HTML/CSS (fewest deps) — rejected: the i18n + docs structure would get hand-rolled and unmaintainable.

**D2 — IP-first, HTTP → HTTPS swap.**
- Let's Encrypt can't issue certs for bare IPs, so phase 1 serves `http://124.220.7.175` (site + playground). MCP clients may refuse non-HTTPS, so remote-MCP usage is documented as enabled-after-domain. Domain is **`finddata.cn`** (user-supplied): once its A record points at the box, run certbot (HTTP-01) and reload nginx with a redirect-all-to-HTTPS config.
- Rationale: unblocks testing and the demo immediately without waiting on DNS; the swap is a config + certbot step, not a rebuild.

**D3 — MCP transport: streamable-http at `/mcp` via nginx reverse proxy.**
- `fd-open-data-mcp` (FastMCP) supports streamable-http (`fd-open-data-mcp serve --transport streamable-http`). nginx proxies `/mcp` → local FastMCP port (e.g. `127.0.0.1:8899`). One TLS-terminating origin keeps the MCP URL stable across the IP→domain swap.
- Alternatives: SSE transport (deprecated by MCP spec), or exposing FastMCP directly (loses TLS and rate-limit point).

**D4 — Access model B: open playground, gated MCP.**
- `/demo`: browser page that calls the backend via a **server-side proxy route on the same origin** that injects the token — users never see or need a key.
- `/mcp`: requires `Authorization: Bearer <token>`. The token lives in a server env file (`/opt/fd/web/.env`), rotated manually. A lightweight rate limit (nginx `limit_req` per IP) guards the endpoint.
- Rationale: playground friction-free for visitors; the raw MCP endpoint is public-by-URL but quota-safe. Self-serve key issuance is explicitly out of scope for v1.

**D5 — Repo grid via GitHub API at build.**
- Astro build step fetches `api.github.com/orgs/FindDataTechnology/repos?per_page=100` (unauthenticated, 60 req/hr is plenty for one build) and renders name/desc/lang/⭐/updated + link. Repos are marked featured (flagship first) via a small local list, the rest auto-appended.
- Rationale: 8 repos today, will grow; never hand-maintain a repo list.
- Alternative: GitHub's embedded repo cards (JS, client-side) — rejected: needs client JS + loses build-time i18n control.

**D6 — i18n: `astro:i18n`, `en` default + `zh` routing.**
- URL scheme: `/` = EN, `/zh/...` = 中文 (default locale `en`, `zh` as the non-default route prefix). Docs content in per-locale content collections (`src/content/docs/en`, `src/content/docs/zh`). UI strings via a shared dict per locale.
- Rationale: `astro:i18n` is the maintained path; keeping zh prefixed (not default) avoids breaking default-locale deep links.

**D7 — Server layout on the Tencent box.**
```
/opt/fd/
  web/           static Astro build (served by nginx at /)
  mcp/           fd-open-data-mcp venv + data (sqlite daas.db, FINDDATA_ROOT)
  web/.env       FD_OPEN_DATA_MCP_DATABASE_URL, EDGAR_IDENTITY, MCP_TOKEN, FINDDATA_ROOT
nginx: / → /opt/fd/web,  /mcp → 127.0.0.1:8899,  /demo-api → proxy w/ token inject
```
- The MCP backend runs once as a systemd unit; the site deploy is `rsync` of the Astro `dist/` + `nginx -s reload`.

## Risks / Trade-offs

- **Open `/mcp` quota abuse** → bearer token + nginx `limit_req` (e.g. 20 req/min/IP); akshare/EDGAR are the quotas to protect; `EDGAR_IDENTITY` set.
- **Plain HTTP phase exposes traffic** → phase-1 only; full HTTPS + redirect enforced at the domain swap; nothing secret is served over HTTP (token never in the browser).
- **3Mbps bandwidth** → fine for a static site + JSON API; if it hurts, add nginx gzip/brotli and cache headers (cheap wins first).
- **Datasource availability from the CN box** (akshare/yfinance/worldbank reachability) → verify each provider at deploy; providers that fail from CN get a documented note and the MCP's built-in failover ranking mitigates.
- **Domain not yet supplied** → non-blocking by D2; tasks keep the domain as a config value with a default `ip` mode.
- **MCP clients rejecting HTTP** → documented: remote-MCP connects after the HTTPS swap; playground works immediately over HTTP.

## Migration Plan

1. IP-first deploy to Tencent box: install nginx, python venv, `uv`-install `fd-open-data-mcp` + `--extra data`, migrate/import catalogs, seed entities, systemd unit, nginx config (HTTP), rsync Astro build → `/opt/fd/web`. Verify site at `http://124.220.7.175` and playground against `/mcp`.
2. Domain phase (when user supplies domain): DNS A record → `124.220.7.175`; `certbot --nginx`; enable HTTP→HTTPS redirect; document remote-MCP URL `https://<domain>/mcp`; set org website field on GitHub (needs org admin).
3. Rollback: site = serve previous `dist/`; MCP = `systemctl restart fd-mcp` with previous env; nginx config restored from backup.

## Open Questions

- **Domain resolved**: `finddata.cn` (set as the domain config value; DNS + HTTPS swap still to run).
- Which datasource providers actually work from the CN box — resolved during D7 verify step.
- Org admin access for setting the GitHub profile website field.
