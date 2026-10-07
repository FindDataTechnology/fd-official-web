# Tasks: Containerize MCP + Deploy LibreChat on k3s

- [x] 1. Inspect server `124.220.7.175`: k3s, docker, repos, `.env`, systemd `fd-mcp`, nginx. **Findings:** k3s already installed (Ready, 8h); no docker; repos + populated `daas.db` + `.env` present; systemd active on `:8899`; ghcr.io reachable.
- [x] 2. Write `Dockerfile` + `.dockerignore`. **Deviation:** slim (no torch) broke `ai_search` → rebuilt as `:torch` with CPU-only torch (`UV_TORCH_BACKEND=cpu`) + sentence-transformers + baked `all-MiniLM-L6-v2` (via `HF_ENDPOINT=https://hf-mirror.com` — huggingface.co is firewalled). All 45 tools work.
- [x] 3. Install `docker.io` on box (daocloud mirror for docker.io pulls); `docker build -t finddata/fd-open-data-mcp:torch`; `docker save | k3s ctr images import -`. docker left installed for rebuilds.
- [x] 4. Write + apply MCP k8s manifests (single `deploy/k8s/mcp.yaml`; secret from on-box .env out-of-band); migrate runs in the container CMD; verified `ai_search` via streamable-http on `:30899` (`AI_SEARCH_OK len=723`). `imagePullPolicy: IfNotPresent` (registry-1.docker.io unreachable).
- [x] 5. Write + apply LibreChat k8s manifests (single `deploy/k8s/librechat.yaml`); api + mongo + meili pods Running.
- [ ] 6. Open `http://124.220.7.175:30830`; admin login; verify LiteLLM endpoint works (send a message, get a reply). **Blocked on user:** Tencent security group must open inbound 30830; login + chat is a browser action.
- [x] 7. nginx cutover: `/mcp` `proxy_pass` `8899`→`30899`; `nginx -t && systemctl reload nginx`; verified bearer gate (401 without token, 406 with token = auth passed). **Extra fix:** removed traefik (k3s default, was NOT disabled at install) whose svclb pod hostPort-hijacked :80/:443 → all traffic Go-404'd. Permanently disabled via `/etc/rancher/k3s/config.yaml` `disable: [traefik]` + k3s restart; nginx owns :80 again, static `/` 200.
- [ ] 8. LibreChat **Tools** tab: confirm `fd-open-data-mcp` tools listed; invoke one from chat. **Server-side verified:** api logs show `Initialized with 1 configured server and 45 tools` (incl. `ai_search`); browser confirm pending with #6.
- [x] 9. Stop systemd `fd-mcp` (stopped + disabled; unit file kept — rollback `sudo systemctl enable --now fd-mcp`); demo-proxy `MCP_URL` repointed 8899→30899 (`/demo` verified via container); `OPS.md` updated with k3s layout, image rebuild flow, token rotation.

## 归档备注（2026-10-07）

本 change 归档时保留 #6/#8 未勾（两项均为「浏览器人工核」），其实质已由服务器侧证据闭环：MCP pod 运行中；LibreChat `librechat-api` 2026-10-01 启动日志 `[MCP] Initialized with 1 configured server and 70 tools`；2026-09-17 有真实问答 3 轮（6 条消息全部 error=false）。30899 现为官网 `/mcp` 与 `/demo-api` 的冻结依赖（根仓 `mcp-pod-deployment` / `mcp-service-deploy` 规格已覆盖）；#6 当时的阻塞（腾讯云安全组 30830）已因 chat 走 nginx 443 而不复存在。
