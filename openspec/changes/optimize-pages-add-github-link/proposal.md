## Why

Two page-level rendering bugs and a missing chrome affordance make the site look unfinished where it's most scrutinized:

1. **Docs cards dump raw markdown.** The `/docs` index renders each card's preview from `d.body` — the *entire raw markdown string* of the doc, starting with the `# H1`. The docs schema (`content.config.ts`) has no `description` field, so `d.body` was grabbed as a placeholder and never replaced. Every docs card shows its whole document where a one-line preview should be.
2. **Repo cards render a blank line for null descriptions.** `fd-official-web` has no GitHub "About" description; `RepoCard.astro` does `description ?? ''`, so its card shows an empty muted line where copy should be. (The null itself is out-of-repo — the GitHub "About" field; this change fixes only the rendering, not the source.)
3. **No GitHub link or icon in the chrome.** The GitHub org is reachable only via a text link in the footer copyright. There's no GitHub icon and no link to *this* repo's source — the standard "view source on GitHub" affordance an open-source project site is expected to have.

This change fixes the two card bugs and wires a GitHub icon + link into the site footer (icon → org, "view source" → this repo). It also folds in the pending ICP footer line (`粤ICP备2026118740号-1`) that was left uncommitted from the prior session, so it ships rather than lingering in limbo.

## What Changes

- **Docs card preview**: add a `description` field to the `docs` content schema; render `d.data.description` instead of `d.body` on both EN and ZH docs index pages. Each of the 6 doc files gets a one-line `description:` in frontmatter, lifted from its existing lede — no new copy invented.
- **Repo card null fallback**: in `RepoCard.astro`, render a localized fallback string when `description` is null/empty, so no card shows a blank line.
- **GitHub link + icon in footer**: inline GitHub octocat SVG (no dependency) in `Layout.astro` footer — a GitHub icon links to the org (`github.com/FindDataTechnology`) alongside the existing org copyright link; a "view source" link (icon + text) points to this repo (`github.com/FindDataTechnology/fd-official-web`). Both GitHub affordances live in the footer (per the user's "put to footer"), not the header.
- **ICP footer line**: the existing uncommitted `粤ICP备2026118740号-1` link in the footer ships with this change.
- **Relative dates on repo cards**: explicitly **dropped** — bare ISO dates are not wrong, only unfriendly; date formatting is taste, not truth, excluded per the same line drawn in `make-site-truthful`.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `site-shell`: the core-structure requirement is updated to require a GitHub icon+link in the footer (→ org) and a "view source" link in the footer (→ this repo), alongside the existing org copyright link and the ICP filing line.
- `docs-site`: a docs-index-card requirement is added so doc cards render a `description` preview, not the raw markdown body.
- `repo-showcase`: the repo-card-content requirement is updated so a null/empty description renders a localized fallback rather than a blank line.

## Impact

- **Authored copy**: 6 doc frontmatter lines (no body changes), `RepoCard.astro`, `Layout.astro`, `content.config.ts`, `docs/index.astro` + `zh/docs/index.astro`, `src/i18n.ts` (fallback + view-source strings), `public/global.css` (icon/link alignment).
- **No behavior change**: no routes, no build pipeline, no data-source changes, no secrets. One inline SVG added to the shell; one optional schema field added (existing builds don't break if a doc lacks it).
- **Out of scope**: the GitHub-org-side null/stale descriptions (`fd-official-web`, `scraw-fd-open-data-mcp`) — same out-of-repo tail as `make-site-truthful` task 6.1. Repo grouping/categorization (Layer B) — explicitly excluded; 12 repos in a flat featured-first grid is browsable.
