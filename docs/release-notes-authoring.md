# Release-notes authoring runbook

One issue = **two markdown files + one snapshot, committed together**. The
pages (`/releases`, `/zh/releases`) and the machine-readable feed
(`/releases.json`) render from committed content only — authoring never adds
a build-time network dependency.

## Cadence and naming

- One issue every two weeks. Skipping one breaks nothing — gaps render as
  gaps; there is no "missing issue" validation.
- **Slug = the issue's period end date** (`YYYY-MM-DD`). It sorts naturally
  and is used everywhere: `src/content/releases/en/<slug>.md`,
  `src/content/releases/zh/<slug>.md`, `src/data/release-snapshots/<slug>.json`.
- A new issue's period must not overlap the previous issue's period — the
  build fails naming both issues and the overlapping range.

## Frontmatter fields

```yaml
---
label: Issue 002          # display label (zh file: 第 002 期)
period_start: "2026-09-30"
period_end: "2026-10-13"
headline: One customer-facing sentence for the whole issue
lines: [data, legal]      # exactly the lines that have a section below
---
```

- **Quote the dates.** Unquoted `2026-09-30` is parsed by YAML as a Date
  object and the collection schema (which wants `YYYY-MM-DD` strings) rejects
  it — the build fails on the entry.
- `lines` values must be from `data` / `legal` / `paas` / `token`
  (unknown values fail the build).

## Body conventions

- One `## <Line label>` section per product line that has progress. The
  heading must equal the localized line label **exactly** —
  en: `Data` / `Legal` / `PaaS` / `Token`, zh: `数据` / `法律` / `PaaS` /
  `Token 中转` — because `/releases.json` extracts these sections as the
  per-line summaries downstream outlets consume.
- The coverage section heading is free-form (it is not a line label), e.g.
  `## Coverage changes` / `## 数据覆盖变化`.

## Producing one issue, end to end

1. Pick the period (must not overlap the previous issue); the slug is its end
   date.
2. Capture the coverage snapshot and diff:

   ```sh
   node scripts/release-coverage-diff.mjs <slug>
   ```

   This rebuilds `src/data/data-modules.json` from committed inputs, writes
   `src/data/release-snapshots/<slug>.json` (slim per-module extract, with
   `generated_at`), and prints the per-module delta against the newest
   previous snapshot. With no previous snapshot it prints current-state
   totals — that is the baseline case (first issue).
3. Write `en/<slug>.md` and `zh/<slug>.md`. Every coverage figure in the
   issue must be pasted from that script output — never from memory.
4. Build:

   ```sh
   npm run build
   ```

   Integrity checks that run here: missing locale twin (names the issue and
   locale), overlapping periods (names both issues and the range), unknown
   `line` value, and — from the feed builder — an issue without its committed
   snapshot (names the issue and the exact command to run).
5. Review the en/zh pair side by side. The build enforces existence pairing,
   not semantic equivalence — keeping the two saying the same thing is a
   human duty, not a tool's.
6. Commit the two markdown files **and** the snapshot file in one commit.
   Never commit a snapshot without its issue: the feed computes each issue's
   delta against the newest smaller-slug snapshot, so a stray snapshot would
   shift the next issue's baseline.

## Editorial rules

- **Progress-only coverage.** Cover only the product lines that shipped
  something in the period. Never write "no news this period" for a paused
  line — absence from the issue is the only signal, matching how the
  `/data` page labels paused modules.
- **Verified numbers only.** Every figure must be reproducible from the
  committed snapshots (issue snapshot vs its predecessor's), and every claim
  must be checkable against a committed artifact — a spec, a repository, or
  the snapshot. The first issue of the series quotes current-state figures
  from its baseline snapshot instead of deltas.
- **No marketing-only claims.** Testimonials, customer names, and usage
  metrics never appear; a claim without a committed artifact behind it is
  removed or backed before the issue is finalized.
- **Customer language.** What shipped and why it matters to someone using the
  products — commit subjects and changelog bullets stay on `/updates`.

## Machine-readable feed

`/releases.json` is emitted at build time from the same collection and
snapshots as the pages (same order, same content). Downstream outlets — the
sales one-pager and the social distribution pipeline — consume this feed;
they must not scrape the HTML pages.
