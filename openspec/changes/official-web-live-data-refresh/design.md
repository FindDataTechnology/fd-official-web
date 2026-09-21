# Design — official-web-live-data-refresh

## Context

Three data surfaces disagree with reality (see proposal.md — Why). The decisive facts established during discovery (2026-09-21):

- Canonical store: Postgres `fd_open_data` on `guangzhou-xinru` (docker `fd-postgres`, port 30432) — 2,105 concepts (1,653 deprecated → **452 active**), 15,118 entities, 6,310,482 `semantic_observations`, 13 `sources`, schema at alembic `0002_sem_obs_source_aware_key`, `concepts.concept_code` column present.
- Deployed MCP store: SQLite on the web box (`/opt/fd/finddata/fd-open-data-mcp/fd_open_data_mcp/metadata/daas.db`) — 15 concepts, 0 entities, 0 observations, no `alembic_version`, no `concept_code` column → `list_concepts`/`coverage_report`/`list_concept_families` all raise `sqlite3.OperationalError`.
- Site snapshot: `src/data/indicators.json` `generated_at 2026-08-28`, `source: "local-db"`, 255 concepts / 5 sources / 29 categories — matches a stale local checkout of the SQLite, not production.
- Build economics: one full build makes ~60 GitHub API calls; anonymous cap is 60/h; no `GITHUB_TOKEN` in any build env → org-list failure writes `repos.json = []` (committed!), and updates coverage silently collapses to one repo.
- Deploy reality: GitHub-hosted image build disabled by policy since 2026-09-10 (refusal stub); the live site is a manual `deploy.sh` rsync from 2026-09-17 21:01; `OPS.md` still documents the disabled GitOps path as live.
- `craw.finddatatech.cloud` (Platform): Logto-gated; `signInMode: SignInAndRegister` with email+password enabled, no social connectors. Demo account `aloadtree@gmail.com` confirmed by the owner as a dedicated, publishable account.

## Goals / Non-Goals

**Goals**: every published number traces to the live export; a failed refresh never degrades the site; `/repos` never blank; `/demo` shows something truthful and inviting; the refresh loop runs without a human.

**Non-Goals**: backfilling `concept_families` / `concept_code` (0 rows upstream — the two-level model is unfinished; `list_concept_families` will legitimately return empty); Logto branding and `/login` copy fixes on the Platform side; demo-account quota/rotation enforcement; the broader `impeccable` UI redesign (follows this change once data is truthful).

## Decisions

**D1 — Point the deployed MCP at the canonical Postgres; do not repair the SQLite.**
The code already accepts a `postgresql://` DSN. Repairing or re-seeding the on-box SQLite recreates a second source of truth that has already drifted once. Switch = update `FD_OPEN_DATA_MCP_DATABASE_URL` in the on-box `.env`, recreate the `fd-mcp-env` secret, delete the pod; the existing `migrate-schema` initContainer then no-ops against an already-at-head database and acts as the gate.
*Alternative rejected*: exporting Postgres → SQLite on a schedule (adds a sync job and a third copy to drift).

**D2 — Stat definitions (the "which number" question).**
- "Indicator concepts" = **active (non-deprecated) concepts** — 452 today, not 2,105. Deprecated rows are excluded from discovery and dispatch by the model's own semantics; publishing the total would count 1,653 retired duplicates.
- "Data sources" = distinct sources present in the concepts export.
- "MCP tools" = `tools/list` count through the same export (52 today; never hardcoded).
- New stats worth adding: entities and observations (15,118 / 6.31M) — the strongest truthful numbers on the page.
*Alternative rejected*: totals everywhere — inflates the headline ~4.6× with retired rows.

**D3 — Fallback policy is "never write on failure", not "write empty".**
Both fetch scripts keep the previous file byte-for-byte on any failure path (org-list failure, per-repo failure, empty result). Emptiness is only legal when no snapshot has ever existed. Freshness is surfaced to visitors via the `generated_at` date on `/indicators`, so a stale export is self-evident instead of silent. (The current `fetch-repos.mjs` catch block is the exact bug: it destroys the committed fallback it was designed to protect.)

**D4 — `/demo` is a static product tour, not an embed.**
The Platform is login-gated; iframing an auth flow is fragile and often blocked. The tour is fully static (renders with zero backend), carries feature copy + visuals, a CTA to `craw.finddatatech.cloud`, and the demo credentials with copy buttons. The demo proxy (`server/demo-proxy.mjs`, port 8898) and the nginx `/demo-api` route are retired with the playground — nothing else consumes them.

