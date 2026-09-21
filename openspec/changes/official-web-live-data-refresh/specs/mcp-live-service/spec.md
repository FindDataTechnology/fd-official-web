## MODIFIED Requirements

### Requirement: Remote MCP server at /mcp
The deployed `fd-open-data-mcp` SHALL be reachable as a remote MCP server over the streamable-http transport at the `/mcp` path, reverse-proxied by nginx to the k3s `fd-open-data-mcp` Deployment. The deployed tool count MUST NOT be hardcoded in specs, docs, or site copy; it SHALL be discoverable by clients via the MCP `tools/list` method.

#### Scenario: MCP endpoint responds
- **WHEN** a client performs an MCP handshake against `/mcp`
- **THEN** the server responds as a valid streamable-http MCP endpoint

#### Scenario: Tool surface is discoverable
- **WHEN** a client calls `tools/list` against `/mcp` (paginating through any `nextCursor`)
- **THEN** the complete tool list is returned, and its count is the authoritative deployed tool count for any downstream display

### Requirement: Data sources and storage on server
The backend SHALL run on the server against the canonical metadata database (the `fd_open_data` Postgres instance on the canonical DB host), addressed via `FD_OPEN_DATA_MCP_DATABASE_URL`, together with configured datasource credentials including `EDGAR_IDENTITY` for SEC EDGAR access. The on-box SQLite `daas.db` SHALL NOT be used as the production store.

#### Scenario: Data reads resolve from server storage
- **WHEN** a valid `read` request is made
- **THEN** the server resolves it through the ontology against the canonical database and datasources

#### Scenario: Catalog counts are non-empty
- **WHEN** `list_concepts`, `coverage_report`, or `data_stats` is called
- **THEN** the call succeeds without a schema error and returns the canonical catalog's non-zero counts (concepts, entities, observations)

## ADDED Requirements

### Requirement: Schema gate before serving
The deployment SHALL start its schema-migration stage before the server container accepts traffic; the server MUST NOT serve catalog queries against a database whose schema is behind the code's expectation. A failed migration SHALL prevent the new version from serving (the previous version keeps serving).

#### Scenario: Drifted database blocks rollout
- **WHEN** the deployed code expects a column or table the database lacks
- **THEN** the migration stage fails, the new pod never becomes ready, and the previously serving version continues
