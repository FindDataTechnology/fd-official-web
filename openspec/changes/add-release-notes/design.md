# Design: add-release-notes

## Context

See `proposal.md` — Why. The site already hosts two content archetypes this
design builds on: hand-written bilingual content collections (`content/apps/`
with `en/` + `zh/` directories, build-failed on bad frontmatter) and build-time
generated data (`src/data/*.json`). `/updates` is the developer feed and stays
as-is. The deploy pipeline rebuilds every ~6 hours from committed state, and
`npm run build` runs `repos:fetch → indicators:fetch → data-modules:build →
astro build`.

## Goals / Non-Goals

**Goals:**

- Make authoring one issue cheap enough to sustain a biweekly cadence: write
  two markdown files, run one script, commit.
- Keep the page renderable from committed content only (no build-time network
  dependency for `/releases`).
- Make every coverage number in an issue reproducible from committed files.
- Close the `/updates` fallback privacy gap with a guard that holds even if
  the committed fallback goes stale again.

**Non-Goals:**

- No CMS, no scheduling service, no automation of the human finalization step.
- No changes to `/updates` sourcing or the developer feed's behavior beyond
  the fallback guard.
- Sales one-pager and VAAS distribution (other repos; they consume the JSON
  feed this change exposes).

## Decisions

### D1: Storage — paired markdown files per issue, following the `apps` pattern

`src/content/releases/en/<slug>.md` + `src/content/releases/zh/<slug>.md`,
declared in `src/content.config.ts` with a `glob` loader (pattern `**/*.md`,
so JSON sidecars elsewhere are ignored). Slug = the issue's period end date
(`YYYY-MM-DD`), which sorts naturally and is stable. Frontmatter carries
`label`, `period_start`, `period_end`, `headline`, and a `lines` list
(`data`/`legal`/`paas`/`token`).

*Alternative*: a single file with `body_en`/`body_zh` frontmatter fields —
rejected: breaks the collection idiom the site already uses and fights
markdown tooling.

### D2: Coverage snapshots live in `src/data/release-snapshots/`, not in the content dir

Each issue commits `src/data/release-snapshots/<slug>.json` — a slim extract
of that moment's `data-modules.json`: per module
`{id, indicators, mapped_indicator_count, coverage_rate}` plus totals and
`generated_at`. Keeping snapshots out of `content/releases/` avoids the md
glob loader and keeps "narrative" and "evidence" in different trees.

`scripts/release-coverage-diff.mjs` (authoring-time only, never wired into
`npm run build`) runs `data-modules:build`, captures the snapshot, and prints
the diff against the newest previous snapshot. The author pastes verified
numbers from that output; the snapshot is committed with the issue.

### D3: Build-time integrity checks live in the page module, mirroring `apps`

The `/releases` page module loads both locale collections, throws on: an issue
missing its locale twin, overlapping `period_*` ranges, or an unknown `line`
value. This is the same fail-the-build pattern `apps-showcase` uses for an
invalid `line`, so no new validation infrastructure.

### D4: Machine-readable feed is a static Astro endpoint, not a script

`src/pages/releases.json.ts` emits the feed at build time by iterating the
collection — label, period, headline, per-line summaries, coverage delta read
from the two adjacent snapshots. Static endpoint over a build script: no
ordering step to add to `npm run build`, and the feed can never drift from the
rendered page because both derive from the same collection in one build.

### D5: `/updates` fallback guard filters at render time against the committed public repo list

The page filters `updates.json` entries by the repo names in the committed
`repos.json` (the last-good **public** list). A render-time guard is chosen
over only fixing the file because it stays correct if the committed fallback
ever goes stale again: an entry whose repo is absent from the public list is
dropped, never rendered. On top of the guard, the committed `updates.json` is
regenerated once in this change so the repo stops carrying private-repo
commit subjects at all.

### D6: Nav labels distinguish the two audiences

`nav.releases`: EN "Releases", zh "发布". `/updates` keeps its "Updates"/"动态"
label. Two adjacent nav items with distinct names make the audience split
discoverable instead of surprising.

## Risks / Trade-offs

- [Biweekly cadence slips under workload] → The design makes an issue cheap
  (two md files + one script + commit) and nothing breaks when an issue is
  skipped: no "missing issue" validation, gaps just render as gaps. Skipped
  issues are a real risk to the "regular" promise, accepted deliberately.
- [zh/en content drift after one side is edited] → Build enforces existence
  pairing, not semantic equivalence; equivalence stays a human review duty.
  Residual risk accepted and noted in the content template.
- [Issue numbers vs live `/data` numbers disagree] → They are different
  calibers by design: issues quote dated snapshot diffs; `/data` always shows
  current state. The site already runs dual-caliber stats on `/data`, so the
  precedent exists; each issue carries its period dates to keep this legible.
- [A repo goes private again and the committed fallback is stale] → Covered by
  the render-time guard (D5); worst case the entry silently disappears from
  `/updates`, which is the intended behavior.

## Migration Plan

Purely additive: new collection, new pages, new endpoint, one regenerated data
file, nav additions. No existing URL changes; `/updates` behavior is
unchanged for visitors. Ships through the normal build pipeline. Rollback =
revert the commit; nothing to unwind structurally.

## Open Questions

- Authoring order (zh first then en, or parallel) — editorial preference,
  affects nothing in this design.
- Whether to add RSS/Atom in addition to `/releases.json` — can be layered on
  the same endpoint later without changing this design.
