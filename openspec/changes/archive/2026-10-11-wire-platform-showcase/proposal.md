# wire-platform-showcase

## Why

主官网柏讯（wire）线目前只有平台入口 CTA 与两张数据服务卡（开放数据 MCP、云端数据联邦），**没有介绍柏讯平台自身能力的 app 页**。而平台侧能力已于 2026-10-11 经生产 E2E 实弹验证全链走通（免费档自助闭环、AI 路径、变换管线与调度、数据需求单、源包订阅），对外宣传口径已获批；apps 集合（apps-showcase）正是「手写双语 app 页」的既定容器。缺页意味着访客从 wire tab 只能看到「进入平台」按钮，却无处了解进入之后能做什么。

## What Changes

- **新增双语 app 页 `wire-platform`**：`src/content/apps/{en,zh}/wire-platform.md`（frontmatter：name/tagline/kind/demoUrl=https://wire.finddatatech.cloud/line: wire/order: 5，排在线内最前）。中文页适度营销但逐条可验证；英文页克制、具体。
- **只认领已生产实证的能力**（2026-10-11 生产 E2E 验证）：
  - 免费档自助闭环：注册登录（Logto SSO）→ CSV/Excel 上传或本地连接器建数据集 → 行内修正（编辑+单条回滚+悬空如实标注）→ 看板可视化编辑器（KPI/折线/柱状/表格四类面板）→ 面板查询绑定（数据集/列/过滤/排序/上限）→ 试取预览 → 确定性刷新（按绑定重取出新版本，零 LLM）→ CSV 导出（数据集与整板）→ 发布+签名分享链接（钉版本、TTL 7/30/90 天、noindex）。
  - AI 路径（如实标注「需开通专属 cell，私有交付」）：对话式生成看板（AI 草稿转正）、AI 无头刷新、连接器/派生变换/join/批量写入/MCP 工具面。
  - 变换管线：派生数据集+血缘管线视图（深度/环检测/异常如实）+ cron 定时刷新调度（数据集与看板统一）。
  - 数据需求单：客户提交（源 URL+期望+节奏），平台评估交付后自动开通数据 scope。
  - 源包订阅：按主题预置的开放数据目录包（年鉴全景/区域经济/货币金融等）。
- **零价格数字红线不变**（wire-tab-refresh 定案 + apps-showcase 既有「Wire line pricing entry」要求）：页面上不出现任何价格、免费额度数字或行配额数字（如免费档「3 数据集 × 10,000 行」不落页）；档位与额度唯一事实源是平台定价页，页面仅放 CTA 指向 `https://wire.finddatatech.cloud/#/pricing`。
- **不写未来时态承诺**（无 coming soon / will；content-integrity 纪律）。

## Capabilities

### New Capabilities

（无——不新增能力面，只新增内容页；apps-showcase 既有能力覆盖渲染路径）

### Modified Capabilities

- `apps-showcase`: 新增「Wire platform app page」要求——wire 线 apps 集合含平台自身双语条目、线内排首、只认领已实证能力、AI 路径如实标注专属 cell 门控、零价格/额度数字。

## Impact

- `src/content/apps/{en,zh}/wire-platform.md`（新增两份，纯内容，零组件改动——`ProductCatalog.astro` 的 wire 分支按 `line === 'wire'` 过滤渲染线内全部 apps，新条目自动出现在 `/products/wire` tab 网格与 `/products/wire-platform` 详情页）。
- 不动 `ProductCatalog.astro`、i18n、`content.config.ts`；slug `wire-platform` 不与线名冲突（getStaticPaths 守卫通过）。
- 入口核验（content-integrity「可达入口」）：2026-10-11 curl 探测 `https://wire.finddatatech.cloud` 与 `https://wire.finddatatech.cloud/#/pricing` 均返回 200。
- 发布链不变：push main → GHA 镜像 → bump `deploy/k8s/fd-web.yaml` 双推 → ArgoCD 滚动；验收带 `?v=<sha>` 绕 EdgeOne HTML 边缘缓存。
