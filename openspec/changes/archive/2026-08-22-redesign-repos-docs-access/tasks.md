## 1. Foundation

- [x] 1.1 Create `src/config.ts` exporting `site` object: `org`, `github` (org URL), `flagship` (repo name string), `featured` (string[]), `demo.pageUrl` ('/demo'), `demo.mcpEndpoint` ('https://www.finddatatech.cloud/mcp'). Public display values only — no secrets.
- [x] 1.2 Add EN + 中文 i18n strings in `src/i18n.ts` for the new CTAs: `repos.demoCta` ("Try the live demo" / "在线体验"), `repos.demoCtaSub` ("Query the MCP from the browser." / "在浏览器中查询 MCP 服务。"), `repos.demoBtn` ("▶ Try the live demo" / "▶ 在线体验"), `repo.demo` ("Try the live demo" / "在线体验"), `docs.demoCta` (reuse repos strings). Add to both `en` and `zh` blocks.

## 2. Shared UI

- [x] 2.1 Extract the GitHub SVG path into a reusable inline `<GitHubIcon>` snippet within `Layout.astro` (or a tiny `src/components/GitHubIcon.astro`) so cards/headers reuse one path. No new dependency.
- [x] 2.2 Add a `.demo-cta` strip component block (styled in `public/global.css`) — a highlighted card with "▶ Try the live demo → /demo" + sub-text, locale-aware via `t()`. Reusable on `/repos` and `/docs`.

## 3. Repos showcase

- [x] 3.1 `src/pages/repos.astro`: import `site` from `../config`; replace the hardcoded `featured` Set with `new Set(site.featured)`. Insert the `.demo-cta` strip below the page header.
- [x] 3.2 `src/components/RepoCard.astro`: add a corner GitHub icon link (top-right of card) using the shared icon, pointing to `repo.url`, `target="_blank"`. Whole card still links to detail/GitHub as before. Keep card style A (one primary click + corner icon).
- [x] 3.3 `src/components/RepoCard.astro`: when `repo.name === site.flagship`, render a "▶ Try the live demo" button linking to `site.demo.pageUrl` inside the card (below the meta line). Non-flagship repos render no demo button.
- [x] 3.4 `src/pages/repos/[name].astro`: in the detail header, render the GitHub icon link beside the repo title (pointing to `repo.data.url`), and — when `repo.data.repo === site.flagship` — a demo CTA button to `/demo`.
- [x] 3.5 Mirror 3.1–3.4 for the `/zh` locale: `src/pages/zh/repos.astro`, `src/pages/zh/repos/[name].astro`, and the zh RepoCard path (card is shared, but confirm `base`/`href` locale logic still resolves). Use 中文 i18n strings.

## 4. Docs

- [x] 4.1 `src/pages/docs/index.astro`: insert the `.demo-cta` strip below the page header (same component as repos). No per-doc→repo link (out of scope).
- [x] 4.2 `src/pages/docs/[...slug].astro`: light visual polish only — match the detail-page header treatment (back link already exists). No GitHub link added (no schema mapping).
- [x] 4.3 Mirror 4.1 for `src/pages/zh/docs/index.astro` (and `zh/docs/[...slug].astro` if it differs).

## 5. Verify

- [x] 5.1 Run `npm run build` (triggers `repos:fetch` + astro build); confirm no type/build errors and the demo CTA + GitHub icons render in the output.
- [x] 5.2 Spot-check `/repos`, `/repos/fd-open-data-mcp`, `/docs`, and one non-flagship repo detail page in both EN and `/zh` — demo CTA present on repos/docs, flagship has demo button + corner icon, non-flagship has corner icon only.
