## ADDED Requirements

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
