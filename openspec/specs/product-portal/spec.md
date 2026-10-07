# product-portal Specification

## Purpose
The homepage as the company front door: positioning hero, five-line card wall, and the research/services footnote — the surfaces above the per-line catalogs.

## Requirements

### Requirement: Homepage product-line card wall

The homepage SHALL present a card wall with one card per product line, each card
carrying the line's mark, the line's name, a one-line description, and a link to
that line's catalog tab. The wall SHALL render in both locales, and SHALL be
laid out so that the five cards read as a complete set at desktop and mobile
widths — no half-empty trailing row that reads as a broken grid.

#### Scenario: Card wall links each line to its tab

- **WHEN** a visitor clicks a line card on `/` or `/zh/`
- **THEN** they land on the products catalog showing that line's tab

#### Scenario: Card wall carries line marks

- **WHEN** a visitor views the homepage card wall in either locale
- **THEN** each card shows its line's mark and the line's name

#### Scenario: Wall reads as complete

- **WHEN** the five cards render at desktop and at mobile widths
- **THEN** no half-empty trailing row is left and the layout does not appear truncated

### Requirement: Research and services footnote
The homepage SHALL include a company-level research and services footnote in
both locales. Every claim, link, and number in the footnote SHALL be verified
against real artifacts; nothing unverifiable SHALL be published. A research
output (paper, dataset, benchmark) SHALL be listed only when an artifact exists
to point at: by domain and title, with a link when a public link exists, and
without a link when none does. A claimed output for which no artifact can be
located SHALL be omitted from the footnote rather than stated. The small-model
fine-tuning service SHALL be listed, as it is verifiable.

#### Scenario: Footnote lists both papers
- **WHEN** both a data-domain and a legal-domain research output have locatable artifacts
- **THEN** each is listed by domain, with a real link if one is public and without a link if none is

#### Scenario: Unverifiable output omitted
- **WHEN** no artifact can be located for a claimed research output
- **THEN** that claim does not appear in the footnote in either locale

#### Scenario: No fabricated evidence
- **WHEN** the footnote renders
- **THEN** it contains no testimonials, metrics, or references that cannot be verified against actual artifacts

### Requirement: Five-line product taxonomy

The site SHALL treat exactly five product lines as a shared vocabulary:
`base`, `lex`, `wire`, `facet`, `constellation`. The homepage card wall and the
products catalog SHALL use the same line set, the same user-facing labels
(EN / 中文), and the same display order as the five-line contract
(`official-web-product-lines` in the workspace store).

#### Scenario: Lines share one vocabulary

- **WHEN** a line appears on the homepage card wall and in the products catalog tabs
- **THEN** both surfaces use the same line label in the selected locale

#### Scenario: Line set matches the five-line contract

- **WHEN** the homepage card wall renders
- **THEN** it shows exactly the five lines in magnitude order, with no sixth line and none missing

### Requirement: Open-source organization on the homepage

The homepage SHALL surface the open-source organization: a compact section
carrying the GitHub organization address (github.com/FindDataTechnology),
the count of public repositories, and two entries — the repository catalog
(`/repos`) and the organization page on GitHub. The section SHALL follow the
committed visual world (console idiom, mono address readout) and SHALL NOT
require JavaScript.

#### Scenario: Homepage shows the organization

- **WHEN** a visitor views the homepage in either locale
- **THEN** a section presents the GitHub organization address, the public
  repository count, and entries to both the repository catalog and the
  organization page on GitHub

#### Scenario: Works without JavaScript

- **WHEN** a visitor browses the homepage with JavaScript disabled
- **THEN** the open-source section renders and its links work unchanged
