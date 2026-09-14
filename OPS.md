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
  web/.env           secrets: MCP_TOKEN, MCP_URL, EDGAR_IDENTITY, ... (chmod 600, never commit)
  web/server/demo-proxy.mjs   Node proxy on 127.0.0.1:8898 (injects MCP_TOKEN for /demo-api)
  finddata/          fd-open-data-mcp + fd-open-data-protocol checkouts + sqlite (daas.db)
                     — hostPath-mounted RW into the MCP container (same paths as bare metal)
```

k3s (single-node, v1.36.3) runs the MCP + LibreChat. traefik is disabled via
`/etc/rancher/k3s/config.yaml` (`disable: [traefik]`) so nginx keeps :80/:443.

| Namespace | Workload | Exposure |
|-----------|----------|----------|
| `mcp` | `fd-open-data-mcp` Deployment (image `finddata/fd-open-data-mcp:torch`, all 45 tools) | NodePort **30899** → 8899 |
| `librechat` | `librechat-api` + `-mongo` + `-meili` (slim, RAG off, LiteLLM backend) | NodePort **30830** |

Manifests live in this repo: `deploy/k8s/mcp.yaml`, `deploy/k8s/librechat.yaml`.
Secrets are k8s Secrets made from the on-box .env files (`fd-mcp-env`, `librechat-env`) — never in git.

nginx config: `/etc/nginx/sites-available/fd` (IP-on-:80 fallback, default_server) + `www.finddatatech.cloud` + `chat.finddatatech.cloud` (TLS, managed by certbot). Repo copies: `deploy/nginx/`. Routes: `www` `/` → `/opt/fd/web/dist` · `www` `/demo-api` → 8898 · `www`+`fd` `/mcp` → **30899** (bearer check + `limit_req`) · `chat` `/` → **30830** (WebSocket/SSE, long timeouts).

## Images — Harbor registry on america

Private Harbor (v2.12) runs on **china-cheap-2** (`103.236.89.174`, SSH port `20400`, root; creds in the finddata workspace `ssh-config.json`). ⚠️ UPDATE 2026-08-31: that box is NOT the finddata cheap fleet's cheap-2 (fixed IP now `103.236.92.58`); the public Harbor used by the Rancher/k3s fleet is on **america** `23.144.68.246:30880` (project `finddata`, robot creds in finddata workspace). It speaks **plain HTTP on loopback only** (the box has no usable public HTTP ports and its tailnet ACLs block peers), so every consumer reaches it through an SSH tunnel:

- **This box**: `harbor-tunnel.service` (systemd, key `~/.ssh/harbor_tunnel`) → `127.0.0.1:5000`.
- On cheap-2 itself: `harbor-endpoint.service` (socat watchdog) forwards `127.0.0.1:5000` → harbor nginx container (docker host-ports are broken on that box — its internal k3s iptables interferes — so don't try to expose Harbor directly).
- Harbor admin password: see the operator's local `finddata/.harbor-creds` (never commit).
- cheap-2 egress is heavily firewalled (no docker.io CDNs, no pypi.org, no github) — **never build there**; use it only as storage.

### Image sources

- `finddata/fd-open-data-mcp:torch` — built from the exact `/opt/fd/finddata` tree (use the web-box `Dockerfile` — the GitHub HEAD one is the slim variant). Build on the **america box** (23.144.68.246; full internet, docker + skopeo): sync source there, `docker build`, `docker push 127.0.0.1:5000/...` into its local registry, then relay.
- Foreign images (`mongo:7`, `meilisearch:v1.6`, `librechat`) — pulled on the america box via skopeo.
- **Relay into Harbor** (america↔china-cheap-2 direct links are unreliable): run on THIS box, which tunnels to Harbor — `skopeo copy --src-tls-verify=false --dest-tls-verify=false --dest-creds admin:$HP docker://23.144.68.246:5000/<img> docker://127.0.0.1:5000/<img>`. Slow (≈3 Mbps) but unattended.

### k3s pull config

`/etc/rancher/k3s/registries.yaml` maps the virtual registry name **`harbor.fd`** → `http://127.0.0.1:5000` with Harbor admin auth. Manifests reference `harbor.fd/finddata/fd-open-data-mcp:torch`, `harbor.fd/cache/mongo:7`, etc. `imagePullPolicy: IfNotPresent`. After pushing a new digest under the same tag: `sudo k3s kubectl -n mcp rollout restart deploy/fd-open-data-mcp`.

