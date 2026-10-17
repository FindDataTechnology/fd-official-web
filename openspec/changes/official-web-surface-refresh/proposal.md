## Why

星研（研究与教育线）与动态（项目动态）是官网的两个长期内容面，但两者的承载方式都停在「内容只有十几条」的假设上：星研落地页把每栏条目全量平铺、没有索引页、标签只能显示不能浏览、没有订阅出口；动态页展示的是构建期从 GitHub 抓来的原始 commit message，页面文案与访客可读性都已失配（数据冻结在 2026-10-08，org 下 13 个公开仓只有 4 个出现在 feed 里）。同时 `/products` 渲染的是壹座落地页而非五线目录，与 `official-web-product-lines` 的「访客打开 `/products` 见五线 tab 与阶梯叙事」不符，且与 `/products/base` 内容重复。

内容量一旦上升（星研每栏到几十上百条、动态成为常态发布渠道），现有结构会同时出现四种退化：落地页无限膨胀、无「看全部」的地址、分类维度不可用、读者无法订阅。因此本次不只重做三个页面，而是同时立起「内容面可增长」的机制：内容类型声明式注册表、每栏索引页与过滤、订阅出口，并把动态的编辑发布整体迁入 CMS，使后续新增内容类型只需一份配置而不是改四处代码。

## What Changes

**A. 星研页重设计（布局与层级）**
- `/research`、`/zh/research` 从「三栏等宽卡片」改为「学院为主仪表 + 编辑内容侧栏」的观测台布局；学院栏承载学习路径（`use` 层用序号编码顺序，`build` 层单独成块并明示前置）。
- 落地页每栏只出精选条目（课程按层全量、内参与研究各取最新 N 条），并给出指向该栏索引页的「查看全部」入口——落地页不再随内容总量膨胀。

**B. 星研内容架构（可增长性）**
- 新增三个栏索引页：`/research/academy`、`/research/briefings`、`/research/articles`（含 `/zh` 对应），只渲染元数据（标题/摘要/日期/标签），正文仍在详情页。
- 索引页支持按既有分类维度即时过滤：内参按 `tags`、研究按 `kind` + `tags`、学院按 `level`；复用站内 `IndicatorsExplorer` 的客户端过滤 + URL 参数模式，不新增分页路由。
- 新增 `/research/feed.xml`（三栏合并的 RSS）；`/briefings.json` 保留。
- 内容类型注册表：把 `fetch-strapi.mjs` 中按 `kind` 硬编码的字段清单、序列化、校验分支收敛为声明式 `COLLECTIONS` 配置；新增内容类型从「改四个文件」降为「加一份配置」。以 `--fixture` 字节级契约作为重构安全网。

**C. 动态转 CMS（一站管理）**
- fd-strapi 新增 `update` 内容类型（`slug`/`date`/`line`/`kind`/双语 `title`+`summary`/`version`/`url`），编辑在 CMS 完成，发布经既有 webhook 触发官网重建。
- `/updates`、`/zh/updates` 改为渲染 CMS 内容：日志栅格（日期左栏）、月份分隔、按产品线过滤条；废弃 `fetch-repos.mjs` 中的 updates 抓取，`src/data/updates.json` 退役。
- 现有 17 条原始 commit 记录整理为若干条双语动态作为种子内容。

**D. 产品总览页（修 spec 偏离）**
- `/products`、`/zh/products` 改为五线总览（阶梯叙事 + 五线卡 + 五线 tab），`/products/base` 保留现有壹座落地页。这是把实现拉回 `official-web-product-lines` 既有要求，不改该 spec。

## Capabilities

### New Capabilities

- `xingyan-content-architecture`: 星研内容面的可增长契约——落地页精选与索引页分离、索引页的分类过滤、订阅出口（RSS/JSON feed）、内容类型注册表与新增类型的接入方式、内容量阈值与升级路径。

### Modified Capabilities

- `updates-feed`: 数据来源由「构建期抓取各仓 CHANGELOG/commit」改为「CMS 编辑发布 + 构建期拉取 + 离线快照兜底」；随之修改聚合页的过滤与降级要求，保留公共可见性与双语纪律。
- `apps-showcase`: `/products` 的目录页职责恢复为五线总览（原要求已如此表述，本次补齐实现并明确 `/products` 与 `/products/base` 的分工与去重）。

## Impact

- **fd-strapi（CMS）**：新增 `update` 内容类型（含双语字段与非本地化维度字段）；需重建镜像并滚动发布；沿用既有 `official-web-deploy` webhook（已监听 publish/unpublish/update/delete）。
- **fd-official-web**：
  - 页面：`src/pages/research.astro`、`src/pages/zh/research.astro` 与新增三个索引页 ×2 语言、`src/pages/research/feed.xml.ts`；`src/pages/updates.astro`、`src/pages/zh/updates.astro` 重做；`src/pages/products.astro`、`src/pages/zh/products.astro` 改为总览页。
  - 组件：`XingyanResearch.astro` 重写；新增索引页与过滤组件；`updates` 相关样式进 `public/global.css`。
  - 管道：`scripts/fetch-strapi.mjs` 注册表重构 + `updates` 集合接入；`scripts/fetch-repos.mjs` 移除 updates 抓取；`src/content.config.ts` 新增 `updates` 集合 schema。
  - 内容：`src/content/updates/`（CMS 拉取产物 + 提交快照）；`src/data/updates.json` 退役。
- **spec**：`updates-feed` 的「CHANGELOG-first sourcing」「Zero site-side maintenance」「Public-only offline fallback」三条按新来源重写；新增 `xingyan-content-architecture`。
- **已知外部问题（本 change 内处理）**：构建日志 `[repos] fetch failed (HTTP 403)` 使 `/repos` 的 README 与仓库数据冻结在 2026-10-08，需一并定位（token 失效或限流）。
- **无 breaking change**：`/briefings.json`、既有详情路由、五线 tab 与产品线 slug 均不变；`/products` 的 URL 不变但内容换位。
