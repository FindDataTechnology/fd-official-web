## Context

官网现状：Astro 7 纯静态（`output: static`，无 adapter），内容集合走 glob loader 读 `src/content/<集合>/<locale>/<slug>.md`；构建链 `content:check → repos:fetch → indicators:fetch → calibers:fetch → data-modules:build → astro build`，产物 `dist/` 部署到腾讯服务器；auto-deploy 既有触发源为 push + ≥6h 定时。星研三集合（briefings 8 / academy 4 / research 4 md）上周刚以 git 为 canonical 落地，双语成对门（`src/lib/twins.ts`）与退役标识检查（`scripts/check-content-integrity.mjs`）都是文件级脚本；finddata 根的 `docs/xingyan/scripts/sanitize_check.py` 与 `internal-identifiers.txt` 是内部标识符规则的现成事实源。既有坑：YAML 日期必须引号（否则 zod 收到 Date 对象构建失败）；集合目录内容变化时须清 `node_modules/.astro`（data-store 残留）。

约束：禁止本机/节点 docker build（出片走 Jenkins）；cheap 集群禁放 scraw 镜像（Strapi 非 scraw，不受限）；Strapi 社区版无自定义角色与 SSO（默认 Author/Editor/Super Admin 三档够用）。

## Goals / Non-Goals

**Goals:**

- 研究员（全球、非 git 用户）浏览器投稿 → 主编发布 → 分钟级上线，全链不碰命令行。
- 站点保持纯静态 nginx 产物，构建产物对 Strapi 零运行时依赖。
- 既有文件级门（退役标识/schema/双语成对/内部标识符）对 CMS 内容原样生效，且有发布侧前置拦截改善体验。
- 已发布内容有灾备（每夜备份）与审计档案（仓内 md 快照）。

**Non-Goals:**

- 不迁 apps/docs/releases/roadmap 等工程营销集合（仍走 git）。
- 不做 SSR/ISR——发布延迟以"一次构建"为接受上限（分钟级）。
- 不做 Strapi 之外的第二内容消费端 API 设计（现 feed JSON 已够）；不做全文检索。
- 不引入自定义角色、SSO、评审工作流插件（社区版默认三档角色即映射研究员/主编/管理员）。
- 媒体 v0 走本地卷，不接 S3/RustFS（图片量小，先简单）。

## Decisions

### D1: 拉取写成文件，不改 loader（pull-to-files）

构建期 `scripts/fetch-strapi.mjs` 调 Strapi REST（`/api/{briefings,academy,research}?locale=all&status=published`，Bearer 只读 token），把已发布条目写成与今天完全同构的 `src/content/<集合>/<locale>/<slug>.md`（frontmatter 契约不变、日期带引号），随后 glob loader、zod schema、twins 门、退役标识检查**一行不改**地跑在拉取产物上。
替代方案：Astro Content Layer 自定义 API loader 直连 Strapi——被否，门都要改成对内存对象跑、时序插不进 content:check 之前，收益只有省一次写盘。

### D2: 构建链顺序与 fail-closed

`build` 改为 `strapi:fetch → content:check → repos:fetch → … → astro build`；`strapi:fetch` 内先 `rm -rf node_modules/.astro`（既有坑），任何失败（不可达/401/应答畸形/条目数骤降 >50%）非零退出——CI 里 fail-closed，绝不静默用旧快照上线（静默回退会让研究员的发布无声丢失，比构建红更糟）。线上安全由"构建失败=不部署、线上保持上次产物"保证。
本地开发：未设 `STRAPI_URL` 时跳过拉取、用仓内快照并打印提示（研究/前端离线可开发）。

### D3: 正文体存 markdown 源，不用 Strapi Blocks 富文本

Strapi v5 默认 Blocks 编辑器产出专有 JSON，与现有 md 渲染管线和 AI 起草（直接产 md）都不兼容。正文用长文本字段存 markdown 源，后台先配社区 markdown 编辑器插件（带预览）；研究员可直接粘贴 md，AI 起草稿也可经 REST 直投为草稿。发布产物即 md，站点渲染链零改动。

### D4: 双语用 Strapi i18n，成对门双保险

内容类型开 i18n（zh 默认 + en），一条文档两个 locale 各自草稿/发布。Strapi 允许只发一个 locale，所以成对约束放两处：`fetch-strapi.mjs` 拉取后先做友好预检（缺对→非零退出并指明条目与缺失语言），构建期 `twins` 门继续兜底。翻译责任显式化：locale 字段让"另一语言谁写"变成看得见的空位。

### D5: 发布侧机检 = Strapi 生命周期钩子，规则清单单一事实源

`fd-strapi` 内实现发布钩子（beforePublish/beforeCreate 发布路径），加载 `internal-identifiers` 规则清单做与 `docs/xingyan/scripts/sanitize_check.py` 同类的检查，命中即抛错阻止发布并提示类别。规则清单事实源仍是 finddata 的 `internal-identifiers.txt`；fd-strapi 构建时从该文件生成打包副本（构建脚本同步，两处头部注释互指）。构建期兜底检查读 finddata 原件——同一清单，两道门。

### D6: 部署形态 = cheap-1 compose 栈 + Jenkins 出片

