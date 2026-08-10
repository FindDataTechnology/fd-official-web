# Proposal: add-flagship-roadmap-updates

## Why

The site currently presents all org repos as equals and has no narrative: visitors can't tell what the flagship product is, where the project is heading, or what changed recently. Updates require a manual local build + rsync with no automation. The org has a defined three-phase plan (蝉蜕 / 卧龙 / 九天) that deserves a first-class public home, and the upcoming domain (finddatatech.cloud on Tencent Cloud) needs a deployment pipeline that doesn't depend on someone remembering to run commands.

## What Changes

- **Flagship product page**: curated bilingual page for `fd-open-data-mcp` (`/fd-open-data-mcp`, `/zh/fd-open-data-mcp`) — hand-written intro (why it exists, architecture, 926 concepts, 16 tools), linking to the auto-rendered README page for full detail. Repo grid keeps README passthrough for all other projects.
- **Roadmap module**: `/roadmap` (+ zh) rendering three phases — 蝉蜕 Chántuì (2–3 months, iterative → usable state), 卧龙 Wòlóng (3 months, content/data richness), 九天 Jiǔtiān (1 year, internationalization) — driven by a `roadmap` content collection (one md per phase, frontmatter: status/period/goal) so progress updates are frontmatter edits. Compact 3-cell strip on the homepage.
- **Updates feed**: `/updates` (+ zh) — build-time aggregation: parse each repo's `CHANGELOG.md` (Keep-a-Changelog) when present, fall back to recent commits otherwise; merged into a reverse-chronological feed. Long-term maintenance = maintain CHANGELOGs in each repo, site follows automatically.
- **Automated deployment**: GitHub Actions workflow (on push + 6h schedule) builds (fetch-repos → astro build) and rsyncs `dist/` to the Tencent server over SSH. Plus a manual `/fd-site-deploy` skill for instant local-triggered deploys.
- Nav gains Roadmap + Updates entries; homepage gains roadmap strip.

## Capabilities

### New Capabilities
- `flagship-page`: curated bilingual flagship product page with hand-written narrative content, separate from auto-generated README pages.
- `roadmap`: content-collection-driven three-phase development plan (蝉蜕/卧龙/九天) with status tracking, full page + homepage strip, bilingual.
- `updates-feed`: build-time aggregation of per-repo CHANGELOG.md (commits fallback) into a reverse-chronological bilingual updates page.
- `auto-deploy`: GitHub Actions build+rsync pipeline (push + scheduled) and a manual deploy skill; server needs no build tooling.

### Modified Capabilities
<!-- None: site-shell/repo-showcase/deploy-infra deltas avoided because add-org-website
     is not yet archived; nav additions are specified inside the new capabilities. -->

## Impact

- **Code**: new pages (`/fd-open-data-mcp`, `/roadmap`, `/updates` × en/zh), new content collections (`roadmap`, curated flagship content), `scripts/fetch-repos.mjs` extended to pull CHANGELOGs/commits, new `.github/workflows/deploy.yml`, new skill file.
- **Infra**: deploy SSH key added to repo secrets; server needs no new software (static rsync only).
- **Ops**: domain plan — finddatatech.cloud via Tencent Cloud registrar (ICP 备案 required before domain cutover, 2–4 weeks, user action); security-group port 80 still pending (user action).
- **No breaking changes** to existing routes or the demo/MCP backend.
