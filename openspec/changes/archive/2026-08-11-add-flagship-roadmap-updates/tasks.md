# Tasks: add-flagship-roadmap-updates

## 1. Deploy pipeline (auto-deploy)

- [x] 1.1 Generate dedicated ed25519 deploy keypair (`~/.ssh/fd_deploy`); append pubkey to `ubuntu@124.220.7.175:~/.ssh/authorized_keys` with marker comment; add local `~/.ssh/config` Host entry `fd-deploy`
- [x] 1.2 Add GitHub repo secrets: `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER` (via `gh secret set`)
- [x] 1.3 Create `.github/workflows/deploy.yml`: on push to main + schedule (twice daily, off-:00/:30) + workflow_dispatch; steps = checkout, setup-node, `node scripts/fetch-repos.mjs`, `npm run build`, rsync `dist/` → temp dir → atomic swap into `/opt/fd/web/dist`
- [x] 1.4 Verify pipeline: push a trivial commit, confirm workflow green and live site updated

## 2. Manual deploy skill

- [x] 2.1 Create `/fd-site-deploy` skill wrapping local fetch + build + rsync (same atomic swap as CI)

## 3. Updates feed (updates-feed)

- [x] 3.1 Extend `scripts/fetch-repos.mjs`: fetch each repo's `CHANGELOG.md`; parse Keep-a-Changelog `## [version] - date` sections (surface `[Unreleased]` as "upcoming"); fallback to `commits?per_page=5` when absent; merge sorted desc, cap 50; write `src/data/updates.json`; keep last-good cache on failure
- [x] 3.2 Create `/updates` + `/zh/updates` pages rendering the feed (repo, date, version/commit, summary)
- [x] 3.3 Add i18n strings + nav entries (en/zh) for Updates

## 4. Roadmap module (roadmap)

- [x] 4.1 Add `roadmap` content collection (one md per phase; frontmatter: name, pinyin, period, goal_en, goal_zh, status, order); author 蝉蜕/卧龙/九天 entries verbatim from the plan
- [x] 4.2 Create `/roadmap` + `/zh/roadmap` pages: three phase cards in order with status indicators (in-progress / planned)
- [x] 4.3 Add homepage 3-cell roadmap strip linking to `/roadmap`; i18n strings + nav entries

## 5. Flagship page (flagship-page)

- [x] 5.1 Author curated bilingual flagship content (why it exists, architecture, 926 concepts / 16 tools / data sources) in content collection
- [x] 5.2 Create `/fd-open-data-mcp` + `/zh/fd-open-data-mcp` pages rendering curated copy + link to README passthrough page
- [x] 5.3 Wire entry points: homepage about/CTA link; `/repos` grid flagship card → curated page; i18n strings

## 6. Verify & ship

- [x] 6.1 Local build passes (all new routes render, en+zh); spot-check pages
- [x] 6.2 Deploy via new workflow; verify `/roadmap`, `/updates`, `/fd-open-data-mcp` live on 124.220.7.175
- [x] 6.3 Housekeeping: mark completed tasks in `add-org-website/tasks.md` and archive it (specs move to `openspec/specs/`)
