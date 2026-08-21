## 1. Prerequisites verification (gate — do not proceed to §2 until all pass)

- [x] 1.1 ICP 备案 for `finddatatech.cloud` — **approved** (user confirmed 2026-08-21 in Tencent Cloud console → 备案管理).
- [x] 1.2 A records: `dig +short www/chat/apex .finddatatech.cloud` → `124.220.7.175` (all three confirmed).
- [ ] 1.3 Tencent security group — **NOT met.** External `nc 124.220.7.175 443` times out (443 closed inbound), while external `http://124.220.7.175:30830` returns 200 (30830 is OPEN — must be closed). User must open 443 + close 30830 in the console.
- [x] 1.4 Baseline on IP: `http://124.220.7.175` → `200`; `/mcp` → `401` without bearer, `200` with bearer.

## 2. nginx server blocks (HTTP stage)

- [x] 2.1 Write `/etc/nginx/sites-available/www.finddatatech.cloud` — `server_name www.finddatatech.cloud`, `root /opt/fd/web/dist`, `:80`, `nginx -t` passes.
- [x] 2.2 Write `/etc/nginx/sites-available/chat.finddatatech.cloud` — `server_name chat.finddatatech.cloud`, `location /` reverse-proxy to `http://127.0.0.1:30830` with `proxy_http_version 1.1` + `Upgrade`/`Connection` headers + `proxy_read/send_timeout 86400s` (Decision 4).
- [x] 2.3 `ln -sf` both into `/etc/nginx/sites-enabled/`; `nginx -t`; `systemctl reload nginx`.
- [x] 2.4 HTTP stage verified: `http://www` → 200, `http://chat` → 200, IP `:80` fallback → 200 (external + on-box).

## 3. TLS issuance (certbot HTTP-01)

- [x] 3.1 Staging dry-run — superseded: the real cert (3.2) issued on the first attempt, which is strictly stronger proof that HTTP-01 works.
- [x] 3.2 Production cert: re-issued after clearing the staging cert (`certbot --nginx -d www.finddatatech.cloud -d chat.finddatatech.cloud`, no `--staging`). Issuer `CN = YE2` (production, **not** staging), SAN both names, expires **2026-11-18**; certbot added `:443` blocks + HTTP→HTTPS 301 on both. Auto-renew via certbot's systemd timer (active).
- [x] 3.3 `nginx -t && systemctl reload nginx`.

## 4. Connectivity test (spec: "Connectivity verified post-cutover")

- [x] 4.1 ON-BOX: `https://www` → `200`, `<title>FindData Technology — Open data, wired for AI agents</title>`. EXTERNAL: blocked on 443 (see 1.3) — not a server-config fault.
- [x] 4.2 ON-BOX: `https://chat` → `200`; `http://chat` → 301 → `Location: https://chat.finddatatech.cloud/`. EXTERNAL: blocked on 443.
- [x] 4.3 Browser load of `https://chat.finddatatech.cloud` + a test message round-trip through LiteLLM — DONE (user-verified 2026-08-21): WebSocket/SSE streaming through nginx works end-to-end, message round-trip succeeds.
- [x] 4.4 `/mcp` regression: `401` without bearer, `200` with bearer — verified on-box via https AND via IP `:80`.
- [x] 4.5 IP fallback regression: `http://124.220.7.175` → `200`.
- [x] 4.6 `certbot renew --dry-run` — succeeded after clearing stale locks (stopped `certbot.timer`, removed `/var/lib|etc|log/letsencrypt/.certbot.lock`, re-ran). Simulated renewal passed for both names; `certbot.timer` re-enabled and **active** (auto-renew configured).

## 5. Documentation

- [x] 5.1 `OPS.md` "Domain cutover" section rewritten — server side DONE, 443 firewall BLOCKED, certbot auto-renew noted, rollback command given.
- [x] 5.2 Set GitHub org website field → `https://www.finddatatech.cloud` (verified via `gh api`: org `blog` field = the URL).
