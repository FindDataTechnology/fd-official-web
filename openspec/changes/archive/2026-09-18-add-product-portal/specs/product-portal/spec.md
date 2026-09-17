## ADDED Requirements

### Requirement: Company portal positioning hero
The homepage hero SHALL present the company positioning in both locales:
FindData Technology / 寻数科技 focuses on text and data processing, builds an
ecosystem around it, and serves individuals and small teams in the AI era with
infrastructure and auxiliary tools. The hero SHALL NOT lead with a single
product line's value proposition.

#### Scenario: Hero states the ecosystem positioning
- **WHEN** a visitor loads `/` or `/zh/`
- **THEN** the hero communicates the text-and-data ecosystem positioning for individuals and small teams in the selected locale

#### Scenario: Hero does not lead with one line
- **WHEN** a visitor reads the hero
- **THEN** no single product line (data, legal, paas, token) is presented as the company's only offering

### Requirement: Four-line product taxonomy
The site SHALL treat exactly four product lines as a shared vocabulary:
`data`, `legal`, `paas`, `token`. The homepage card wall and the products
catalog SHALL use the same line set and the same user-facing labels
(EN / 中文) for each line.

#### Scenario: Lines share one vocabulary
- **WHEN** a line appears on the homepage card wall and in the products catalog tabs
- **THEN** both surfaces use the same line label in the selected locale

### Requirement: Homepage product-line card wall
The homepage SHALL present a card wall with one card per product line
(`data`, `legal`, `paas`, `token`), each card naming the line, giving a
one-line description, and linking to that line's catalog tab. The wall SHALL
render in both locales.

#### Scenario: Card wall links each line to its tab
- **WHEN** a visitor clicks a line card on `/` or `/zh/`
- **THEN** they land on the products catalog showing that line's tab

### Requirement: Research and services footnote
The homepage SHALL include a company-level research footnote listing the two
papers (one data-domain, one legal-domain) and the small-model fine-tuning
service. Every claim, link, and number in the footnote SHALL be verified
against real artifacts; nothing unverifiable SHALL be published.

#### Scenario: Footnote lists both papers
- **WHEN** a visitor views the homepage footnote in either locale
- **THEN** the two papers are listed by domain, each with a real link if one exists and no link if none does

#### Scenario: No fabricated evidence
- **WHEN** the footnote renders
- **THEN** it contains no testimonials, metrics, or references that cannot be verified against actual artifacts
