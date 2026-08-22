# deploy-infra

## Purpose

Defines the deployment infrastructure — nginx reverse-proxy layout, IP-first HTTP serving with a later domain/HTTPS swap to `finddata.cn`, redeploy mechanism, and secret isolation from the static build.
## Requirements
### Requirement: nginx reverse-proxy layout
nginx SHALL serve the static site at `/` for `www.finddatatech.cloud`, reverse-proxy `chat.finddatatech.cloud` to the LibreChat NodePort (`127.0.0.1:30830`) with WebSocket passthrough, proxy `/mcp` to the MCP process, and proxy the `/demo-api` playground route to the backend with token injection.

#### Scenario: All routes wired
- **WHEN** requests hit `https://www.finddatatech.cloud/`, `https://chat.finddatatech.cloud/`, `/demo-api`, and `/mcp`
- **THEN** each is routed to the correct upstream (static dir, LibreChat NodePort, backend, gated MCP)

#### Scenario: Chat subdomain proxies with WebSockets
- **WHEN** the LibreChat UI opens a streaming/WebSocket connection via `https://chat.finddatatech.cloud`
- **THEN** nginx proxies it to `127.0.0.1:30830` with `Upgrade`/`Connection` headers forwarded and a long read timeout so the stream is not truncated

#### Scenario: NodePort 30830 not exposed publicly
- **WHEN** an external client attempts `http://124.220.7.175:30830`
- **THEN** the Tencent security group blocks it (30830 is cluster-internal only; chat is reached through nginx :443)

### Requirement: IP-first serving over HTTP
The site and backend SHALL be live and functional on the Tencent IP over plain HTTP before the domain/HTTPS swap.

#### Scenario: Site reachable by IP
- **WHEN** a visitor loads `http://124.220.7.175`
- **THEN** the site is served

### Requirement: Domain config with HTTPS swap
The domain config value SHALL be `finddatatech.cloud`, served across two subdomains: `www.finddatatech.cloud` for the static site and `chat.finddatatech.cloud` for LibreChat. When each subdomain's A record points to the server **and** ICP 备案 for `finddatatech.cloud` is approved, a certbot (HTTP-01) step SHALL issue a single Let's Encrypt certificate covering both subdomains and nginx SHALL serve HTTPS with an HTTP→HTTPS 301 redirect on both. Until the swap, plain HTTP on the IP remains active.

#### Scenario: HTTPS after swap
- **WHEN** both A records resolve to `124.220.7.175`, 备案 is approved, and the swap step runs
- **THEN** `https://www.finddatatech.cloud` serves the site and `https://chat.finddatatech.cloud` serves LibreChat, and HTTP requests to either redirect to HTTPS

#### Scenario: HTTP remains before swap
- **WHEN** the swap has not run (DNS, 备案, or security-group prerequisites unmet)
- **THEN** the site remains available over plain HTTP on the IP `http://124.220.7.175`

#### Scenario: ICP 备案 gates the cutover
- **WHEN** 备案 for `finddatatech.cloud` is not approved
- **THEN** certbot HTTP-01 does not succeed and the change halts at the HTTP nginx stage without breaking the IP fallback

#### Scenario: Connectivity verified post-cutover
- **WHEN** the cutover completes
- **THEN** both subdomains return HTTPS 200, the site renders, the chat UI loads and can reach LiteLLM/MCP, and `/mcp` still returns valid MCP responses (401 without bearer, success with)

### Requirement: Redeploy mechanism
The site SHALL be redeployable by copying the static build to `/opt/fd/web` and reloading nginx; the backend SHALL be managed via its systemd unit.

#### Scenario: Site redeploy
- **WHEN** a new static build is copied to `/opt/fd/web`
- **THEN** nginx reload serves the new content

### Requirement: No secrets in the static build
Secrets (`MCP_TOKEN`, `EDGAR_IDENTITY`, database URL) SHALL live only in a server env file (`/opt/fd/web/.env`) and MUST NOT appear in the Astro build output.

#### Scenario: Build contains no secrets
- **WHEN** the static build is inspected
- **THEN** it contains no token, identity, or credential values

