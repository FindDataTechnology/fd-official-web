## Why

The site's showcase pipeline is GitHub-only: `fetch-repos.mjs` fetches public
`FindDataTechnology` repos at build time, so every deployed app that lives only
in a private Gitee mirror has zero presence on the site. The legal line
(law-bench contract platform, the SAMR contract-template data stack) is exactly
in that blind spot — deployed, business-relevant, invisible.

## What Changes

- New hand-written `apps` content collection (bilingual), independent of the
  GitHub fetch pipeline — same "curated narrative vs raw README" split the
  flagship collection already established.
- New `/apps` grid page and `/apps/[slug]` detail pages, en + zh locales.
- Two launch entries:
  - **law-bench** — contract drafting/review agent platform: clause-library
    contract generation, triple AI review (legal / commercial / completeness),
    rubric + DeepEval evaluation, clause RAG, 37-tool MCP server; live demo link.
  - **contract-template data** — 合同示范文本 data service built on the
    scraw-law-contracts crawler stack (SAMR source).
- Nav gains an "Apps / 产品" entry; homepage gains a products section between
  the intro and roadmap sections (the open-source grid itself lives on `/repos`).
- Explicitly out of scope: lawcraw/Platform (internal-only per its PRODUCT.md),
law-bench domain/TLS fronting (separate infra change), any GitHub repo changes.

## Capabilities

### New Capabilities
- `apps-showcase`: hand-curated product/app pages for deployed apps that are
  not public GitHub repos — collection schema, bilingual grid and detail pages,
  nav/homepage surfacing.

### Modified Capabilities
- `site-shell`: navigation gains an Apps / 产品 entry alongside Repos.

## Impact

- Code: `src/content.config.ts`, `src/content/apps/*`, `src/pages/{,zh/}apps*`,
  `src/components/Layout.astro` (nav), `src/pages/{index,zh/index}.astro`
  (products section), `src/i18n.ts` (labels).
- No build-pipeline changes: apps content is committed, not fetched.
- Deploy-safe: purely additive pages; existing routes untouched.
