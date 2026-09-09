## Context

The site already has two content models: auto-fetched repo READMEs
(`repos`, via `fetch-repos.mjs`) and hand-written curated narrative
(`flagship`, `en.md`/`zh.md` + dedicated pages). The apps layer is a
generalization of the flagship pattern to N apps × 2 locales. Bilingual UI
strings live in `src/i18n.ts`; nav lives in `src/components/Layout.astro`;
homepage sections in `src/pages/index.astro` (+ `zh/index.astro`).

## Goals / Non-Goals

- Goals: committed (non-fetched) bilingual apps content; `/apps` grid +
  per-app detail pages for both locales; nav + homepage surfacing; launch with
  law-bench and the SAMR contract-template data service.
- Non-Goals: fetching Gitee content at build time; publicizing lawcraw
  (internal-only); domain/TLS fronting for the law-bench demo (separate infra
  change); touching the GitHub repo pipeline.

## Decisions

- **Content modeling**: one file per app per locale, `src/content/apps/<slug>.<locale>.md`
  (glob loader id = filename), mirroring how `docs` keys locale by path and
  `flagship` by filename. Pages filter entries by locale suffix. Frontmatter:
  `name`, `slug`, `tagline`, `kind`, `demoUrl`, `order`; body = narrative.
- **Routing**: static pages following the existing `{page}.astro` +
  `zh/{page}.astro` convention. Detail pages via `getCollection('apps')`
  filtered by slug + locale; unknown slug → Astro 404 (no `getStaticPaths`
  match). No dynamic `[slug]` route needed if each launch app gets a dedicated
  pair of pages — but a single `[slug].astro` per locale avoids per-app page
  boilerplate as apps grow. Choose `[slug].astro` with `getStaticPaths` over
  `getEntry`-per-page (the flagship approach does not scale to N).
- **Nav/homepage**: add `nav.apps` i18n keys ("Apps"/"产品"), one nav link,
  and a homepage products section between the intro and roadmap sections
  listing apps from the collection (order asc) — reusing the existing card styles.

## Risks / Trade-offs

- Demo link is a bare IP (`http://23.144.68.246:30830`) — accepted for launch,
  flagged in proposal as future infra work (domain + TLS).
- Apps content is marketing-adjacent: copy is derived from the law-bench
  repo docs; keep claims to what those docs state.

## Migration Plan

Purely additive; no existing route or pipeline changes. Static build picks up
new collection automatically.

## Open Questions

- None.
