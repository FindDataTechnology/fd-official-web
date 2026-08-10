## ADDED Requirements

### Requirement: Flagship install and quickstart docs
The `/docs` section SHALL document how to install and run `fd-open-data-mcp`: `uv sync` (+ `--extra data`), `migrate`, `import-catalog`, `consume-concepts`, `propose-bindings`, `seed-entities`, `generate-schedules`, and `read`/`serve`.

#### Scenario: Quickstart commands documented
- **WHEN** a visitor opens the quickstart page
- **THEN** they can follow the documented setup and read commands end-to-end

#### Scenario: Remote MCP usage documented
- **WHEN** the docs describe remote usage
- **THEN** they explain connecting to the live server URL and that it requires HTTPS (available after the domain swap) or a bearer token

### Requirement: Protocol spec overview
The `/docs` section SHALL include an overview of the `fd-open-data-protocol` manifest contract (what a datasource must expose to be ingested).

#### Scenario: Protocol page exists
- **WHEN** a visitor opens the protocol page
- **THEN** it explains the datasource manifest contract and links to the `fd-open-data-protocol` repo

### Requirement: Add-a-datasource guide
The `/docs` section SHALL include a guide for adding a new datasource to the system.

#### Scenario: Contributor can follow the guide
- **WHEN** a visitor opens the add-a-datasource page
- **THEN** it explains the steps to expose a datasource via the protocol and register it with the MCP

### Requirement: Bilingual docs
All docs pages SHALL be available in both EN and 中文 via per-locale content collections.

#### Scenario: Docs render in both locales
- **WHEN** a visitor opens the same doc page in EN and in `/zh`
- **THEN** each renders the corresponding locale's content
