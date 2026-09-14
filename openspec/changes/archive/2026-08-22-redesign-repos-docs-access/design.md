## Context

The FindDataTechnology site is a static Astro build, bilingual EN/中文, served behind nginx on `124.220.7.175`. The demo playground (`/demo`) already works end-to-end: browser → `POST /demo-api` → nginx → `server/demo-proxy.mjs` → k3s MCP (NodePort 30899). The demo proxy reads `MCP_URL` + `MCP_TOKEN` from `.env` and injects the bearer server-side, so the token never reaches the browser (locked by `demo-playground` spec).

Today: repo cards (`RepoCard.astro`) show name/desc/lang/stars/updated and link the whole card to either the on-site README or GitHub, but have no explicit GitHub affordance. The only demo entry point is the homepage hero CTA. The featured list is hardcoded in two places (`fetch-repos.mjs` and `repos.astro`); `ORG` is hardcoded in `fetch-repos.mjs`.

## Goals / Non-Goals

**Goals:**
- Surface a GitHub icon on every repo card and the repo detail header.
- Surface the demo from `/repos` and `/docs` via a page-level CTA, and from the flagship card + flagship detail header.
- Introduce one public settings file (`src/config.ts`) as the single source for display values: org, flagship, featured list, demo page URL, public MCP endpoint string.

**Non-Goals:**
- No new demo backend, no token handling changes, no nginx changes.
- No repo categorization, tagging, or table-of-contents.
- No per-doc → repo link (no schema mapping; inventing one is scope creep).
- No changes to `fetch-repos.mjs` (build script can't import `.ts`).

## Decisions

### 1. Public config vs. secret backend — hard split

`src/config.ts` holds **public display values only**. The secret backend (`MCP_URL`, `MCP_TOKEN`) stays in `.env` and `server/demo-proxy.mjs`.

**Rationale**: The site is a static build — any value in client-reachable code is shipped to the browser. The token-never-exposed spec requirement makes the split non-negotiable. Two files, clear boundary: `config.ts` = display knobs (committed), `.env` = backend (gitignored, server-only).

**Alternative considered**: one settings file covering both. Rejected — anything imported by an `.astro` page is bundle-able into client JS; a single file invites the token to leak.

### 2. Config shape

```ts
export const site = {
  org: 'FindDataTechnology',
  github: 'https://github.com/FindDataTechnology',
  flagship: 'fd-open-data-mcp',
  featured: ['fd-open-data-mcp', 'fd-open-data-protocol'],
  demo: {
    pageUrl: '/demo',
    mcpEndpoint: 'https://www.finddatatech.cloud/mcp',
  },
} as const;
```

`pageUrl` is the link the CTAs use; `mcpEndpoint` is the display string for "connect your own client" copy (not wired to any fetch). `featured` dedupes the list currently duplicated in `repos.astro` (the build script keeps its own copy — see Decision 3).

### 3. Build script keeps ORG/featured; config owns runtime only

`fetch-repos.mjs` is plain `.mjs` and cannot import `.ts` without a loader. Rather than add a build step or convert the script, `ORG` and `FEATURED` stay in the script; `config.ts` owns the runtime display list. The two can drift, but both are short and rarely change; a `// keep in sync with src/config.ts` comment in the script is the guardrail.

**Alternative**: move shared values to a `.json` both can import. Rejected — adds a file and an import shape the components don't need; the duplication is two short arrays.

### 4. Card style A — corner GitHub icon, whole card → detail

Whole card remains a link to the detail page (or GitHub if no README). A GitHub SVG in the top-right corner links directly to the repo. The icon path is reused verbatim from `Layout.astro` (the `ghPath` constant) — not re-drawn.

**Alternative**: action row (README / GitHub / Demo buttons). Rejected — noisier grid, and only flagship has a demo, so a uniform action row would show dead buttons on most cards.

### 5. Demo button gated to flagship

Only `fd-open-data-mcp` has a wired demo. Non-flagship cards get the GitHub icon only. The flagship card and the flagship detail header get a "Try the live demo" button → `site.demo.pageUrl`.

### 6. Reuse the existing icon path

`Layout.astro` already defines `ghPath` (the GitHub mark). Extract it to a tiny shared constant (or export from `Layout`/a new `Icon.astro`) so `RepoCard` and the detail page reuse the identical SVG. One path, three call sites.

## Risks / Trade-offs

- **Featured-list drift between `fetch-repos.mjs` and `config.ts`** → Mitigation: `// keep in sync` comment + both are short. Acceptable for a two-array duplication.
- **Icon click vs. card click overlap on mobile** → Mitigation: the corner icon is a small target with `stopPropagation`-safe nested anchor; the card link wraps the content, the icon is a separate `<a>` inside. Test on narrow viewport.
- **CTA strip on every page feels repetitive** → Mitigation: one strip on `/repos` and `/docs` index only, not on detail pages (detail pages get the header CTAs). Acceptable repetition for discoverability.
