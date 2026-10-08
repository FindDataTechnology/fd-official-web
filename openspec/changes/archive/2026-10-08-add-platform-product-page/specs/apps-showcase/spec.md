# apps-showcase delta

## ADDED Requirements

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

## MODIFIED Requirements

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
