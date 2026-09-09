# apps-showcase Specification

## Purpose
TBD - created by archiving change add-apps-showcase. Update Purpose after archive.

## Requirements

### Requirement: Hand-curated apps collection
The site SHALL provide an `apps` content collection of hand-written, bilingual
(`en` / `zh`) app entries that is independent of the GitHub fetch pipeline:
apps content is committed to the repo and renders without network access. Each
entry SHALL carry at minimum a name, tagline, kind, and demo/entry URL, plus a
markdown body describing the product.

#### Scenario: App entry renders in both locales
- **WHEN** an app has both an `en` and a `zh` entry
- **THEN** `/apps/<slug>` and `/zh/apps/<slug>` render their respective locale's content

#### Scenario: Apps render without GitHub
- **WHEN** the site builds with no GitHub API access
- **THEN** the apps pages still render in full (they do not depend on `fetch-repos.mjs`)

### Requirement: Apps grid page
The site SHALL provide an apps grid at `/apps` (EN) and `/zh/apps` (中文)
listing every app entry with its name, tagline, and a link to its detail page.

#### Scenario: Grid lists all apps
- **WHEN** a visitor opens `/apps` or `/zh/apps`
- **THEN** every app in the collection appears with name, tagline, and detail link in the selected locale

### Requirement: App detail pages
The site SHALL render each app entry at `/apps/<slug>` and `/zh/apps/<slug>`,
including the narrative body and a call-to-action linking to the app's demo or
entry URL. An unknown slug SHALL 404.

#### Scenario: Detail page renders narrative and CTA
- **WHEN** a visitor opens a known app detail page
- **THEN** the page renders the app's narrative content and a demo/entry call-to-action

#### Scenario: Unknown app 404s
- **WHEN** a visitor requests `/apps/<unknown>`
- **THEN** the site returns a 404

### Requirement: Launch content: legal line
The collection SHALL launch with two entries covering the legal product line:
the law-bench contract drafting/review agent platform (clause-library contract
generation, triple AI review across legal accuracy / commercial fairness /
completeness, rubric + DeepEval evaluation, clause RAG search, MCP server
integration, live demo link) and the contract-template data service built on
the SAMR 合同示范文本 crawler stack.

#### Scenario: law-bench page communicates the product
- **WHEN** a visitor opens the law-bench app page
- **THEN** the page describes contract generation, the three review dimensions, evaluation, clause RAG, and MCP integration, and links to the live demo

#### Scenario: Contract-template data entry present
- **WHEN** a visitor opens the apps grid
- **THEN** the 合同示范文本 data service appears as an app with its own detail page

### Requirement: Homepage products section
The homepage SHALL present a products section between the intro and roadmap
sections, listing the app entries and linking to the apps grid — distinct from
the auto-listed GitHub projects on `/repos`.

#### Scenario: Products section on homepage
- **WHEN** a visitor loads the homepage (EN or 中文)
- **THEN** a products section appears before the roadmap strip, showing the apps and linking to the apps grid
