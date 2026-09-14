# Design: Containerize MCP + Deploy LibreChat on k3s

## Reality check (post-inspection of 124.220.7.175)

- **k3s ALREADY installed** — v1.36.3+k3s1, node Ready (8h old), containerd 2.3.2-k3s2. Traefik running; left alone (harmless under NodePort + nginx). P1 install = no-op.
- **No docker / buildkit / nerdctl on box.** `uv` + python3.12 present. Source repos at `/opt/fd/finddata/`.
- **systemd `fd-mcp` ACTIVE** on `127.0.0.1:8899` via `.venv/bin/fastmcp run server.py:mcp --transport streamable-http`. Kept as rollback until P6.
- **MCP `.env`** (`/opt/fd/finddata/fd-open-data-mcp/.env`): `FD_OPEN_DATA_MCP_DATABASE_URL=sqlite:////opt/fd/finddata/fd-open-data-mcp/fd_open_data_mcp/metadata/daas.db`, `FINDDATA_ROOT=/opt/fd/finddata`, `EDGAR_IDENTITY=<set>`, `MCP_TOKEN=<set>`, `LOG_LEVEL=INFO`, `HF_ENDPOINT=https://hf-mirror.com`.
- **`daas.db` pre-populated** (7.8 MB) at that path. No re-seed needed.
- **Only `fd-open-data-mcp` + `fd-open-data-protocol` siblings on box** (no `fd-akshare`/`fd-yfinance`/etc.). Live `fetch`/`import_catalog` over providers won't work regardless of `[data]` install. Core ontology/catalog/entity/graph/policy tools (read `daas.db`) all work with core deps.
- **ghcr.io reachable** (HTTP 401 = network OK; anonymous public pulls work) — LibreChat image pull works.

## Architecture (final)

```
124.220.7.175 (Tencent, 3.6 Gi RAM, k3s v1.36.3, traefik left running)
├─ nginx (existing)
│   /         → /opt/fd/web/dist          (static site, unchanged)
│   /demo-api → 127.0.0.1:8898            (demo-proxy, unchanged)
│   /mcp      → 127.0.0.1:30899           (k3s NodePort, was :8899)
├─ k3s
│  ├─ ns:mcp   Deployment fd-open-data-mcp
│  │           image finddata/fd-open-data-mcp:latest (local containerd, imagePullPolicy Never)
│  │           containerPort 8899 · NodePort 30899 · limit 1.5 Gi
│  │           mounts: /data      ← hostPath /opt/fd/finddata/fd-open-data-mcp/fd_open_data_mcp/metadata (RW, daas.db)
│  │                   /finddata ← hostPath /opt/fd/finddata (RO, FINDDATA_ROOT)
│  │           env: FD_OPEN_DATA_MCP_DATABASE_URL=sqlite:////data/daas.db, FINDDATA_ROOT=/finddata,
│  │                EDGAR_IDENTITY/MCP_TOKEN/LOG_LEVEL from Secret
│  │           cmd: migrate && serve --transport http --host 0.0.0.0 --port 8899
│  └─ ns:librechat
│      api          ghcr.io/danny-avila/librechat:latest · NodePort 30830 → 3080 · 1 Gi
│      mongodb      512 Mi · PVC 2 Gi (local-path)
│      meilisearch  512 Mi · PVC 1 Gi (local-path)
│      ConfigMap librechat.yaml: customEndpoints→LiteLLM, mcpServers.fd-open-data-mcp
│      Secret: LITELLM_API_KEY, MCP_TOKEN, MONGO_*, MEILI_MASTER_KEY, CREDS_KEY, JWT_SECRET, ADMIN_*
│      [vectordb + rag_api NOT deployed — RAG off by omission]
└─ systemd fd-mcp (rollback, stopped at P6)
```

## Image build (no docker on box)

Install `docker.io` via apt on the box, build natively (amd64, fast), import into k3s containerd, then stop docker to reclaim RAM:

```
sudo apt-get install -y docker.io
sudo docker build -t finddata/fd-open-data-mcp:latest \
     -f /opt/fd/finddata/fd-open-data-mcp/Dockerfile /opt/fd/finddata/
sudo docker save finddata/fd-open-data-mcp:latest | sudo k3s ctr images import -
sudo systemctl stop docker.socket docker   # reclaim ~150 Mi; image already in k3s containerd
```

Deployment references `finddata/fd-open-data-mcp:latest` with `imagePullPolicy: Never`.

## Dockerfile design

Single-stage, slim:

