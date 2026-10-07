# Operations

Ops notes for the FindDataTechnology official site (this repo → `/opt/fd/web` on the Tencent box 124.220.7.175).

## Deploy

**TCR 镜像 + ArgoCD 拉取式 GitOps**（2026-09-22 起为线上模型；镜像通道 2026-10-01 切 TCR）。
发版 = 在 `deploy/k8s/fd-web.yaml` 把镜像 tag 升到目标 sha（一条 bump commit，如 `chore(deploy): roll official-web to sha-xxxxxxx`）。链路：push `main` → GitHub Actions `.github/workflows/image.yml`（push / 手动 dispatch）在镜像内构建 Astro 站（多阶段 `Dockerfile`；指标导出经 BuildKit secret `fd_indicators_token`，缺失时退回仓库内快照）→ 推 `hkccr.ccs.tencentyun.com/fd-web/official-web:sha-<sha>`（腾讯云 TCR 个人版）→ 集群从 `ccr.ccs.tencentyun.com` 拉取（国内分发经 cheap-3 tcr-relay 回灌，见 commit 1ab5fc1）。chengsi 上的 ArgoCD app `fd-web`（source = gitee `main`，path `deploy/k8s`，`directory.include` 仅 `fd-web.yaml`；auto-sync + prune + selfHeal）轮询到 bump 后滚动 `official-web` Deployment（2 副本，固定 `vm-0-9-ubuntu` 节点，NodePort **30442**）；宿主 nginx `location /` 反代该 NodePort。

**回滚：** revert 该 tag bump 提交（ArgoCD 自动回到上一版）；或宿主 nginx `location /` 临时切回静态根（`.bak-static-20260922` 备份配置；`/opt/fd/web/dist*` 停留在 2026-09-22 的版本）。

**历史路径（均已退役）：** ① GitHub-secrets SSH + rsync（`deploy.yml`）：2026-08-29 删除；`DEPLOY_SSH_KEY`/`DEPLOY_HOST`/`DEPLOY_USER` 已从 GitHub secrets 清除，服务器旧部署公钥已撤销（旧私钥登录被拒），Mac 侧换 `fd-deploy`（`~/.ssh/fd_deploy_new`）。② cheap-1 国内构建 + rsync 静态目录（`scripts/build-deploy.sh` + `/etc/cron.d/fd-web-deploy` 每 6h）：2026-09-21 上线、09-22 切回 pod 路径，cron 已全注释停跑；其构建环境在构建箱 `/opt/fd/fd-web-build.env`（chmod 600，含 `FD_INDICATORS_MCP_TOKEN`/`GITHUB_TOKEN`/`FD_WEB_DEPLOY_PASS`）。GitHub secrets 现为 `TCR_USERNAME`/`TCR_PASSWORD`。手动发布 = dispatch `image` workflow + 本地 bump tag（`/fd-site-deploy` 同路径），或直接触发 ArgoCD sync。

**ArgoCD UI（chengsi）：** `ssh -L 18443:127.0.0.1:30443 ubuntu@124.220.7.175` → http://127.0.0.1:18443（`argocd-server` NodePort 30443；admin 口令在本地密码库）。


## Layout on the server

```
/opt/fd/
  web/dist           static site — 2026-09-22 起退役为回滚副本（线上由 pod 经 nginx 提供）
  web/dist.prev      更早一版（回滚目标）
  web/.env           secrets: MCP_TOKEN, MCP_URL, EDGAR_IDENTITY, ... (chmod 600, never commit)
  web/server/demo-proxy.mjs   ACTIVE（Platform tour 演示的 /demo-api 后端：systemd 运行中，
                     MCP_URL 指向 127.0.0.1:30899）
  finddata/          fd-open-data-mcp + fd-open-data-protocol checkouts
                     — hostPath-mounted RW into the MCP container (same paths as bare metal)
```

**MCP storage (2026-09-21):** the deployed MCP reads the **canonical Postgres**
(`fd_open_data` on `guangzhou-xinru`, reached over the tailnet at `100.64.0.3:30432`)
via `FD_OPEN_DATA_MCP_DATABASE_URL` in the `fd-mcp-env` secret. The on-box SQLite
(`.../metadata/daas.db`) is dev-only and was the source of a long-running
"empty catalog" incident — do not point the Deployment back at it. The
`migrate-schema` initContainer runs `alembic upgrade head` against whatever DB
the DSN names and gates the rollout.

k3s (single-node, v1.36.3) runs the MCP + LibreChat. traefik is disabled via
`/etc/rancher/k3s/config.yaml` (`disable: [traefik]`) so nginx keeps :80/:443.

