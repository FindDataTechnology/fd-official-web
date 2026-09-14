# repo-showcase

## Purpose

Defines the `/repos` showcase page — a build-time-generated grid of the org's public GitHub repositories with featured-first ordering and build resilience.
## Requirements
### Requirement: Repo grid auto-generated at build time
The `/repos` page SHALL fetch the org's public repositories from the GitHub API (`api.github.com/orgs/FindDataTechnology/repos`) during the build and render them into a grid. The repo list MUST NOT be hardcoded in the site source.

#### Scenario: Build fetches live repo list
- **WHEN** the site is built
- **THEN** the repo grid reflects the current public repos of FindDataTechnology as returned by the GitHub API

#### Scenario: New repo appears without source edit
- **WHEN** a new public repo is added to the org and the site is rebuilt
- **THEN** the new repo appears in the grid with no source code change

### Requirement: Featured repos listed first
A small, locally maintained list SHALL designate featured repos (the flagship `fd-open-data-mcp` first); featured repos SHALL render before the auto-fetched remainder.

#### Scenario: Flagship is first
- **WHEN** the `/repos` page renders
- **THEN** `fd-open-data-mcp` appears first, before other repos

### Requirement: Repo card content
Each repo card SHALL display the repo name, description, primary language, star count, last-updated date, a GitHub icon link to its GitHub page, and (for the flagship) a demo button. When a repo's description is null or empty, the card SHALL render a localized fallback string rather than a blank line.

#### Scenario: Card shows API data
- **WHEN** a repo card renders
- **THEN** it shows name, description, language, stars, updated date, a GitHub icon linking to `https://github.com/FindDataTechnology/<repo>`, and links via the whole card to its detail or GitHub page

#### Scenario: Null description renders fallback
- **WHEN** a repo has no GitHub description (null or empty)
- **THEN** its card renders a localized fallback string (e.g. "No description available" / "暂无描述") instead of a blank line

### Requirement: Build resilience
If the GitHub API fetch fails during build, the build SHALL NOT fail outright; it SHALL fall back to a cached/empty grid and log a warning, so the site still ships.

#### Scenario: API unavailable at build
- **WHEN** the GitHub API is unreachable during build
- **THEN** the build completes with an empty repo grid and a warning logged

### Requirement: GitHub icon link on repo cards
Each repo card SHALL display a GitHub icon linking directly to the repo's GitHub page, in addition to the whole-card link to the on-site detail page (or to GitHub when no README exists). The icon SHALL reuse the existing inline GitHub SVG path.

#### Scenario: Card shows GitHub icon
- **WHEN** a repo card renders
- **THEN** a GitHub icon is visible and links to `https://github.com/FindDataTechnology/<repo>`

#### Scenario: Icon opens repo in new tab
- **WHEN** a visitor clicks the GitHub icon on a card
- **THEN** the repo's GitHub page opens

### Requirement: Demo button on flagship card
The flagship repo card SHALL display a "Try the live demo" button linking to the demo page. Non-flagship cards SHALL NOT show a demo button.

#### Scenario: Flagship card has demo button
- **WHEN** the flagship repo card renders
- **THEN** a demo button is visible and links to the demo page URL from the settings module

#### Scenario: Non-flagship card has no demo button
- **WHEN** a non-flagship repo card renders
- **THEN** no demo button is shown

### Requirement: Page-level demo CTA on repos page
The `/repos` page SHALL render a page-level "Try the live demo" CTA strip above the repo grid, linking to the demo page URL from the settings module.

#### Scenario: Repos page shows demo CTA
- **WHEN** a visitor opens `/repos`
- **THEN** a demo CTA strip is visible above the grid and links to the demo page

