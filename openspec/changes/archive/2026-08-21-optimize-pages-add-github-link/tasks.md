## 1. Docs card preview (d.body → description)

- [x] 1.1 `src/content.config.ts` — add `description: z.string().optional()` to the `docs` schema (after `order`)
- [x] 1.2 `src/content/docs/en/quickstart.md` — add `description:` frontmatter (lift the lede: "Install and run the open-data ontology MCP — ask for data as concepts and entities, get ranked, failover, refreshed answers.")
- [x] 1.3 `src/content/docs/en/protocol.md` — add `description:` ("`fd-open-data-protocol` is the manifest contract a datasource must expose to be ingested by `fd-open-data-mcp`.")
- [x] 1.4 `src/content/docs/en/datasource.md` — add `description:` ("Expose any data source as a first-class provider in the ontology.")
- [x] 1.5 `src/content/docs/zh/quickstart.md` — add `description:` (Chinese lede: "安装并运行开放数据本体 MCP——以概念与实体的方式查询数据，获得按质量排序、故障转移并定时刷新的答案。")
- [x] 1.6 `src/content/docs/zh/protocol.md` — add `description:` (Chinese lede — lift the first line of the ZH protocol doc)
- [x] 1.7 `src/content/docs/zh/datasource.md` — add `description:` (Chinese lede — lift the first line of the ZH datasource doc)
- [x] 1.8 `src/pages/docs/index.astro:20` — `<span>{d.body}</span>` → `<span>{d.data.description}</span>`
- [x] 1.9 `src/pages/zh/docs/index.astro:20` — same

## 2. Repo card null-description fallback

- [x] 2.1 `src/i18n.ts` — add `repos.noDesc` string (EN "No description available" / ZH "暂无描述")
- [x] 2.2 `src/components/RepoCard.astro` — render `repo.description?.trim() || t(locale, 'repos.noDesc')` instead of `repo.description ?? ''`

## 3. GitHub link + icon in shell

- [x] 3.1 `src/components/Layout.astro` — add an inline GitHub octocat SVG in the footer, wrapped in `<a href="https://github.com/FindDataTechnology" aria-label="GitHub">`. SVG uses `fill="currentColor"`, `aria-hidden="true"`, sized to footer metrics.
- [x] 3.2 `src/components/Layout.astro` — add a "view source" link (icon + text) in the footer pointing to `https://github.com/FindDataTechnology/fd-official-web`, alongside the existing org copyright link
- [x] 3.3 `src/i18n.ts` — add `footer.viewSource` string (EN "View source" / ZH "查看源码")
- [x] 3.4 `public/global.css` — add minimal styles: footer GitHub icon vertical alignment + hover; view-source link alignment with existing footer row

## 4. ICP footer line

- [x] 4.1 `src/components/Layout.astro` — keep/confirm the `粤ICP备2026118740号-1` link to `https://beian.miit.gov.cn/` in the footer (currently an uncommitted local edit; this change ships it)

## 5. Build + verify

- [x] 5.1 `npm run build` — confirm it fetches repos, builds `dist/`, no errors
- [x] 5.2 Grep built `dist/docs/index.html` + `dist/zh/docs/index.html` — confirm cards show the `description` text, not `# Quickstart` / raw markdown H1
- [x] 5.3 Spot-check built `dist/repos/index.html` + `dist/zh/repos/index.html` — `fd-official-web` card shows the fallback string, not a blank line
- [x] 5.4 Spot-check built `dist/index.html` — footer has the GitHub icon linking to the org and a view-source link to `fd-official-web`; ICP line present
- [x] 5.5 Deploy (CI auto-deploys on push to `main`) + browser-verify `/docs`, `/repos`, and the footer GitHub links — PR #2 merged, CI run 32498985243 success, live HTML grep-verified

## 6. Out-of-repo follow-up (not in this change)

- [ ] 6.1 GitHub org: set `fd-official-web` repo description (currently `null`) and fix `scraw-fd-open-data-mcp` description — out-of-repo, same tail as `make-site-truthful` 6.1
