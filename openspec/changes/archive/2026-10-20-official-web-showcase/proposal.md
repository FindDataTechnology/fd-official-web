## Why

柏讯已经上线了匿名只读橱窗（`wire-showcase-market`）：平台自营看板经
`/api/v1/showcase/dashboards` 可匿名访问，详情含完整 spec（面板快照 + 完整图表
配置），两条真实成品看板已导入并通过 27/27 面板渲染实测。但**官网还没有任何
入口指向它**——`/indicators` 与 `/data` 只是构建期快照列表，看不见一张图。

对外推广最缺的正是这个：一个能直接发给客户、点开就有真数字和图表的公开页面。
端点已稳定，缺的是官网这一层的消费与呈现。

## What Changes

- 新增官网 **橱窗页** `/showcase`（中英双语），列出平台自营看板并支持进入详情。
- 新增看板 **详情页** `/showcase/{slug}`：渲染完整的 KPI 卡与图表。
- 新增构建期快照脚本 `scripts/fetch-showcase.mjs`：从柏讯橱窗端点抓取，并把
  每张图的 `raw_option` **预渲染为静态 SVG** 内联进快照——官网维持纯静态、
  零运行时图表依赖（与现有 `/indicators` 手写 SVG 的路线一致）。
- 侧栏导航加「看板」入口（`nav.showcase`），与「数据指标」「数据板块」并列。
- 快照失败时**保留已提交的快照**（与 `fetch-indicators.mjs` / `fetch-repos.mjs`
  同策略），`astro build` 永不因网络问题中断。

## Capabilities

### New Capabilities

- `showcase-pages`：官网橱窗的列表页与详情页——快照来源与降级策略、预渲染
  SVG 的呈现契约、双语与导航位置、外部跳转回柏讯的边界。

### Modified Capabilities

（无——现有官网能力的行为不变；本变更是新增页面，不改 `indicator-catalog`、
`product-portal` 等既有能力的要求。）

## Impact

- 新增页面：`src/pages/showcase.astro`、`src/pages/showcase/[slug].astro`
  及对应 `src/pages/zh/…` 两份。
- 新增组件：`src/components/ShowcaseBoard.astro`（列表卡 + 详情图表块）。
- 新增脚本：`scripts/fetch-showcase.mjs` + `src/data/showcase.json`（提交进仓
  的快照，离线兜底）。
- 改动：`src/i18n.ts`（导航与页面文案键）、`src/components/Layout.astro`
  （导航项）、`package.json`（`showcase:fetch` 并纳入 `build` 链）。
- 依赖：**新增 `echarts` 为 devDependency**（仅用于构建期 SVG 预渲染，不进
  浏览器产物）。这是本变更唯一的依赖变化，替代方案见 design。
- 后端：只消费已上线的 `/api/v1/showcase/dashboards[/{id}]`，不改柏讯。
