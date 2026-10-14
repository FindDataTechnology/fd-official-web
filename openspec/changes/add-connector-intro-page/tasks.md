# Tasks

- [x] 1. `zh/wanxing-connector.md`：frontmatter 定案（name「萬星连接器」/ kind
  「Agent 连接网关」/ line `constellation` / order `15` / demoUrl
  `https://connector.finddatatech.cloud`）+ 四段正文（它是什么 / 怎么用三条路 /
  安全与可控 / 在线体验），双层口吻，按 proposal tagline 基线
- [x] 2. `en/wanxing-connector.md`：对译，frontmatter 同步
- [x] 3. 事实核验：生产 `/v1/catalog` 现拉核对「1500+ provider」下限仍成立
  （不写精确数）；demoUrl 实测可达（200/登录门均可，学习样例：谦面页
  demoUrl 同为登录门）；「零粘贴连接」（壹座生产域跨域铸牌在产）与「柏讯
  连接器取数」（wire-platform 卡既述）两处生产行为核对出处；正文零未验证数字
  与零精确计数
- [x] 4. 构建验收：`astro build` 绿；4 条新路径生成（en/zh ×
  `/products/wanxing-connector` + `/apps/wanxing-connector` 跳转壳）；
  萬星线页出现新卡且 order 15 居中（FindDataRouter 之后、行业技能包之前，
  构建产物字节序复核）；详情页关键内容（名称/kind/tagline/demoUrl）在产物
  HTML 中逐项核对；`content:check`（retired 标识）零命中
- [x] 5. 浏览器实机目检：线页卡片位次 + 详情页排版（重点看 demoUrl 演示按钮
  可见性——前例曾在此栽过 `article.doc a` 特异性坑，已修则复核即可）
  （证据：gui-test-screenshots/t5_constellation_line_page.png 四卡可见、萬星
  连接器居中第三；t5_connector_detail_page.png 排版正常；demo 按钮 computed
  style bg rgb(56,225,200)/color rgb(6,32,27)、visible:true——特异性坑未复发）
- [x] 6. 构建产物数据文件（`src/data/*.json` 由 fetch 脚本再生成）还原 HEAD，
  change 保持内容纯净（`git checkout HEAD --` 五文件，status 仅余 change
  自身文件 + 未入库截图目录）
- [ ] 7. 部署验收：commit + roll（fd-web.yaml sha → GHA image → relay 回灌 →
  ArgoCD `fd-web` 同步，配方见 OPS.md 更正后的镜像 roll 路径）；线上四条新
  路径全 200；详情页文案/kind/demoUrl 线上 HTML 逐项在；萬星线页卡片位次复核
