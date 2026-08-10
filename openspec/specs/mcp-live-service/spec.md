# mcp-live-service

## Purpose

Defines the live `fd-open-data-mcp` backend service exposed at `/mcp` — streamable-http transport, bearer-token gating, rate limiting, server-side data storage, and systemd-managed process lifecycle.

## Requirements

### Requirement: Remote MCP server at /mcp
The deployed `fd-open-data-mcp` SHALL be reachable as a remote MCP server over the streamable-http transport at the `/mcp` path, reverse-proxied by nginx to the local FastMCP process.

#### Scenario: MCP endpoint responds
- **WHEN** a client performs an MCP handshake against `/mcp`
- **THEN** the server responds as a valid streamable-http MCP endpoint (16 tools available)

### Requirement: Bearer-token gating on /mcp
The `/mcp` endpoint SHALL require `Authorization: Bearer <token>`; requests without a valid token SHALL be rejected with HTTP 401.

#### Scenario: Missing token rejected
- **WHEN** a request to `/mcp` has no or an invalid bearer token
- **THEN** the server returns HTTP 401 and no MCP response

#### Scenario: Valid token accepted
- **WHEN** a request to `/mcp` includes a valid bearer token
- **THEN** the MCP request proceeds

### Requirement: Rate limiting
The `/mcp` endpoint SHALL be rate-limited per client IP to prevent quota abuse.

#### Scenario: Limit exceeded is throttled
- **WHEN** a client exceeds the configured rate limit on `/mcp`
- **THEN** excess requests are rejected/throttled at the proxy

### Requirement: Data sources and storage on server
The backend SHALL run on the server with its sqlite database (`daas.db`) and configured datasource credentials, including `EDGAR_IDENTITY` for SEC EDGAR access.

#### Scenario: Data reads resolve from server storage
- **WHEN** a valid `read` request is made
- **THEN** the server resolves it through the ontology against its local database and datasources

### Requirement: Managed as a service
The backend SHALL run under systemd so it starts on boot, restarts on failure, and has a health check path.

#### Scenario: Backend restarts on failure
- **WHEN** the backend process exits unexpectedly
- **THEN** systemd restarts it
