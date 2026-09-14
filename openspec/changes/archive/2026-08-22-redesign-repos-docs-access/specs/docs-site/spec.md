## ADDED Requirements

### Requirement: Page-level demo CTA on docs index
The `/docs` index page SHALL render a page-level "Try the live demo" CTA strip above the doc grid, linking to the demo page URL from the settings module, for access parity with the `/repos` page.

#### Scenario: Docs index shows demo CTA
- **WHEN** a visitor opens `/docs`
- **THEN** a demo CTA strip is visible above the doc grid and links to the demo page

### Requirement: Repo detail header demo CTA on flagship
The flagship repo detail page (`/repos/[name]` for `fd-open-data-mcp`) SHALL render a "Try the live demo" CTA in the header, linking to the demo page URL from the settings module.

#### Scenario: Flagship detail header shows demo CTA
- **WHEN** a visitor opens the flagship repo's detail page
- **THEN** a demo CTA is visible in the header and links to the demo page

#### Scenario: Non-flagship detail header has no demo CTA
- **WHEN** a visitor opens a non-flagship repo's detail page
- **THEN** no demo CTA is shown in the header
