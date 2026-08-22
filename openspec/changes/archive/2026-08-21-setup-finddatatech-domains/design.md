## Context

The FindDataTechnology box (`124.220.7.175`, Tencent mainland) currently serves everything over plain HTTP on the raw IP:

- **Static site** → nginx `server` block on `:80`, root `/opt/fd/web/dist`.
- **LibreChat** → k3s NodePort `30830`, reachable only as `http://124.220.7.175:30830` (and only if the security group opens that port). No friendly URL.
- **`/mcp`** → nginx reverse-proxies to `127.0.0.1:30899` (k3s NodePort for the MCP pod), bearer-gated via `fd-auth.conf` + `limit_req`.
- **`/demo-api`** → `127.0.0.1:8898` (demo-proxy systemd unit).

OPS.md already documents a "Domain cutover (finddatatech.cloud)" as a set of pending user actions (buy domain via a 国内 registrar, file ICP 备案, A record, certbot). The existing `deploy-infra` spec names `finddata.cn` as the domain; this change supersedes that with `finddatatech.cloud` and, crucially, introduces a **second subdomain** (`chat`) that the original spec never modeled — LibreChat didn't exist when that spec was written.

Constraints:

- **ICP 备案**: Tencent will not serve 80/443 to the public internet from a mainland box for an un-备案'd domain. 备案 approval (2–4 weeks) is a hard gate; the TLS cutover is a no-op until 备案 is approved and DNS + security-group are in place.
- **No 30830 exposure**: LibreChat must be reached through nginx `:443`, not by opening NodePort 30830 publicly. Keeps the attack surface at one port and lets nginx own TLS.
- **traefik disabled**: k3s has `disable: [traefik]`, so nginx is the sole L7 entry point — no Ingress needed.
- **WebSockets**: LibreChat uses WebSockets for streaming; the chat proxy block must pass `Upgrade`/`Connection` headers and use long timeouts, or the UI breaks.
- **Single cert for both subdomains**: `certbot --nginx -d www.finddatatech.cloud -d chat.finddatatech.cloud` issues one cert covering both names (SAN).

## Goals / Non-Goals

**Goals:**

- `https://www.finddatatech.cloud` serves the static site (Astro `dist/`), with HTTP→HTTPS 301.
- `https://chat.finddatatech.cloud` reverse-proxies to LibreChat (`127.0.0.1:30830`) with WebSocket support, with HTTP→HTTPS 301.
- One Let's Encrypt cert (HTTP-01 via certbot `--nginx`) covering both subdomains; auto-renewal left to certbot's systemd timer.
- IP-on-`:80` fallback keeps working during/after cutover (no breakage for anyone still hitting the IP).
- `/mcp`, `/demo-api` behavior unchanged.
- Connectivity verified end-to-end after cutover.

**Non-Goals:**

