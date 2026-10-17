# Spec: updates-feed

## Purpose
Build-time aggregated, reverse-chronological feed of project updates across the org's public repos.

## Requirements

### Requirement: Editorial updates page

The site SHALL provide a bilingual updates page (`/updates`, `/zh/updates`) showing a reverse-chronological feed of editorial project updates authored in the CMS. Each feed entry MUST show: the product line it belongs to, a human-written title, its date, and its summary; it MAY show a version or a link to the underlying change. Entries SHALL be grouped by month and filterable by product line, and the filter state SHALL be expressible in the URL so a filtered view can be shared. The page MUST render only published entries.

#### Scenario: Visitor views updates feed

- **WHEN** a visitor navigates to `/updates` or `/zh/updates`
- **THEN** they see entries ordered newest-first, each carrying a product line, a title, a date, and a summary, with month separators between months

#### Scenario: Internal-only material is never published

- **WHEN** an entry describing internal-only work (deploy plumbing, infrastructure rollovers, or unreleased plans) exists as a draft or is not published in the CMS
- **THEN** it does not appear in the public feed, while other published entries still do

#### Scenario: Filter by product line

- **WHEN** a visitor selects a product line filter on the updates page
- **THEN** only entries for that line remain listed, and the selection is reflected in the URL

#### Scenario: Unpublished entry disappears

- **WHEN** an entry is unpublished or deleted in the CMS and the site rebuilds
- **THEN** that entry no longer appears on the updates page

### Requirement: CMS-authored sourcing with build-time snapshot fallback

The updates feed SHALL be authored in the CMS: each entry is created, translated, and published there, and publishing SHALL trigger a site rebuild through the existing publish webhook. The build SHALL pull published entries into the site repository as content files, and those pulled files SHALL be committed as an offline snapshot so a build without CMS access still renders the last-good feed. The build MUST NOT derive updates from repository commit messages or `CHANGELOG.md` files.

#### Scenario: Publishing an entry reaches the site

- **WHEN** an editor publishes an updates entry in the CMS
- **THEN** a rebuild is triggered and the entry appears on the updates page after it completes

#### Scenario: Build without CMS access degrades gracefully

- **WHEN** the CMS is unreachable during a build
- **THEN** the build succeeds using the committed snapshot and the updates page renders the last-good entries rather than an empty page

#### Scenario: No commit-derived entries

- **WHEN** the built updates page is inspected
- **THEN** no entry originates from a repository commit message or changelog file

### Requirement: Zero site-side maintenance under CMS authorship

Adding or editing an update MUST require only editing and publishing the entry in the CMS; the site MUST pick it up on the next rebuild without any change to the site repository.

#### Scenario: New entry appears without site-repo changes

- **WHEN** an editor publishes a new updates entry and the site rebuilds
- **THEN** the entry appears on `/updates` with no commit to fd-official-web

### Requirement: Published-only snapshot fallback

The committed offline snapshot MUST contain only entries that were published in the CMS when the snapshot was written. When the snapshot is stale relative to the CMS, the next successful pull SHALL rewrite it to match the currently published set. A degraded build MUST never publish content that was not published in the CMS.

#### Scenario: Unpublished content never leaks through the snapshot

- **WHEN** a build runs without CMS access and the committed snapshot is used
- **THEN** only entries that were published when the snapshot was written are rendered

#### Scenario: Snapshot regenerates on the next successful pull

- **WHEN** a build succeeds against the CMS after the snapshot went stale
- **THEN** the committed snapshot is rewritten to match the currently published set