Strapi（自定义镜像：Node 22 + fd-strapi 应用）+ 专用 Postgres 16 容器 + uploads 卷，compose 栈落 cheap-1（与 mcp.finddatatech.cloud 同款模式：compose + Caddy/Cloudflare，域名 `cms.finddatatech.cloud`）。镜像出片走当前在役通道（**Jenkins 已于 2026-10-11 退役，不适用**；apply 波 3 先用 fd-build-channel 盘点裁决——候选：GHA 直推 ccr / 快照仓通道），节点 compose pull 滚版——遵守"禁止本机/节点 docker build"。另注：官网自身部署是构建机 `scripts/build-deploy.sh`（docker run 构建 + rsync dist 到 web 机），非镜像滚版；Strapi 栈是新增的独立部署面。
替代方案：k8s/ArgoCD——被否，单个有状态小服务用 GitOps 是重炮打蚊子，compose 与既有网关运维面一致。apply 时先核 cheap-1 内存余量（registry + mcp 网关在役），不足则改落 tencent 节点，决策不影响其余设计。

### D7: 备份与快照档案

- 每夜（cheap-1 cron）：`pg_dump` strapi 库 + uploads 目录 tar → 推既有备份通道（fd_backups 路径），保留 14 份滚动。
- 快照档案：一个轻量同步任务（Jenkins 定时或手动触发）跑 `strapi:fetch` 并把生成的 md 提交回 fd-official-web 仓（`src/content/**` 三集合目录）——仓里永远有"当前已发布内容"的 md 快照，供本地开发、灾后核对与审计。构建拉取会覆写工作树，属预期脏区，禁止手工提交（快照只由同步任务提交）。

### D8: 迁移与切换（一次性、可回滚）

`fd-strapi` 内置一次性导入脚本（entityService + locale 参数建双语对，避免 REST 手工对 documentId），读现仓 16 篇 md 建entries。切换判据：拉取产物与现站构建输出 diff=0（同一内容两种来源等价）。回滚策略：切换前打 git tag；若 Strapi 路径出问题，revert 构建链 commit 即回到 git 直读快照（快照在切换时刻已冻结为最新已发布状态），Strapi 侧数据不动。

### D9: 与未归档变更 xingyan-research-line 的协调

该变更（finddata 根）的 6.x 上线与验收任务在切换后执行时走 Strapi 路径；其 `docs/xingyan/` 三内容目录在切换后转为存档/AI 起草暂存（canonical 移至 Strapi），模板与 sanitize 脚本继续用于 AI 起草侧。在其 tasks.md 加协调注记，不改其 spec。

### D10: webhook 触发管线

Strapi 内建 webhook（entry.publish 事件）POST 到构建机上的触发端点（带触发 token；Jenkins 已退役，构建机跑的是 `scripts/build-deploy.sh`——触发端点用构建机上的一个极简 webhook 接收器（compose 里加一个 20 行级小容器或 Caddy 路由到本地脚本），校验 token 后调起 build-deploy.sh；apply 波 3 上机盘点构建机现状后落地）。漏发由 ≥6h 定时兜底（spec 已列）。管理员账号 v0 强密码即可，后台路径仅 Cloudflare 暴露，后续可加 Cloudflare Access 收紧（非本变更范围）。

## Risks / Trade-offs

- [构建新增对 Strapi 在线的依赖] → fail-closed + 定时兜底 + 线上永不因 CMS 故障退化；Strapi 挂只影响"发新文"，不影响线上的可用性与既有内容。
- [规则清单双副本漂移（D5）] → fd-strapi 构建脚本从 finddata 原件生成副本，不手改；构建期门读原件兜底。
- [研究员只写一种语言导致构建反复红] → 拉取预检的错误信息直接指明条目与缺的语言；角色约定里写明"发布前两语言就绪"，主编发布前可见双 locale 状态。
- [快照同步任务提交产生噪音 diff] → 同步任务用固定 commit message 前缀 `[content-snapshot]`，仅覆盖三集合目录；并发会话注意勿手工提交该脏区（既有并发回滚坑）。
- [cheap-1 余量不足] → apply 第一步先核内存，不足改落 tencent 节点（D6）。
- [Strapi 大版本升级破坏内容模型] → 每夜备份 + 仓内 md 快照双保险；升级前先备份、快照可重建内容类型。
- [发布 webhook 携带的条目未过双语预检] → 构建在拉取预检处失败，红构建即信号，定时不会把半双语内容带上线（门在构建内，不在 webhook 内）。

## Migration Plan

1. 建 fd-strapi（内容类型/i18n/钩子/导入脚本），本地容器验证（本地验证不违反出片纪律——不推仓不部署）。
2. Jenkins 出片 → cheap-1 起栈 → DNS `cms.finddatatech.cloud` 通 → 导入 16 篇 → 管理后台逐条抽查双语与字段。
3. fd-official-web：加 fetch 脚本与构建链改动（此时 Strapi 已有全量内容），跑 `strapi:fetch`，比对拉取产物与仓内 md diff=0。
4. 打 tag → 切构建链（含 Jenkins 注入 token、Strapi webhook 配置）→ 线上验证一篇真实发布走完全链（发布→webhook→构建→上线≤15min）。
5. 回滚：revert 构建链 commit 即回 git 快照路径；Strapi 栈保留。

## Open Questions

- 研究员账号的首批名单与开户节奏（apply 末尾交付使用说明，账号本身由主编在后台开）。
- 学院 pack 互指链接回填（xingyan-research-line 3.2）在 Strapi 侧如何编辑 pack_url 字段——字段已建模，编辑动线在使用说明里写清即可。
