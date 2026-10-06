# apps-showcase Specification

## Purpose
Hand-curated bilingual product/app pages for the five product lines — independent of the GitHub fetch pipeline, line-classified at build time, deep-linkable per line.

## Requirements

### Requirement: Hand-curated apps collection

The site SHALL provide an `apps` content collection of hand-written, bilingual
(`en` / `zh`) app entries that is independent of the GitHub fetch pipeline:
apps content is committed to the repo and renders without network access. Each
entry SHALL carry at minimum a name, tagline, kind, and a `line` field whose
value is one of the five product lines (`base`, `lex`, `wire`, `facet`,
`constellation`); an entry SHALL carry a demo/entry URL wherever a live entry
point exists. An entry with a missing or unknown `line` SHALL fail the build
rather than render unclassified.

#### Scenario: App entry renders in both locales

- **WHEN** an app has both an `en` and a `zh` entry
- **THEN** `/products/<slug>` and `/zh/products/<slug>` render their respective locale's content

#### Scenario: Apps render without GitHub

- **WHEN** the site builds with no GitHub API access
- **THEN** the products pages still render in full (they do not depend on `fetch-repos.mjs`)

#### Scenario: Unknown line fails the build

- **WHEN** an app entry declares a `line` outside the five-line set
- **THEN** the build fails with an error naming the entry and the invalid value

### Requirement: Apps grid page

The site SHALL provide a line-tabbed products catalog at `/products` (EN) and
`/zh/products` (中文) with one tab per product line (`base`, `lex`, `wire`,
`facet`, `constellation`) in magnitude order. Each line SHALL be reachable via a
distinct, deep-linkable URL, and the selected tab SHALL list only that line's
entries with name, tagline, and a link to each detail page. When a line holds
few entries, the catalog SHALL lay them out across the content width rather than
leaving a single narrow card on an otherwise empty area.

#### Scenario: Grid lists all apps

- **WHEN** a visitor selects a line tab
- **THEN** only entries whose `line` matches appear, each with name, tagline, and detail link in the selected locale

#### Scenario: Tabs filter entries by line

- **WHEN** a visitor opens a line tab
- **THEN** the catalog lists exactly the entries of that line, and no others

#### Scenario: Line tabs are deep-linkable

- **WHEN** a visitor opens a line's catalog URL directly
- **THEN** the catalog renders with that line's tab active

#### Scenario: A thin line does not read as empty

- **WHEN** a visitor opens a line that has a single entry
- **THEN** that entry is laid out across the content width, and the page does not present a large empty content area

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

### Requirement: Legacy /apps URLs redirect
`/apps`, `/zh/apps`, `/apps/<slug>`, and `/zh/apps/<slug>` SHALL redirect to
their `/products` equivalents so existing external links keep working.

#### Scenario: Legacy catalog URL redirects
- **WHEN** a visitor requests `/apps` or `/zh/apps`
- **THEN** they are redirected to `/products` (resp. `/zh/products`)

#### Scenario: Legacy detail URL redirects
- **WHEN** a visitor requests `/apps/<slug>` or `/zh/apps/<slug>`
- **THEN** they are redirected to `/products/<slug>` (resp. `/zh/products/<slug>`)

### Requirement: Launch content across five lines

The collection SHALL cover all five product lines, with at least one entry per
line. Each entry SHALL belong to exactly one line, and SHALL state only
capabilities verifiable against the corresponding project. Entries whose line
membership is owned by another contract SHALL follow that contract.

#### Scenario: Every line has at least one entry

- **WHEN** a visitor opens the products catalog
- **THEN** each of the five line tabs lists at least one entry

#### Scenario: Entry capabilities are verifiable

- **WHEN** a visitor reads an entry's detail page
- **THEN** every capability it claims is verifiable against the corresponding project, and its entry point (if any) is live
