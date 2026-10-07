## ADDED Requirements

### Requirement: MCP registered as a LibreChat mcpServer
The system SHALL register the containerized `fd-open-data-mcp` in LibreChat's `mcpServers` configuration using the `streamable-http` transport, pointing at the in-cluster Service `http://mcp.mcp.svc.cluster.local:8899` (so traffic stays inside the cluster), with a `Bearer` Authorization header sourced from a Kubernetes Secret.

#### Scenario: MCP tools discoverable in UI
- **WHEN** a logged-in user opens the "Tools" / MCP section in LibreChat
- **THEN** the `fd-open-data-mcp` tools are listed and selectable

#### Scenario: Traffic stays in-cluster
- **WHEN** LibreChat calls the MCP server
- **THEN** the request resolves via the cluster DNS `mcp.mcp.svc.cluster.local` and does not hairpin through the NodePort or host nginx

### Requirement: Bearer auth between LibreChat and MCP
The integration SHALL send `Authorization: Bearer <MCP_TOKEN>` on every MCP request, where `<MCP_TOKEN>` is the same value mounted into the MCP pod's Secret. LibreChat SHALL fail closed (no anonymous access) if the token is missing or wrong.

#### Scenario: Wrong token rejected
- **WHEN** LibreChat is configured with a stale/incorrect MCP token
- **THEN** MCP tool calls return 401/403 and the UI surfaces an auth error for those tools

#### Scenario: Matching token works
- **WHEN** LibreChat's MCP token equals the MCP pod's `MCP_TOKEN`
- **THEN** invoking an MCP tool from chat returns a successful result

### Requirement: Configurable timeout
The integration SHALL set a request timeout (default 30000 ms) on MCP calls so a hung MCP request does not stall the chat stream indefinitely.

#### Scenario: Hung MCP call times out
- **WHEN** an MCP tool call exceeds the configured timeout
- **THEN** LibreChat aborts the call and shows a timeout error rather than hanging the session

### Requirement: Single source of truth for MCP token
The MCP token SHALL be defined once in a Kubernetes Secret (e.g. `mcp-secrets`) in a namespace readable by both the MCP Deployment (namespace `mcp`) and the LibreChat chart (namespace `librechat`), or duplicated via a shared Secret, so the two never drift.

#### Scenario: Token rotation updates both sides
- **WHEN** the `MCP_TOKEN` Secret value is updated
- **THEN** after the pods pick up the new value, both the MCP server and LibreChat use the identical token (no drift)
