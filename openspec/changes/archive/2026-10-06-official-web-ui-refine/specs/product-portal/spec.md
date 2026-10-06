## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Company portal positioning hero

**Reason**: Duplicated the hero contract that already lives in `site-shell` ("Consistent branding"), and its scenario text still referenced the retired four-line vocabulary (`data`, `legal`, `paas`, `token`). One hero contract, in one place.

**Migration**: `site-shell` now carries the full hero contract — company positioning, no single-line value proposition, five-line ladder below the hero, statistics secondary.

### Requirement: Four-line product taxonomy

**Reason**: Superseded by the five-line naming and ordering contract (`official-web-product-lines`); keeping a four-line requirement alive here let new work pass validation while building the wrong taxonomy.

**Migration**: Replaced by "Five-line product taxonomy" above, which points at the same five slugs, labels, and display order as the workspace-level contract.