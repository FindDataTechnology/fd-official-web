## Why

官网现在把若干与现状不符的说法直接发给了访客：旗舰页写着「15 个指标概念 / 45 个
MCP 工具」，而同一次构建的首页统计已经是 452 个概念 / 53 个工具——同一个站点自相
矛盾；开放数据 MCP 的产品页指向一个已经不存在的 GitHub 组织（`FindDataOfficial`，
API 返回 404）；识律线的「在线体验」按钮指着一个打不开的 IP 地址；合同示范文本页仍
在描述已退役的 Scrapyd 采集栈。这些是可核对的失实，不是措辞问题——`product-portal`
早就写了「不可验证的不许发布」，但没有任何机制拦住它。

先做这件事，是因为 `official-web-ui-refine` 要动同一批文件：不先把内容打真，精修
会把旧说法一起带进新版。

## What Changes

逐条修正对外失实内容（涉及 `src/content/apps/{en,zh}/`、`src/content/flagship/`、
`src/i18n.ts`）：

- **旗舰页规模数字**（`flagship/{en,zh}.md`）：删去手写的「15 个指标概念 / 45 个
  MCP 工具」，改为与首页同源的构建期指标导出，双语一致。
- **GitHub 组织名**（`apps/{en,zh}/open-data-mcp.md`）：`FindDataOfficial` →
  `FindDataTechnology`（前者已 404）。
- **识律线入口**（`apps/{en,zh}/law-bench.md`）：`demoUrl` 由不可达的
  `http://23.144.68.246:30830` 改为经核验可达的入口；不可达则移除入口 CTA。
- **采集栈描述**（`apps/{en,zh}/contract-templates.md`）：Scrapyd 采集栈 → 现行
  k8s/GitOps 采集运行时。
- **npm 包名**（`apps/{en,zh}/facet-market.md`）：文档不再书写与实际发布不一致的
  scope；重新发布正确 scope 属独立待办，不在此变更内。
- **仓库描述改写稿**：交付 12 个公开仓的中英描述文本（去掉 `[wire]`/`[facet]` 一类
  内部前缀），**GitHub 侧落地由维护者执行**，本变更只交付文稿与核对清单。

新增一条内容完整性契约与配套检查：

- 新增能力 `content-integrity`：规模数字必须来自构建期导出；对外文案不得引用已退役
  的组织、域名与基础设施；入口链接必须可达。
- 新增内容检查脚本（退役标识清单：`FindDataOfficial`、`craw.finddatatech.cloud`、
  `Scrapyd`），可在本地与 CI 运行，命中即失败并列出文件与标识。

路线图与首页注脚：

- `roadmap/chantui.md`：蝉蜕阶段的交付物清单与周期重写为已发生的事实（现在列的四条
  都在 09-30–10-01 上线了，却仍以未来计划呈现）。
- `product-portal` 的研究与业务注脚：改为「只发可验证内容」——当前工作区查不到两篇
  论文的标题或链接，该条降级到可验证状态（保留可验证的「小模型微调服务」）。

## Capabilities

### New Capabilities

- `content-integrity`: 官网对外内容的真实性契约——数字可溯源、系统名称与现行实现一致、入口链接可达，并配有可在本地/CI 运行的检查。

### Modified Capabilities

- `flagship-page`: 旗舰页的规模数字改为来自构建期指标导出，不得手写。
- `roadmap`: 阶段交付物只能陈述已发生或已明确排期的事实；已上线的条目不得继续以未来计划呈现。
- `product-portal`: 研究与业务注脚从「必须列出两篇论文」改为「只发布可验证内容」。

## Impact

- 站点内容：`src/content/apps/{en,zh}/{open-data-mcp,law-bench,contract-templates,facet-market}.md`、
  `src/content/flagship/{en,zh}.md`、`src/content/roadmap/chantui.md`
- 页面代码：`src/pages/fd-open-data-mcp.astro`、`src/pages/zh/fd-open-data-mcp.astro`
  （旗舰页数字接入构建期导出）；`src/i18n.ts`（注脚文案）
- 新增：内容检查脚本与退役标识清单（`scripts/`），接入本地检查
- 对外副作用：GitHub 12 个公开仓的 description 与 `fd-vertical-packs` README 里的
  退役域名——**由维护者执行**，本变更交付文本与清单
- 站点之外发现同类残留一处（`fd-open-data-protocol/pyproject.toml` 的
  `FindDataOfficial`），记入后续待办，不在本变更范围
- 不含：任何视觉与结构改动（归 `official-web-ui-refine`）