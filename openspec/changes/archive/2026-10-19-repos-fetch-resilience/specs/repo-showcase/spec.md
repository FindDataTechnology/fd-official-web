## MODIFIED Requirements

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

## ADDED Requirements

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
