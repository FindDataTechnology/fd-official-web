# download-center Specification

## Purpose

Lets visitors download Platform desktop installers from the official site: a committed snapshot describes the current release — version, release date, platforms, dual-source links, beta flags — and the site renders a bilingual download band from it with zero build-time network access. The snapshot shape is the cross-repo contract written by the platform repo's release tooling (paas `add-desktop-release`), so both sides evolve it in lockstep.

## Requirements

### Requirement: Committed snapshot as the single data source

The site SHALL carry desktop installer release data as one committed JSON snapshot in the repository. Each release entry SHALL carry a release version, a release date, and one entry per distributed platform (macOS, Windows). Each platform entry SHALL carry a beta flag, an official-site link, and a GitHub Releases link, where each link may be absent but at least one SHALL be present. Building and rendering the download band SHALL require no network access, and the band SHALL not depend on the GitHub fetch pipeline.

#### Scenario: Band renders without network

- **WHEN** the site builds and renders with no network access
- **THEN** the download band renders in full from the committed snapshot

#### Scenario: Snapshot covers the contract fields

- **WHEN** a release is recorded in the snapshot
- **THEN** it exposes a version, a release date, macOS and Windows platform entries, and for each platform a beta flag plus its available source links

### Requirement: Build-time snapshot validation

The site SHALL validate the snapshot at build time: a missing or malformed required field, a non-semantic version string, an unknown platform key, or a platform entry with neither source link SHALL fail the build with an error naming the offending entry and field. A platform key outside the distributed set SHALL fail the build even when its data is otherwise well-formed.

#### Scenario: Malformed entry fails the build

- **WHEN** a snapshot release entry misses a required field, carries a non-semantic version, or holds an unknown platform key
- **THEN** the build fails with an error naming the entry and the invalid field

#### Scenario: Linkless platform entry fails the build

- **WHEN** a platform entry carries neither an official link nor a GitHub link
- **THEN** the build fails with an error naming that platform entry

### Requirement: Download band rendering

The download band SHALL render, for each platform of the newest release, the platform name, the release version, the release date, and one download link per available source: the official-site link as the primary (domestic) source and the GitHub Releases link as the international source. A platform entry flagged beta SHALL carry a visible beta marker and SHALL NOT be presented as stable.

#### Scenario: Both sources present

- **WHEN** a platform entry carries both an official link and a GitHub link
- **THEN** the band renders the official link as the primary download and the GitHub link as the alternative international source

#### Scenario: Beta entry marked

- **WHEN** a platform entry is flagged beta
- **THEN** that platform's download carries a visible beta marker and is not labeled stable

#### Scenario: Newest release wins

- **WHEN** the snapshot holds more than one release
- **THEN** the band renders the newest release's platform entries only

#### Scenario: No release yet renders a coming-soon state

- **WHEN** the snapshot records no release
- **THEN** the band renders a bilingual desktop-coming-soon state and renders no download links

### Requirement: Transitional single-source state

While the official download domain is not yet serving installers, a platform entry with only a GitHub link SHALL render the GitHub link as its download and SHALL show a bilingual note that the official direct link is coming soon; the band SHALL NOT render a broken or placeholder link for it. When a later snapshot adds the official link, it SHALL become the primary link and the coming-soon note SHALL disappear, with no page-side change beyond the snapshot update.

#### Scenario: GitHub-only entry renders the transitional note

- **WHEN** a platform entry has only a GitHub link
- **THEN** the download uses the GitHub link and the band notes the official direct link is coming soon

#### Scenario: Official link promotion

- **WHEN** a later snapshot adds the official link for a platform
- **THEN** the band renders the official link as primary, the GitHub link as the alternative, and no longer shows the coming-soon note for that platform

### Requirement: Unsigned installer guidance

Because first releases ship unsigned, the download band SHALL render, adjacent to the download links, a short bilingual note stating that the installers are unsigned and how to get past macOS Gatekeeper and Windows SmartScreen; the guidance SHALL be visible without leaving the page.

#### Scenario: Bypass guidance visible at the band

- **WHEN** a visitor views the download band
- **THEN** unsigned-install guidance for macOS and Windows is visible on the page, without following any link

### Requirement: Bilingual download band

The download band SHALL render in both locales, each with its own copy, from the single locale-neutral snapshot — version numbers, links, and flags SHALL have no per-locale duplication.

#### Scenario: zh band mirrors en

- **WHEN** a visitor opens the Chinese product page
- **THEN** the download band renders Chinese copy with the same versions, links, and flags as the English page
