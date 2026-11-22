# Proposal

## Why

萬星（constellation）是五条线里**产品最多、线页最薄**的一条：`/zh/products/constellation/` 只渲染
四张 app 卡（服务平台 / 词元 / 连接器 / 行业技能包），没有任何**线级**入口——访客读完四段介绍后
没有「进控制台」「看对接文档」「看现在有多少 agent 在跑」的地方，只能各自点四张卡里某一款的
「在线体验」。对照兄弟线：`base` 有 15.8KB 的七段落地页，`wire` 有平台入口 + 定价按钮，`lex` 有家族宣言。
萬星四款产品的共同入口不存在。

同时线卡的 `line.constellation.desc` 与 `tag` 还停在「FindDataRouter 是第一颗星」的年代——那时这条线
只有词元一款；今天是四款在售产品。

## What Changes

- **萬星线页加一条线级 entry strip**（沿 wire 线页 `wire-entry` 的既有样式，不新造视觉）：
  三个入口——进目录（`wanxing.finddatatech.cloud/#/catalog`）、对接文档（`#/docs`）、
  部署者控制台（`#/console`）。
- **strip 带两个实时数字**：在役 agent 数、近 7 天回合数，取自萬星公开状态端点，**构建期取数 + committed
  快照回落**（与 `fetch-repos.mjs` / `fetch-indicators.mjs` 同一种失败模式：取不到就保留上一份，构建绿）。
- **线卡文案更新**：`line.constellation.desc`（中英）改为覆盖四款在售产品的一句话；
  `tag` 由「生长中」保持不变（是否为事实需运营确认，本刀不动）。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `apps-showcase`: 新增一条 requirement——萬星线页携带线级入口条与构建期快照数字；对齐既有
  「Wire line pricing entry」的形状（一条线页专属入口，不发明第六线、不改五线阶梯）。

## Non-goals

- **不做专门落地页**（不走 `BaseLanding.astro` 那条 15KB 的路）。萬星线页当前形态是「线 tab + 卡列表」，
  加一条 strip 就能补上入口；再造一整套落地页是产品决定，不是本刀。
- **不在页面上运行时拉取萬星**。构建期取数，取不到回落快照；站点不新增运行时依赖。
- **不动五线阶梯 / LineTabs / LINE_PAGES 契约**。
- **不改 `tag`（生长中）**——那是运营口径，未经确认不擅自升级。
- 不做壹座萬星看板（`under_construction` 三块），那是 paas 仓的另一个 change。

## Impact

- `src/components/ProductCatalog.astro` — 新增 `line === 'constellation'` 的分支（与既有 `wire` / `lex`
  分支同形）。
- `scripts/fetch-constellation-status.mjs`（新增）+ `src/data/constellation-status.json`（committed 快照）。
- `package.json` 的 `build` 链新增一步（与 `calibers:fetch` 同位置）。
- `src/i18n.ts` — 中英两处 `line.constellation.desc` + strip 的标签文案。
- 无新依赖；无 runtime 请求；不影响 `/repos`、`/data`、`/products/<其他线>`。