⚠️ The pull path shares the box's ~3 Mbps uplink — a cold pull of the full image set takes hours. Keep Harbor as the durable copy; if the box ever loses containerd images, re-pull early, not during an incident.

## Services

| Unit / command | What |
|------|------|
| `fd-demo-proxy` (systemd) | `node server/demo-proxy.mjs` on `127.0.0.1:8898`; `MCP_URL` in `web/.env` → `http://127.0.0.1:30899/mcp` |
| `fd-mcp` (systemd) | **STOPPED + DISABLED** (superseded by the k3s pod). Rollback: `sudo systemctl enable --now fd-mcp` + point `MCP_URL`/nginx back to 8899 |
| `sudo k3s kubectl ...` | all container ops |

```bash
sudo k3s kubectl get pods -A
sudo k3s kubectl -n mcp logs deploy/fd-open-data-mcp -f
sudo k3s kubectl -n librechat logs deploy/librechat-api -f
systemctl restart fd-demo-proxy
```

## Token rotation

1. Update `MCP_TOKEN` in `/opt/fd/web/.env` and `/opt/fd/finddata/fd-open-data-mcp/.env`.
2. Recreate the k8s secrets and bounce pods:
   ```bash
   sudo k3s kubectl -n mcp delete secret fd-mcp-env
   sudo k3s kubectl -n mcp create secret generic fd-mcp-env --from-env-file=/opt/fd/finddata/fd-open-data-mcp/.env
   sudo k3s kubectl -n mcp delete pod -l app=fd-open-data-mcp
   # librechat-env holds MCP_TOKEN too — recreate it the same way, then delete the api pod
   systemctl restart fd-demo-proxy
   ```
3. Update the bearer check in `/etc/nginx/fd-auth.conf`; `nginx -t && systemctl reload nginx`.
4. Share the new value with remote MCP users. nginx rejects missing/invalid tokens with 401.

## Domain cutover (finddatatech.cloud) — LIVE

`www.finddatatech.cloud` (static site) and `chat.finddatatech.cloud` (LibreChat) are live over public HTTPS. ICP 备案 approved; Tencent security group opens 443, 30830 closed.

**In place (server side):**
- A records: `www.finddatatech.cloud`, `chat.finddatatech.cloud`, apex `finddatatech.cloud` → `124.220.7.175`.
- nginx blocks `www` (static site) + `chat` (reverse-proxy → `127.0.0.1:30830`, WebSocket/SSE) under `/etc/nginx/sites-available/`, enabled. Repo copies: `deploy/nginx/`.
- `certbot --nginx -d www.finddatatech.cloud -d chat.finddatatech.cloud` issued one Let's Encrypt **production** cert (issuer `CN = YE2`, SAN both names, expires **2026-11-18**); certbot added `:443` + HTTP→HTTPS 301 on both. Auto-renew via certbot's systemd timer (**active**); `certbot renew --dry-run` passed for both names.
- IP-on-:80 `fd` block left as default_server fallback (zero-downtime; anyone on the IP keeps working).
- GitHub org website field set → `https://www.finddatatech.cloud` (verified via `gh api`).

**Tencent Cloud security group (inbound, on CVM `124.220.7.175`):**
| Port | Rule | Why |
|------|------|-----|
| 443 | open, `0.0.0.0/0` | public HTTPS — `www` static + `chat` LibreChat |
| 80 | open, `0.0.0.0/0` | certbot HTTP-01 renewal (every ~60d) + nginx 301→HTTPS; **do not close** or certs auto-expire |
| 30830 | **closed** | LibreChat raw NodePort — cluster-internal only, chat must come through nginx `:443` |
| 22 | open, restricted | SSH |

**Verified externally (2026-08-21):** `nc :443` succeeds · `nc :30830` closed · `https://www` → 200 (`<title>FindData Technology …</title>`) · `https://chat` → 200 (`<title>LibreChat</title>`) · `http://www` → 301 HTTPS · TLS chain verifies (issuer `YE2`) · `/mcp` 401 without bearer. Chat backend healthy (`librechat-api` 1/1 Running 47h, `Server readiness checks passing`, 89 MCP tools loaded).

**WebSocket/SSE streaming (Decision 4):** user-verified end-to-end 2026-08-21 — browser load of https://chat.finddatatech.cloud + a test message round-trip through LiteLLM succeeds, nginx's Upgrade/Connection headers + 86400s timeouts pass streaming through cleanly.

Rollback: `rm /etc/nginx/sites-enabled/{www,chat}.finddatatech.cloud && nginx -t && systemctl reload nginx` (IP `:80` resumes; `certbot delete` to drop the cert).
