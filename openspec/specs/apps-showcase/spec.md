# apps-showcase Specification

## Purpose
TBD - created by archiving change add-apps-showcase. Update Purpose after archive.

## Requirements

### Requirement: Hand-curated apps collection
The site SHALL provide an `apps` content collection of hand-written, bilingual
(`en` / `zh`) app entries that is independent of the GitHub fetch pipeline:
apps content is committed to the repo and renders without network access. Each
entry SHALL carry at minimum a name, tagline, kind, demo/entry URL, and a
`line` field whose value is one of the four product lines (`data`, `legal`,
`paas`, `token`). An entry with a missing or unknown `line` SHALL fail the
build rather than render unclassified.

#### Scenario: App entry renders in both locales
- **WHEN** an app has both an `en` and a `zh` entry
- **THEN** `/products/<slug>` and `/zh/products/<slug>` render their respective locale's content

#### Scenario: Apps render without GitHub
- **WHEN** the site builds with no GitHub API access
- **THEN** the products pages still render in full (they do not depend on `fetch-repos.mjs`)

#### Scenario: Unknown line fails the build
- **WHEN** an app entry declares a `line` outside the four-line set
- **THEN** the build fails with an error naming the entry and the invalid value

### Requirement: Apps grid page
The site SHALL provide a line-tabbed products catalog at `/products` (EN) and
`/zh/products` (中文) with one tab per product line (`data`, `legal`, `paas`,
`token`). Each line SHALL be reachable via a distinct, deep-linkable URL, and
the selected tab SHALL list only that line's entries with name, tagline, and a
link to each detail page.

#### Scenario: Grid lists all apps
- **WHEN** a visitor selects a line tab
- **THEN** only entries whose `line` matches appear, each with name, tagline, and detail link in the selected locale

#### Scenario: Tabs filter entries by line
- **WHEN** a visitor opens a line tab
- **THEN** the catalog lists exactly the entries of that line, and no others

#### Scenario: Line tabs are deep-linkable
- **WHEN** a visitor opens a line's catalog URL directly
- **THEN** the catalog renders with that line's tab active

### Requirement: App detail pages
The site SHALL render each app entry at `/products/<slug>` and
`/zh/products/<slug>`, including the line it belongs to, the narrative body,
and a call-to-action linking to the app's demo or entry URL. An unknown slug
SHALL 404.

#### Scenario: Detail page renders narrative and CTA
- **WHEN** a visitor opens a known app detail page
- **THEN** the page renders the app's line, narrative content, and a demo/entry call-to-action

#### Scenario: Unknown app 404s
- **WHEN** a visitor requests `/products/<unknown>`
- **THEN** the site returns a 404

### Requirement: Launch content: legal line
The collection SHALL launch with entries covering all four product lines:
`legal` — the law-bench contract drafting/review platform and the
contract-template data service (SAMR 合同示范文本); `paas` — Platform, the
dsh-runtime AI assistant (agent chat, documents RAG, MCP extensions, agent
catalog, scheduled jobs) available as web app and Electron desktop client,
entry `https://craw.finddatatech.cloud`; `token` — FindDataRouter, the AI API
gateway with per-user tokens and multi-channel failover, entry
`https://token.finddatatech.cloud`; `data` — an entry surfacing the
open-data MCP flagship, DAAS, indicators, and demo. Each entry SHALL state
only capabilities verifiable against the corresponding project.

#### Scenario: Every line has at least one entry
- **WHEN** a visitor opens the products catalog
- **THEN** each of the four line tabs lists at least one entry

#### Scenario: law-bench page communicates the product
- **WHEN** a visitor opens the law-bench app page
- **THEN** the page describes contract generation, the three review dimensions, evaluation, clause RAG, and MCP integration, and links to the live demo

#### Scenario: Contract-template data entry present
- **WHEN** a visitor opens the legal line tab
- **THEN** the 合同示范文本 data service appears as an app with its own detail page

#### Scenario: Platform entry communicates the PaaS line
- **WHEN** a visitor opens the paas entry
- **THEN** the page describes agent chat, documents RAG, MCP extensions, and the web + desktop surfaces, and links to the craw entry URL

#### Scenario: FindDataRouter entry communicates the token line
- **WHEN** a visitor opens the token entry
- **THEN** the page describes the AI API gateway role and links to `https://token.finddatatech.cloud`

### Requirement: Legacy /apps URLs redirect
`/apps`, `/zh/apps`, `/apps/<slug>`, and `/zh/apps/<slug>` SHALL redirect to
their `/products` equivalents so existing external links keep working.

#### Scenario: Legacy catalog URL redirects
- **WHEN** a visitor requests `/apps` or `/zh/apps`
- **THEN** they are redirected to `/products` (resp. `/zh/products`)

#### Scenario: Legacy detail URL redirects
- **WHEN** a visitor requests `/apps/<slug>` or `/zh/apps/<slug>`
- **THEN** they are redirected to `/products/<slug>` (resp. `/zh/products/<slug>`)
