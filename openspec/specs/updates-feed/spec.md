# Spec: updates-feed

## Purpose
Build-time aggregated, reverse-chronological feed of project updates across org repos.

## Requirements

### Requirement: Aggregated updates page
The site SHALL provide a bilingual updates page (`/updates`, `/zh/updates`) showing a reverse-chronological feed of project updates across org repos, generated at build time. Each feed entry MUST show: repo name, date, version or commit identifier, and the change summary.

#### Scenario: Visitor views updates feed
- **WHEN** a visitor navigates to `/updates`
- **THEN** they see entries from multiple org repos ordered newest-first, each with repo, date, and summary

### Requirement: CHANGELOG-first sourcing with commits fallback
The build-time fetch script SHALL parse each repo's `CHANGELOG.md` (Keep-a-Changelog format: `## [version] - date` sections) when the file exists, and SHALL fall back to that repo's recent commits when no changelog exists. The `[Unreleased]` section of a changelog SHOULD be surfaced as "upcoming" entries where present.

#### Scenario: Repo with changelog
- **WHEN** a repo contains a `CHANGELOG.md` with version sections
- **THEN** the feed contains one entry per version section with its date and bullet content

#### Scenario: Repo without changelog
- **WHEN** a repo has no `CHANGELOG.md`
- **THEN** the feed contains entries derived from that repo's recent commits (message + date)

#### Scenario: Fetch failure degrades gracefully
- **WHEN** the GitHub API is unreachable at build time
- **THEN** the build still succeeds using the most recently cached data, and the updates page renders from that cache

### Requirement: Zero site-side maintenance
Adding a new update to the feed MUST require only editing the relevant repo's `CHANGELOG.md` (or pushing commits); the site MUST pick it up on the next build without site-repo changes.

#### Scenario: New changelog entry appears automatically
- **WHEN** a maintainer adds a version section to a repo's CHANGELOG.md and the site rebuilds
- **THEN** the new entry appears on `/updates` with no changes to fd-official-web
