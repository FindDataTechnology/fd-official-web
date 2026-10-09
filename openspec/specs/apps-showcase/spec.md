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
distinct, deep-linkable URL. On every line page the tab navigation SHALL be
present. Non-base lines SHALL list their entries with name, tagline, and a link
to each detail page; when such a line holds few entries, the catalog SHALL lay
them out across the content width rather than leaving a single narrow card on
an otherwise empty area. The `base` line SHALL instead render its dedicated
product landing (see Base line landing page) at the same URL.

#### Scenario: Grid lists all apps

- **WHEN** a visitor selects a non-base line tab
- **THEN** only entries whose `line` matches appear, each with name, tagline, and detail link in the selected locale

#### Scenario: Tabs filter entries by line

- **WHEN** a visitor opens a non-base line tab
- **THEN** the catalog lists exactly the entries of that line, and no others

#### Scenario: Line tabs are deep-linkable

- **WHEN** a visitor opens a line's catalog URL directly
- **THEN** the page for that line renders with its tab active

#### Scenario: A thin line does not read as empty

- **WHEN** a visitor opens a non-base line that has a single entry
- **THEN** that entry is laid out across the content width, and the page does not present a large empty content area

#### Scenario: Base tab lands on the product landing

- **WHEN** a visitor opens `/products/base` or `/zh/products/base`
- **THEN** the dedicated base landing renders with the base tab active, not the generic entry grid

### Requirement: Base line landing page

`/products/base` and `/zh/products/base` SHALL render a dedicated, bilingual product landing for the base line in place of the generic line catalog, at the same URLs, while keeping the five-line tab navigation so all lines stay cross-reachable. The landing SHALL present, in order: a dual-track hero, a value-proposition section, a product-tour section, an all-platform matrix, a self-host quickstart, the desktop download band, and a closing section. The closing section SHALL link to the release-notes page, the roadmap page, and the GitHub organization, and SHALL keep the base line's app entries reachable through links to their detail pages. The other four lines SHALL keep the generic catalog view unchanged.

#### Scenario: Landing renders the seven sections in order

- **WHEN** a visitor opens `/products/base`
- **THEN** the page renders the dual-track hero, value proposition, product tour, platform matrix, quickstart, download band, and closing section in that order, with the five-line tabs present

#### Scenario: zh mirror renders the same structure

- **WHEN** a visitor opens `/zh/products/base`
- **THEN** the page renders the same seven-section structure with Chinese copy

#### Scenario: Other lines keep the catalog

- **WHEN** a visitor opens a non-base line tab page (e.g. `/products/lex`)
- **THEN** the generic line catalog renders as before, with no landing sections

#### Scenario: Line app entries stay reachable

- **WHEN** a visitor reads the landing's closing section
- **THEN** the base line's app entries are linked to their detail pages

### Requirement: Dual-track hero

The landing hero SHALL present two tracks: a hosted-cloud track whose call-to-action offers contact-based activation — the hosted cloud is currently invite-only, so the CTA SHALL NOT promise or link self-service signup — and a local track that offers the self-host path: the quickstart commands to copy and an affordance that takes the visitor to the download band.

#### Scenario: Cloud CTA stays invite-consistent

- **WHEN** a visitor reads the cloud track
- **THEN** the CTA reads as contact-to-activate and does not link a self-service signup page

#### Scenario: Local track jumps to the download band

- **WHEN** a visitor activates the local track's download affordance
- **THEN** the visitor is taken to the download band section of the same page

### Requirement: Product tour section with live-demo deep link

The landing SHALL include a product-tour section that illustrates the product in the site's CSS-drawn mockup style (no real screenshots, no user data), and SHALL offer a call-to-action that takes the visitor to the live demo page in the same locale.

#### Scenario: Tour CTA reaches the demo page

- **WHEN** a visitor follows the tour section's demo call-to-action on `/products/base`
- **THEN** the visitor reaches `/demo`; on `/zh/products/base`, the visitor reaches `/zh/demo`

### Requirement: Platform matrix and self-host quickstart

The landing SHALL include an all-platform matrix stating the surfaces the platform runs on — web, WeChat mini-program, macOS, Windows — and a self-host quickstart section presenting the public repository's clone, install, and start commands as copyable text, linking to the repository for the full guide.

#### Scenario: Matrix covers the four surfaces

- **WHEN** a visitor reads the platform matrix
- **THEN** web, mini-program, macOS, and Windows are each stated

#### Scenario: Quickstart commands are copyable and linked

- **WHEN** a visitor reads the quickstart section
- **THEN** the clone/install/start commands appear as copyable text with a link to the public repository

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

### Requirement: Wire line pricing entry

The wire line's catalog page (`/products/wire` and `/zh/products/wire`) SHALL offer, alongside the platform entry CTA, a pricing call-to-action linking to the Wire platform's pricing page (`https://wire.finddatatech.cloud/#/pricing`). The main site SHALL NOT carry plan prices, row quotas, or any pricing figures for the Wire line — the platform's pricing page is the single source of truth for pricing numbers.

#### Scenario: Pricing CTA reaches the platform pricing page
- **WHEN** a visitor follows the pricing call-to-action on `/products/wire` or `/zh/products/wire`
- **THEN** they land on the Wire platform pricing page

#### Scenario: No pricing figures on the main site
- **WHEN** the wire line's catalog and app detail pages are inspected in either locale
- **THEN** no plan price or row-quota figure appears for the Wire line
