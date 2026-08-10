# Operations

Ops notes for the FindDataTechnology official site (this repo → `/opt/fd/web` on the Tencent box 124.220.7.175).

## Deploy

**Automatic (default):** `.github/workflows/deploy.yml` runs on every push to `main` + twice daily (03:07 / 15:07 UTC). It fetches repo data, `astro build`s, rsyncs `dist/`, then atomically swaps into `/opt/fd/web/dist` (previous release kept at `dist.prev`).

**Manual:** `/fd-site-deploy` skill in Claude Code, or by hand:

```bash
npm run build
rsync -az --delete dist/ fd-deploy:/opt/fd/web/dist-new/
ssh fd-deploy 'rm -rf /opt/fd/web/dist.prev && mv /opt/fd/web/dist /opt/fd/web/dist.prev && mv /opt/fd/web/dist-new /opt/fd/web/dist'
```

`fd-deploy` is an ssh config host using the dedicated key `~/.ssh/fd_deploy` (pubkey in the server's `authorized_keys`, comment `fd-official-web-deploy`; private key also in repo secret `DEPLOY_SSH_KEY`, alongside `DEPLOY_HOST` / `DEPLOY_USER`).

**Rollback:** `ssh fd-deploy 'rm -rf /opt/fd/web/dist && mv /opt/fd/web/dist.prev /opt/fd/web/dist'`

## Layout on the server

```
/opt/fd/
  web/dist           static site — nginx root
  web/dist.prev      previous release (rollback target)
  web/.env           secrets: MCP_TOKEN, EDGAR_IDENTITY, FD_OPEN_DATA_MCP_DATABASE_URL, FINDDATA_ROOT (chmod 600, never commit)
  web/server/demo-proxy.mjs   Node proxy on 127.0.0.1:8898 (injects MCP_TOKEN for /demo-api)
  mcp/               fd-open-data-mcp checkout (uv venv) + sqlite (daas.db)
```

nginx config: `/etc/nginx/sites-available/fd`. Routes: `/` → `/opt/fd/web/dist` · `/demo-api` → 8898 · `/mcp` → 8899 (bearer check + `limit_req`).

## Services (systemd)

| Unit | What |
|------|------|
| `fd-mcp` | FastMCP streamable-http on `127.0.0.1:8899` |
| `fd-demo-proxy` | `node server/demo-proxy.mjs` on `127.0.0.1:8898` |

```bash
systemctl restart fd-mcp fd-demo-proxy
journalctl -u fd-mcp -f
```

## Token rotation

1. Update `MCP_TOKEN` in `/opt/fd/web/.env`; `systemctl restart fd-mcp fd-demo-proxy`.
2. Update the bearer check in `/etc/nginx/sites-available/fd`; `nginx -t && systemctl reload nginx`.
3. Share the new value with remote MCP users. nginx rejects missing/invalid tokens with 401.

## Domain cutover (finddatatech.cloud)

Pending user actions before HTTPS:

1. Tencent security group: open inbound TCP 80 + 443 for `0.0.0.0/0` (external access is blocked until then).
2. Buy `finddatatech.cloud` via Tencent Cloud (国内注册商 — required for ICP 备案), file 备案 (2–4 weeks).
3. A record → `124.220.7.175`, then `certbot --nginx -d finddatatech.cloud -d www.finddatatech.cloud`, set `server_name`, force 301 to https.
4. Set the GitHub org website field to `https://finddatatech.cloud`.

Until then, plain HTTP on the IP keeps working.
