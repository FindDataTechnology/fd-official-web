## Context

The site is a single Astro static build (bilingual, `astro:i18n`, `/` EN +
`/zh/…`) behind nginx. The `apps` content collection already exists with
hand-written bilingual entries and detail pages under `/apps`. Four real
product lines now exist with verified entry points: data (this site's
flagship/DAAS/indicators), legal (LawBench, contract-template corpus),
paas (Platform v1.3.0, `craw.finddatatech.cloud`), token (FindDataRouter,
`token.finddatatech.cloud`). See proposal.md for motivation.

## Goals / Non-Goals

Goals: one portal homepage + one tabbed catalog serving all four lines;
verifiable claims only; legacy URLs keep working; minimal new machinery.

Non-Goals: no per-line sub-sites beyond catalog entries; no client-side
framework added (stays static Astro); no new build-time network dependencies;
no screenshots or marketing assets that don't exist; no changes to `/repos`,
`/docs`, `/demo`, `/indicators` structure (they remain data-line pages at top
level in this change).

## Decisions

### D1: Line tabs as static routes `/products/<line>`, not query params
Each line gets a real page: `/products/<line>` (+ `/zh/products/<line>`),
generated from a shared tab-catalog component over the `apps` collection
filtered by `line`. `/products` renders with the first line (`data`) active.
- Why: static output means `?line=` tabs would need JS and give no shareable
  URLs; distinct routes are SSG-native and deep-linkable (spec requires it).
- Alternative rejected: client-side tab state via query param — breaks
  no-JS rendering and static caching.

### D2: Detail pages live at `/products/<slug>`; slugs MUST NOT collide with line names
Content slugs are validated at build: a slug in `{data, legal, paas, token}`
(or `zh` locale equivalents) fails the build. Line pages take precedence over
detail pages for those path segments.
- Why: both live under `/products/`; collision would shadow a tab page.

### D3: Redirects via Astro config, not nginx
`astro.config.mjs` `redirects`: `/apps` → `/products`, `/zh/apps` →
`/zh/products`, `/apps/[slug]` → `/products/[slug]`, `/zh/apps/[slug]` →
`/zh/products/[slug]`. Astro emits meta-refresh pages for static output.
- Why: redirects live in the repo and work on any host; nginx rules would be
  deploy-only knowledge and drift.
- Alternative rejected: nginx `rewrite` — same effect but invisible to the
  repo.

### D4: `line` as a required enum in the content schema
`content.config.ts` apps schema gains `z.enum(['data', 'legal', 'paas',
'token'])`. Build fails on missing/unknown values (spec scenario). Line labels
(EN/中文) live once in `i18n.ts` and feed both the homepage cards and the tab
bar — one vocabulary (product-portal spec).

### D5: Data line entry = one committed entry linking the existing surfaces
The `data` tab launches with a single entry for the open-data MCP flagship
whose body links to `/docs`, `/demo`, `/indicators`, and DAAS on GitHub/PyPI.
- Why: keeps tab mechanics uniform (every tab renders the same card list);
  no special-cased tab layout.
- Alternative rejected: a bespoke data-line landing section — more layout
  code for the same links.

### D6: Homepage stats derive at build from the indicator export (revised during implementation)
Originally this decision called for hardcoded-but-reverified numbers with
provenance comments. The 2026-09-17 audit found the live public MCP serving 48
tools but only 15 concepts (country 8 + stock 7; other entity types empty,
`isError: false`) while the deployed `/indicators` page still showed its August
export (255 concepts / 5 sources) — hardcoded numbers would have immediately
disagreed with one surface or the other, and any server-side change would
re-stale them. Revision: `scripts/fetch-indicators.mjs` additionally records
`tools_count` (paginated `tools/list`, omitted on failure), and both homepage
locales derive indicators/sources/tools from the same `indicators.json` the
`/indicators` page renders — the two surfaces cannot disagree, whatever the
deploy-time export yields. The committed snapshot stays the offline fallback
(255-concept August export kept; the transient 15-concept live reading was not
committed). The catalog shrinkage itself is a server-side regression outside
this change's scope, reported to the owner.

### D7: New entry copy constrained to verified facts
Platform entry states only capabilities confirmed in its own PRODUCT.md/README
(dsh agent chat, documents RAG, MCP extensions, agent catalog, cron, web +
Electron macOS/Windows, local-first); FindDataRouter entry states the gateway
role, per-user tokens, multi-channel failover. Neither gets pricing,
testimonials, screenshots, or metrics — both products' docs list those as
absences. The fine-tuning footnote and the two papers render text-only when no
public link exists.

## Risks / Trade-offs

- **Slug/line collision** — mitigated by the D2 build guard.
- **Stats drift** — resolved by the D6 revision: stats derive from the same
  build-time export as `/indicators`, so they cannot drift apart.
- **Token-line exposure** — publishing FindDataRouter on the ICP-filed
  corporate site is a business/compliance decision already made by the owner
  (2026-09-17); the entry copy stays factual and low-key (no pricing, no
  channel details) to match it.
- **Top-level docs/demo/indicators still read as data-line pages** — accepted
  for this change; folding them under the data tab is a later IA iteration if
  the portal feels unbalanced.