**D5 — Refresh path: cheap-1 builds (Node in Docker) and rsyncs static files; nginx serves the static root.**
Decided during implementation, on evidence gathered then:
- The live `/` was actually served by the in-cluster `official-web` pod (nginx proxied to NodePort 30442), so `deploy.sh`'s rsync had been a no-op; the manifest's image tag (built 2026-09-18) was the real release lever.
- Reviving that path needs an image push to the registry k3s pulls from (`harbor.finddatatech.cloud:8080` → rewritten to `100.64.0.8:30880`), which demands registry auth the node's `registries.yaml` does not carry, plus a docker-daemon insecure-registry entry on the build box (a daemon restart there would bounce the MCP gateway stack).
- cheap-1 already runs the fleet's buildx builders, reaches `api.github.com`, and has `docker` + `rsync` + `sshpass`; it has **no** Node and **no** docker.io access.
So: build the site **inside `node:22-alpine`** (mirror-pulled via `dockerproxy.net`), then rsync `dist/` to `/opt/fd/web/dist` and let nginx serve it — OPS.md's documented rollback path promoted to the primary one. The pod path stays as a rollback (flip nginx back). Cron: `/etc/cron.d/fd-web-deploy`, every 6h, self-updating the script from `main`.
*Alternatives rejected*: GitHub-hosted build (policy); registry image path (auth/daemon churn above); installing Node on the host (needless state when docker is already there).

**D6 — Updates noise filter: prefix list in the script, repo exclusion list available but empty.**
Filter commit summaries matching internal-only prefixes (`chore(openspec):`, `chore(cleanup):`, `chore(deps):`, `chore(release):`). Keep repos includable — `fd-craw-private` is a public, real product (Platform); its signal was drowned by openspec/chore chatter, not illegitimate as a repo.

**D7 — Demo credentials live in site content, not env.**
They are intended to be public; indirection buys nothing. Rotation = edit content + rebuild. The account stays non-admin with its own quota (Platform-side, out of scope here but a stated condition of publication).

**D8 — One i18n stat key.**
The homepage asks for `stat.indicators`; the dictionary defines `stat.concepts`. Standardize every page on the existing `stat.concepts` key family (and add the new entity/observation labels alongside) rather than adding a duplicate key.

## Risks / Trade-offs

- [Web box cannot reach `guangzhou-xinru:30432` (mesh ACL)] → verify reachability with a psql probe before touching the secret; if blocked, open the path first — do not flip the DSN speculatively.
- [Public MCP queries hit the canonical Postgres directly] → the existing nginx rate limit (`limit_req zone=mcp`) is the guard; monitor load after cutover. Read-only DB user is a follow-up (Q2).
- [Published credentials get scraped and the account abused for model spend] → accepted by the owner for a dedicated demo account; mitigations (quota, rotation, non-admin) are Platform-side follow-ups recorded in the proposal's out-of-scope.
- [`GITHUB_TOKEN` on the build host] → use a fine-grained token scoped to public-repo read of the org only; it grants nothing beyond what anonymous calls already see, minus the cap.
- [`list_concept_families` returns empty after cutover] → truthful (0 families upstream); not an error. Drill-down and search do not depend on it.
- [Scheduled build host is a single machine] → a missed cycle means a stale-but-correct site (D3 guarantees no blanking); acceptable degradation.

## Migration Plan

1. **Scripts first** (safe, no infra): fallback fixes + token plumbing + updates filter + stat-key fix. Rebuild locally; `/repos` repopulates from the 15 public repos.
2. **MCP cutover** (ops): verify Postgres reachability → update on-box `.env` DSN → recreate `fd-mcp-env` → delete pod → confirm `list_concepts` returns 2,105/452 and `data_stats` is non-empty. Rollback = revert the DSN, recreate secret, delete pod (previous SQLite state untouched).
3. **Export + pages**: run `indicators:fetch` against the fixed MCP, commit the fresh snapshot, ship the new stats/as-of date.
4. **Demo swap**: tour page + credentials, retire proxy + nginx route (`nginx -t && reload`).
5. **Pipeline + docs**: schedule the build on the chosen host, rewrite `OPS.md`'s Deploy section to match.
Each step deploys independently; the site is never in a mixed state beyond one step.

## Open Questions

- ~~Q1: Which host runs the scheduled build~~ **Resolved: cheap-1**, Node-in-Docker + rsync (see D5).
- Q2: Should the MCP use a read-only Postgres role instead of the current owner role? Recommended yes as a fast follow; does not block this change.
- Q3: Do entity/observation counts go on the homepage hero (recommended) or only on `/indicators`? Copy-level call, decide during UI pass.
- Q4 (found during implementation): `list_concepts` has **no pagination or limit parameter** and the server caps a call at 500 rows, so a client cannot enumerate the full 2,105-concept catalog (country alone is 1,798). The export's per-entity-type fan-out recovers the complete **active** set (452 — matches the DB exactly) but cannot reach every deprecated row. Fix belongs upstream in `fd-open-data-mcp` (expose `limit`/cursor on `list_concepts`); the site publishes only active concepts, so nothing user-visible depends on the gap today.
