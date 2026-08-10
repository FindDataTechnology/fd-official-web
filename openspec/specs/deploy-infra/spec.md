# deploy-infra

## Purpose

Defines the deployment infrastructure — nginx reverse-proxy layout, IP-first HTTP serving with a later domain/HTTPS swap to `finddata.cn`, redeploy mechanism, and secret isolation from the static build.

## Requirements

### Requirement: nginx reverse-proxy layout
nginx SHALL serve the static site at `/`, proxy `/mcp` to the FastMCP process, and proxy the `/demo-api` playground route to the backend with token injection.

#### Scenario: All routes wired
- **WHEN** requests hit `/`, `/demo-api`, and `/mcp`
- **THEN** each is routed to the correct upstream (static dir, backend, gated backend)

### Requirement: IP-first serving over HTTP
The site and backend SHALL be live and functional on the Tencent IP over plain HTTP before the domain/HTTPS swap.

#### Scenario: Site reachable by IP
- **WHEN** a visitor loads `http://124.220.7.175`
- **THEN** the site is served

### Requirement: Domain config with HTTPS swap
The domain config value SHALL be `finddata.cn`. When the domain's A record points to the server, a certbot (HTTP-01) step SHALL issue a Let's Encrypt certificate and nginx SHALL be reconfigured to serve HTTPS with HTTP→HTTPS redirect. Until the swap, plain HTTP remains active.

#### Scenario: HTTPS after swap
- **WHEN** the domain resolves and the swap step runs
- **THEN** `https://finddata.cn` serves the site and HTTP redirects to HTTPS

#### Scenario: HTTP remains before swap
- **WHEN** the swap has not run
- **THEN** the site remains available over plain HTTP on the IP

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
