## Why

一级导航的六项里有三项是单一产品/单线内容：文档只是柏讯旗舰 fd-open-data-mcp 的 3 篇使用文档，数据板块是柏讯线的数据资产目录，仓库是开源面——一级导航名不副实。访客的真实动线只有三条：**看产品、看动态、试演示**。同时两处表达欠账一并修正：/demo 页对壹座线上版的称呼错位（笼统的 Platform），以及公司使命（推动信息平权）未在首页出现。

## What Changes

- **导航收敛到三项**：产品 · 动态 · 演示。数据/仓库/文档沉没——页脚可达 + 所属页入口，**所有 URL 原样保留**（/data、/repos、/docs 及全部深链不动）。
- **首页新增「开源」区块**：GitHub 组织地址（github.com/FindDataTechnology）+ 公开仓计数 + 双入口（仓库一览 /repos、GitHub 组织 ↗）。控制台语言窄带，纯静态。
- **/demo 命名**：按钮/模拟终端/正文对壹座线上版的称呼（双语）——「打开壹座线上版」/ "Open Base Online"，模拟终端窗口标题「壹座线上版 · …」。
- **首页副题注入使命句**：「……推动信息平权」/ "— advancing information equality"（双语各一句）。
- **入口补齐**：/data 入口上柏讯线页与 open-data-mcp 详情页；文档入口上旗舰页与页脚。

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `site-shell`: 导航分组要求从「至多六项」收紧为「恰三项」（产品/动态/演示），沉没面清单扩为 数据/仓库/文档/数据指标/路线图/发布；仓库的中文标注 仓库 随沉没面移至页脚与页面入口。
- `product-portal`: 首页新增「开源组织」区块的要求（组织地址 + 仓库目录入口，双语、零 JS）。

## Impact

- `src/components/Layout.astro`（导航数组、页脚沉没行）
- `src/pages/index.astro`、`src/pages/zh/index.astro`（开源区块、hero 副题使命句）
- `src/i18n.ts`（导航键、使命句、开源区块文案）
- `src/components/ProductCatalog.astro`（wire 线页的 /data 入口区块）
- `src/pages/products/[slug].astro` 等（open-data-mcp 详情页的 /data 入口，可选加分项）
- `src/pages/fd-open-data-mcp.astro`（旗舰页文档入口）
- 规格影响：site-shell（导航 MODIFIED）、product-portal（开源区块 ADDED）；URL 与既有深链零变化
- 不含：/data、/repos、/docs 页面本体的任何改动；不含 features 文案改写