## Why

The official site and LibreChat are reachable only by raw IP today (`http://124.220.7.175`), and LibreChat has no public entry point at all — only an internal k3s NodePort (30830). The domain `finddatatech.cloud` is the intended public face (OPS.md already lists this cutover as pending). Assigning `www.finddatatech.cloud` to the static site and `chat.finddatatech.cloud` to LibreChat — both over HTTPS — gives users a memorable, trustworthy entry point and finally makes the chat UI publicly usable, which is the whole reason LibreChat was deployed.

## What Changes

- **DNS**: A records for `www.finddatatech.cloud` and `chat.finddatatech.cloud` → `124.220.7.175`.
- **nginx**: two TLS server blocks — `www.finddatatech.cloud` → static site (`/opt/fd/web/dist`), `chat.finddatatech.cloud` → reverse proxy to LibreChat at `127.0.0.1:30830`. Existing `/mcp`, `/demo-api`, and IP-on-:80 behavior is preserved.
- **TLS**: Let's Encrypt certificates for both subdomains via `certbot --nginx` (HTTP-01); HTTP→HTTPS 301 redirect enforced.
- **Firewall**: Tencent security group opens inbound TCP 80 + 443 for `0.0.0.0/0`. NodePort 30830 stays closed externally — chat is proxied through nginx :443, not exposed directly.
- **Connectivity test**: verify HTTPS 200 on both subdomains, the site renders, the LibreChat UI loads and can reach LiteLLM/MCP, and the existing `/mcp` endpoint still returns valid MCP responses.
- **Prerequisite gate**: ICP 备案 for `finddatatech.cloud` must be approved before Tencent will serve 80/443 on the mainland box; the change verifies 备案 status before the TLS cutover and is a no-op until then.

## Capabilities

### New Capabilities
<!-- None: subdomain routing and HTTPS are owned by the existing deploy-infra spec. -->

### Modified Capabilities
- `deploy-infra`: the "Domain config with HTTPS swap" requirement changes — the domain becomes `finddatatech.cloud` (was `finddata.cn`) with two subdomains: `www` serving the static site and `chat` proxying to LibreChat (NodePort 30830); each gets Let's Encrypt HTTPS with an HTTP→HTTPS redirect. The nginx reverse-proxy layout requirement gains the `chat` subdomain route.

## Impact

- **DNS / Tencent Cloud**: A records + security-group rules for 80/443; ICP 备案 status gates the TLS cutover.
- **nginx** (`/etc/nginx/sites-available/`): new `www` and `chat` server blocks with certbot-managed TLS and redirect; existing `fd` IP-on-:80 config retained as fallback.
- **LibreChat**: becomes publicly reachable at `https://chat.finddatatech.cloud` instead of only via NodePort 30830; no manifest change, only nginx exposure.
- **Static site**: served at `https://www.finddatatech.cloud` instead of by IP.
- **CI/deploy**: `deploy.yml` rsync+swap unaffected; OPS.md "Domain cutover" section updated to reflect the completed www + chat setup.
- **No change**: MCP `/mcp` auth/rate-limit, demo-proxy, k3s workloads, content/i18n.
