## ADDED Requirements

### Requirement: Docs index card previews
The `/docs` index page SHALL render each doc as a card showing the doc title and a one-line description preview, sourced from the doc's `description` frontmatter field — not the raw markdown body.

#### Scenario: Card shows description preview
- **WHEN** a visitor opens the `/docs` index
- **THEN** each card displays the doc's title and its `description` frontmatter value as a short preview, with no raw markdown (no `#` heading, no full body) rendered into the card

#### Scenario: Doc without description renders gracefully
- **WHEN** a doc lacks a `description` frontmatter field
- **THEN** its card renders the title with an empty (non-breaking) preview, and the build does not fail
