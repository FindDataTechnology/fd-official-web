# Tasks

- [x] 1. `src/components/Layout.astro` 页脚版权行补 `粤公网安备44030002016558号` 文本链接
  （→ `https://beian.mps.gov.cn/#/query/webSearch?code=44030002016558`，`target="_blank"` +
  `rel="noopener noreferrer"`），与既有 ICP 行并列；不新增 i18n 键、不挂图片——验证：
  `npm run build` 绿，构建产物中 en 与 zh 两套页脚均含该号码与链接
- [x] 2. 浏览器实机目检（本地 `astro preview`）：EN `/` 与 中文 `/zh/` 页脚两行备案并列、
  链接目标正确且可达（证据截图）
- [x] 3. 部署验收：commit → GHA image 绿 → tcr-relay 回灌 → GitOps `fd-web` bump →
  ArgoCD hard refresh → rollout 成功 → 线上探针：线上 HTML 含
  `粤公网安备44030002016558号`，链接可达 mps 平台；既有页脚断言（GitHub org / view source /
  ICP）无回归