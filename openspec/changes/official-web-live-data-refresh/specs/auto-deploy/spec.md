## MODIFIED Requirements

### Requirement: Automated build-and-deploy pipeline
A build-and-deploy pipeline SHALL build the site (fetch repos/READMEs/updates/indicator data → `astro build`) and deploy `dist/` to the Tencent server (`/opt/fd/web/dist`), running on infrastructure that does not push from foreign-hosted runners to domestic endpoints (the GitHub-hosted image build is disabled by policy since 2026-09-10). The pipeline MUST trigger on push to the default branch and on a schedule of at least every 6 hours so external repo changes (READMEs, CHANGELOGs, commits) and catalog changes propagate without manual action. A failed build or deploy MUST be visible to the operator.

#### Scenario: Push triggers deploy
- **WHEN** a commit is pushed to the default branch of fd-official-web
- **THEN** the pipeline builds and deploys the site to the server without manual intervention

#### Scenario: Scheduled rebuild refreshes external content
- **WHEN** the scheduled trigger fires
- **THEN** the site is rebuilt with the latest GitHub org data (repos, READMEs, changelogs) and the latest indicator export, and deployed

#### Scenario: Deploy failure is visible
- **WHEN** the build or deploy step fails
- **THEN** the failure is surfaced to the operator (non-zero exit or visible job status) and the live site remains on the last good deploy

#### Scenario: No foreign-runner pushes
- **WHEN** the pipeline runs
- **THEN** no GitHub-hosted runner pushes to a domestic Harbor or CN server

### Requirement: Secrets handling
The deploy SSH private key SHALL be stored only in the pipeline environment and local SSH config (manual); it MUST NOT be committed to the repository. The `GITHUB_TOKEN` used by build-time fetches and the MCP export token SHALL be provided by the build environment and MUST NOT be committed. The rsync user SHOULD have write access limited to `/opt/fd/web/dist`.

#### Scenario: No secrets in repo
- **WHEN** the repository is inspected (including workflow/job definitions)
- **THEN** no private keys, tokens, or passwords are present in committed files

#### Scenario: Build tokens are injected by the environment
- **WHEN** the build runs
- **THEN** `GITHUB_TOKEN` and the MCP export token come from the pipeline environment, not from any committed file
