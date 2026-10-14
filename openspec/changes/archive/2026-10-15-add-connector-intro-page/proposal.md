# Proposal: add-connector-intro-page

## Why

官网 `apps` 集合现有 11 个条目，五线里唯独「萬星连接器」缺席：open-connector-mt
生产在跑（`connector.finddatatech.cloud`，多租户连接网关，1568 provider 目录），
是壹座 agent 动作面与柏讯取数的共同地基，但客户从官网无从知道这个产品是什么、
怎么用。2026-10-15 `/opsx:explore` 定案（用户授权代决）：补官网介绍页，主叙事
讲给壹座/wire 现有及潜在用户（方案 A），写「怎么用」不写「怎么买」（连接器无
独立计费故事，SERVICE_OBO 仍 allow-all v1）。

## What Changes

- **新增 2 个内容文件**（en/zh 双语，走既有 `apps` content 管线，零代码改动）：
  - `zh/wanxing-connector.md` + `en/wanxing-connector.md`：slug
    `wanxing-connector`，名称「萬星连接器」，kind「Agent 连接网关」，
    line `constellation`，order `15`（萬星服务平台(5)、FindDataRouter(10) 之后，
    行业技能包(20) 之前），demoUrl `https://connector.finddatatech.cloud`。
- **正文四段**（双层口吻，照 wanxing.md 惯例）：
  1. 它是什么——OAuth/API key 连一次账户，agent 获得千级外部服务、万级预置
     动作；凭据、scope、schema、策略、脱敏日志都在一个可检视的运行时里。
  2. 怎么用（三条路）——壹座里零粘贴连接（跨域铸牌）、柏讯平台连接器取数、
     控制台管理连接与日志。
  3. 安全与可控——凭证加密存储、动作允许/阻断策略、运行日志脱敏。
  4. 在线体验——打开控制台（demoUrl）。
- **docs voice 纪律**：计数一律用下限口径（「1500+ provider」「万级动作」），
  不写精确计数（会过期）；实施时从生产 `/v1/catalog` 现拉核对下限仍成立；
  「零粘贴连接」「取数」均为生产行为，实施时核对壹座/柏讯入口可达。
- **不写「怎么购买」**：连接器用量经壹座/柏讯轨道结算，无独立定价；独立计费
  落地后再补段。
- slug 守卫：`wanxing-connector` 非线名，过 products 页 getStaticPaths 的
  slug≠line 守卫。

## Capabilities

### New Capabilities

无——新增条目完全落在既有 `apps-showcase` 契约内（手写双语 app 集合、五线
line 枚举校验、线页过滤渲染）。

### Modified Capabilities

无。

## Non-goals

- connector 域名自己的产品 landing（决定：不做，控制台保持功能面，官网卡是
  唯一事实源）；
- 独立计费/定价叙事（无故事，不写）；
- `apps-showcase` spec 措辞卫生（若仍有陈旧债，另立 change）；
- 首页卡片墙改动（自动含新卡，无代码）。

## Impact

- `src/content/apps/zh/wanxing-connector.md` + `src/content/apps/en/wanxing-connector.md`
  两文件新增；无代码/依赖/接口改动。
- 构建产物新增 4 条路径（en/zh × `/products/wanxing-connector` +
  `/apps/wanxing-connector` 跳转壳）；萬星线页多一卡（order 15 居中）。
