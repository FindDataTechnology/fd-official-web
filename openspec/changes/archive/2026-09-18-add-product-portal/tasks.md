# Tasks

## 1. Content model

- [x] 1.1 Add required `line` enum (`data|legal|paas|token`) to the apps schema in `src/content.config.ts`, plus a build guard rejecting app slugs that equal a line name. Verify: temporarily set an entry's `line` to `bogus` → `npm run build` fails naming the entry; restore.
- [x] 1.2 Add line labels (EN/中文) and portal strings (hero, card wall, research/services footnote) to `src/i18n.ts`. Verify: `npm run build` passes with no missing-key warnings in either locale.

## 2. Content entries

- [x] 2.1 Retag existing entries: add `line: legal` to `law-bench` and `contract-templates` (en + zh). Verify: both detail pages render unchanged content after the route move.
- [x] 2.2 Write `data` line entry (en + zh) for the open-data MCP flagship, linking `/docs`, `/demo`, `/indicators`, and DAAS GitHub/PyPI from the body. Verify: `/products/data` lists it.
- [x] 2.3 Write `paas` entry (en + zh) for Platform from its verified capabilities only (dsh agent chat, documents RAG, MCP extensions, agent catalog, cron, web + Electron desktop, local-first); entry URL `https://craw.finddatatech.cloud`. Verify: copy contains no pricing/screenshots/testimonials.
- [x] 2.4 Write `token` entry (en + zh) for FindDataRouter (AI API gateway, per-user tokens, multi-channel failover); entry URL `https://token.finddatatech.cloud`. Verify: copy contains no pricing or channel details.

## 3. Catalog pages

- [x] 3.1 Build the line-tabbed catalog component and pages: `/products` (first tab active) and `/products/<line>` (+ `/zh/` variants), tabs deep-linkable, listing only the active line's entries. Verify: `/products/paas` and `/zh/products/token` render only their line's cards with the correct tab active.
- [x] 3.2 Move detail pages to `/products/<slug>` (+ `/zh/`), showing the line badge linking back to its tab. Verify: known slug renders narrative + line + CTA; unknown slug 404s.
- [x] 3.3 Add redirects in `astro.config.mjs`: `/apps`→`/products`, `/zh/apps`→`/zh/products`, `/apps/[slug]`→`/products/[slug]`, `/zh/apps/[slug]`→`/zh/products/[slug]`. Verify: opening `dist/apps/law-bench/index.html` refreshes to `/products/law-bench`.
- [x] 3.4 Repoint the nav 产品 entry to `/products` (label "Products" EN / 「产品」 zh) in `Layout.astro` + i18n. Verify: header link on every page targets the catalog.

## 4. Homepage portal

- [x] 4.1 Replace hero strings with the company ecosystem positioning (EN + 中文); update tagline. Verify: `/` and `/zh/` state the ecosystem positioning, no single line leads.
- [x] 4.2 Replace the flat products strip with the four-line card wall; each card links to its `/products/<line>` tab. Verify: clicking each of the four cards lands on the right tab in both locales.
- [x] 4.3 Add the research/services footnote (data paper, legal paper, fine-tuning service), text-only where no public link exists. Verify: footnote renders in both locales with no dead links.
- [x] 4.4 Audit and update the three hero stats against the current deployed system; record source + date in a comment beside each number. Verify: numbers match a freshly run count; comments state provenance.

## 5. Cross-cutting verification

- [x] 5.1 Full `npm run build` succeeds; spot-check `dist/` for: all four line pages in both locales, detail pages for all entries, redirect stubs for legacy `/apps` URLs, and no page referencing `/apps` internally. Verify with a `grep -r "/apps" dist/` limited to non-redirect files returning empty.
- [x] 5.2 Bilingual parity pass: every new page and string exists in EN and 中文 with equivalent content. Verify: `/zh/products/<line>` set mirrors `/products/<line>` set; locale switch from each new page works.
