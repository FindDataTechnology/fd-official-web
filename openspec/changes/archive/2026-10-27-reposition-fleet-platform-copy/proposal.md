## Why

finddata 根 change `reposition-fleet-platform-narrative`（2026-10-27 用户裁决）把公司北极星叙事重写为「AI-native agent 集群持续运行平台」——集群挂壹座、五线为供给域、对外口径诚实（「职责变了」，禁绝对化替代表述），并新增了 spec `official-web-product-lines` 的面级要求。本 change 是该叙事在官网的落地：hero、首页线卡副口径、产品目录副题、壹座线落地页 hero 双语刷新。

## What Changes

- 首页 hero（`/`、`/zh`）：定位句从「文本与数据基础设施」改为「agent 集群平台」，五线阶梯叙事保留并存。
- 首页线卡区与 `/products[|/zh]` 目录副题：五线呈现为「集群的供给域」。
- 线卡一句话（line.*.why，双语）：壹座=集群平台（组建/管理/迭代/分享）；其余四线加供给域前缀。
- 壹座线落地页 hero（BaseLanding，双语）：四动词呈现 + 萬星上线运行分工句。
- **BREAKING（仅文案口径）**：旧顶层定位句下线。页面结构、组件、路由、样式一律不动；不开第六线、不改阶梯叙事与线标。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `product-portal`：新增「首页 hero 集群定位」「线卡/线页供给域框架」「壹座落地页四动词与萬星分工」三条要求。

## Impact

- `src/i18n.ts`（约 10 处键值，en/zh 各一遍）。
- 验收：`pnpm build` 绿 + 按 spec Scenario 逐点比对渲染文案 + 数字/门禁类既有审计不变（本仓无文案数字门禁）。
- 契约背书：finddata 根 spec `official-web-product-lines`（本 change 的 Scenario 与其 delta 对齐）与 `fleet-platform-positioning`（定位句来源）。
