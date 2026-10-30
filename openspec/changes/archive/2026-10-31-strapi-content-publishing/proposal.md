## Why

星研线（内参/学院/研究）的编辑者即将扩展为分散在全球的研究员：git 工作流（代码托管账号、markdown、frontmatter、口头追踪审稿状态）对他们是门槛，对组织是无法落地的发布闸。需要一个浏览器化的投稿-评审-发布面，让研究员写草稿、主编点发布，而站点保持纯静态、既有机检门一道不丢。用户已裁决（2026-10-16）：现在就做，文章直接用 Strapi 发布和更新。

## What Changes

- 新增自托管 Strapi（v5 社区版）作为**编辑性内容的唯一投稿与发布面**：内参（briefings）、学院（academy）、研究（research）三个集合的内容改由 Strapi 托管（zh/en 双语、角色分工、媒体库、草稿/发布状态）。
- 官网构建链新增 `strapi:fetch` 步骤：构建期从 Strapi REST API 拉取已发布内容，写成现有 `src/content/<集合>/<locale>/<slug>.md` 文件——glob loader 与全部文件级门（retired 标识、双语成对、schema 校验）不改一行逻辑，天然覆盖拉取产物。
- 发布即上线：Strapi 发布事件 webhook 触发现有构建管线（在 push 触发与 ≥6h 定时触发之外新增第三触发源）；发布到上线延迟为分钟级（一次构建）。
- 机检门前移：Strapi 侧发布生命周期钩子跑内部标识符检查（研究员点发布当场被拦、当场能改）；构建期同一套门对拉取内容再跑一遍，fail-closed。
- git 从"印刷厂"降级为"备份档案"：三集合的仓内 md 变为生成的快照（本地开发与灾难恢复用），每晚 pg_dump + 媒体备份，快照定期回提交仓作为审计档案。
- 范围围栏：apps / docs / releases / roadmap 等工程与营销集合**不迁**，仍走 git；本变更只圈三个编辑性集合。

## Capabilities

### New Capabilities

- `strapi-content-publishing`: Strapi 作为编辑性内容（内参/学院/研究）的唯一投稿与发布面——角色分工（作者只草稿、编辑才发布）、zh/en 双语条目与成对约束、发布前内部标识符拦截、构建期拉取与文件级门覆盖、fail-closed、发布触发上线、备份与快照档案、本地无 Strapi 开发。

### Modified Capabilities

- `auto-deploy`: 构建管线的触发源在 push 与定时之外新增 Strapi 发布 webhook；构建流程新增 Strapi 拉取步骤（先于内容检查）；构建环境注入的凭据集合新增 Strapi 只读 token；Strapi 不可达时构建失败可见、线上保持上一次良好部署。

## Impact

- **fd-official-web**：`package.json` 构建链（新增 `strapi:fetch` 并前置）、新增 `scripts/fetch-strapi.mjs`、三集合 `src/content/**` 由手写改为生成快照、构建期新增 `STRAPI_URL`/`STRAPI_READ_TOKEN` 注入、`node_modules/.astro` 缓存清理。
- **新服务 fd-strapi**（新项目目录，finddata 工作区内）：Strapi v5 CE 应用（三内容类型 + i18n zh/en + 角色约定 + 发布前机检钩子 + markdown 正文）、专用 Postgres 与媒体卷、Dockerfile、compose 部署清单、Jenkins 构建出片。
- **基础设施**：cheap-1（或按余量另选节点）compose 栈承载 Strapi + Postgres，Cloudflare DNS 新增 cms 子域，节点侧每夜备份任务；Strapi → 构建管线的 webhook。
- **相邻变更协调**：finddata 根 openspec 的未归档变更 `xingyan-research-line`（其 6.x 上线与验收任务将在切换后走 Strapi 路径执行）；`docs/xingyan/` 三内容目录在切换后转为存档/AI 起草暂存区。
- **不迁移**：apps / docs / releases / roadmap 集合、五线门面、指标与数据模块构建，全部保持现状。
