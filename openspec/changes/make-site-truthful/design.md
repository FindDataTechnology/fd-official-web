# Design: Make Site Truthful

## Context

The FindData Technology website contains several hardcoded claims that are provably false:

1. **Domain references**: Copy still points to `finddata.cn` (old domain), but the live domain is `www.finddatatech.cloud` (cutover completed 2026-08-21 per OPS.md)
2. **Stats**: Homepage claims "16 MCP tools" (actually 45 deployed) and "8 data sources" (actually 13 production adapters)
3. **Future-tense copy**: README describes the domain cutover as pending when it's already done

The site's content is split between **authored copy** (i18n, flagship, docs, roadmap) and **generated content** (repo grid, updates feed from GitHub API). The truth bugs are all in authored copy.

## Goals / Non-Goals

**Goals:**
- Fix the three provable lies: domain references, tool count, source count
- Update copy to reflect the completed domain cutover (past tense, not future)
- Keep the fix minimal and mechanical — no restructuring, no new features

**Non-Goals:**
- Deriving stats at build time (the counts live in the MCP DB, not the repo)
- Fixing GitHub repo descriptions (`null`, "Scrapy crawler") — out of repo scope
- Rewriting roadmap placeholder copy (taste, not truth)
- Adding SEO/OG tags (separate concern)

## Decisions

**D1: Correct the numbers once (Approach A), don't derive at build**
- Rationale: The stats (45 tools, 13 sources) live in the MCP DB / deployment, not the repo. Deriving them at build would require a new data source the repo doesn't have. Correcting them once is the minimum viable fix; marking them as "known drift surface" is honest about the limitation.
- Trade-off: They'll drift again on the next source expansion or tool addition. Acceptable for now — the alternative (build-time derivation) is a separate project.

**D2: Count "data sources" as production adapters only (13)**
- Rationale: The runner table splits into 13 production (network-backed), 10 stubs (explicitly "placeholder data… not usable"), 2 read-only registries. Counting stubs as "sources" would be a lie the other way. The truthful number is the ones that return real data.
- Trade-off: Undersells total adapter count (25). Acceptable — "sources" should mean sources you can actually query.

**D3: Keep 926 concepts pending DB verification**
- Rationale: This number lives in `daas.db` and is unverifiable from the repo. Dropping it would require a design decision; keeping it without verification is a soft lie. The honest move is to keep it for now but flag it as needing confirmation against the live DB during implementation.
- Trade-off: If the number has drifted, the site will still show a stale stat. Mitigated by flagging it in tasks as a verification step.

**D4: Fix the domain in `astro.config.mjs` (canonical base)**
- Rationale: This is the source of truth for canonical URLs, sitemaps, and SEO tags. If it's wrong, every URL the site emits is wrong. The fix is mechanical: `finddata.cn` → `www.finddatatech.cloud`.
- Trade-off: None — this is a plain bug.

**D5: Update README.md (repo root) to past tense**
- Rationale: The repo-root README is mirrored into the gitignored `src/content/repos/fd-official-web.md` at build time. Fixing the generated copy won't stick; the fix must land in the upstream README.
- Trade-off: None — the cutover is done, the copy should say so.

## Risks / Trade-offs

**R1: Stats will drift again**
- Likelihood: High — every source expansion or tool addition invalidates the hardcoded numbers
- Mitigation: Flag this as a known drift surface in tasks. A future change could derive stats at build time or pull from a single `stats.json` file.
- Residual risk: Low — the site will show stale numbers, not broken ones.

**R2: 926 concepts may be stale**
- Likelihood: Medium — the number was set when the flagship page was written and hasn't been verified since
- Mitigation: Task includes a verification step against the live DB. If verification fails, the number should be dropped or updated.
- Residual risk: Low — if the number is wrong, it's a soft lie, not a broken feature.

**R3: Domain fix may break IP fallback**
- Likelihood: Very low — the domain is already live, the IP fallback is preserved in nginx
- Mitigation: The fix is in `astro.config.mjs` (canonical URLs), not in nginx config. The IP fallback is unaffected.
- Residual risk: None — the domain is the canonical base, the IP is a fallback.

**R4: README update may not propagate immediately**
- Likelihood: Low — the README is mirrored at build time, so the next build will pick up the fix
- Mitigation: The fix is in the repo-root README, which is the source of truth. The next `npm run build` will regenerate the mirrored copy.
- Residual risk: None — the fix is in the right place.
