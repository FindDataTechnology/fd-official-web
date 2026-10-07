## ADDED Requirements

### Requirement: Slim LibreChat without RAG components
The system SHALL deploy LibreChat via the official Helm chart with the RAG stack disabled: `vectordb.enabled=false` and `ragApi.enabled=false`. The chart MUST NOT provision pgvector/PostgreSQL or the rag_api service. This is the binding constraint for fitting the 4 GB node.

#### Scenario: No vectordb rag_api pods
- **WHEN** LibreChat is installed
- **THEN** `kubectl get pods -n librechat` shows api, admin-panel, mongodb, meilisearch only - no `vectordb-*` or `rag_api-*` pods

### Requirement: LiteLLM as the sole LLM endpoint
The system SHALL configure LibreChat with a single custom endpoint pointing at LiteLLM (`baseURL` `http://124.223.42.3:30080`, API key from the provided secret). No other LLM provider (OpenAI/Anthropic direct) SHALL be wired in.

#### Scenario: LiteLLM endpoint registered
- **WHEN** LibreChat starts
- **THEN** the custom endpoint `LiteLLM` is available in the model picker with models proxied from LiteLLM

#### Scenario: Chat completes via LiteLLM
- **WHEN** a logged-in user sends a message using the LiteLLM endpoint
- **THEN** a streamed completion is returned (status 200, non-empty tokens)

### Requirement: NodePort exposure
The system SHALL expose the LibreChat app on NodePort 30830 and the admin panel on NodePort 30831. No Ingress SHALL be required to reach the UI.

#### Scenario: App reachable at 30830
- **WHEN** a browser opens `http://124.220.7.175:30830`
- **THEN** the LibreChat login page renders

### Requirement: Resource limits for 4 GB node
The system SHALL set memory limits on LibreChat services that keep total cluster usage under 3.5 Gi: api ≤ 1 Gi, admin ≤ 256 Mi, mongodb ≤ 512 Mi, meilisearch ≤ 512 Mi.

#### Scenario: Total usage under budget
- **WHEN** all LibreChat + MCP pods are Running
- **THEN** `kubectl top nodes` shows the node using < 3.5 Gi with no OOMKilled pods in the last hour

### Requirement: Persistent MongoDB
The system SHALL provision a PVC for MongoDB data (local-path) so chat history survives pod restarts.

#### Scenario: Chat history persists
- **WHEN** the mongodb pod is deleted and rescheduled
- **THEN** previously created conversations are still visible on next login

### Requirement: MCP secrets wired via Kubernetes Secret
LibreChat's MCP bearer token and LiteLLM API key SHALL be sourced from a Kubernetes Secret referenced in Helm values, not hardcoded in plaintext values.

#### Scenario: Secrets not in helm values plaintext
- **WHEN** `helm get values librechat -n librechat` is inspected
- **THEN** the LiteLLM API key and MCP token values are Secret references, not literal strings
