# Spec: flagship-page

## Purpose
Curated bilingual landing page for the flagship project `fd-open-data-mcp`.

## Requirements

### Requirement: Curated flagship product page
The site SHALL provide a dedicated bilingual page for the flagship project `fd-open-data-mcp` at `/fd-open-data-mcp` (English) and `/zh/fd-open-data-mcp` (中文). Content MUST be hand-written curated copy (not the raw README), covering: why the project exists, what it does, architecture overview, and current capabilities (concept coverage, tool count, data sources). The page MUST link to the auto-rendered README page (`/repos/fd-open-data-mcp`) for full technical detail.

#### Scenario: Visitor reads flagship page in English
- **WHEN** a visitor navigates to `/fd-open-data-mcp`
- **THEN** they see curated English copy explaining the project's purpose, architecture, and capabilities, plus a link to the full README page

#### Scenario: Visitor reads flagship page in Chinese
- **WHEN** a visitor navigates to `/zh/fd-open-data-mcp`
- **THEN** they see the equivalent curated Chinese copy

#### Scenario: Flagship page links to README detail
- **WHEN** a visitor clicks the full-detail link on the flagship page
- **THEN** they reach `/repos/fd-open-data-mcp` (or `/zh/repos/fd-open-data-mcp`)

### Requirement: Flagship entry points
The homepage hero/about section SHALL link to the flagship page, and the flagship repo card in the `/repos` grid SHALL link to the curated flagship page rather than the raw README page.

#### Scenario: Homepage links to flagship
- **WHEN** a visitor views the homepage
- **THEN** a prominent link or CTA leads to `/fd-open-data-mcp` (locale-appropriate)

#### Scenario: Repo grid links flagship card to curated page
- **WHEN** a visitor clicks the `fd-open-data-mcp` card on `/repos`
- **THEN** they land on `/fd-open-data-mcp`, not the README passthrough page
