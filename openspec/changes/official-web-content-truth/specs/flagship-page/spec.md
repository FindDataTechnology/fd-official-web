## MODIFIED Requirements

### Requirement: Curated flagship product page

The site SHALL provide a dedicated bilingual page for the flagship project `fd-open-data-mcp` at `/fd-open-data-mcp` (English) and `/zh/fd-open-data-mcp` (中文). Content MUST be hand-written curated copy (not the raw README), covering: why the project exists, what it does, architecture overview, and current capabilities. Any quantitative figure on the page (concept coverage, tool count, data sources) SHALL be rendered from the same build-time indicator export the homepage uses; such figures SHALL NOT be written by hand, and SHALL agree with the homepage statistics of the same build. The page MUST link to the auto-rendered README page (`/repos/fd-open-data-mcp`) for full technical detail.

#### Scenario: Visitor reads flagship page in English

- **WHEN** a visitor navigates to `/fd-open-data-mcp`
- **THEN** they see curated English copy explaining the project's purpose, architecture, and capabilities, plus a link to the full README page

#### Scenario: Visitor reads flagship page in Chinese

- **WHEN** a visitor navigates to `/zh/fd-open-data-mcp`
- **THEN** they see the equivalent curated Chinese copy

#### Scenario: Flagship page links to README detail

- **WHEN** a visitor clicks the full-detail link on the flagship page
- **THEN** they reach `/repos/fd-open-data-mcp` (or `/zh/repos/fd-open-data-mcp`)

#### Scenario: Flagship figures agree with the homepage

- **WHEN** a visitor reads the scales on the flagship page and the statistics on the homepage of the same build
- **THEN** the concept and tool counts are identical, because both come from the same indicator export