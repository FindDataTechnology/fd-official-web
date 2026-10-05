## MODIFIED Requirements

### Requirement: Repo card content

Each repo card SHALL display the repo name, description, primary language, star
count, last-updated date, and a link to its GitHub page. The name, the
description, and the metadata SHALL each occupy their own visual row: the
metadata SHALL NOT run on from the end of the description, and the name SHALL
NOT be joined to the start of the description. When a repo's description is null
or empty, the card SHALL render a localized fallback string rather than a blank
line.

#### Scenario: Card shows API data

- **WHEN** a repo card renders
- **THEN** it shows name, description, language, stars, updated date, and links to `https://github.com/FindDataTechnology/<repo>`

#### Scenario: Content is laid out in rows

- **WHEN** a repo card renders
- **THEN** the description and the language / stars / date metadata occupy separate lines, with the metadata not beginning immediately after the description text

#### Scenario: Null description renders fallback

- **WHEN** a repo has no GitHub description (null or empty)
- **THEN** its card renders a localized fallback string (e.g. "No description available" / "暂无描述") instead of a blank line

## ADDED Requirements

### Requirement: Grid grouped by product line

The `/repos` grid SHALL group the auto-fetched repositories by the five product
lines, using a small, locally maintained line map kept alongside the featured
list; featured repositories SHALL still render first. A repository that is
absent from the line map SHALL render in a separate "other" group rather than
being dropped from the grid.

#### Scenario: Repos appear under their line

- **WHEN** the `/repos` page renders
- **THEN** each repository appears under its product line's group heading, with the featured repositories listed first

#### Scenario: Unmapped repo is not dropped

- **WHEN** a public repository is not present in the line map
- **THEN** it renders in the "other" group, and no repository silently disappears