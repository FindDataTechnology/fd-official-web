## REMOVED Requirements

### Requirement: Aggregated updates page

**Reason**: The feed's source changes from repository commit metadata to editorial entries authored in the CMS. The requirement's commit-prefix exclusion scenarios describe machinery that ceases to exist; keeping the requirement would leave a contract for behavior the site no longer implements.

**Migration**: Every guarantee that still applies (bilingual page, reverse-chronological order, per-entry repo/line identification, and the principle that internal-only material never reaches the public feed) is carried into the replacement requirement "Editorial updates page" below. Internal-only material is now excluded by not being authored or not being published, rather than by message-prefix filtering.

### Requirement: CHANGELOG-first sourcing with commits fallback

**Reason**: The build no longer reads `CHANGELOG.md` or repository commits for this surface. Updates are authored and translated in the CMS, so both sourcing paths and the anonymous-rate-limit concern described by this requirement are obsolete.

**Migration**: Replaced by "CMS-authored sourcing with build-time snapshot fallback". The offline-degradation guarantee (a build without upstream access still renders the last-good feed) is preserved by the committed snapshot mechanism, and the build-token concern no longer applies to this feed.

### Requirement: Zero site-side maintenance

**Reason**: The requirement promises that adding an update needs no change to the site repository, naming `CHANGELOG.md` edits as the mechanism. The guarantee survives but the named mechanism is gone, and the scenario would assert behavior that can no longer occur.

**Migration**: Replaced by "Zero site-side maintenance under CMS authorship", which keeps the same guarantee with publishing in the CMS as the only required action.

### Requirement: Public-only offline fallback

**Reason**: The fallback is no longer a repo list joined against a repo-derived feed. It becomes a committed snapshot of published CMS entries, so the "repo absent from the public list" filtering scenarios no longer describe the system.

**Migration**: Replaced by "Published-only snapshot fallback". The guarantee that a degraded build never publishes non-public content is preserved by snapshotting only entries that were published at pull time.

## ADDED Requirements

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
