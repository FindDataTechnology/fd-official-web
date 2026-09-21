# Tasks — official-web-live-data-refresh

## 1. Build scripts: non-destructive fallbacks + auth

- [x] 1.1 In `scripts/fetch-repos.mjs`, make every failure path preserve the existing `src/data/repos.json` byte-for-byte (org-list failure currently writes `[]`); an empty array may only be written when no snapshot exists. Verify: temporarily point `ORG` at a nonexistent org, run `npm run repos:fetch`, confirm `repos.json` is unchanged and the warning names the failure; then revert.
- [x] 1.2 Same for `src/content/repos/` — on org-list failure the previously generated README collection must not be deleted (the `rm -rf` currently runs before the fetch succeeds). Verify: run the failing-fetch case and confirm the directory still contains the prior build's files.
- [x] 1.3 Add authenticated GitHub API calls: send `Authorization: Bearer $GITHUB_TOKEN` on every request when the env var is set; document `GITHUB_TOKEN` in `.env.example` and `OPS.md`. Verify: run a full `npm run repos:fetch` with a token and confirm ~60 calls complete without HTTP 403 (check `api.github.com/rate_limit` before/after).
- [x] 1.4 In `scripts/fetch-repos.mjs` `fetchUpdates`, filter commit summaries matching internal-only prefixes (`chore(openspec):`, `chore(cleanup):`, `chore(deps):`, `chore(release):`) and skip repos on an exclusion constant (starts empty). Verify: rebuild `updates.json` and confirm no `chore(openspec)` entries remain while other commits from the same repo do.
- [x] 1.5 In `scripts/fetch-indicators.mjs`, make the failure path leave `src/data/indicators.json` untouched (it already does for most errors — add the empty-concepts guard) and extend the payload with `entities_count`, `observations_count`, and `active_concepts` (non-deprecated) alongside `tools_count`. Verify: point `FD_INDICATORS_MCP_URL` at a dead port, run the fetch, confirm the file is byte-identical and the warning prints.

## 2. Pages: truthful stats, labels, freshness, link targets

- [x] 2.1 Fix the stat-key mismatch: use the existing `stat.concepts` key family on both homepages (`src/pages/index.astro`, `src/pages/zh/index.astro`); add i18n labels for entities/observations stats in `src/i18n.ts` (EN + ZH). Verify: build and confirm every `.stat` block renders a non-empty `<span>` in both locales.
- [x] 2.2 Derive homepage stats from the export per design D2: active concept count, source count, tools count, entity count, observation count; omit any stat whose field is missing. Verify: build with the current snapshot and confirm rendered numbers equal the JSON values; remove `tools_count` from a scratch copy and confirm the stat block disappears.
- [x] 2.3 Show the catalog as-of date: render `generated_at` (localized) near the indicators page header on `/indicators` and `/zh/indicators`. Verify: build and confirm the date string appears and matches the JSON.
- [x] 2.4 Retarget indicator drill-down's "try it live" link from `/demo` to the flagship product page in `IndicatorsExplorer.astro` (both locales). Verify: click a drill-down on the built page and land on the flagship page in the same locale.
- [x] 2.5 Refresh `/repos` empty-state copy in `src/i18n.ts` so it no longer claims auto-listing when the fallback snapshot is being served (distinguish "no repos yet" from "showing last-known list"). Verify: inspect the built `/repos` page in both locales.

## 3. MCP cutover to the canonical store (ops, gated by reachability)

- [x] 3.1 From the web box (124.220.7.175), verify Postgres reachability to the canonical host (`guangzhou-xinru`, docker `fd-postgres` on 30432) with a `psql`/`pg_isready` probe. Do not proceed to 3.2 until this passes; if blocked, resolve network/ACL first and record what was opened.
- [x] 3.2 Update `FD_OPEN_DATA_MCP_DATABASE_URL` in the on-box `/opt/fd/finddata/fd-open-data-mcp/.env` to the canonical Postgres DSN, recreate the `fd-mcp-env` secret, and delete the `fd-open-data-mcp` pod so the migrate-schema initContainer gates the start. Verify: pod Ready; `list_concepts` returns non-erroring counts (expect 2,105 total / 452 active); `data_stats` returns non-empty stores.
- [x] 3.3 Post-cutover checks against `https://www.finddatatech.cloud/mcp`: `list_concepts`, `coverage_report`, `data_stats`, and one `read` all succeed; record the live tool count from `tools/list`. Verify: the four calls return without `sqlite3.OperationalError`.
- [x] 3.4 Rollback rehearsal: document (in this change's PR/diff notes) the revert path — old DSN back into `.env`, recreate secret, delete pod — and confirm the previous serving state is restorable without data loss.

## 4. Demo page → Platform product tour

- [ ] 4.1 Replace `src/pages/demo.astro` + `zh/demo.astro` and retire `DemoWidget.astro` with a static bilingual Platform tour: feature highlights, visuals, CTA to `https://craw.finddatatech.cloud`, demo credentials block with per-field copy buttons and a "shared demo account" label. Verify: both `/demo` and `/zh/demo` render with no runtime backend calls (build offline and load the pages).
- [ ] 4.2 Add the demo account strings (identifier + password + label) to site content per design D7 — committed, not env-driven. Verify: grep the built `dist/` confirms the credentials appear only on the two tour pages.
- [ ] 4.3 Retire the demo proxy: stop/disable the `fd-demo-proxy` systemd unit and remove the nginx `/demo-api` route, then `nginx -t && systemctl reload nginx`. Verify: `curl /demo-api` returns 404 at the edge and the tour pages still load.
- [ ] 4.4 Sweep for stale `/demo` references: nav copy, `i18n.ts` demo strings, repo cards' demo buttons, docs links that pointed at the playground query flow. Verify: site-wide grep in `src/` for playground-era strings comes back clean; nav link still resolves to the tour.

## 5. Refresh pipeline + docs truth

- [ ] 5.1 Decide the build host (design Q1: america/fd-deploy box vs operator Mac) and record the choice in `design.md`. Verify: decision noted with rationale.
- [ ] 5.2 Stand up the scheduled build: cron/launchd on the chosen host running `npm run build && ./deploy.sh` on push-equivalent cadence (≥ every 6h), with `GITHUB_TOKEN` and `FD_INDICATORS_MCP_TOKEN` in the build env. Verify: one unattended cycle completes and `/opt/fd/web/dist/index.html` mtime advances; a deliberately broken build leaves the live site untouched.
- [ ] 5.3 Rewrite `OPS.md`'s Deploy section to describe the path that actually ships (removing the disabled-GitOps narrative), including where tokens live and the rollback line. Verify: a reader following OPS.md can run a deploy and a rollback cold.
- [ ] 5.4 Full end-to-end verification: after one scheduled cycle, confirm `/repos` lists the org's public repos, homepage stats match the export, `/indicators` shows the as-of date, `/updates` shows multi-repo entries without internal-noise commits, and `/demo` shows the tour with credentials. Verify: each check observed on the live site in both locales.
