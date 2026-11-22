# Design

## Context

线页由 `src/pages/zh/products/[line].astro` 分派：`base` 走 `BaseLanding.astro`，其余四线走
`ProductCatalog.astro`。`ProductCatalog.astro` 里已有两处**按线分支**的先例：`wire` 的 entry 组
（`demo-cta` + 定价次按钮）与 `lex` 的一句家族宣言——所以「萬星也多一个分支」是本文件已有的形状，
不是新架构。

构建期取数的先例有三个，失败模式各不相同：
- `fetch-repos.mjs` / `fetch-indicators.mjs`：失败**保留上一份**（last-good）；
- `fetch-calibers.mjs`：失败写 `null`（**刻意不保留**，因为旧总数当现值就是谎）。

萬星的两个数字（在役 agent 数、近 7 天回合数）是**单调增长的运营量**，不是配额也不是价格：
保留一份几小时前的快照不构成误导，而缺数时渲染 0 才是。故走 last-good。

## Goals / Non-Goals

**Goals:**
- 线页补上三个入口与两个数字，零运行时依赖。
- 复用既有 `wire-entry` 样式与 i18n 机制，不新增视觉语汇。

**Non-Goals:**
- 不建萬星专属落地页（那要另立 change）。
- 不改五线阶梯、LineTabs、`PRODUCT_LINES`。
- 不动任一 app 卡的内容。

## Decisions

**D1 · 构建期导出而非运行时拉取。**
站点是静态 Astro；运行时拉取意味着每个访客都要等一个跨站请求、且萬星不可达时页面残缺。构建期导出
把失败收敛到构建一次，与 `/repos` `/data` 完全同一种已知失败模式。
*备选*：客户端 fetch + 骨架——被否，静态站上引入一个会闪的区块，且与「构建拿不到就保留上一份」的
既有纪律冲突。

**D2 · 走 last-good，不走 null。**
理由见 Context：这两个数是运营量而非承诺量。缺数时**该格不渲染**（不是渲染 0），保留上一份是次优
但诚实的选择——`generated_at` 会随快照一起渲染，读者能看见它是哪一刻的数。

**D3 · 分支写在 `ProductCatalog.astro`，不新建组件文件。**
四个线页共用这一个文件，wire 与 lex 的分支都内联在此。新建 `ConstellationEntry.astro` 会让「线页
特例」的读法分裂成两处。等第三条线也需要同样形状时再抽。

**D4 · 文案更新只改 `line.constellation.desc`，不改 `tag`。**
`tag`（生长中）是运营口径，本刀无依据改它。`desc` 现在的「FindDataRouter 是第一颗星」在四款产品
在售的今天是**事实错误级的过时**——它把一款产品当成整条线。

## Risks / Trade-offs

- **构建机可能访问不到 wanxing 域名** → 缓解：这正是 D2 存在的原因；取不到保留上一份，构建绿。
  但需在 CI 上实测一次（HANDOFF 记录首次构建的日志）。
- **快照长期不更新** → `generated_at` 渲染在数字旁，陈旧自证；导出脚本随每次构建跑。
- **`desc` 中英两处必须同步改** → 漏一处会让两语言说不同的话；任务里列为同一任务的子项，并由
  `npm run check:locales` 与人工双语核对兜底。

## Migration Plan

无。上线即生效；回滚 = 删掉分支与快照步骤（页面回到今天的四卡）。