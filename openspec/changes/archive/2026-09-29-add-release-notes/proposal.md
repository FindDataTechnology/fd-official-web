# Proposal: add-release-notes

## Why

The site's only progress surface is `/updates`, a build-time developer feed of
commit subjects and changelog bullets. There is no customer-facing account of
what shipped and why it matters, even though the raw material already exists in
volume (128 archived OpenSpec change proposals in the workspace, per-repo
CHANGELOGs, and git-tracked data-coverage snapshots). Customers, prospects, and
sales conversations currently have nothing on the site that says "here is what
FindData shipped recently" in language a non-engineer can read.

This change adds that layer. It is deliberately a *curation* layer on top of
existing machinery: the site already rebuilds every ~6 hours and already has
the hand-written-bilingual-content pattern (`content/apps/`) coexisting with
auto-generated data (`/updates`, `/repos`), so the new capability follows an
established site archetype rather than introducing a new one.

## What Changes

- **New bilingual content collection `releases`** (`src/content/releases/<issue>.md`):
  one entry per issue, on a fixed biweekly cadence, finalized by a human from
  an AI-drafted summary of that period's customer-relevant changes. Each entry
  states what shipped, organized by product line (`data` / `legal` / `paas` /
  `token`), and includes a data-coverage delta section with verifiable numbers.
- **New pages `/releases` and `/zh/releases`** rendering the collection
  reverse-chronologically, with a nav entry in both locales.
- **Coverage delta tooling**: a script that diffs the current
  `src/data/data-modules.json` coverage snapshot against the snapshot stored
  with the previous release issue, producing the numbers for the
  "coverage changes" section. Each release issue commits its own
  `coverage.json` snapshot so the next diff is deterministic.
- **Editorial convention, encoded in the spec**: an issue covers only the lines
  that have progress; it never asserts "no news this period" for a paused line
  (consistent with how `/data` labels the paused legal module). Numbers quoted
  in an issue must come from the committed snapshots, not from memory.
- **Modified — `updates-feed` hygiene**: the committed offline fallback
  (`src/data/updates.json`) must never contain entries from repos that are not
  currently public. Today the committed fallback still holds commit subjects of
  `fd-craw-private` (now private) captured before it went private; if a build
  runs while the GitHub API is unreachable, those internal commit subjects
  would be served on the public site. The fallback is filtered/regenerated so
  the exclusion guarantee covers the fallback path too.

## Capabilities

### New Capabilities

- `release-notes`: customer-facing release-notes layer — bilingual curated
  issues at a fixed cadence, coverage deltas from committed snapshots, and the
  editorial rules that keep the layer truthful (verified numbers only, silent
  on paused lines).

### Modified Capabilities

- `updates-feed`: the offline-fallback requirement is extended — the committed
  fallback feed must be subject to the same public-only guarantee as the live
  fetch, so a degraded build can never publish non-public repo activity.

## Impact

- `src/content.config.ts` — declare the `releases` collection.
- `src/content/releases/**` — new content (first launch issue included).
- `src/pages/releases.astro`, `src/pages/zh/releases.astro` — new pages.
- `src/i18n.ts` — nav labels and page copy for both locales.
- `scripts/release-coverage-diff.mjs` — new authoring-time script (no build
  dependency; the page renders committed markdown only).
- `scripts/fetch-repos.mjs` + `src/data/updates.json` — fallback hygiene fix.
- No API, dependency, or deployment-pipeline changes; the page rides the
  existing 6-hour build/deploy cycle.
- Out of scope here (tracked separately): the sales one-pager and the VAAS
  social distribution that also consume these release notes — both live in
  other repos per the workspace's one-task-per-subproject constraint.
