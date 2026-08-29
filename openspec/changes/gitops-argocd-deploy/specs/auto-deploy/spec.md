# Delta: auto-deploy

## MODIFIED Requirements

### Requirement: Automated build-and-deploy pipeline
A GitHub Actions workflow (`build-image.yml`) SHALL build the site (fetch repos/READMEs/updates data → `astro build`) and package `dist/` into a container image, push it to the private Harbor registry (`fd-web` project), and commit the new image tag into `deploy/k8s/fd-web.yaml` (commit suffixed `[skip ci]`). The in-cluster ArgoCD SHALL pick up the manifest change and roll the `official-web` Deployment. The workflow MUST trigger on push to the default branch and on a schedule (at least every 6 hours) so external repo changes propagate without manual action. Image tags MUST be unique per run (commit sha + UTC timestamp) so scheduled rebuilds of an unchanged commit still roll out.

#### Scenario: Push triggers deploy
- **WHEN** a commit is pushed to the default branch of fd-official-web
- **THEN** the workflow builds and pushes a new image, bumps the manifest tag, and ArgoCD rolls the Deployment without manual intervention

#### Scenario: Scheduled rebuild refreshes external content
- **WHEN** the scheduled trigger fires
- **THEN** the site is rebuilt with the latest GitHub org data and the new image rolls out via the same GitOps chain

#### Scenario: Deploy failure is visible
- **WHEN** the build, push, or manifest bump fails
- **THEN** the workflow run fails visibly in the Actions tab, the manifest tag is unchanged, and the live site remains on the last good Deployment

### Requirement: Server requires no build tooling
The container image SHALL contain only pre-built static files; the workflow MUST NOT require Node.js, npm, or GitHub API access on the server or its cluster. Server-side operations for a deploy SHALL be none (ArgoCD operates purely through the Kubernetes API).

#### Scenario: Server stays build-free
- **WHEN** a deploy runs
- **THEN** no files are written on the server host by CI, and the host nginx config is unchanged

### Requirement: Manual deploy skill
A user-invocable skill (`/fd-site-deploy`) SHALL publish on demand through the same chain: local build → local image build/push → tag bump commit (ArgoCD then rolls out), or by directly triggering an ArgoCD sync.

#### Scenario: Manual deploy on demand
- **WHEN** the user invokes `/fd-site-deploy`
- **THEN** a fresh image is built and pushed, the manifest tag is bumped, and the cluster rolls the new version

### Requirement: Secrets handling
GitHub SHALL hold no credential capable of SSH-ing into or writing files on any server: repository secrets MUST be limited to the project-scoped Harbor push robot (`HARBOR_USER`/`HARBOR_PASS`), and the default `GITHUB_TOKEN`. No private keys, tokens, or passwords SHALL be committed to the repository. The historical deploy SSH key (`fd-official-web-deploy`) SHALL be removed from the server's `authorized_keys` once the GitOps path is verified.

#### Scenario: No server credentials in GitHub
- **WHEN** the repository secrets and workflows are inspected
- **THEN** no SSH private key, server password, or host credential exists — only the Harbor robot and `GITHUB_TOKEN`

#### Scenario: Old deploy key revoked
- **WHEN** the GitOps pipeline has served production through one full scheduled cycle
- **THEN** the server's `authorized_keys` no longer contains the `fd-official-web-deploy` public key
