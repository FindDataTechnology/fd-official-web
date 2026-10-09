# Design — wire-tab-refresh

## Context

主官网柏讯 tab 由 `src/components/ProductCatalog.astro` 渲染（`line === 'wire'` 条件块），文案在 `src/i18n.ts` EN/ZH 双块，卡片内容为 `src/content/apps/{en,zh}/*.md` 手工双语集。既有硬约束：卡片宣称能力必须可对项目验证、构建期数字律（对外量必须来自构建期导出）、双语对等、content:check 门禁。柏讯平台新服务与四档定价由伴生 change `wire-self-serve-launch` 落地（fd-wire 仓）。

## Goals / Non-Goals

**Goals:**
- wire tab 口径与柏讯平台真实能力对齐（我的数据/上传物化/产物/自助注册）。
- 提供定价入口且主官网零价格数字（单一事实源=平台定价页）。

**Non-Goals:**
- 不改五线 tab 结构、不加新卡片、不动 /data 板块。
- 不等待 fd-wire 主 change 上线（本 change 仅链接指向既有 hash 路由，可独立发布；文案中「自助注册」等表述以主 change 上线为前提，发布顺序上主 change 先行）。

## Decisions

### D1 定价入口放平台入口块，不进卡片

`ProductCatalog.astro` 的 wire 平台入口块加次级 CTA（「查看定价」/ "See pricing"），与主 CTA 同组；不放进 app 卡片——卡片属手工集，链接属页面结构，职责分开。样式遵循 One Signal 律（次级 CTA 用描边样式，不新增薄荷强调）。

### D2 文案不写量级数字

新能力表述不携带「N 个数据集」「N 连接器」类手写数字（构建期数字律）；能力级表述（上传、物化、预览、溯源、AI 构建）不需要数字。EN/ZH 同步改，`line.wire.desc` 无消费键直接删除（i18n 缺键回退 EN 的机制不受影响，删除前 grep 确认零引用）。

### D3 卡片正文最小改动

`open-data-mcp` 卡保持开源数据平台定位不动；`cloud-federation` 卡 tagline 的「登录门控的 MCP 端点」表述随平台正式登录上线仍准确，正文仅校准与新服务重复或过时的句子；不重写整卡（降低双语审校面）。

## Risks / Trade-offs

- [表述超前于平台上线] → 发布顺序钉死：fd-wire 主 change 先滚（定价四卡/登录可见），本 change 后发。
- [EdgeOne HTML 缓存延迟] → 验收统一带 `?v=<sha>` 查询串（既有配方）。
- [content:check 门禁] → 文案避开退役标识词（FindDataOfficial / craw.finddatatech.cloud / Scrapyd），build 前置检查通过。

## Migration Plan

push main → GHA 出镜像 → bump `deploy/k8s/fd-web.yaml` 双推（gitee+github）→ ArgoCD 自动滚 → 带 `?v=<sha>` 验收 `/products/wire` 与 `/zh/products/wire`。回滚=revert bump 提交。

## Open Questions

（无）
