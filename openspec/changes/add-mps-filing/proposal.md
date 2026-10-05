# Proposal: add-mps-filing

## Why

`finddatatech.cloud` 主域已取得公安联网备案（`粤公网安备44030002016558号`），但三仓全域排查
（grep 零命中）显示这行从未在任何站点展示——官网页脚只挂了 ICP 备案号，公安备案的展示义务
（编号 + 查询链接）未履行。官网是备案主域的正身，本 change 补上这一行。

## What Changes

- `src/components/Layout.astro` 页脚版权行补一条文本链接：
  `粤公网安备44030002016558号` → `https://beian.mps.gov.cn/#/query/webSearch?code=44030002016558`
  （`target="_blank"` + `rel="noopener noreferrer"`），与既有 `粤ICP备2026118740号-1` 同行并列。
- 备案标签双语同形：中英页面都保留中文原文（备案号是法定标识，不翻译），与既有 ICP 行的
  硬编码形态一致；不新增 i18n 键。
- 不挂警徽图片，纯文本链接（与家族「文本型」记号原则一致）。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `site-shell`: MODIFIED「Core site structure」——页脚陈述增加公安联网备案号（编号 + 查询
  链接），携带该要求全部既有场景 + 新增「公安备案展示」场景。

## Non-goals

- 官网页脚的其他改动（结构、其他链接、样式）；
- 谦面 / 萬星页脚的同一行（各自仓的 change 里做：paas `add-facet-intro-view`、
  fd-wanxing `upgrade-wanxing-footer`）；
- 官网 `/products` 页首与识律页脚的「壹座之上，萬星闪耀」（命名阶梯 wordplay，另议）；
- 备案主体信息变更类工作（若主体变更，另立）。

## Impact

- **Code**: `src/components/Layout.astro`（页脚一行）；无依赖、无 i18n 变更。
- **Pages**: 全站页脚（EN `/` 与 中文 `/zh/…`，静态构建同源）。
- **部署**: fd-official-web 镜像线（GHA → TCR → GitOps `fd-web` bump；与 2026-10-05
  `add-facet-wanxing-apps` 同线）。
- **事实**: 号码由用户提供；查询链接形态 = 全国互联网安全管理服务平台
  `beian.mps.gov.cn/#/query/webSearch?code=<number>`；实现时实测该链接可达。

## 验收口径

- `npm run build`（astro build，含 repos/indicators 预取）绿；构建产物 HTML 的 en 与 zh
  两套页脚均含两行备案且链接目标正确；
- 浏览器实机目检（本地 `astro preview`）：EN `/` 与 中文 `/zh/` 页脚两行备案并列、链接可达
  （证据截图）；
- 部署后探针：线上 HTML 含 `粤公网安备44030002016558号` 且链接指向 mps 平台；既有页脚
  断言（GitHub org / view source / ICP）无回归。