- `FROM python:3.12-slim`
- `RUN pip install uv`
- `WORKDIR /app`
- `COPY fd-open-data-protocol/ /app/fd-open-data-protocol/`  (sibling, pure-Python, resolves the `[tool.uv.sources]` path dep)
- `COPY fd-open-data-mcp/ /app/fd-open-data-mcp/`
- `WORKDIR /app/fd-open-data-mcp`
- `RUN uv sync --no-dev`  (core deps only: fastmcp, pandas, sqlalchemy, fastapi, etc. **No `[data]` extra → no akshare/playwright-wheel; no torch** — sentence-transformers is undeclared so not pulled.)
- `ENV FD_OPEN_DATA_MCP_DATABASE_URL=sqlite:////data/daas.db FINDDATA_ROOT=/finddata`
- `EXPOSE 8899`
- `CMD ["sh","-c","uv run fd-open-data-mcp migrate && uv run fd-open-data-mcp serve --transport http --host 0.0.0.0 --port 8899"]`

Image ~400–600 Mi. **Conditional:** if `server.py` imports `sentence-transformers` at module top-level (crashes startup without torch), the Dockerfile must either (a) stub the module or (b) install torch. Verified at build time — see `## Risk: sentence-transformers coupling`.

## Risk: sentence-transformers coupling

`semantic_search.py` / `ai_search.py` do `from sentence_transformers import SentenceTransformer` at module top-level + hardcode a local HF snapshot path. **If `server.py` imports those modules at top-level, the slim image fails to boot.** Grep of `server.py` confirms the import shape before the Dockerfile is finalized. If coupled, options: (1) move imports into tool bodies (lazy) — cleanest but an upstream edit; (2) `pip install sentence-transformers` in image (+1.5 Gi torch — unacceptable on 4 Gi); (3) ship a `sentence_transformers` shim module that no-ops on import. Decision deferred to the grep result; default to (1) or (3) to keep the image slim.

## k8s manifests

### MCP — `deploy/k8s/mcp/`
- `namespace.yaml` — ns `mcp`
- `secret.yaml` — placeholder keys (`EDGAR_IDENTITY`, `MCP_TOKEN`, `LOG_LEVEL`); applied on box with real values via `kubectl create secret generic mcp-env --from-literal=...` (never committed)
- `deployment.yaml` — 1 replica, `finddata/fd-open-data-mcp:latest`, `imagePullPolicy: Never`, port 8899, `resources.limits.memory: 1.5Gi`, envFrom Secret + `DATABASE_URL` + `FINDDATA_ROOT`, volumeMounts `/data` (hostPath RW) + `/finddata` (hostPath RO)
- `service.yaml` — NodePort 30899 → targetPort 8899

### LibreChat — `deploy/k8s/librechat/`
- `namespace.yaml`
- `configmap.yaml` — `librechat.yaml`: `endpoints.custom[LiteLLM]` (baseURL `http://124.223.42.3:30080/v1`, `apiKey: '${LITELLM_API_KEY}'`, `models.fetch: true`), `mcpServers.fd-open-data-mcp` (`type: streamable-http`, `url: http://mcp.mcp.svc.cluster.local:8899/mcp`, `Authorization: Bearer ${MCP_TOKEN}`). No RAG block.
- `secret.yaml` — placeholder keys; applied on box: `LITELLM_API_KEY`, `MCP_TOKEN`, `MONGO_INITDB_ROOT_USERNAME/PASSWORD`, `MEILI_MASTER_KEY`, `CREDS_KEY`, `JWT_SECRET`, `ADMIN_USERNAME/PASSWORD`
- `mongodb-deployment.yaml` + `mongodb-pvc.yaml` (2 Gi)
- `meilisearch-deployment.yaml` + `meilisearch-pvc.yaml` (1 Gi)
- `api-deployment.yaml` (env: `MONGO_URI=mongodb://mongodb:27017/LibreChat`, `MEILI_HOST=http://meilisearch:7700`, no `RAG_API_URL`; mounts ConfigMap at `/app/librechat.yaml`) + `api-service.yaml` (NodePort 30830 → 3080)

### nginx cutover
`/etc/nginx/sites-available/fd`: `proxy_pass http://127.0.0.1:8899/mcp` → `http://127.0.0.1:30899/mcp`. `fd-auth.conf` + `limit_req` stay. Reload.

## Auth model

- **Public `/mcp`** (via nginx :80): nginx still enforces bearer (`fd-auth.conf`) + rate limit. Stays secure.
- **In-cluster** (LibreChat → `mcp.mcp.svc.cluster.local:8899/mcp`): no nginx, FastMCP doesn't enforce bearer — the `Authorization` header LibreChat sends is ignored. Internal cluster traffic only; acceptable. (Full in-cluster auth = FastMCP middleware, out of scope.)

## Resource budget (3.6 Gi)

k3s+system ~0.5 Gi, traefik ~0.1, MCP 1.5 (limit; actual ~0.5), LibreChat api 1 Gi, mongo 512 Mi, meili 512 Mi, nginx ~0.05. Sum of limits ≈ 3.6 Gi (tight); actual ≈ 2 Gi; swap 1.9 Gi buffer. If OOM → meili 256 Mi or stop traefik.

## Rollback

Keep systemd `fd-mcp` unit + `.venv` on the box. Rollback = `sudo systemctl start fd-mcp` + revert nginx `/mcp` → `127.0.0.1:8899`. ~10 seconds.
