# add-platform-product-page — Tasks

## 1. Snapshot data + build-time validation

- [x] 1.1 Create `src/data/desktop-releases.json` with `{"schema": 1, "releases": []}` and verify it parses as JSON
- [x] 1.2 Create `src/lib/desktop-releases.ts`: typed shape per design D2 + `loadDesktopReleases()` that throws naming the entry/field on missing `version`/`released_at`/`platforms`, non-semver version, unknown platform key, platform entry with neither link, non-boolean `beta`; unknown fields ignored. Verify: temporarily break the JSON (bad platform key, then linkless entry) → `npm run build` fails naming each; restore → build green

## 2. Download band component

- [x] 2.1 Create `src/components/DownloadBand.astro`: renders newest release only — per-platform rows with platform name, version, date, official link as primary + GitHub as international alternative; visible beta marker on beta entries (never labeled stable); "official direct link coming soon" note on GitHub-only entries; bilingual coming-soon empty state when `releases` is empty (no download links); unsigned-install bypass footnote (macOS Gatekeeper / Windows SmartScreen) visible at the band; `#download` anchor. Verify: `astro dev` shows the band in both states (with fixture entry, then empty)
- [x] 2.2 Add `download.*` i18n keys in `src/i18n.ts`, en and zh both authored. Verify: `/products/base` and `/zh/products/base` each show their locale's band copy from the same JSON

## 3. Base landing page

- [x] 3.1 Add `line.base.landing.*` i18n keys in `src/i18n.ts`, en and zh both authored: dual-track hero (cloud contact-activation copy without signup promise; local track), value props (open-source base / all platforms / local-first), tour intro, platform matrix (web / mini-program / macOS / Windows), quickstart, closing. Verify: keys present in both locale objects, no EN-only key
- [x] 3.2 Create `src/components/BaseLanding.astro`: seven sections in order (hero → value → tour embedding `TourMockup` → matrix → quickstart with copyable clone/install/start commands linking the public README → `DownloadBand` → closing with release-notes/roadmap/GitHub-org links + "more in this line" row linking the base line's app entries); five-line tab nav present (extract the tab block from `ProductCatalog.astro` for reuse); local-track download affordance jumps to `#download`; cloud CTA href = the intro-pages contact channel (confirm exact address — design D6). Verify: `astro dev` renders all seven sections in order with tabs
- [x] 3.3 Wire the branch in `src/pages/products/[line].astro` and `src/pages/zh/products/[line].astro`: `line === 'base'` renders `BaseLanding`, the other four lines keep `ProductCatalog`. Verify: `/products/base` and `/zh/products/base` show the landing with base tab active; `/products/lex` (and wire/facet/constellation, en+zh) render the unchanged catalog; `/products` root (defaults to base) shows the landing with tabs

## 4. Snapshot entry + cross-repo contract

- [x] 4.1 Check whether the v1.3.0 GitHub Release exists on `FindDataTechnology/platform`: if yes, hand-write the release entry with real asset URLs (`macos` beta:false, `windows` beta:true — win stays beta until paas smoke-test turns it over) and verify the band renders both platforms; if no, keep `releases: []` and verify the coming-soon state (design D3)
- [x] 4.2 Post the finalized snapshot contract (schema shape from design D2 + `src/lib/desktop-releases.ts` path) as a note in the paas repo's `add-desktop-release` change so `release-sync.mjs` implements against it. Verify: note present in that change's directory

## 5. Build, probes, deploy

- [x] 5.1 `npm run build` green; build log shows no new network fetches beyond the existing repos/indicators/calibers/data-modules steps; `npm run content:check` still green. Verify: both commands exit 0
- [x] 5.2 `astro preview` + curl probes: en/zh landing section order and `#download` anchor; tour CTA hrefs `/demo` and `/zh/demo`; quickstart commands present; closing links resolve (releases, roadmap, GitHub org, app-entry pages); four non-base lines byte-identical to pre-change build (diff the generated HTML). Verify: all probes pass
- [ ] 5.3 Deploy via the image-roll line (build → TCR → gitee ArgoCD `fd-web` sync; `deploy.sh` rsync as fallback) and live-probe `www.finddatatech.cloud/products/base`, `/zh/products/base`, and one non-base line. Verify: three live probes green, then check the download band state one final time against the snapshot decision from 4.1
