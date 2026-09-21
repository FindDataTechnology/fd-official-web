## MODIFIED Requirements

### Requirement: Aggregated updates page
The site SHALL provide a bilingual updates page (`/updates`, `/zh/updates`) showing a reverse-chronological feed of project updates across the org's public repos, generated at build time. Each feed entry MUST show: repo name, date, version or commit identifier, and the change summary. Entries MUST be excluded from the public feed when their repo is on a maintained exclusion list or their commit summary matches a maintained internal-only prefix list (e.g. `chore(openspec):`, `chore(cleanup):`).

#### Scenario: Visitor views updates feed
- **WHEN** a visitor navigates to `/updates`
- **THEN** they see entries from multiple org repos ordered newest-first, each with repo, date, and summary

#### Scenario: Internal-only commits are filtered
- **WHEN** a repo's recent commits include messages matching an internal-only prefix (e.g. `chore(openspec): archive …`)
- **THEN** those commits do not appear in the public feed, while that repo's other commits still do

#### Scenario: Excluded repo is filtered entirely
- **WHEN** a repo is on the exclusion list
- **THEN** no entries from that repo appear in the public feed

### Requirement: CHANGELOG-first sourcing with commits fallback
The build-time fetch script SHALL parse each repo's `CHANGELOG.md` (Keep-a-Changelog format: `## [version] - date` sections) when the file exists, and SHALL fall back to that repo's recent commits when no changelog exists. The `[Unreleased]` section of a changelog SHOULD be surfaced as "upcoming" entries where present. All GitHub API calls SHALL carry the build token when configured so coverage spans every repo rather than stopping at the anonymous rate limit.

#### Scenario: Repo with changelog
- **WHEN** a repo contains a `CHANGELOG.md` with version sections
- **THEN** the feed contains one entry per version section with its date and bullet content

#### Scenario: Repo without changelog
- **WHEN** a repo has no `CHANGELOG.md`
- **THEN** the feed contains entries derived from that repo's recent commits (message + date)

#### Scenario: Feed covers all repos under one build
- **WHEN** the build runs with a configured `GITHUB_TOKEN`
- **THEN** every included repo contributes entries; commit fallback does not silently stop after the first few repos

#### Scenario: Fetch failure degrades gracefully
- **WHEN** the GitHub API is unreachable at build time
- **THEN** the build still succeeds using the most recently cached data, and the updates page renders from that cache without being overwritten with fewer entries
