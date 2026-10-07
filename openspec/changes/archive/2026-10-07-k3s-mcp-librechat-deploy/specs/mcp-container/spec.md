## ADDED Requirements

### Requirement: Reproducible MCP container image
The system SHALL build `fd-open-data-mcp` into a Docker image based on `python:3.12-slim` (or compatible ≥3.10) using `uv` for dependency resolution. The image MUST include the sibling dependency `fd-open-data-protocol` (resolved from a vendored copy in the build context, not a path outside it) and Playwright Chromium runtime libraries needed by the scraping adapters.

#### Scenario: Image builds with uv from vendored sources
- **WHEN** `docker build` runs in the `fd-open-data-mcp` source dir with the sibling `fd-open-data-protocol` copied into the context
- **THEN** the build completes and `uv sync --frozen --no-dev` installs all runtime deps without network path dependencies

#### Scenario: Playwright Chromium usable at runtime
- **WHEN** the container starts
- **THEN** the Playwright scraping adapters can launch Chromium without "missing shared library" errors

#### Scenario: CLI entrypoint present
- **WHEN** `docker run --rm <image> fd-open-data-mcp --help` executes
- **THEN** the CLI help prints including `serve`, `migrate`, `import-catalog`, and `seed-entities` subcommands

### Requirement: Configurable runtime via environment variables
The image SHALL be driven entirely by environment variables at runtime — no secrets baked into layers. The required variables are: `FD_OPEN_DATA_MCP_DATABASE_URL`, `FINDDATA_ROOT`, `EDGAR_IDENTITY`, and `MCP_TOKEN` (bearer auth). The DB URL MUST point at the mounted PVC path, not the build-time default.

#### Scenario: Env override of DB path
- **WHEN** the container runs with `FD_OPEN_DATA_MCP_DATABASE_URL=sqlite:////data/daas.db`
- **THEN** the server opens `/data/daas.db` (the PVC mount) and ignores any build-time `metadata/daas.db`

#### Scenario: No secrets in image layers
- **WHEN** `docker history <image>` is inspected
- **THEN** no API key, bearer token, or `MCP_TOKEN` value appears in any layer

### Requirement: Kubernetes Deployment with persistent SQLite
The system SHALL run MCP as a Kubernetes Deployment (1 replica) in namespace `mcp`, mounting a PVC (`daas-db`, local-path) at `/data` for `daas.db`, and a read-only hostPath (or ConfigMap) for `FINDDATA_ROOT` containing the `fd-*` provider data. The Deployment MUST run an init step (`migrate` + `seed-entities` + `import-catalog`) before the `serve` container starts.

#### Scenario: DB persists across pod restarts
- **WHEN** the MCP pod is deleted and rescheduled
- **THEN** the new pod reuses the existing `daas.db` from the PVC and data is intact

#### Scenario: Init migration runs before serve
- **WHEN** the pod starts on a fresh PVC
- **THEN** `fd-open-data-mcp migrate` completes successfully before the `serve` container becomes Ready

#### Scenario: FINDDATA_ROOT data available read-only
- **WHEN** the serve container starts
- **THEN** the `fd-*` provider files under `FINDDATA_ROOT` are readable (catalog/import succeeds)

### Requirement: NodePort Service with bearer auth
The system SHALL expose MCP via a Service of type NodePort on port 30899 → containerPort 8899, over the `streamable-http` transport, with Bearer-token authentication enforced (the `MCP_TOKEN` value from a Kubernetes Secret).

#### Scenario: Service reachable on NodePort
- **WHEN** a client sends `GET /` to `http://124.220.7.175:30899`
- **THEN** the MCP server responds (not a connection refused)

#### Scenario: Bearer token enforced
- **WHEN** a client calls an MCP tool without the `Authorization: Bearer <token>` header
- **THEN** the server rejects the request with 401/403

#### Scenario: Valid token grants tool access
- **WHEN** a client calls an MCP tool with the correct bearer header
- **THEN** the tool executes and returns a result

### Requirement: Image pushed to Harbor registry
The built image SHALL be tagged `harbor.local:30880/finddata/fd-open-data-mcp:latest` (and a git-sha tag) and pushed to the existing Harbor registry with valid robot-account credentials.

#### Scenario: Image pull succeeds from k3s
- **WHEN** the k3s node pulls `harbor.local:30880/finddata/fd-open-data-mcp:latest`
- **THEN** the pull completes using the preconfigured `regcred` imagePullSecret