| Namespace | Workload | Exposure |
|-----------|----------|----------|
| `mcp` | `fd-open-data-mcp` Deployment（镜像 `ccr.ccs.tencentyun.com/finddata/fd-open-data-mcp:<sha>`，TCR——以 `deploy/k8s/mcp.yaml` 为准；Harbor tag 为回退） | NodePort **30899** → 8899 |
| `librechat` | `librechat-api` + `-mongo` + `-meili` (slim, RAG off, LiteLLM backend) | NodePort **30830** |

Manifests live in this repo: `deploy/k8s/mcp.yaml`, `deploy/k8s/librechat.yaml`.
Secrets are k8s Secrets made from the on-box .env files (`fd-mcp-env`, `librechat-env`) — never in git.

nginx config: `/etc/nginx/sites-available/fd` (IP-on-:80 fallback, default_server) + `www.finddatatech.cloud` + `chat.finddatatech.cloud` (TLS, managed by certbot). Repo copies: `deploy/nginx/`. Routes: `www` `/` → **30442**（pod） · `www`+`fd` `/mcp` → **30899** (bearer check + `limit_req`) · `www` `/demo-api` → **8898**（fd-demo-proxy → MCP） · `chat` `/` → **30830** (WebSocket/SSE, long timeouts).

## Images — Harbor registry on china-cheap-2

Private Harbor (v2.12) runs on **china-cheap-2** (`103.236.89.174`, SSH port `20400`, root; creds in the finddata workspace `ssh-config.json`). It speaks **plain HTTP on loopback only** (no usable public HTTP ports on that box; tailnet ACLs block peers), so consumers reach it through SSH tunnels:

- **This box**: `harbor-tunnel.service` (systemd, key `~/.ssh/harbor_tunnel`) → `127.0.0.1:5000`.
- On cheap-2 itself: `harbor-endpoint.service` (socat watchdog) forwards `127.0.0.1:5000` → harbor nginx container (docker host-ports are broken on that box — internal k3s iptables — don't expose Harbor directly).
- Harbor admin password: see the operator's local `finddata/.harbor-creds` (never commit).
- cheap-2 egress is heavily firewalled (no docker.io CDNs, no pypi.org, no github) — **never build there**; use it only as storage.
- **2026-10-07 复核：** 官网已回到镜像形态（TCR，见 Deploy）；mcp 镜像亦切 TCR（Harbor 作回退 tag），librechat 基础镜像引用 `harbor.finddatatech.cloud:8080`（以 `deploy/k8s/*.yaml` 为准）。

### Image sources

- `finddata/fd-open-data-mcp:torch` — build from the exact `/opt/fd/finddata` tree (use the web-box `Dockerfile`; the GitHub HEAD one is the slim variant). Build on the **america box** (23.144.68.246; full internet, docker + skopeo): sync source there (`FROM scratch` + `COPY` + `docker push` into its registry works when SSH is GFW-flaky), `docker build`, push to its local registry (`127.0.0.1:5000`).
- Foreign images (`mongo:7`, `meilisearch:v1.6`, `librechat`) — `skopeo copy` on the america box from docker.io/ghcr.
- **Relay into Harbor** (america↔cheap-2 links are unreliable): run on THIS box — `skopeo copy --src-tls-verify=false --dest-tls-verify=false --dest-creds admin:$HP docker://23.144.68.246:5000/<img> docker://127.0.0.1:5000/<img>`. Slow (≈3 Mbps) but unattended.

### k3s pull config

`/etc/rancher/k3s/registries.yaml` maps **`harbor.fd`** → `http://127.0.0.1:5000`. Harbor projects `finddata`/`cache` are **public-pull** (containerd 2.x ignores registries.yaml auth and k3s didn't pass imagePullSecrets to it either — the `harbor-auth` secrets in mcp/librechat are harmless future-proofing; push still needs admin). Manifests: `harbor.fd/finddata/fd-open-data-mcp:torch`, `harbor.fd/cache/mongo:7`, etc. `imagePullPolicy: IfNotPresent` — after pushing a new digest under the same tag, `ctr -n k8s.io images rm harbor.fd/finddata/fd-open-data-mcp:torch` then rollout-restart, or containerd reuses the cached tag.

**2026-10-07 复核：** mcp / 官网镜像已切 `ccr.ccs.tencentyun.com`（TCR）；本节的 `harbor.fd` 映射为 Harbor 形态记录，仍适用于 Harbor 回退 tag。

⚠️ The pull path shares the box's ~3 Mbps uplink — cold pulls of the full set take hours. Keep Harbor as the durable copy.

## Services

| Unit / command | What |
|------|------|
| `fd-demo-proxy` (systemd) | **ACTIVE**（Platform tour 演示的 `/demo-api` 后端；MCP_URL 指向 30899） |
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

`www.finddatatech.cloud`（官网）and `chat.finddatatech.cloud` (LibreChat) are live over public HTTPS. ICP 备案 approved; Tencent security group opens 443, 30830 closed.

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
