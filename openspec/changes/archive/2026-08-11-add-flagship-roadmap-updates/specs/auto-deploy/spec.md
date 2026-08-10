# Spec: auto-deploy

## ADDED Requirements

### Requirement: Automated build-and-deploy pipeline
A GitHub Actions workflow SHALL build the site (fetch repos/READMEs/updates data → `astro build`) and deploy `dist/` to the Tencent server (`/opt/fd/web/dist`) via rsync over SSH. The workflow MUST trigger on push to the default branch and on a schedule (at least every 6 hours) so external repo changes (READMEs, CHANGELOGs, commits) propagate without manual action.

#### Scenario: Push triggers deploy
- **WHEN** a commit is pushed to the default branch of fd-official-web
- **THEN** the workflow builds and rsyncs the site to the server without manual intervention

#### Scenario: Scheduled rebuild refreshes external content
- **WHEN** the scheduled trigger fires
- **THEN** the site is rebuilt with the latest GitHub org data (repos, READMEs, changelogs) and deployed

#### Scenario: Deploy failure is visible
- **WHEN** the build or rsync step fails
- **THEN** the workflow run fails visibly in the Actions tab and the live site remains on the last good deploy

### Requirement: Server requires no build tooling
The server SHALL receive only pre-built static files; the workflow MUST NOT require Node.js, npm, or GitHub API access on the server. Nginx MUST NOT require a reload for static-only updates (atomic-ish directory replacement).

#### Scenario: Server stays build-free
- **WHEN** a deploy runs
- **THEN** the only server-side operation is file replacement under `/opt/fd/web/dist`

### Requirement: Manual deploy skill
A user-invocable skill (`/fd-site-deploy`) SHALL perform a local build + rsync deploy on demand, equivalent to the CI pipeline, for immediate publishes.

#### Scenario: Manual deploy on demand
- **WHEN** the user invokes `/fd-site-deploy`
- **THEN** the site is built locally (with fresh GitHub data) and rsynced to the server immediately

### Requirement: Secrets handling
The deploy SSH private key SHALL be stored only in GitHub Actions secrets (CI) and local SSH config (manual); it MUST NOT be committed to the repository. The rsync user SHOULD have write access limited to `/opt/fd/web/dist`.

#### Scenario: No secrets in repo
- **WHEN** the repository is inspected (including CI workflow files)
- **THEN** no private keys, tokens, or passwords are present in committed files
