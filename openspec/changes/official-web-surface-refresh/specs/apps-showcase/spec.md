## MODIFIED Requirements

### Requirement: Apps grid page

The site SHALL provide a line-tabbed products catalog at `/products` (EN) and
`/zh/products` (中文) with one tab per product line (`base`, `lex`, `wire`,
`facet`, `constellation`) in magnitude order. Each line SHALL be reachable via a
distinct, deep-linkable URL. On every line page the tab navigation SHALL be
present.

The `/products` and `/zh/products` URLs SHALL render the five-line overview: the
magnitude-ladder narrative, the five-line cards linking to each line page, and
the tab navigation. They MUST NOT render a single line's dedicated landing page,
and MUST NOT duplicate the content of any `/products/<line>` page.

Non-base lines SHALL list their entries with name, tagline, and a link to each
detail page; when such a line holds few entries, the catalog SHALL lay them out
across the content width rather than leaving a single narrow card on an
otherwise empty area. The `base` line SHALL instead render its dedicated product
landing (see Base line landing page) at `/products/base` and
`/zh/products/base`.

#### Scenario: Products root renders the five-line overview

- **WHEN** a visitor opens `/products` or `/zh/products`
- **THEN** the page renders the magnitude-ladder narrative and one card per product line linking to that line's page, with the tab navigation present, and does not render the base line's landing sections

#### Scenario: Products root is distinct from the base line page

- **WHEN** the HTML of `/products` is compared with that of `/products/base`
- **THEN** the two pages differ in their main content (overview versus landing), and each is self-describing in title and description metadata

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
