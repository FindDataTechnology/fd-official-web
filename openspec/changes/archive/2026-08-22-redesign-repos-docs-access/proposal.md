## Why

Visitors land on `/repos` and `/docs` with no obvious way to reach a project's GitHub page from the card, and no obvious way to reach the live demo from anywhere except the homepage hero. The GitHub icon path already exists in `Layout.astro`'s footer, and the demo already works end-to-end — both are just under-surfaced. A single public settings file (`src/config.ts`) gives the operator one place to change the demo page link, the public MCP endpoint string, and the featured list, instead of hunting across components.

## What Changes

- **NEW** `src/config.ts` — public display values only: org name, flagship repo name, featured repo list, and a `demo` block (`pageUrl`, `mcpEndpoint`). Secret backend values (`MCP_URL`, `MCP_TOKEN`) stay in `.env` / `server/demo-proxy.mjs` — they cannot be client-visible (static build + token-never-exposed spec).
- **MODIFIED** `src/components/RepoCard.astro` — add a corner GitHub SVG icon (reusing the inline `<path>` from `Layout.astro`) linking to the repo; add a "Try the live demo" button on the flagship card only.
- **MODIFIED** `src/pages/repos.astro` — add a page-level "▶ Try the live demo" CTA strip linking to the demo page.
- **MODIFIED** `src/pages/repos/[name].astro` — detail header gets a GitHub icon link (matching the existing "View on GitHub" text link) and a demo CTA on the flagship entry only.
- **MODIFIED** `src/pages/docs/index.astro` + `src/pages/docs/[...slug].astro` — add the same page-level demo CTA strip on the docs index for consistency; doc detail gets a back link only (already present). No per-doc → repo link (no schema mapping exists).
- **MODIFIED** `src/i18n.ts` — new EN + 中文 strings for the demo CTA ("Try the live demo" / "在线体验") and the demo button label.
- **UNCHANGED** `scripts/fetch-repos.mjs` — build script cannot import `.ts`; `ORG` and `FEATURED` stay there. `config.ts` owns runtime display only.

## Capabilities

### New Capabilities
- `site-config`: A single source of truth for public display settings (org, flagship, featured list, demo page URL, public MCP endpoint string), imported by pages and components.

### Modified Capabilities
- `repo-showcase`: Cards get a GitHub icon link and the flagship card gets a demo button; the repos page gets a page-level demo CTA strip.
- `docs-site`: The docs index gets a page-level demo CTA strip for access parity with `/repos`.

## Impact

- **Code**: `src/config.ts` (new), `RepoCard.astro`, `repos.astro`, `repos/[name].astro`, `docs/index.astro`, `i18n.ts`. Light CSS additions in `public/global.css` for the CTA strip and card icon.
- **Secrets**: None exposed — `config.ts` is committed and public; the bearer token and backend URL remain server-side only in `.env` / `demo-proxy.mjs`.
- **Build**: No new dependencies. `fetch-repos.mjs` unchanged, so the build flow is identical.
- **i18n**: Every new visible string added to both `en` and `zh` locales in `i18n.ts`.
