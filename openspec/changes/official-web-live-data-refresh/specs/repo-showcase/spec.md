## MODIFIED Requirements

### Requirement: Repo grid auto-generated at build time
The `/repos` page SHALL fetch the org's public repositories from the GitHub API (`api.github.com/orgs/FindDataTechnology/repos`) during the build and render them into a grid. The repo list MUST NOT be hardcoded in the site source. The fetch SHALL send an authenticated request when a `GITHUB_TOKEN` is configured in the build environment, so a full build (org list + per-repo README, CHANGELOG, and commit calls) does not exhaust the unauthenticated per-hour rate limit.

#### Scenario: Build fetches live repo list
- **WHEN** the site is built
- **THEN** the repo grid reflects the current public repos of FindDataTechnology as returned by the GitHub API

#### Scenario: New repo appears without source edit
- **WHEN** a new public repo is added to the org and the site is rebuilt
- **THEN** the new repo appears in the grid with no source code change

#### Scenario: Authenticated fetch when token present
- **WHEN** the build runs with `GITHUB_TOKEN` in the environment
- **THEN** all GitHub API calls carry the token's authorization, and a full build completes without hitting the anonymous rate limit

### Requirement: Build resilience
If the GitHub API fetch fails during build, the build SHALL NOT fail outright and SHALL NOT overwrite the committed snapshot: the previously committed `repos.json` SHALL be served as-is and a warning logged, so the site still ships with the last known repo grid. An empty grid is acceptable only when no snapshot has ever been committed.

#### Scenario: API unavailable at build
- **WHEN** the GitHub API is unreachable during build
- **THEN** the build completes, the previously committed repo list is rendered unchanged, and a warning is logged

#### Scenario: A failed README fetch degrades that repo only
- **WHEN** the org list succeeds but an individual repo's README request fails
- **THEN** that repo renders in the grid without a detail page, and every other repo's data is unaffected
