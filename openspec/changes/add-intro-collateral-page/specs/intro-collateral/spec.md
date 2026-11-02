## Purpose

Carry the company's introduction long-image page (a self-contained single-file HTML collateral) on the official site as a public, shareable URL with social-card metadata, while staying out of search indexing and site navigation, and keeping exactly one editable source for it.

## ADDED Requirements

### Requirement: Public shareable URL

The intro collateral page SHALL be served at `https://www.finddatatech.cloud/intro/` to any anonymous visitor, over HTTPS, with no login, token, or referer requirement.

#### Scenario: Anonymous GET returns the page

- **WHEN** an anonymous client requests `/intro/` over HTTPS
- **THEN** the response SHALL be `200` with an HTML content type, and the body SHALL contain the collateral's first-page headline

#### Scenario: Page carries the collateral in full

- **WHEN** the fetched document is inspected
- **THEN** it SHALL contain all collateral sections (hero, architecture axis, the five product lines, scale, and entries/footer) from the single source file

### Requirement: Social share card

The page SHALL declare Open Graph metadata (`og:title`, `og:description`, `og:image`, `og:type`), and the `og:image` target SHALL be committed alongside the page and reachable by anonymous GET on the public network.

#### Scenario: Card metadata present

- **WHEN** a link-preview crawler fetches `/intro/`
- **THEN** the document SHALL expose og:title, og:description, and an absolute og:image URL

#### Scenario: og:image resolves publicly

- **WHEN** the og:image URL is requested anonymously
- **THEN** the response SHALL be `200` with an image content type

### Requirement: Not indexed and not in site navigation

The page SHALL instruct search engines not to index it, SHALL NOT appear in the site's generated `sitemap.xml`, and SHALL NOT be linked from the official site's navigation or content pages. It is a share-by-link collateral, not part of the site's content tree.

#### Scenario: Robots meta declares noindex

- **WHEN** the page HTML is inspected
- **THEN** it SHALL carry a robots directive with `noindex`

#### Scenario: Sitemap excludes the page

- **WHEN** the site builds and serves `sitemap.xml`
- **THEN** no entry SHALL contain the `/intro/` path

### Requirement: Single committed source, zero build integration

The only editable source of the collateral page SHALL be a committed file inside this repository's static assets, served through the existing static pipeline with no build-time network access or new credentials; the former out-of-repo copy SHALL be replaced by a pointer, not maintained as a second live file.

#### Scenario: Build without network still ships the page

- **WHEN** the site builds with no network access
- **THEN** the built output SHALL contain `/intro/` unchanged from the committed file

#### Scenario: Legacy location reduced to a pointer

- **WHEN** the retired collateral directory is inspected
- **THEN** `web/index.html` SHALL no longer exist there, and a README SHALL state that the official-web repo path is the source of truth
