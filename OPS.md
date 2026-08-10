# Operations

Ops notes for the FindDataTechnology official site (this repo → `/opt/fd/web` on the Tencent box).

## Layout on the server

```
/opt/fd/
  web/                 static Astro build (nginx serves /)
  mcp/                 fd-open-data-mcp checkout (uv venv) + sqlite (daas.db)
  web/.env             secrets: MCP_TOKEN, EDGAR_IDENTITY, FD_OPEN_DATA_MCP_DATABASE_URL, FINDDATA_ROOT
```

nginx: `/` → `/opt/fd/web` · `/demo-api` → `127.0.0.1:8898` (demo-proxy) · `/mcp` → `127.0.0.1:8899` (FastMCP streamable-http, bearer-token + `limit_req`).

## Build & deploy

```bash
npm run build                 # fetches repos.json from GitHub API, then astro build
SSH_PASSWORD=... ./deploy.sh  # rsync dist/ → server, nginx reload
```

## Services (systemd)

| Unit | What | Restart |
|------|------|---------|
| `fd-mcp` | `python -m fastmcp run fd_open_data_mcp.server:mcp --transport streamable-http --port 8899` | on-failure |
| `fd-demo-proxy` | `MCP_TOKEN=... node server/demo-proxy.mjs` (port 8898) | on-failure |

```bash
systemctl restart fd-mcp fd-demo-proxy
journalctl -u fd-mcp -f
```

## Env vars (`/opt/fd/web/.env`)

- `MCP_TOKEN` — bearer token for `/mcp` and used by the demo proxy. **Rotate**: change it, restart `fd-demo-proxy`, and share the new value with remote MCP users. nginx rejects missing/invalid tokens with 401.
- `EDGAR_IDENTITY` — required for SEC EDGAR access.
- `FD_OPEN_DATA_MCP_DATABASE_URL` — sqlite URL (default `fd_open_data_mcp/metadata/daas.db`).
- `FINDDATA_ROOT` — parent dir holding the `fd-*` providers.

## IP-first → HTTPS swap (finddata.cn)

Phase 1 serves plain HTTP on the IP (Let's Encrypt cannot issue certs for bare IPs). To go HTTPS:

1. Point the `finddata.cn` A record at `124.220.7.175` (registrar).
2. `sudo certbot --nginx -d finddata.cn` (HTTP-01).
3. nginx config: force `return 301 https://$host$request_uri;` on the :80 server.

After that, remote MCP clients use `https://finddata.cn/mcp` + token.

## Rollback

- Site: keep a previous `dist` locally (`cp -r dist dist.bak` before a deploy) and rsync it back.
- Backend: `systemctl restart fd-mcp` (env unchanged). nginx config backed up at `/etc/nginx/sites-available/fd` before the HTTPS swap.