- Buying the domain, filing ICP 备案, or setting DNS A records — these are user/Tencent-console actions, called out as prerequisites, not implemented here.
- Opening NodePort 30830 to the public internet.
- Changing k3s/LibreChat manifests, MCP auth, demo-proxy, or site content/i18n.
- Serving the apex `finddatatech.cloud` (bare) — out of scope; can be a 301 to `www` later if desired. (Apex is not part of this change's cert unless explicitly added.)
- DNS-01 / wildcard certs — HTTP-01 with two explicit `-d` names is simpler and sufficient.

## Decisions

### Decision 1: Two separate `server` blocks (www, chat), not one shared block
**Choice:** Distinct `server_name`-keyed blocks: `www` → `root /opt/fd/web/dist`, `chat` → `proxy_pass http://127.0.0.1:30830`.
**Why over a single block:** the two subdomains have completely different upstreams (static files vs. reverse proxy) and different proxy needs (chat needs WebSocket headers + long timeouts; www needs none). A shared block with `if`-branching on `$host` is fragile and slow. Two blocks are clearer and match how certbot `--nginx` lays out its managed config.
**Alternatives:** (a) one server block with `$host`-conditional logic — rejected (fragile, nginx `if`-is-evil); (b) traefik Ingress / IngressRoute — rejected (traefik is disabled by design; nginx owns :80/:443).

### Decision 2: certbot HTTP-01 via `--nginx`, single cert for both names
**Choice:** `sudo certbot --nginx -d www.finddatatech.cloud -d chat.finddatatech.cloud` — certbot rewrites the nginx blocks to add TLS + the 301 redirect itself, and installs the cert under `/etc/letsencrypt/`.
**Why over DNS-01:** HTTP-01 needs no DNS-provider credentials on the box and works the moment the A records resolve and 80 is reachable. DNS-01 would require planting Tencent DNS API creds on the server for no real benefit at this scale.
**Why one cert over two:** fewer renewals, one ACME order, simpler. SAN covers both names.
**Alternatives:** (a) two separate certs — rejected (redundant); (b) wildcard `*.finddatatech.cloud` via DNS-01 — rejected (needs API creds, overkill).

### Decision 3: Proxy chat through nginx `:443`, keep 30830 closed externally
**Choice:** `chat.finddatatech.cloud` → nginx → `127.0.0.1:30830`; security group does **not** open 30830 to `0.0.0.0/0`.
**Why over opening 30830:** one public TLS port, one place to enforce TLS + future rate-limiting, no direct exposure of the LibreChat container. NodePort stays cluster-internal.
**Alternatives:** open 30830 publicly + let LibreChat serve TLS itself — rejected (doubles cert management, wider surface, LibreChat has no TLS natively).

### Decision 4: WebSocket-aware proxy config for the chat block
**Choice:** the chat `location /` block sets `proxy_http_version 1.1`, `proxy_set_header Upgrade $http_upgrade`, `proxy_set_header Connection "upgrade"`, and `proxy_read_timeout`/`proxy_send_timeout` to `8640`0s (1 day) — LibreChat's SSE/streaming breaks without these.
**Why:** LibreChat streams responses over SSE/WebSocket; nginx's defaults (HTTP/1.0 proxy, 60s read timeout) truncate or fail the stream.
**Alternatives:** none — required for the app to function.

### Decision 5: Keep IP-on-`:80` as a fallback block
**Choice:** the existing `fd` server block (listens on `:80`, `server_name _;` or the IP) stays, serving the static site. Domain blocks listen on `:80` only to bootstrap HTTP-01 + do the 301, and on `:443` for real traffic.
**Why:** zero-downtime cutover — anyone with the IP bookmarked keeps working; if 备案/cert fails, the IP path is unaffected. Also gives certbot's HTTP-01 challenge a working `:80`.
**Alternatives:** collapse IP serving into the www block — rejected (loses the fallback and complicates rollback).

## Risks / Trade-offs

- **[Risk] ICP 备案 not approved / pending** → Tencent silently drops 80/443 inbound for the domain; certbot HTTP-01 challenge fails, TLS never issues. **Mitigation:** the task sequence checks 备案 status (Tencent console) and DNS resolution *before* running certbot; if either is missing, the change halts at the HTTP-nginx stage (blocks + A records wired, no TLS) and the IP fallback keeps serving. Re-run certbot once 备案 clears.
- **[Risk] certbot ACME rate limits** (failed-authorizations: 5/hour, 5 per account per week for identical certs) → repeated misconfigured runs get the account throttled. **Mitigation:** dry-run `certbot --nginx --staging` first on both names; only issue real certs once staging succeeds.
- **[Risk] LibreChat WebSocket breakage behind nginx** → chat UI hangs / drops responses. **Mitigation:** Decision 4's header + timeout config; verify by actually loading chat and sending a message in the connectivity test.
- **[Risk] DNS A record misconfigured** (apex vs www) → cert fails for one name. **Mitigation:** `dig www.finddatatech.cloud` + `dig chat.finddatatech.cloud` must both return `124.220.7.175` before certbot runs.
- **[Trade-off] Apex `finddatatech.cloud` not served here** → users typing the bare domain get nothing (or whatever Tencent's default record points to). Acceptable for now; apex 301→www is a trivial follow-up if desired.
- **[Trade-off] HTTP-01 ties cert issuance to port 80 being publicly reachable** — fine on this box once 备案 + security group are set, but it's why the prerequisite gate exists.

## Migration Plan

Prerequisites (user/Tencent-console, before this change's server work):
1. Domain `finddatatech.cloud` purchased via a 国内 registrar.
2. ICP 备案 filed and **approved** for `finddatatech.cloud`.
3. A records: `www.finddatatech.cloud` and `chat.finddatatech.cloud` → `124.220.7.175`.
4. Security group: inbound TCP 80 + 443 from `0.0.0.0/0`; **30830 stays closed**.

Server-side cutover (this change):
1. Write the two nginx server blocks (`www`, `chat`) under `/etc/nginx/sites-available/`, `ln -s` into `sites-enabled/`. `nginx -t`.
2. `certbot --nginx --staging -d www.finddatatech.cloud -d chat.finddatatech.cloud` (dry run).
3. `certbot --nginx -d www.finddatatech.cloud -d chat.finddatatech.cloud` (real cert; certbot adds TLS + 301).
4. `systemctl reload nginx`.
5. Connectivity test (see tasks): HTTPS 200 on both, site renders, chat UI loads + a message round-trips, `/mcp` still 401-without-token / valid-with-token.
6. Update OPS.md "Domain cutover" section to mark www + chat done; set GitHub org website → `https://www.finddatatech.cloud`.

**Rollback:** remove the two site blocks from `sites-enabled`, `nginx -t && systemctl reload nginx`. IP-on-:80 fallback resumes; LibreChat still reachable on 30830 internally. Cert files can stay in `/etc/letsencrypt/` (harmless) or be removed with `certbot delete`.

## Open Questions

- **Apex domain:** serve `finddatatech.cloud` → 301 `www`, or leave untouched? Default: leave untouched (not in scope).
- **Cloudflare / CDN in front?** If the user later puts Cloudflare in front of `chat`, WebSocket support must be enabled there too and certbot would move to DNS-01 / origin certs. Out of scope for now; noted for the future.
