# add-platform-product-page — Design

## Context

fd-official-web is an Astro static site, bilingual via `astro:i18n` (`/` = EN, `/zh/*` = 中文, `t()` falls back to EN). Today `/products/<line>` renders `ProductCatalog.astro` for all five lines: ladder intro, line tabs (deep-linkable), per-line external CTA blocks (wire/lex precedent), and the line's hand-curated app cards. `/products` (root) defaults to the base tab, so upgrading the base line upgrades the catalog default view.

Established patterns this change reuses:

- **Fail-the-build integrity**: `src/lib/releases.ts` validates locale twins at build; the apps collection fails on unknown `line`. New data validation follows the same throw-at-build pattern.
- **Committed-data philosophy**: apps entries, release notes, `src/data/release-snapshots/*.json` all render with zero network. The download band joins this family.
- **CSS-drawn mockup**: `TourMockup.astro` (used by `/demo`) is deliberately not a screenshot — locale-aware, DPI-crisp, no user data. The landing's tour section reuses it directly.
- **Deployment**: Docker image roll via gitee ArgoCD (`fd-web`), per the 2026-10-05 intro-pages precedent; `deploy.sh` rsync remains as fallback.

Cross-repo: paas `add-desktop-release` builds `scripts/release-sync.mjs`, whose job is to write this repo's snapshot and roll the site. The snapshot schema is defined **here** (reader side, this change) and referenced there (writer side).

## Goals / Non-Goals

**Goals:**

- `/products/base` + `/zh/products/base` become the seven-section landing at the same URLs; other four lines untouched.
- Download band driven by one committed snapshot JSON with build-time validation; schema fixed as the cross-repo contract.
- Bilingual parity (both locales fully authored, no EN-only sections).
- Zero-network build/render conserved.

**Non-Goals:**

- No pricing section, no screenshot asset pipeline, no deepening of the other four lines.
- No installer hosting, dl domain, or release CI — that is paas `add-desktop-release` (`installer-distribution`).
- No changes to the app detail pages, the `/demo` page, or the apps content collection schema.

## Decisions

### D1. Routing: branch inside `products/[line].astro`, not a new route

`getStaticPaths` keeps emitting all five lines; when `line === 'base'` the page renders the new `BaseLanding.astro` instead of `ProductCatalog`. Both locale entry files (`products/[line].astro`, `zh/products/[line].astro`) stay as thin wrappers passing `locale`.
*Alternative considered*: a static `/products/base.astro` shadowing the dynamic route — rejected: forks the tab-nav/two-locale wiring and risks URL drift; the branch keeps one owner of the path.

### D2. Snapshot file: `src/data/desktop-releases.json`, single current-state file

Not the dated `release-snapshots/` archive pattern — that exists for data-coverage history; the release pipeline needs one rewritable file. Shape (the cross-repo contract, `schema: 1`):

```json
{
  "schema": 1,
  "releases": [
    {
      "version": "1.3.0",
      "released_at": "2026-10-08",
      "platforms": {
        "macos":   { "beta": false, "filename": "Platform-1.3.0.dmg",
                     "official_url": null,
                     "github_url": "https://github.com/FindDataTechnology/platform/releases/download/v1.3.0/Platform-1.3.0.dmg" },
        "windows": { "beta": true,  "filename": "Platform-1.3.0-setup.exe",
                     "official_url": null, "github_url": "…" }
      }
    }
  ]
}
```

- `releases` is newest-first; the band renders `releases[0]` only. An array (vs a bare `latest` object) tolerates a future history view without a schema break.
- Platform keys are a closed set (`macos`, `windows`); Linux later adds a key, no shape change.
- Reader rule: **unknown fields ignored, missing/malformed known fields fail the build** — writer may add fields first without breaking the site.

### D3. Pre-release state: empty-state gate; placeholder entry only if the release exists

Implementation order is ②→①→③: this page can ship before the v1.3.0 GitHub Release exists. A hand-written entry pointing at a not-yet-existing asset URL would 404 on a public page. Rule: **if the v1.3.0 release is live on GitHub at implementation time**, hand-write the entry with real asset URLs (as the proposal prefers); **otherwise** commit `"releases": []` and the band renders a bilingual "desktop installers coming soon" state (spec'd). release-sync later rewrites the file either way — the schema is proven by validation tests with fixture data in both cases.

### D4. Validation: `src/lib/desktop-releases.ts`, throw-at-build

Mirrors `releases.ts`: typed schema + `loadDesktopReleases()` that throws naming the offending entry/field on — missing `version`/`released_at`/`platforms`, non-semver version, unknown platform key, platform entry with neither link, `beta` not boolean. The pages import it, so `astro build` is the validator.

### D5. Landing composition: one component, seven sections, reused primitives

`BaseLanding.astro` renders: dual-track hero → value props (open-source base / all platforms / local-first) → tour (embeds `TourMockup`) → platform matrix (web / mini-program / macOS / Windows) → quickstart → `DownloadBand.astro` (`#download` anchor) → closing (release notes · roadmap · GitHub org · "more in this line" row linking the base line's app entries). Line tabs are rendered by the same markup `ProductCatalog` uses (extract or duplicate the small tab block — extract preferred).

### D6. Cloud CTA: contact-to-activate, target = the intro-pages contact channel

The hosted cloud is invite-only; the CTA copy says 联系开通 / "Contact us to activate" and MUST NOT link a signup page. The concrete `mailto:` target reuses the company contact block already published on the 谦面/萬星 intro pages (PII decision already made there); exact address is confirmed at implementation (only one href changes).

### D7. Quickstart copy: the public README's three commands

`git clone https://github.com/FindDataTechnology/platform.git` → `npm install` → `npm start`, rendered as copyable blocks with a link to the README's Quick start section. Grounded against the current public README; if it drifts, the page copy follows the README (README is the contract).

### D8. i18n: new `line.base.landing.*` and `download.*` key namespaces, both locales authored in the same change

`t()` falls back to EN, but the zh page is a first-class surface (zh-first audience) — every key gets a real zh string in the same PR (the facet i18n double-copy lesson).

## Risks / Trade-offs

- [Release not live when this ships → download links 404] → D3 empty-state gate; release-sync overwrites when ③ lands.
- [Schema drift between paas writer and this reader] → `schema: 1` field + reader-ignores-unknown-fields rule (D2); any shape change is a bump with both sides in one cross-repo pass.
- [Contact address for 联系开通 unresolved] → blocks one href only; decision D6 keeps the default (intro-pages block).
- [Landing grows long] → static HTML, no JS beyond existing site patterns; sections are anchorable for deep links.
- [/products root silently becomes the landing] → accepted and desired (base is the default tab); covered by a probe task.

## Migration Plan

Single static deploy (image roll via gitee ArgoCD, intro-pages precedent). No data migration. Rollback = revert the commit and re-roll. The dl-direct-link promotion later is a snapshot-only edit (spec'd transitional semantics).

## Open Questions

- Does the v1.3.0 GitHub Release exist when implementation starts? (Picks the D3 branch; both are built and spec'd either way.)
- Exact contact address for D6 (confirm/reuse intro-pages contact block).
