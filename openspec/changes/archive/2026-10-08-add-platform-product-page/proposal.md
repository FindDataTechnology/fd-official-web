# add-platform-product-page

## Why

壹座（base 线，寻数·壹座）在官网上只有五线目录里的一格：ProductCatalog 的 line-tab 加 repo 卡片（README 级介绍）。定位已定案（2026-10-07 拷问）：壹座 = 开源平台，全平台覆盖（web / 小程序 / mac / win），云端 + 本地双轨。官网缺一个把这套叙事讲完整的专属产品页；同时桌面安装包首发（姊妹 change add-desktop-release，paas 仓）将产出首批下载产物，官网需要一个承接下载的入口。设计语言直接沿用：LineMark、阶梯字、备案页脚、TourMockup 的 CSS 手绘哲学（谦面/萬星 2026-10-05 三仓先例）。

## What Changes

- `/products/base`（及 `/zh/products/base`）从 line-tab 目录原地升级为壹座专属产品页：URL 不变，五线目录结构不动，其余四线维持现状、日后按同模式深化
- 七段结构：双轨 hero（云端"联系开通" + 本地"三行命令 / 下载安装包"）→ 价值主张（开源底座 / 全平台 / 本地优先）→ 功能 tour（复用 TourMockup 风格，深链 `/demo` 看全程）→ 全平台矩阵（web / 小程序 / mac / win）→ 自部署 quickstart → 下载带 → 收尾（更新日志 · roadmap · GitHub 链接）
- 下载带数据源 = committed snapshot JSON（版本 × 平台 × 双源链接），构建零网络依赖（沿 releases 页 committed-only 哲学）；由 add-desktop-release 的发版链路回写
- 过渡态：先放 GitHub Releases 直链 + "国内直链即将上线"注记；dl.finddatatech.cloud 就绪后回填官网直链为主源、GitHub 为国际源
- 云端 CTA = 联系开通（按云端现状邀请制的假设；若已开自助注册则改指 platform.finddatatech.cloud 登录页）
- 明确不做：价格区块、真产品截图素材管线、其他四线深化、下载产物托管本身（那是 add-desktop-release 的 installer-distribution）

## Capabilities

### New Capabilities

- `download-center`: 桌面安装包下载带——snapshot 数据形状（版本、发布日期、平台产物、双源链接、beta 标记）、双语渲染、过渡态语义、未签名安装的绕过脚注

### Modified Capabilities

- `apps-showcase`: base 线从"目录 tab + app 卡片"扩展为可选的专属线页（line landing）——七段结构、双轨 hero、深链 `/demo`；其余线保持目录形态不受影响

## Impact

- **页面**：`src/pages/products/[line].astro` 升级或新增 base 专属视图 + zh 副本；i18n 增 `line.base.*` hero/段落键与 `download.*` 键
- **数据**：`src/data/` 新增 desktop-releases snapshot JSON；本 change 先手写 v1.3.0 占位条目（GitHub 直链），发版链路接管后机器回写
- **组件**：复用 TourMockup / LineMark / Layout；新增下载带组件（平台矩阵 × 版本 × 双源 + 绕过脚注）
- **跨仓契约**：snapshot JSON 的 schema 与 paas 仓 add-desktop-release 的回写脚本锁步（一处定义、双侧引用）
- **验收**：en/zh 双语渲染、三域探针绿、构建无网络依赖守恒（snapshot 全 committed）
