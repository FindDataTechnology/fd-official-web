## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Repo card content
Each repo card SHALL display the repo name, description, primary language, star count, last-updated date, a GitHub icon link to its GitHub page, and (for the flagship) a demo button. When a repo's description is null or empty, the card SHALL render a localized fallback string rather than a blank line.

#### Scenario: Card shows API data
- **WHEN** a repo card renders
- **THEN** it shows name, description, language, stars, updated date, a GitHub icon linking to `https://github.com/FindDataTechnology/<repo>`, and links via the whole card to its detail or GitHub page

#### Scenario: Null description renders fallback
- **WHEN** a repo has no GitHub description (null or empty)
- **THEN** its card renders a localized fallback string (e.g. "No description available" / "暂无描述") instead of a blank line
