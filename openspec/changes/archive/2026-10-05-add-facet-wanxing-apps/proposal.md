# Proposal: add-facet-wanxing-apps

## Why

`apps` 集合现有 8 个条目里没有谦面功能集市场、也没有萬星服务平台——两条最新
旗舰产品在主站叙事缺席：facet 线下唯一卡片是 DAAS 平台（另一产品），
constellation 线挂的是 FindDataRouter 与行业技能包。官网是五线门面叙事的
权威面（five-lines 规范），两个产品必须各有 app 页。2026-10-05 grill 共识：
范围 C（产品域+官网两层都补）、双层口吻（价值定位领句 + 可动手事实）。

## What Changes

- **新增 4 个内容文件**（en/zh 双语，走既有 `apps` content 管线，零代码改动）：
  - `zh/facet-market.md` + `en/facet-market.md`：名称「谦面功能集市场」，
    kind「Agent 供给市场」，line `facet`，order `5`（排 DAAS 平台之前），
    demoUrl `https://facet.finddatatech.cloud`。
  - `zh/wanxing.md` + `en/wanxing.md`：名称「萬星服务平台」，
    kind「Agent 服务平台」，line `constellation`，order `5`（线内第一），
    demoUrl `https://wanxing.finddatatech.cloud`。
- **正文**：按既有惯例——`##` 分节约 5 段 + 结尾「在线体验」链接；双层口吻。
- **docs voice 纪律**：数字与命令只写实现时当场可验证的（A2A 端点形状
  `POST /api/wanxing/v1/a2a/<slug>` + Idempotency-Key、CLI 已发布包名
  `npx @finddatatechonology/facet`、demoUrl 可达）；验证不了的宁可不写
  （不写市场包数/服务数这类会过期的计数）。
- **文案草案（zh 版定稿基线，en 对译）**：
  - 谦面 tagline：「AI 编辑器的功能集与工具分发市场——浏览、订阅、发布功能集，
    MCP 服务目录，一行 CLI 装进 Claude Code / Cursor。」
  - 萬星 tagline：「Agent 服务的对外运行与服务平台——部署、驻留、门面、计费与
    机群观测；标准 A2A 端点，按时长计费。」（定稿按
    `paas/docs/wanxing-serving-api.md` 计费口径修正，原「按回合计量」措辞弃用）
- slug 守卫：`facet-market`/`wanxing` 均非线名，过 products 页 getStaticPaths
  的 slug≠line 守卫。

## Capabilities

### New Capabilities

无——新增条目完全落在既有 `apps-showcase` 契约内（手写双语 app 集合、line
枚举校验、线页过滤渲染）。

### Modified Capabilities

无。（在案事实：`apps-showcase` spec 正文仍写旧四线 `data/legal/paas/token`，
与现实五线不符——既有陈旧债，应另立卫生 change 修正，不在本 change 夹带。）

## Non-goals

- 线页叙事升级（五线各写线级介绍，另立）；`apps-showcase` 四线陈旧措辞修正
  （另立）；产品域侧改动（fd-wanxing `add-intro-view`、paas
  `add-facet-intro-hero` 各自立项）；首页卡片墙改动（自动含新卡，无代码）。

## Impact

- **Code**: 仅 `src/content/apps/{en,zh}/` 四个新 md；无组件/页面/配置改动。
- **Pages**: `/products/facet-market`、`/products/wanxing`（+ `/zh/` 对应）
  生成（`/apps/<slug>` 保留既有跳转壳，自动生成）；`/products/facet` 与
  `/products/constellation` 线页各多一张卡片（order 5 居首），首页卡片墙同步。

## 验收口径

- `astro build` 绿；四条 app 页路径生成且双语渲染；两线页卡片出现（名称/
  tagline/demoUrl 链接）；正文中的端点形状、CLI 包名、demoUrl 逐条核验
  （探针/实测可达）。
