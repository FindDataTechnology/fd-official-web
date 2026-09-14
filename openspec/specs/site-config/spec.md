# site-config

## Purpose

Defines the single committed settings module that serves as the source of truth for public display values across the site (org name, GitHub org URL, flagship repo, featured list, demo URL, public MCP endpoint), ensuring no secrets leak into the client bundle.

## Requirements
### Requirement: Public site settings file
A single committed settings module SHALL be the source of truth for public display values: org name, GitHub org URL, flagship repo name, featured repo list, demo page URL, and the public MCP endpoint string. It SHALL NOT contain any secret or backend value (bearer token, internal backend URL).

#### Scenario: Page reads demo link from config
- **WHEN** a CTA or button renders a link to the demo
- **THEN** the href is sourced from the settings module's `demo.pageUrl`

#### Scenario: Config contains no secrets
- **WHEN** the settings module is inspected or bundled
- **THEN** it contains no bearer token and no internal backend URL; only public display values

#### Scenario: Featured list sourced from config at runtime
- **WHEN** the repos page renders and marks featured cards
- **THEN** the featured set is read from the settings module, not hardcoded in the page
