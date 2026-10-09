# wire-tab-refresh

## Why

主官网 /products 柏讯 tab 的口径停在 2026-10-05 前后：只讲「开放数据 MCP + 云端数据联邦」，而柏讯平台此后上线并生产实证了一批自助服务（客户数据集「我的数据」、公网上传→引擎物化→预览、连接器、产物溯源、AI 对话构建、四档定价与自助注册），主官网未反映；柏讯平台已有正式定价页，主官网缺入口。伴生 fd-wire 主 change `wire-self-serve-launch`（四档定价/正式登录/自助开户）。

## What Changes

- **平台入口 CTA 文案更新**：i18n `wire` 相关键（`i18n.ts` EN/ZH 两块）按已上线服务重写，提及客户数据（我的数据/上传物化/产物）与自助注册。
- **新增「查看定价」入口**：wire tab 平台入口块增加指向 `https://wire.finddatatech.cloud/#/pricing` 的 CTA；主官网**不标任何价格数字**（定价唯一事实源=柏讯平台定价页）。
- **两张 wire 卡内容校准**：`open-data-mcp.md`、`cloud-federation.md`（EN/ZH 各两份）tagline/正文按当前能力校准；宣称能力保持可对项目验证（apps-showcase 既有约束），不引入手写量级数字（构建期数字律）。
- **顺手清理**：无消费的 `line.wire.desc` 历史遗留键处置（删除或接入）。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `apps-showcase`: wire 线 tab 页新增平台定价入口要求（定价链接指向柏讯平台、主官网不携带价格数字）。

## Impact

- `src/i18n.ts`（wire 相关键 EN/ZH）、`src/components/ProductCatalog.astro`（wire 平台入口块加定价 CTA）、`src/content/apps/{en,zh}/{open-data-mcp,cloud-federation}.md`。
- 发布链不变：push main → GHA 镜像 → bump `deploy/k8s/fd-web.yaml` 双推 → ArgoCD 滚动；验收带 `?v=<sha>` 绕 EdgeOne HTML 边缘缓存。
- 与 fd-wire 主 change 的定价页改版无代码耦合，仅链接指向（其定价页 hash 路由 `#/pricing` 已存在）。
