## Why

The site's three headline claims are all false right now. `/repos` renders an empty grid ("No repositories yet") while the org has 15 public repos with fresh commits; `/indicators` and the homepage advertise 255 indicator concepts / 5 data sources from a snapshot frozen at 2026-08-28, while the canonical database holds 2,105 concepts (452 active), 13 sources, 15,118 entities and 6.31M observations; and the `/demo` playground returns raw JSON with every name null and no values. Behind each: the deployed MCP serves a 15-row seed SQLite (schema never migrated, `list_concepts` errors), the build scripts overwrite last-good data with empty arrays on failure, the GitHub fetch runs unauthenticated against the 60 req/h cap, and the CI pipeline that used to refresh all of this has been a refusal stub since 2026-09-10.

## What Changes

- **MCP serves the canonical database.** The deployed `fd-open-data-mcp` pod switches from the stale on-box SQLite seed to the canonical Postgres (`fd_open_data`, host `guangzhou-xinru`) via `FD_OPEN_DATA_MCP_DATABASE_URL`; the schema-migration initContainer gates the switch. `list_concepts` / `coverage_report` / `data_stats` stop erroring and return non-zero canonical counts.
- **Non-destructive data fallbacks.** Both fetch scripts (`fetch-repos.mjs`, `fetch-indicators.mjs`) keep the last committed snapshot on failure instead of writing `[]`; a failed refresh is logged loudly and leaves `generated_at` untouched. `/repos` can never again ship blank because one build's network flaked.
- **Authenticated GitHub fetch.** The repo/README/updates fetch uses a `GITHUB_TOKEN` when configured (~60 API calls per build exceeds the unauthenticated 60/h cap — the direct cause of the empty grid and the 5-entry updates feed).
- **Truthful stats.** Homepage and `/indicators` numbers derive from the same live export (active concept count, source count, entity count, observation count, MCP tool count from `tools/list`), every stat renders a localized label (the homepage's first stat card currently has an empty label — `stat.indicators` vs `stat.concepts`), and the page shows the export's as-of date so staleness is visible.
- **Updates feed hygiene.** Internal-only commit types (`chore(openspec)`, `chore(cleanup)`, …) and repos on an exclusion list are filtered out of the public feed.
- **Demo page becomes the Platform product tour.** `/demo` stops being the broken MCP query playground and becomes a bilingual Platform showcase — feature highlights, a prominent entry CTA to `https://craw.finddatatech.cloud`, and the published shared demo account (dedicated `aloadtree@gmail.com` credentials, confirmed as safe to publish). The server-side demo proxy is retired with it. Indicator drill-down "try it live" links retarget accordingly.
- **Refresh mechanism matches reality.** The disabled GitHub-hosted image build is replaced by a domestic build + deploy path on a schedule, and `OPS.md` is corrected to describe whatever actually ships (it currently documents an ArgoCD/GitOps auto-build that no longer runs).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `mcp-live-service`: the backend's storage requirement changes from the on-box SQLite `daas.db` to the canonical Postgres; adds a requirement that catalog tools return non-erroring, non-empty canonical data behind a schema gate, and that the deployed tool count is discoverable rather than hardcoded.
- `indicator-catalog`: the export must reflect the live catalog with a non-destructive fallback; stats derive from the export with localized labels and a visible as-of date; drill-down link targets change with the demo page replacement.
- `repo-showcase`: the build fetch authenticates with a token; build resilience changes from "empty grid on failure" to "last committed snapshot preserved on failure".
- `updates-feed`: same last-good preservation, plus exclusion of internal-only commit types and repos from the public feed.
- `demo-playground`: the query playground is replaced by the Platform product tour with a trial entry and published demo credentials; token-proxy requirements are removed with the playground.
- `auto-deploy`: the GitHub-hosted Actions pipeline requirement is replaced by a domestic build/deploy path with an equivalent trigger cadence (push + at least every 6 hours).

## Impact

- **Scripts**: `scripts/fetch-repos.mjs` (fallback policy, token, updates filtering), `scripts/fetch-indicators.mjs` (fallback policy, stats fields).
- **Pages/components**: `src/pages/index.astro` + `zh/index.astro` (stats), `src/pages/indicators.astro` + `zh/` and `src/components/IndicatorsExplorer.astro` (as-of date, link targets), `src/pages/demo.astro` + `zh/demo.astro` and `src/components/DemoWidget.astro` (replaced by tour), `src/pages/repos.astro` (empty-state copy), `src/i18n.ts` (stat keys, demo strings).
- **Server/infra**: `deploy/k8s/mcp.yaml` + on-box `fd-mcp-env` secret (database URL), `server/demo-proxy.mjs` retired, nginx `/demo-api` route removal, `OPS.md` rewritten deploy section, deploy schedule (cron or equivalent domestic path).
- **Secrets**: `GITHUB_TOKEN` added to the build environment; MCP database URL moves to the canonical Postgres DSN (network reachability from the web box to `guangzhou-xinru:30432` must be verified — the mesh is Tailscale-based).
- **Out of scope**: `concept_families` backfill (0 rows upstream, two-level model unfinished), Logto login-page branding and `/login` copy fix on the Platform side, demo-account quota/rotation policy enforcement, and any UI redesign beyond the pages touched above (a separate `impeccable`-driven pass is planned after the data is truthful).
