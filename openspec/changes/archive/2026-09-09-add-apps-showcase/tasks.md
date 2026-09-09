## 1. Content collection

- [x] 1.1 Add `apps` collection schema to `src/content.config.ts` (name, tagline, kind, demoUrl, order)
- [x] 1.2 Write `law-bench` entries: `src/content/apps/en/law-bench.md` + `zh/law-bench.md`
- [x] 1.3 Write contract-template data entries: `src/content/apps/en/contract-templates.md` + `zh/contract-templates.md`

## 2. Pages

- [x] 2.1 `/apps` grid page (`src/pages/apps.astro`) listing entries by `order` with tagline + detail links
- [x] 2.2 `/zh/apps` grid page (`src/pages/zh/apps.astro`)
- [x] 2.3 Detail route `src/pages/apps/[slug].astro` via `getStaticPaths` over the collection (en entries)
- [x] 2.4 Detail route `src/pages/zh/apps/[slug].astro` (zh entries)

## 3. Shell + homepage

- [x] 3.1 Add `nav.apps` ("Apps" / "产品") and apps-section i18n keys to `src/i18n.ts`
- [x] 3.2 Add the nav link in `src/components/Layout.astro` for both locales
- [x] 3.3 Add homepage products section (between intro and roadmap) in `src/pages/index.astro` + `src/pages/zh/index.astro`

## 4. Verification

- [x] 4.1 `npm run build` passes; `/apps`, `/zh/apps`, both detail pages, and both locales' homepage render
- [x] 4.2 `openspec validate add-apps-showcase --strict` passes
