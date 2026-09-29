# release-notes Specification

## Purpose
A customer-facing layer that tells site visitors what FindData shipped recently, in language a non-engineer can read, on a regular cadence — distinct from the developer-oriented `/updates` feed, and grounded in verifiable numbers from committed data-coverage snapshots.

## Requirements

### Requirement: Bilingual release-notes pages
The site SHALL provide a release-notes page at `/releases` (English) and `/zh/releases` (中文), listed in the site navigation of both locales. The page SHALL render release issues in reverse-chronological order, each showing at minimum: an issue label, its period (start and end date), a headline, and body sections. The page SHALL render from committed content only, with no build-time network dependency.

#### Scenario: Visitor opens the release notes
- **WHEN** a visitor navigates to `/releases` or `/zh/releases`
- **THEN** they see release issues ordered newest-first, each with issue label, period, headline, and body content in the locale they opened

#### Scenario: Site builds offline
- **WHEN** the site builds with no network access
- **THEN** the release-notes pages still render in full, because they depend only on committed content

### Requirement: Issue integrity
Each release issue SHALL cover one stated, explicit period, and consecutive issues MUST NOT overlap. An issue that exists in one locale but is missing from the other SHALL fail the build, naming the issue and the missing locale.

#### Scenario: Overlapping periods are rejected
- **WHEN** a new issue declares a period that overlaps the previous issue's period
- **THEN** the build fails with an error naming both issues and the overlapping range

#### Scenario: Locale pairing is enforced
- **WHEN** an issue exists as `en` content but has no `zh` counterpart (or vice versa)
- **THEN** the build fails with an error naming the issue and the missing locale, rather than rendering a single-locale issue

### Requirement: Coverage deltas from committed snapshots
Every release issue SHALL commit a machine-readable coverage snapshot captured at authoring time from the same source the data-modules page uses. Coverage figures quoted in an issue MUST be derivable from the diff between that issue's snapshot and the previous issue's snapshot. An issue MUST NOT quote a coverage figure that cannot be reproduced from those two snapshots.

#### Scenario: Quoted figure is reproducible
- **WHEN** an issue states a coverage change (e.g. an indicator count moving from N to M)
- **THEN** diffing the issue's committed snapshot against the previous issue's snapshot yields exactly that change

#### Scenario: First issue bootstraps the baseline
- **WHEN** the first issue is authored and no previous snapshot exists
- **THEN** its snapshot is committed as the baseline and the issue quotes current-state figures rather than deltas

### Requirement: Truthful editorial rules
An issue SHALL cover only the product lines that have progress in the period, and MUST NOT contain a statement that a line had no progress — absence from an issue is the only signal, matching how the data-modules page labels paused modules. Every claim in an issue MUST be verifiable against a committed artifact (snapshot, spec, or repository state); testimonials, customer names, and usage metrics MUST NOT appear.

#### Scenario: Paused line stays silent
- **WHEN** a product line had no shippable progress during an issue's period
- **THEN** the issue simply omits that line, and contains no sentence asserting the line was quiet

#### Scenario: Marketing-only claims are kept out
- **WHEN** a draft issue contains a claim with no committed artifact behind it (e.g. a usage metric or customer quote)
- **THEN** the issue is not finalized until the claim is removed or backed by a committed artifact

### Requirement: Machine-readable issue feed
The release-notes capability SHALL expose the issue list as a machine-readable feed (JSON) generated at build time, containing each issue's label, period, headline, per-line summaries, and coverage delta. Downstream outlets (the sales one-pager and the social distribution pipeline) consume this feed rather than scraping HTML.

#### Scenario: Feed reflects the rendered issues
- **WHEN** the site builds with N committed issues
- **THEN** the feed contains N entries in the same order as the page, each carrying label, period, headline, line summaries, and coverage delta
