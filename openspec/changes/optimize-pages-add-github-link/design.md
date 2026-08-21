# Design: Optimize Pages + Add GitHub Link

## Context

Following `make-site-truthful`, the site's copy no longer lies. But two page-level rendering bugs and a missing chrome affordance remain visible to any visitor:

1. The `/docs` index cards show their entire markdown body as the "preview" line — a half-finished feature where a `description` field was intended but never added to the schema, so `d.body` was used as a placeholder.
2. The `/repos` grid renders a blank line for `fd-official-web` because its GitHub description is null and `RepoCard` does `description ?? ''`.
3. The site shell has no GitHub icon and no "view source" link — the standard affordance for an open-source project site. GitHub is reachable only via footer text.

## Goals / Non-Goals

**Goals:**
- Fix the docs card preview so it shows a one-line description, not raw markdown.
- Fix the repo card null-description rendering.
- Wire a GitHub icon + link into the shell (header → org, footer → this repo).
- Ship the pending ICP footer line.

**Non-Goals:**
- Repo grouping / categorization (Layer B) — excluded; 12 repos in a flat featured-first grid is browsable, and grouping needs a curated map (GitHub `topics` are empty on every org repo, verified), which is a taste decision.
- Relative dates on repo cards — taste, not truth; excluded per the `make-site-truthful` line.
- Fixing the GitHub-org-side null/stale descriptions — out-of-repo, same tail as 6.1.

## Decisions

**D1: Add a `description` frontmatter field, lift it from each doc's lede**
- Rationale: The schema needs a short preview string. Each doc already opens with a one-line lede that *is* the description ("Install and run the open-data ontology MCP…"). Lifting it keeps the copy truthful (no marketing invented) and single-source.
- Trade-off: The lede now lives in frontmatter and is repeated as the body's opening. Acceptable — the body lede reads naturally as the doc's opening; the frontmatter is the card preview. If drift becomes a concern later, the body could open by referencing the description, but that's restructuring, not in scope.

**D2: Repo card null fallback — localized string via i18n.ts, not empty**
- Rationale: `description ?? ''` renders a blank muted line that looks broken. A fallback string fills the gap. The codebase keys all UI strings in `src/i18n.ts` (`repos.empty`, `stat.*`, etc.); a keyed fallback (`repos.noDesc`) matches that convention rather than an inline ternary.
- Trade-off: Two i18n keys for a fallback is slightly more than an inline ternary. Acceptable — matching the surrounding convention (every UI string is keyed) reads better than a one-off inline string, and Ponytail defers to local idiom.
- The null *source* (GitHub "About") is out-of-repo and stays; this only fixes the render.

**D3: GitHub icon — inline SVG, no dependency**
- Rationale: Ponytail rung 3 — a native inline SVG needs no icon library, no CSS framework, no JS. One `<svg>` block in `Layout.astro`. The octocat path is the standard GitHub mark; `fill="currentColor"` follows the existing CSS variable pattern.
- Trade-off: The SVG is hand-pasted. If a second icon is ever needed, reconsider an icon set — but one icon does not justify a dependency.

**D4: Both GitHub affordances in the footer — icon → org, "view source" → this repo**
- Rationale: The user asked for "both" links and to "put to footer." The footer gains a GitHub icon linking to the org (the visual affordance, alongside the existing org copyright text link) and a "view source" text link to `fd-official-web` (the standard OSS-site "this site is open source" pattern). No header icon — the user placed the GitHub presence in the footer.
- Trade-off: The footer's existing org copyright text link and the new org icon both point to the org. Mild redundancy, but the text is attribution ("© FindDataTechnology") and the icon is the GitHub affordance — different purposes. Acceptable.

**D5: Fold the pending ICP footer line into this change**
- Rationale: The `粤ICP备2026118740号-1` link in the footer is an uncommitted local edit from the prior session, in limbo. Folding it here ships it with related shell work rather than leaving it stranded. It's a CN legal-filing requirement for the domain-served site.
- Trade-off: The ICP line is unrelated to the card bugs. Acceptable — it's a one-line footer addition, same file (`Layout.astro`), and leaving it uncommitted is worse.

## Risks / Trade-offs

**R1: Docs `description` field is optional — a doc without it shows a blank preview**
- Likelihood: Low — all 6 docs get a description in this change.
- Mitigation: The field is `z.string().optional()` so a missing one doesn't break the build; the card just shows an empty span. Future docs should include it.
- Residual risk: Low — a blank preview for a missing field is the status quo, not a regression.

**R2: Repo card fallback masks the out-of-repo null**
- Likelihood: Low — the fallback is honest ("no description"), not a fake one.
- Mitigation: The out-of-repo null is tracked separately (task 6.1 tail).
- Residual risk: None — the fallback is clearly a fallback, not a claim.

**R3: Inline SVG could render inconsistently / accessibility**
- Likelihood: Very low — inline SVG with `currentColor` follows the existing CSS variable pattern.
- Mitigation: Use `aria-hidden` on the decorative icon and an `aria-label`/`title` on the link for screen readers; size with the existing nav font metrics.
- Residual risk: None.

**R4: Two footer GitHub links could feel redundant**
- Likelihood: Low — org icon and "view source" point to different targets (org vs this repo).
- Mitigation: The "view source" link is labeled distinctly from the org copyright link and icon.
- Residual risk: None.
