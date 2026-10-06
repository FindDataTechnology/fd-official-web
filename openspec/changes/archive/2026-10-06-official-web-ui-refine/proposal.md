## Why

官网现在有两类问题都卡在呈现层，规格锁死的路由与 slug 不用动：

- **hero 不合规**：首页说的是柏讯线单一产品的价值主张，而 `site-shell` 的
  「Consistent branding」与 `product-portal` 的「Company portal positioning hero」
  都要求 hero 陈述公司生态定位、且不得以单条产品线的卖点开场。
- **看得见的缺陷**：`/products` 默认落在内容最少的壹座线，首屏只有一张孤卡；
  `/repos` 卡片把描述与元信息挤在同一行（DOM 复核：描述与元信息均为 `inline`，底边相差
  5px，线上渲染成 `…cn-report, cn-gov).Python · 2026-10-04`）；手机端导航是横向滚动条，
  标签被截断（390px 下「数据指标」只剩「数」）。
- **没有主次**：两个强调色（薄荷 `#38e1c8` / 蓝紫 `#6aa6ff`）同时承担品牌，区块标题是
  蓝色、数字与按钮是薄荷；全站只有一种材质（1px 边框 + 12px 圆角面板），没有产品视觉，
  也没有任何 OG 分享图——链接贴到哪里都是空卡。

## What Changes

**批次一 · token 层与缺陷（全站立刻受益，风险低）**

- 色彩定主次：薄荷为唯一品牌强调（CTA、数字、当前项），蓝紫降为内文链接色；新增两个
  层级 token（raised surface / strong border）；背景允许 ±5% 内微调，品牌五色不换。
- 六级字号阶梯（display / h1 / h2 / body / label / mono）；中文标题行高 1.15 → 1.3。
- 引入拉丁显示字体（仅标题与 kicker 的拉丁字符，自托管 woff2 ≤ 80KB），中文继续系统字体。
- 材质分级：feature 卡 / 标准卡 / 行式列表三级，启用 DESIGN.md 里已定义却没人用的阴影词汇。
- 修 `/repos` 卡片排版：名称、描述、元信息各占一行。
- 修 `/products` 呈现：一条线的应用很少时不挤进窄格，避免「整页一张孤卡」。
- 手机端导航不再横向滚动截断，当前页高亮。
- header / footer 全站共享部分同步。

**批次二 · 门面与身份**

- 首页 hero 改为公司定位 + 五线阶梯主视觉；统计降为一行次要信息。
- 五个线标：阶梯字（壹/识/柏/谦/萬）印章母题，官网统一墨色；用于首页线卡与线页。
- `/repos` 按产品线分组（本地线归属表；缺归属的仓进「其他」而非被丢弃）。
- 中英 OG 分享图各一张（static 1200×630），每页声明 `og:image`。

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `site-shell`: 新增「导航分组与当前项」「零 JS 与无障碍底线」「社交分享图」三条要求；
  在「Consistent branding」中固化 hero 的公司定位契约（承接 `product-portal` 的重复要求）。
- `repo-showcase`: 卡片内容分行呈现；新增按产品线分组的要求。
- `apps-showcase`: 四线词汇更新为五线；薄线的目录呈现；启动内容要求与现行域名字实相符。
- `product-portal`: 四线卡墙更新为五线并携带线标；移除重复的 hero 要求（迁移到 `site-shell`）。

## Impact

- 全站样式 token 层与共享组件：`public/global.css`、`src/components/Layout.astro`、
  `RepoCard.astro`、`ProductCatalog.astro`
- 页面：`src/pages/index.astro`、`src/pages/zh/index.astro`、`src/pages/repos*.astro`、
  `src/pages/products*.astro`
- 新增资源：五个线标（inline SVG）、中英 OG 图（PNG）、拉丁显示字体（自托管 woff2）
- 文档：站点仓新增 `CONTEXT.md`（站点域词汇）；`DESIGN.md` 由 impeccable 的 `document`
  流程生成，不在本变更手写
- 不含：文案真值修正（归 `official-web-content-truth`）；路由与 slug 不变；不新增页面
- 依赖：`official-web-content-truth` 先归档（同一批文件，避免冲突）