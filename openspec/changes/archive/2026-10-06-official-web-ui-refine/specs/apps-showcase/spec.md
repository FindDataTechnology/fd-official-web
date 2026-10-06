## MODIFIED Requirements

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

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Launch content: legal line

**Reason**: This requirement was written for the retired four-line structure (legal / paas / token / data), named entry domains that no longer serve the site (`craw.`, `token.`), and folded the open-data MCP and DAAS into one `data` entry — all superseded by the five-line rebrand and the hand-written entries that followed it.

**Migration**: Replaced by "Launch content across five lines" above; line identity and display order are owned by the `official-web-product-lines` contract.