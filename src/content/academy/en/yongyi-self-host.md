---
title: "Self-Hosting YongYi: Put Long-Term Memory on Your Own Server"
summary: "YongYi is an MIT-licensed, open-source long-term memory service for AI agents. This course walks you through deploying it from zero on your own machine or cluster — start the service, mint your first token, ask the memory, fence the admin face away from the public internet, and keep backup and acceptance habits that actually reproduce."
order: 3
level: build
updated: "2026-10-29"
source_material: "Public repo FindDataTechnology/fd-memory: docs/DEPLOYMENT.md (deployment tutorial), README.md (configuration & quick start), docs/federation-recipe.md (multi-node onboarding)"
pack_url: ''
---


## What you'll be able to do

Run the YongYi memory service on a machine (or cluster) you own, complete the minimal loop of "mint a token → write a memory → query the memory," fence its admin face (token minting, metrics, reindex) safely away from the public internet, and keep backup and acceptance habits that actually reproduce.

## Prerequisites

- A machine that runs Node 22 or Docker (Linux or macOS).
- A terminal with `curl`; Docker locally if you want the container path.
- Optional: one OpenAI-compatible LLM lane credential to enable the "distill" sidecar (the read-only memory face works without it).
- Sources and image are public: `github.com/FindDataTechnology/fd-memory`, MIT license.

## Steps

### 1. Understand the shape: one process, two kinds of files

YongYi is a **single-process Node service** with no external database. All state is just two things: markdown files under `owners/` (the truth source — readable and diffable) plus derived SQLite indexes (rebuildable any time). So backups only need the markdown; the index can always be recomputed.

### 2. Start the service

Fastest local check (bound to loopback, nothing exposed):

```bash
git clone https://github.com/FindDataTechnology/fd-memory
cd fd-memory && npm ci && npm run build
node dist/index.js serve --port 4000
curl http://127.0.0.1:4000/healthz   # → {"status":"ok"}
```

To serve externally, the container is the least-friction start (the repo ships a `Dockerfile`):

```bash
docker build -t fd-memory .
docker run -d -v fdmm-data:/data \
  -e FD_MEMORY_PEPPER='<production token-hash pepper, must change>' \
  -p 127.0.0.1:49375:49375 fd-memory
```

Pin the port mapping to `127.0.0.1:` and let a reverse proxy in front take the public exposure — never let the container drink the internet directly.

### 3. Mint the first token, ask once

Permissions form a tree: `platform → person → deployment`. On a fresh instance, mint the first platform root with the CLI on a trusted host, then derive a person token through it:

```bash
# 1) trusted host: mint the platform root (customarily labeled bootstrap)
node dist/index.js token mint --kind platform --namespace '*' --label bootstrap
# 2) derive a person token through it (call on the internal network only)
curl -X POST http://127.0.0.1:49375/admin/mint \
  -H "authorization: Bearer $BOOT" -H 'content-type: application/json' \
  -d '{"namespace":"u/demo","label":"first"}'
# 3) read memory with the person token
curl -H "authorization: Bearer <person-token>" \
  'http://127.0.0.1:49375/digest?q=recent+work&k=5'
```

### 4. Fence the admin face with a reverse proxy (the critical step)

This is the step deployments most often miss and least afford to. The service authenticates `/admin/*`, but the edge must additionally block it **at the path layer** — authentication stops abuse, path fencing stops leaking the very information that "this service has an admin face." Route by this table:

| Path | Edge treatment |
|---|---|
| `/healthz` | pass (public read-only probe, use as liveness) |
| `/digest` | pass (401 without a token) |
| `/mcp` | pass, and **disable buffering** (streaming output otherwise arrives whole and late) |
| `/admin/*` | **edge 404** (minting / metrics / reindex — internal only) |
| `/capture` | edge 404 (write face goes through the internal network or MCP, never public) |

A minimal Caddy shape (Nginx is conceptually the same):

```caddy
memory.example.com {
  handle /healthz { reverse_proxy fd-memory:49375 }
  handle /digest  { reverse_proxy fd-memory:49375 }
  handle /mcp { reverse_proxy fd-memory:49375 { } }
  handle { respond 404 }   # everything else 404, incl. /admin and /capture
}
```

### 5. Back up only the truth source; verify checksums before calling a restore

```bash
tar czf fdmm-wiki-$(date +%F).tar.gz -C /var/lib/fdmm owners tokens.db
sha256sum fdmm-wiki-*.tar.gz     # verify before a restore drill; no checksum, no "recoverable" claim
```

Back up `FD_MEMORY_PEPPER` separately and encrypted — rotate it and every old token becomes invalid.

## Self-check

- From the public internet, `curl https://<your-host>/admin/mint` must return **404**, not 401 — a 401 leaks "the admin face lives here."
- `curl https://<your-host>/healthz` returns `{"status":"ok"}`; `/digest` without credentials returns **401**.
- Restore the markdown truth source on another machine; `/digest` still answers what you wrote.

## If it didn't work

- **`/digest` keeps returning 401**: confirm the `Authorization: Bearer <token>` header is present and the token's namespace matches the write side.
- **Short CJK queries miss**: rebuild the derived index with the trigram tokenizer; the vector lane needs a reembed pass afterward.
- **Distill produces nothing**: both gates must pass — `FD_MEMORY_DISTILLER_URL` set and `FD_MEMORY_DISTILL_ENABLED=1`; one alone won't start the scheduler.

## Next steps

When multiple nodes must share one memory, see `docs/federation-recipe.md` in the public repo — a local node registers a remote profile, hooks land in the local spool and drain to the service on schedule; both sides stay visible with zero data loss.
