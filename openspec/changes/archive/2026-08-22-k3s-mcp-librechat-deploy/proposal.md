## Why

The current `fd-open-data-mcp` service runs as a bare systemd unit on `124.220.7.175`, tightly coupled to the host: a hand-installed uv venv at `/opt/fd/mcp/`, a SQLite DB on local disk, and Playwright Chromium baked into the VM. This makes the service non-portable, hard to reproduce, and painful to scale as the user plans to add more applications. The user now wants to consume MCP through a chat interface (LibreChat or a self-built equivalent), which requires MCP to be reachable over the network with stable auth — the current `127.0.0.1:8899` binding is insufficient. Containerizing MCP and running both MCP and LibreChat on a managed k3s cluster gives portability, declarative config, and a clean integration path for chat-driven consumption.

## What Changes

- Install a single-node **k3s** cluster on `124.220.7.175` (Tencent, 4 vCPU/4 GB), replacing the ad-hoc systemd model for MCP. Memory/CPU limits set at install time so k3s cannot OOM the static-site nginx that already runs on the box.
- **Containerize `fd-open-data-mcp`**: add a Dockerfile (python:3.12-slim + uv + Playwright Chromium deps), build, and push to the existing Harbor registry (`harbor.local:30880`).
- Deploy MCP on k3s via a Kubernetes **Deployment + Service (NodePort 30899)** with a **PVC** for the SQLite `daas.db` and a hostPath/ConfigMap for the read-only `fd-*` providers under `FINDDATA_ROOT`. Bearer-token auth preserved.
- Deploy **LibreChat** via the official Helm chart with RAG components (`vectordb`, `rag_api`) **disabled** to fit the 4 GB node. LiteLLM (`http://124.223.42.3:30080`) is the single LLM endpoint.
- **Integrate MCP into LibreChat** via `mcpServers` config (streamable-http + bearer token) so MCP tools are discoverable in the chat UI.
- **Update nginx** on `124.220.7.175` so `/mcp` routes to the k3s NodePort (30899) instead of the old `127.0.0.1:8899`.
- **Decommission** the systemd `fd-mcp.service` unit after the containerized service is verified; keep static-site deploy (rsync + nginx) untouched.

## Capabilities

### New Capabilities
- `k3s-install`: requirements for installing a single-node k3s cluster on the Tencent box with resource limits and local-path storage, coexisting with the existing nginx/static-site.
- `mcp-container`: requirements for building a reproducible `fd-open-data-mcp` container image and running it as a k8s Deployment with persistent SQLite storage and bearer-token auth.
- `librechat-deploy`: requirements for deploying slim LibreChat (no RAG) on k3s with LiteLLM as the sole LLM endpoint.
- `mcp-integration`: requirements for wiring the containerized MCP into LibreChat's `mcpServers` config with streamable-http transport and bearer auth.
- `nginx-mcp-route`: requirements for updating the host nginx reverse-proxy so `/mcp` targets the k3s NodePort and the systemd fallback remains available until cutover.

### Modified Capabilities
<!-- None: existing specs (org-website, repo-showcase, mcp-live-service, etc.) describe the static site and the pre-container MCP exposure; their requirements are not changing. The nginx change here is a deployment-route swap, tracked as a new capability rather than a spec-level modification. -->

## Impact

- **Host `124.220.7.175`**: gains k3s (kubelet, containerd, Traefik disabled) alongside existing nginx + static site. systemd `fd-mcp.service` to be stopped/removed post-verification.
- **Source `finddata/fd-open-data-mcp`**: gains a `Dockerfile` and `.dockerignore`; no Python code changes expected.
- **Image registry**: new image `harbor.local:30880/finddata/fd-open-data-mcp:latest`.
- **k3s cluster**: new namespaces `mcp` and `librechat`; PVC on local-path; NodePorts 30899 (MCP), 30830 (LibreChat app), 30831 (LibreChat admin).
- **nginx config** (`/etc/nginx/sites-available/fd`): `/mcp` upstream changed from `127.0.0.1:8899` to `127.0.0.1:30899`.
- **Memory budget**: ~4 GB node must hold k3s (~300 MB) + MCP (~512 MB–1.5 GB) + LibreChat slim (~1.5–2 GB) + nginx/static (~100 MB). RAG disabled is the key constraint.
- **No change**: static-site CI (`deploy.yml`), rsync atomic-swap, `dist` layout, i18n, bilingual content.
