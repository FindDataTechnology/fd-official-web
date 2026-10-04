# Tasks

- [x] 1. `zh/facet-market.md` + `en/facet-market.md`：frontmatter 定案
  （name/kind/line/order/demoUrl）+ `##` 分节正文（双层口吻，按提案 tagline 基线）
- [x] 2. `zh/wanxing.md` + `en/wanxing.md`：同上
- [x] 3. 事实核验：A2A 端点形状（`POST /api/wanxing/v1/a2a/<agentSlug>`）、CLI
  包名（npm 实查 `@finddatatechonology/facet@0.1.0`，install 支持
  `--target claude-code|cursor`）、两个 demoUrl 实测可达（均 200）；
  计费口径按 `paas/docs/wanxing-serving-api.md` 定「按时长计费、分钟向上取整」；
  正文零未验证数字
- [x] 4. 验收：`astro build` 绿（102 页）；四页路径生成（en/zh 各
  `/products/<slug>` + `/apps/<slug>` 跳转壳）；两线页卡片出现且 order 5 居首
  （谦面市场在 DAAS 前、萬星在 FindDataRouter 前，构建产物字节序复核）；
  详情页关键内容（名称/kind/tagline/端点/CLI/demoUrl）在产物 HTML 中逐项核对；
  浏览器实机目检线页与详情页（证据 gui-test-screenshots/）
- [x] 5. 顺带修复（浏览器目检发现）：`public/global.css` 中 `article.doc a`
  （0,1,1）压过 `.repo-demo-btn`（0,1,0），演示按钮文字变 accent 同色不可见——
  全站既有缺陷（所有带 demoUrl 的 app 详情页），改选择器为
  `article.doc a.repo-demo-btn` 修复；新页与既有页（paas-platform）计算样式
  复核 + 截图（before/after）在证
- [x] 6. 构建产物数据文件（src/data/*.json 由 fetch 脚本再生成）还原 HEAD，
  change 保持内容纯净
- [x] 7. 部署验收（2026-10-05）：commit `57484d3` + roll `98955e8`（fd-web.yaml
  sha-57484d3）→ GHA image run 37228775510 绿 → relay 03:39:50 回灌 →
  tencent 集群 ArgoCD app `fd-web`（源=gitee、automated+selfHeal）同步 →
  rollout 成功 → 线上一二验证：四条新路径（en/zh × facet-market/wanxing）
  全 200；详情页文案/kind/demoUrl/CLI 在线上 HTML 逐项在；谦面线页卡片
  order 5 居首（谦面功能集市场 3105 < DAAS 平台 3587）；演示按钮 CSS 修复
  在线上 global.css 生效。**更正**：official-web 现行发布路径 = 镜像 roll
  （pod 供页，ArgoCD fd-web app 源 gitee），OPS.md 的静态 cron/rsync 描述
  已过时（cron 已注释、静态 dist 停于 09-29）