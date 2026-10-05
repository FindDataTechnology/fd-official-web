# 仓库描述改写稿（任务 3.x 交付物）

> **执行记录**：2026-10-06 用户授权后由 ZCode 以 `gh api -X PATCH`（账号 scs001）逐仓落地，
> 12/12 成功；复查 org 全量列表，`[wire]/[facet]/[base]/[constellation]` 前缀 0 残留。
> 官网 `/repos` 网格在下次构建 + 滚动后自动同步（构建期从 GitHub API 拉取）。

- 现状取自 `api.github.com/orgs/FindDataTechnology/repos`（2026-10-06）。
- 原则：去掉 `[wire]`/`[facet]`/`[base]`/`[constellation]` 内部前缀（线归属改由官网
  `/repos` 页面分组表达，见 `official-web-ui-refine`）；语言统一英文（GitHub description
  单字段，官网中英两页同源显示，见提案 R5 决策）；只改写与现状不符的条目。
- **落地由维护者执行**（任务 3.4）：`gh api -X PATCH /repos/FindDataTechnology/<repo> -f description=...`
  或网页逐仓修改。落地后 `/repos` 网格在下次构建自动同步。

| # | 仓库 | 处置 | 新描述 |
|---|------|------|--------|
| 1 | fd-open-data-mcp | 保留 | `Open-data ontology MCP: a semantic concept layer over multi-datasource financial/economic data (akshare, yfinance, edgar, wbgapi, cn-report, cn-gov).` |
| 2 | fd-open-data-protocol | 去前缀 | `The open-data datasource protocol: a manifest contract a datasource exposes to be ingested by fd-open-data-mcp.` |
| 3 | fd-cn-report | 去前缀 | `Chinese financial report MCP server — Shenwan industry AI rule system, outline extraction, AI structured extraction, Elasticsearch store + search.` |
| 4 | platform | 去前缀 | `Local-first AI assistant platform on the DeepSeek Harness (dsh) runtime — streaming agent chat, document RAG, and MCP extensibility across web and desktop.` |
| 5 | fd-official-web | **重写**（现文把官网说成单品「open-data ontology MCP for AI agents」，已是五线门面） | `Official website of FindData Technology (寻数科技) — the public facade of the five product lines: products, open-source repos, docs, and a live MCP demo.` |
| 6 | fd-industry-data | 去前缀 | `Industry data spiders with remote browser support.` |
| 7 | scraw-fd-open-data-mcp | 去前缀 | `Unified concept-driven crawler for fd-open-data-mcp — consumes a CrawlPlan, fetches via the shared adapter registry, warms the read cache.` |
| 8 | law-bench | **重写**（现为纯中文，英文页照发；改双语访客可读的英文，线名保留中文） | `Chinese legal contract drafting & evaluation workbench (寻数·识律 Lex): clause corpus, taxonomy-driven assembly, LLM review, self-healing iteration, prompt comparison — web workbench, public API, MCP server.` |
| 9 | fd-daas-mcp | 去前缀 | `DAAS — Data As a Service: the local one-SQLite-file data platform behind a consolidated MCP server (161 tools) + 18 Claude skills.` |
| 10 | fd-vertical-packs | 去前缀 | `Vertical pack entry skills + cloud agents catalog for the FindData platform market.` |
| 11 | fd-cn-gov | 去前缀 | `Ministry open-information scrapers + datasource registry.` |
| 12 | fd-vaas-skills | 去前缀 | `VAAS — Video Automation & Distribution System: natural-language video creation and multi-platform publishing skill chain.` |

## 站外同类残留（任务 3.3，交维护者）

- `fd-vertical-packs` README 正文引用已退役域名 `craw.finddatatech.cloud`（现为
  `platform.finddatatech.cloud`）——上游仓库改，站点镜像随构建同步。
- `fd-open-data-protocol/pyproject.toml` 出现 `FindDataOfficial`（站点外）。
- npm scope `@finddatatechonology`（少一个 n，包本身是我们发布的，repository 指向
  `FindDataTechnology/platform`）：重新发布正确 scope + 老包退役 = 独立待办；站点文档
  当前与实际发布一致，无需改动。
