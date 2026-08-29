# Operations

Ops notes for the FindDataTechnology official site (this repo → `/opt/fd/web` on the Tencent box 124.220.7.175).

## Deploy

**Automatic (GitOps, since 2026-08-29):** `.github/workflows/build-image.yml` runs on every push to `main` + twice daily (03:07 / 15:07 UTC). It builds `dist/`, packages it into `23.144.68.246:30880/fd-web/official-web:<sha>-<ts>`, pushes to Harbor, and commits the new image tag into `deploy/k8s/fd-web.yaml` (`[skip ci]`). The in-cluster **ArgoCD** (argocd namespace, pinned to china-cheap-3 node in the chengsi k3s cluster) auto-syncs and rolls the `official-web` Deployment in namespace `fd-web` (NodePort 30442). Host nginx keeps TLS termination and serves `/demo-api` + `/mcp` directly.

GitHub holds **no server SSH credential** — only a project-scoped Harbor push robot (`HARBOR_USER`/`HARBOR_PASS`).

**Manual:** trigger `build-image` via workflow_dispatch, or push to main. `/fd-site-deploy` skill = local build + push + tag bump.

**Rollback:** `git revert` the tag-bump commit (ArgoCD auto-syncs back), or one-line nginx rollback: restore `try_files` in `location /` + `systemctl reload nginx` (the static root `/opt/fd/web/dist` is kept as fallback backend).

**ArgoCD UI:** `ssh -L 18443:127.0.0.1:30443 -p 40925 root@103.236.89.174` → http://127.0.0.1:18443 (admin; password in local password manager).


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

## Images (no registry — docker.io is firewalled on this box)

Build on the box, import straight to containerd; all Deployments use `imagePullPolicy: IfNotPresent`:

```bash
cd /opt/fd/finddata
sudo docker build -f fd-open-data-mcp/Dockerfile -t finddata/fd-open-data-mcp:torch .
sudo docker save finddata/fd-open-data-mcp:torch | sudo k3s ctr images import -
sudo k3s kubectl -n mcp delete pod -l app=fd-open-data-mcp   # force re-resolve of :torch
```

⚠️ `sudo k3s crictl rmi --prune` deletes imported images that no running pod references — re-import after any prune.

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
