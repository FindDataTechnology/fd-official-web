# Tasks — official-web-content-truth

## 1. 文案纠错（把说法打真）

- [x] 1.1 旗舰页数字接入构建期导出：`src/pages/fd-open-data-mcp.astro`、
      `src/pages/zh/fd-open-data-mcp.astro` 从 `src/data/indicators.json` 渲染概念数与工具数；
      `src/content/flagship/{en,zh}.md` 删去手写的「15 个指标概念 / 45 个 MCP 工具」段落
- [x] 1.2 `src/content/apps/{en,zh}/open-data-mcp.md`：`FindDataOfficial` → `FindDataTechnology`
- [x] 1.3 `src/content/apps/{en,zh}/law-bench.md`：先探针核验现行入口
      （`http://23.144.68.246:30830`），不可达则替换为可达入口或移除入口 CTA；
      把探针方式与结果记入本变更 → 证据见 `reports/verification.md`（旧址连接失败，
      换为 `https://lex.finddatatech.cloud`，探针 200）
- [x] 1.4 `src/content/apps/{en,zh}/contract-templates.md`：把「Scrapyd 采集栈（配套 Redis 与
      PostgreSQL）」改写为现行 k8s/GitOps 采集运行时
- [x] 1.5 `src/content/apps/{en,zh}/facet-market.md`：核验结论——文档与实际发布**已经一致**
      （npm 上真实存在的就是 `@finddatatechonology/facet`，repository 指向
      `FindDataTechnology/platform`，是包名 scope 拼错而非文档写错），文案不改；
      「重新发布正确 scope + 老包退役」记入 `repo-descriptions.md` 独立待办
- [x] 1.6 `src/content/roadmap/chantui.md`：四条交付物改写为已上线事实（带日期）、周期保持
      2–3 个月（无证据表明失真）；`items_en` 与 `items_zh` 事实同步
      （遗留一问：蝉蜕是否该补充在途项/宣告完成，属用户裁决，见 reports）
- [x] 1.7 `src/i18n.ts`：`home.research.papers` 键删除（中英），两处首页不再渲染论文句；
      「小模型微调服务」保留

## 2. 内容完整性契约与检查

- [x] 2.1 新增 `scripts/check-content-integrity.mjs`：扫描 `src/**`（默认），命中退役标识
      即非零退出，并打印文件、行号与命中的标识
- [x] 2.2 脚本内维护退役标识清单常量：`FindDataOfficial`、`craw.finddatatech.cloud`、`Scrapyd`；
      `src/content/repos/`（构建期 GitHub 镜像）明确排除，站外残留走上游修复
- [x] 2.3 `package.json` 增加 `content:check`，并前置进 `build`
- [x] 2.4 反向验证：自检 4/4 通过；用 `git show HEAD:` 取改前文件重放 → 精确命中 4 处
      （FindDataOfficial ×2、Scrapyd ×2）退出码 1；修复后现树 93 文件 0 命中。
      全程输出见 `reports/verification.md`

## 3. 仓库描述改写稿（交付物，GitHub 侧由维护者执行）

- [x] 3.1 起草 12 个公开仓的描述：去掉 `[wire]`/`[facet]`/`[base]`/`[constellation]`
      内部前缀（改由 `/repos` 页面按线分组表达），语言统一英文 → `repo-descriptions.md`
- [x] 3.2 核对每条描述与仓库现状一致（重点改写 `fd-official-web`、`law-bench`，
      其余保留原文去前缀）
- [x] 3.3 站外同类残留清单已列：`fd-vertical-packs` README 的 `craw.finddatatech.cloud`、
      `fd-open-data-protocol/pyproject.toml` 的 `FindDataOfficial`、npm scope 拼写
- [ ] 3.4 落地 GitHub（维护者执行）：更新 12 条 description，记录执行时间与操作人
      **（等用户授权；执行人可用 `gh`——已登录 scs001，有 repo scope）**

## 4. 验证

- [x] 4.1 `openspec validate official-web-content-truth --strict` 通过
- [x] 4.2 `npm run build` 通过（102 页，含 content:check 前置门）；`npm run content:check` 通过
- [x] 4.3 本地核对：旗舰页数字 == 首页统计（452/53，双语）；构建产物 grep 旧数字 0 残留；
      content-integrity 全绿即全站无 `FindDataOfficial`；`law-bench` 新入口探针 200
- [ ] 4.4 上线（Jenkins 构建 → ArgoCD 滚动）后，中英对照截图与探针结果归档到
      `reports/`
- [x] 4.5 「站点之外同类残留」与「npm scope 重新发布」已登记在 `repo-descriptions.md`