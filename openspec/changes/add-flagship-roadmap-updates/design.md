# Design: add-flagship-roadmap-updates

## Context

The site (Astro static, bilingual en/zh, self-hosted on Tencent 124.220.7.175 behind nginx) currently has: homepage with about section, auto repo grid + README passthrough pages, docs, and a live demo. Deploys are manual (local build + rsync). The flagship repo `fd-open-data-mcp` has a Keep-a-Changelog `CHANGELOG.md`; the other 8 repos do not. The domain plan is finddatatech.cloud (Tencent registrar, ICP 备案 pending — user action), so the site stays IP-first HTTP for now.

## Goals / Non-Goals

**Goals:**
- Give the flagship product a curated narrative home distinct from raw README pages
- Make the 蝉蜕/卧龙/九天 plan public and status-driven
- Make "what changed" visible with near-zero ongoing maintenance (maintain CHANGELOGs in repos, site follows)
- Make publishing fully automatic (push or schedule → live), with a manual one-command override

**Non-Goals:**
- Cross-repo `repository_dispatch` triggers (push to fd-open-data-mcp → site rebuild). Needs a PAT; the 6h schedule is good enough for now. Revisit if latency matters.
- Per-project curated pages beyond the flagship (other repos keep README passthrough)
- HTTPS/domain cutover (blocked on user: security group port 80, DNS, 备案)
- Comments/reactions/analytics on the updates feed — it's static content

## Decisions

### D1: Flagship page = curated content collection entry, not a hardcoded page
Curated copy lives in `src/content/docs`-style collection (or a `flagship` collection) as bilingual md, rendered by `/fd-open-data-mcp` + `/zh/fd-open-data-mcp` pages. Rationale: keeps all prose in content files (same pattern as docs/roadmap), page template stays thin. Alternative — hardcode copy in the .astro page: rejected, it breaks the "content lives in content collections" convention and makes copy edits touch markup.

### D2: Roadmap as its own `roadmap` collection
One md per phase: frontmatter `{ name, pinyin, period, goal, status: 'in-progress' | 'planned' | 'done', order }`, body for freeform detail. Homepage strip and `/roadmap` both render from it. Rationale: status is the mutable field; frontmatter edits are the cheapest possible maintenance. Alternative — i18n strings in `src/i18n.ts`: rejected, mixing structured status data into a flat string map is awkward and harder to extend (e.g. adding a 4th phase later).

Bilingual handling: either two files per phase (`chantui.en.md`, `chantui.zh.md`) or one file with `goal_en`/`goal_zh` fields. **Choose one file per phase with `_en`/`_zh` fields** — 3 files total instead of 6, and status/period are language-neutral so they stay single-source.

### D3: Updates feed extends the existing fetch script
`scripts/fetch-repos.mjs` already pulls repos + READMEs from the GitHub API. Extend it to also write `src/data/updates.json`:
- For each repo: `GET /repos/{org}/{repo}/contents/CHANGELOG.md` → parse `## [x.y.z] - YYYY-MM-DD` sections (small regex parser, ~30 lines; no new dependency — the format is regular enough).
- Repos without a changelog: `GET /repos/{org}/{repo}/commits?per_page=5` → first line of message + date.
- Merge, sort desc by date, cap at ~50 entries.
- Cache: reuse the existing graceful-fallback pattern (keep last good `updates.json` committed or on disk; build succeeds offline).

Rationale: mirrors the proven README-fetch mechanism; same failure modes, same caching. Alternative — runtime fetch from the browser: rejected (rate limits, CORS, slower, breaks the static-site model).

### D4: GitHub Actions build + rsync deploy (not server-side cron)
Workflow `.github/workflows/deploy.yml`: `on: push (main) + schedule (cron twice daily, e.g. 3:07/15:07 UTC — off-:00/:30) + workflow_dispatch`. Steps: checkout → node → `node scripts/fetch-repos.mjs` (uses built-in `GITHUB_TOKEN`) → `astro build` → rsync `dist/` over SSH. Secrets: `DEPLOY_SSH_KEY`, `DEPLOY_HOST` (124.220.7.175), `DEPLOY_USER` (ubuntu), plus a `MCP_TOKEN`-free config since the site build doesn't need it.

Rationale over server cron: GitHub API access is fast/tokened in Actions and not subject to CN network flakiness; server needs zero tooling; failure visibility is free (Actions tab). Public repo → Actions minutes are free.

Deploy safety: rsync to a temp dir + atomic swap (`dist-new` → `dist`) avoids nginx serving a half-written tree; no nginx reload needed for static files.

Manual path: `/fd-site-deploy` skill wraps the existing local build + rsync so a manual publish is one command. Same script the workflow conceptually runs, executed locally.

### D5: SSH key hygiene
Generate a dedicated ed25519 keypair for deploys; public key appended to `ubuntu@124.220.7.175:~/.ssh/authorized_keys` with a comment marker; private key goes to Actions secrets and local `~/.ssh/config` (`Host fd-deploy`). Never committed. Optionally scope server-side with a forced command or a dedicated `deploy` user later — acceptable to start with ubuntu since it already owns /opt/fd/web.

## Risks / Trade-offs

- [Actions schedule is best-effort and can be delayed/skipped under GitHub load] → 6h cadence tolerates slips; manual `/fd-site-deploy` covers urgent publishes.
- [Changelog regex parser breaks on non-standard formats] → Only the flagship changelog matters today and it's clean Keep-a-Changelog; parser failure for any repo falls back to commits, never fails the build.
- [Deploy key compromise gives shell on the server] → Key is deploy-only, rotatable; mitigation path is the dedicated `deploy` user (noted as future hardening, not blocking).
- [Half-deployed tree served by nginx] → temp-dir + atomic swap in the rsync step.
- [Two bilingual strings for roadmap goals drift apart] → single file per phase keeps them adjacent; reviewer eyeballs at edit time.

## Migration Plan

1. Generate deploy keypair; install pubkey on server; add secrets to the repo.
2. Add workflow file; first run validates CI deploy end-to-end.
3. Extend fetch script (updates.json); add roadmap + flagship collections/pages; nav + homepage strip.
4. Deploy via the new pipeline; verify `/roadmap`, `/updates`, `/fd-open-data-mcp` live.
5. Rollback: `git revert` + re-run workflow (or rsync previous dist backup kept server-side as `dist.prev`).

## Open Questions

- 备案 timeline for finddatatech.cloud (user action) — does not block this change; domain cutover is a separate later change.
- Whether 蝉蜕 should get per-iteration entries in the updates feed (it will, naturally, via the flagship CHANGELOG — no extra mechanism needed).
