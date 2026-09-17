## Why

The site is still a single-product (data line) marketing site while the company
now runs four product lines; two of them (PaaS Platform, FindDataRouter) have
zero presence, and the homepage positioning, stats, and nav predate the current
product reality. The company needs one bilingual portal that presents 寻数科技
FindData Technology as a text-and-data-processing ecosystem serving individuals
and small teams in the AI era, with all four lines reachable from it.

## What Changes

- Reposition the homepage from "open data, wired for AI agents" to a company
  portal: ecosystem positioning hero (聚焦文本与数据处理 / serving individuals
  and small teams), a 2x2 product-line card wall (数据 / 法律 / PaaS / Token),
  and a company-level footnote with the two papers (data, legal) and the
  small-model fine-tuning service.
- Introduce a four-line product taxonomy — `data`, `legal`, `paas`, `token` —
  as a first-class concept in the apps content collection (new required `line`
  field).
- Replace the flat `/apps` grid with a tabbed catalog at `/products`: one tab
  per line, entries filtered by `line`; old `/apps` and `/apps/<slug>` URLs
  redirect to their `/products` equivalents.
- Launch content grows to all four lines:
  - **legal** (existing): LawBench, contract-template data — retagged `legal`;
  - **paas** (new): Platform v1.3.0 (dsh-runtime AI assistant: chat, documents
    RAG, MCP extensions, agent catalog, cron; web + Electron desktop) — this
    reverses the "lawcraw/Platform internal-only" exclusion recorded in
    add-apps-showcase (2026-09-09);
  - **token** (new): FindDataRouter — AI API Gateway (token.finddatatech.cloud);
  - **data** (new): a line page surfacing the existing flagship MCP, DAAS,
    indicators, and demo entry points.
- Audit and update the homepage stats (6026 indicators / 28 sources / 56
  tools) against current verified counts — numbers on the site must be
  actually run, per the make-site-truthful commitment.
- Out of scope: LawBench domain/TLS fronting (still a raw IP demo link),
  token/craw infra changes, fabricating screenshots or any evidence the
  products do not have, per-line deep sub-sites beyond one catalog entry each.

## Capabilities

### New Capabilities
- `product-portal`: the company-portal homepage (ecosystem positioning hero,
  four-line card wall, research/services footnote) and the four-line product
  taxonomy that the catalog and cards share.

### Modified Capabilities
- `apps-showcase`: collection entries gain a required `line`; the grid page
  becomes a line-tabbed catalog at `/products` with redirects from `/apps`;
  launch content expands from the legal line to all four lines; the homepage
  products section becomes the four-line card wall.
- `site-shell`: the homepage hero/positioning requirement changes from the
  data-line value proposition to the company-portal positioning; the nav
  产品/Apps entry points to `/products`.

## Impact

- Code: `src/content.config.ts` (line field), `src/content/apps/{en,zh}/*`
  (retag + 3–4 new entries), `src/pages/{,zh/}apps.astro` → products catalog
  with tabs, redirect stubs for legacy `/apps*`, `src/pages/{,zh/}index.astro`
  (hero, card wall, footnote, stats), `src/i18n.ts` (portal + line strings),
  `src/components/Layout.astro` (nav href).
- No build-pipeline changes: line pages remain committed content; `/repos`
  GitHub fetch untouched.
- Bilingual commitment unchanged: every new surface ships EN + 中文.
