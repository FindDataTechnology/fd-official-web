# Tasks: add-release-notes

## 1. Content collection & pages

- [x] 1.1 Declare the `releases` collection in `src/content.config.ts` (glob loader, base `./src/content/releases`, pattern `**/*.md`, schema: `label`, `period_start`, `period_end`, `headline`, `lines` array) and verify `npm run build` stays green with the empty collection
- [x] 1.2 Add i18n keys for both locales — `nav.releases` ("Releases" / "发布") and `releases.title` / `releases.sub` — and verify a seeded test entry renders using them in both locales
- [x] 1.3 Create `src/pages/releases.astro` and `src/pages/zh/releases.astro` rendering the collection reverse-chronologically (issue label, period, headline, body sections by line), committed-content only, and verify both pages render the seeded entry
- [x] 1.4 Add build-time integrity checks in the page module — missing locale twin, overlapping `period_*` ranges, unknown `line` value — and verify each of the three failure modes fails the build with an error naming the offending issue (seed each bad case temporarily, then remove the seeds)

## 2. Coverage snapshot tooling

- [x] 2.1 Implement `scripts/release-coverage-diff.mjs` (authoring-time only): run the data-modules build, capture a slim per-module snapshot to `src/data/release-snapshots/<slug>.json`, and print the diff against the newest previous snapshot — verify it prints a readable per-module delta and writes the snapshot file with `generated_at`
- [x] 2.2 Capture and commit the baseline snapshot for the launch issue, and verify the file lists every module id present in `data-modules.json` (no silent module drop)

## 3. Machine-readable feed

- [x] 3.1 Implement `src/pages/releases.json.ts` as a static build-time endpoint emitting label, period, headline, per-line summaries, and the coverage delta computed from each issue's snapshot and its predecessor — verify the built `dist/releases.json` has the same issue count and order as the rendered page

## 4. updates-feed fallback guard

- [x] 4.1 Add the render-time guard to both updates pages: filter `src/data/updates.json` entries against the repo names in the committed `src/data/repos.json` — verify by temporarily seeding an entry for `fd-craw-private` that it is not rendered while other entries still are
- [x] 4.2 Regenerate the committed `src/data/updates.json` and verify no remaining entry references a repo absent from `repos.json` (grep the committed file against the repo list)

## 5. Launch issue & authoring docs

- [x] 5.1 Author the launch issue in both locales (`en/` + `zh/` markdown): period, headline, sections only for lines with progress, every coverage figure taken from the task 2.2 baseline output — verify the build is green and both locale pages render it
- [x] 5.2 Write the authoring runbook `docs/release-notes-authoring.md` (frontmatter fields, the snapshot+diff step, the editorial rules: progress-only coverage, no paused-line statements, bilingual pairing review) and verify it walks through producing one issue end-to-end from the script names it references

## 6. Final verification

- [x] 6.1 Run `npm run build` end-to-end and verify in `dist/`: `/releases` and `/zh/releases` render with nav entries in both locales, `/releases.json` matches the page, and `/updates` still renders its feed (now guarded)
