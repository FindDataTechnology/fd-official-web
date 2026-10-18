# repo-showcase

## Purpose

Defines the `/repos` showcase page — a build-time-generated grid of the org's public GitHub repositories with featured-first ordering and build resilience that never degrades the published list.

## Requirements

### Requirement: Repo grid auto-generated at build time
The `/repos` page SHALL fetch the org's public repositories from the GitHub API (`api.github.com/orgs/FindDataTechnology/repos`) during the build and render them into a grid. The repo list MUST NOT be hardcoded in the site source. Only repositories the API reports as public SHALL appear; the fetch SHALL send an authenticated request when a `GITHUB_TOKEN` is configured in the build environment, so a full build (org list + per-repo README, CHANGELOG, and commit calls) does not exhaust the unauthenticated per-hour rate limit.

#### Scenario: Build fetches live repo list
- **WHEN** the site is built
- **THEN** the repo grid reflects the current public repos of FindDataTechnology as returned by the GitHub API

#### Scenario: New repo appears without source edit
- **WHEN** a new public repo is added to the org and the site is rebuilt
- **THEN** the new repo appears in the grid with no source code change

#### Scenario: Private repos never appear
- **WHEN** the build runs with a token that can see the org's private repositories
- **THEN** private repositories appear in neither the grid nor the updates feed

#### Scenario: Authenticated fetch when token present
- **WHEN** the build runs with `GITHUB_TOKEN` in the environment
- **THEN** all GitHub API calls carry the token's authorization, and a full build completes without hitting the anonymous rate limit

### Requirement: Featured repos listed first
A small, locally maintained list SHALL designate featured repos (the flagship `fd-open-data-mcp` first); featured repos SHALL render before the auto-fetched remainder.

#### Scenario: Flagship is first
- **WHEN** the `/repos` page renders
- **THEN** `fd-open-data-mcp` appears first, before other repos

### Requirement: Repo card content

Each repo card SHALL display the repo name, description, primary language, star
count, last-updated date, and a link to its GitHub page. The name, the
description, and the metadata SHALL each occupy their own visual row: the
metadata SHALL NOT run on from the end of the description, and the name SHALL
NOT be joined to the start of the description. When a repo's description is null
or empty, the card SHALL render a localized fallback string rather than a blank
line.

#### Scenario: Card shows API data

- **WHEN** a repo card renders
- **THEN** it shows name, description, language, stars, updated date, and links to `https://github.com/FindDataTechnology/<repo>`

#### Scenario: Content is laid out in rows

- **WHEN** a repo card renders
- **THEN** the description and the language / stars / date metadata occupy separate lines, with the metadata not beginning immediately after the description text

#### Scenario: Null description renders fallback

- **WHEN** a repo has no GitHub description (null or empty)
- **THEN** its card renders a localized fallback string (e.g. "No description available" / "暂无描述") instead of a blank line

### Requirement: Build resilience

If the GitHub API fetch fails during build, the build SHALL NOT fail outright and SHALL NOT overwrite the committed snapshot: the previously committed `repos.json` SHALL be served as-is and a warning logged, so the site still ships with the last known repo grid. An empty grid is acceptable only when no snapshot has ever been committed. The page SHALL show the capture date of the list it renders.

An individual repo's README failing SHALL degrade that repo only — it renders in the grid without a detail page, every other repo unaffected. But a **widespread** README failure MUST NOT ship silently: when the share of repos whose README could not be fetched reaches a majority, the build MUST fail rather than deploy a repo surface that is missing most of its detail pages. The build output MUST end with a one-line verdict naming how many repos and READMEs were fetched, so a degraded build is visible without reading the whole log.

#### Scenario: API unavailable at build

- **WHEN** the GitHub API is unreachable during build
- **THEN** the build completes, the previously committed repo list is rendered unchanged, and a warning is logged

#### Scenario: A failed README fetch degrades that repo only

- **WHEN** the org list succeeds but an individual repo's README request fails
- **THEN** that repo renders in the grid without a detail page, and every other repo's data is unaffected

#### Scenario: Widespread README failure fails the build

- **WHEN** the org list succeeds but READMEs cannot be fetched for a majority of repos
- **THEN** the build fails instead of deploying, and the failure message states how many repos and READMEs were fetched

#### Scenario: Build ends with a one-line verdict

- **WHEN** any build finishes the repo fetch step
- **THEN** its final line states the repo count and README count, so a degraded run is visible at a glance

### Requirement: Grid grouped by product line

The `/repos` grid SHALL group the auto-fetched repositories by the five product
lines, using a small, locally maintained line map kept alongside the featured
list; featured repositories SHALL still render first. A repository that is
absent from the line map SHALL render in a separate "other" group rather than
being dropped from the grid.

#### Scenario: Repos appear under their line

- **WHEN** the `/repos` page renders
- **THEN** each repository appears under its product line's group heading, with the featured repositories listed first

#### Scenario: Unmapped repo is not dropped

- **WHEN** a public repository is not present in the line map
- **THEN** it renders in the "other" group, and no repository silently disappears

### Requirement: Build environment credential self-check

Before starting a build, the deploy script SHALL verify that the credential keys the build requires are present and non-empty, and SHALL abort naming any missing key rather than proceeding. A key whose absence has no safe degradation path (an unauthenticated GitHub fetch that can silently produce a partial repo surface) SHALL be required; a key whose absence falls back to a committed snapshot MAY be optional and warned about only.

#### Scenario: Missing required key aborts the build

- **WHEN** the build environment is missing a required credential key
- **THEN** the build aborts before any build work, and the message names the missing key

#### Scenario: Missing optional key only warns

- **WHEN** the build environment is missing a credential key that has a committed-snapshot fallback
- **THEN** the build proceeds with a warning, and the fallback data is used

#### Scenario: A credential lost to an env edit is caught immediately

- **WHEN** an edit to the build env file drops a required key
- **THEN** the next build attempt fails at the self-check, before the site can be built or deployed in a degraded state
