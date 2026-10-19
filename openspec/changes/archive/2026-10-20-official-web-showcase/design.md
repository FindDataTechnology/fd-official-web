## Context

见 `proposal.md` — Why。塑造本设计的现状：

- 官网是 **Astro 静态站**，`package.json` 依赖只有 `astro` 与 `marked`——**没有
  任何图表库**。现有 `/indicators` 的分布图与样例序列图是组件里手写 SVG 的。
- 已有三个"构建期抓取 → 提交快照 → 网络失败保留旧快照"的脚本先例
  （`fetch-indicators.mjs` / `fetch-repos.mjs` / `fetch-calibers.mjs`）：抓不到
  就告警退出 0，**不动已提交的快照**，保证 `astro build` 永不因网络中断。
- 上游端点已就绪且形状稳定：`GET /api/v1/showcase/dashboards` 返回
  `{items:[{id,title,version,published_at,updated_at,panel_count}], total}`；
  详情额外带 `spec`（其中 `raw_option` 面板是完整 echarts 配置）与
  `refreshed_at`。
- 上游产物里面板分两类：`kpi`（`snapshot.rows[0][0]` 单值）与 `raw_option`
  （完整 echarts option，数据已内嵌）。

## Goals / Non-Goals

**Goals:**

- 官网有一页可以直接发给客户：点开就是真图表、真数字，不需要注册。
- 官网**维持纯静态**——不引入浏览器端图表运行时。
- 快照与降级策略与既有三个抓取脚本完全一致（运维心智不增加）。

**Non-Goals:**

- 不做交互图表（缩放/悬浮/十字光标）。官网是橱窗与推广面，交互版本在柏讯
  `#/showcase` 里——两者分工明确，不重复建设。
- 不做实时数据。官网展示的是**发布时刻快照**（与柏讯橱窗同语义），页面上
  如实标注截至时间。
- 不做匿名订阅/收藏（那需要身份，属柏讯登录面）。
- 不改 `indicator-catalog` / `data-modules` 等既有页面。

## Decisions

### D1：构建期把 `raw_option` 预渲染成 SVG，官网不引图表运行时

`fetch-showcase.mjs` 在抓取时用 `echarts` 的 **SSR 模式**
（`renderer: "svg"`, `ssr: true`）把每个 `raw_option` 面板渲染成 SVG 字符串，
写入快照；页面直接内联这段 SVG。

**为什么不运行时渲染**：Astro 站点的价值就在"零 JS 的静态页"。引入 echarts
到浏览器意味着 ~1MB 的运行时包、首屏 JS 执行、以及一套需要维护的客户端初始化
逻辑——为了看几张图不值得。SSR 预渲染让每张图变成几 KB 的内联矢量图，可被
搜索引擎抓取、可被打印、无需 JS。

**为什么不手写 SVG**（照 `/indicators` 的老路）：成品看板的配置包含 time 轴、
log 轴、多系列、markLine 叠加——手写等价 SVG 是数千行且无法复用。用 echarts
SSR 是"用对的工具做对的事"，且**只在构建期跑**。

**代价**：`echarts` 成为 devDependency（不影响浏览器产物，但增加 CI 安装体积）；
SVG 会随快照提交进仓（可接受——现有 `indicators.json` 也是提交的，且这正符合
"离线可构建"的既有纪律）。

### D2：快照保留 SVG 与结构化摘要两份数据

每张图在快照里同时存 `svg`（呈现用）与 `series_count`/`title` 等摘要（列表页
与无障碍文本用）。KPI 面板存 `label`/`value`/`subtitle` 三个纯文本字段。

**为什么不全存原始 option**：官网不需要重新渲染，存原配置只会让快照体积翻倍
且诱导后来者"在浏览器里再渲染一次"（正是 D1 要避免的）。保留摘要字段是为了
列表页与 `alt` 文本——SVG 对读屏软件不友好，文本兜底是必要的。

### D3：快照失败保留旧快照，构建永不中断

完全照搬 `fetch-indicators.mjs` 的策略：网络错/上游 5xx/返回空 → 打印告警 +
`exit 0`，**不覆盖**已提交的 `src/data/showcase.json`。

**为什么**：官网是营销面，它的可用性不该绑在柏讯 API 的可用性上。旧快照哪怕
是上周的，也比构建失败好。页面上的"数据截至"标注让陈旧是**可见的**，而不是
静默的。

### D4：入口位置与柏讯链接的关系

导航放在「数据指标」旁边（`nav.data` / `nav.indicators` / `nav.showcase` 三个
并列），因为它们是同一件事的三个粒度：数据板块（是什么）→ 指标目录（有什么
字段）→ 看板（长什么样）。

详情页底部放一个「在柏讯中交互查看」的外部链接（指向
`https://wire.finddatatech.cloud/#/showcase/{id}`）。

**为什么需要这个链接**：官网是静态截图，客户想缩放/悬浮/看具体数值时的下一站
就是柏讯交互版。这是把官网流量导进产品的自然路径，不额外建东西。

### D5：slug 用上游 id，不用标题

详情页路径为 `/showcase/{id}`（数字 id）。标题会改（甚至中英差异），id 稳定。

**代价**：URL 不可读。缓解——页面 `<title>` 与 og 用真实标题，SEO 靠 title
而非路径；若后续要可读 slug，在上游 spec 里加字段（已有 `showcase_slug`），
属后续优化。

## Risks / Trade-offs

- **SVG 快照体积**（16 张图 × ~20KB ≈ 320KB 的 JSON）→ 拆分：列表页只读
  摘要（不含 SVG），详情页按 slug 懒加载对应的 SVG 片段（Astro 静态生成时
  就是不同 HTML 文件，天然分离）。**不做一个巨大的 showcase.json 全量内联**。

- **`echarts` devDependency 增加 CI 时间** → 只在新脚本里 import，`astro build`
  不打包它；CI 已有 node_modules 安装步骤，增量可接受。

- **上游返回 0 条时官网橱窗空白** → 页面显式渲染"橱窗筹备中"空态（不是空页
  或报错），且保留旧快照策略会让它在有历史数据时不至于变空。

- **中英文标题混排** → 上游 title 是单一语言（当前是中文）。首版如实呈现原文，
  不臆造翻译；页面框架与文案键双语齐备，后续上游提供英文标题时直接受益。

- **SVG 用系统字体渲染，与浏览器端字体略有差异** → 可接受（静态图本来就不保证
  逐像素一致）；在 design 里记录，不作为缺陷。

## Migration Plan

1. 加 `echarts` devDependency 与 `scripts/fetch-showcase.mjs`，**先手工跑一次**
   生成快照并提交（这样即使 CI 抓不到，站点也有内容）。
2. 加页面与导航，`astro build` 验证。
3. 回滚：删除页面与导航项即可（快照文件留着无害）。

## Open Questions

- 详情页是否要显示 `panel_count` 与发布方信息？可用性决策，实施时按版面取值。
- 是否需要 og:image（社交分享卡片）？属运营增强，本变更先用标题+描述。
