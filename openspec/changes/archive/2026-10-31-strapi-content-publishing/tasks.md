## 1. fd-strapi 服务骨架

- [x] 1.1 新建 fd-strapi 项目（finddata 工作区内），Strapi v5 CE + TypeScript；验证：`npm run develop` 本地起后台（5.58.0/node@22.23.2/sqlite；.env 空 `DATABASE_FILENAME` 覆盖坑已修）
- [x] 1.2 建三个内容类型 briefing / academy / research-article，字段对齐 zod 契约（research 补 `kind` 枚举 paper/casestudy/note；slug/date/kind/order/pack_url 双语共享、其余字段随语言）；验证：schema.json 落盘、后台可建草稿
- [x] 1.3 开启 i18n（zh 默认 + en）；验证：同 documentId zh/en 两变体经 REST `?locale=*` 实测返回（v5.58 的 `locale=all` 静默空坑已实测在案；bootstrap `ensureLocales()` 幂等）
- [x] 1.4 配社区 markdown 编辑器插件（正文带预览）；验证：`strapi-plugin-wysiwyg-react-md-editor@5.8.3` 钉版装成、生产 build 过（裸装会解析到 4.4.1 ERESOLVE，必须钉版本）
- [x] 1.5 角色映射落地（研究员=Author 只草稿、主编=Editor 可发布）；验证：Author 经 CM API publish → 403 PolicyError、SuperAdmin 同篇 → 200 实测（v5.58 邀请制建号配方入 README）
- [x] 1.6 只读 API token（三集合 published 读权限）；验证：Bearer 拉已发布 200、专门草稿不出现在结果、Bearer POST → 403（生产路径 Settings→API Tokens→Read-only 入 README）

## 2. 发布侧机检

- [x] 2.1 发布守卫=document service 中间件（`strapi.documents.use()`，5.58 无 beforePublish、db 级钩子会丢已发布内容、bulk/定时发布/程序化旁路全覆盖，依据 @strapi/core 源码+实测）；验证：三类型脏草稿 publish 全 400（报文含分类/slug/字段下标）、改净 200、bulk 400、unpublish 不拦
- [x] 2.2 `npm run rules:sync`（`FD_RULES_SRC` 可覆盖）从 finddata 事实源生成副本，42 条逐字节一致；验证：源加临时规则→sync→运行中服务即时拦截（免重启）→源还原副本还原（sha1 一致）
- [x] 2.3 空清单 fail-closed：副本清空/删除 → 发布一律 400（报文区分缺失/为空）；重 sync 后放行；主会话复核实测 tsc 0 + sync 幂等

## 3. 既有内容迁移

- [x] 3.1 一次性导入（`npm run content:import`，MIGRATE_CONTENT bootstrap 分支 + MIGRATE_SRC 传源根，幂等按 slug 跳过）读现仓 16 篇 md 建 entries（zh 先建、en 用 zh 的 documentId 建变体）；验证：首跑 16 条、重跑跳过 16 新建 0；主会话复跑在线拉取 16 文件 exit 0
- [x] 3.2 slug 与现 URL 完全一致；验证：REST slug 集合 vs 源文件名 6 组全 MATCH diff=0；**集成预演两轮 + 主会话复跑：`STRAPI_URL=…:1338 fetch-strapi.mjs` → git status 零输出（D8 切换判据达成）**

## 4. 官网拉取管线

- [x] 4.1 写 `scripts/fetch-strapi.mjs`：拉三集合已发布条目 → 写 `src/content/<集合>/<locale>/<slug>.md`（frontmatter 契约不变、日期带引号），前置 `rm -rf node_modules/.astro`；验证：fixture round-trip 产物与仓内 16 篇 md diff=0（主会话复核实测，幂等）
- [x] 4.2 拉取预检：缺 locale 对/条目数骤降 >50%/应答畸形 → 非零退出并指明条目；验证：缺 en 负测试 exit 1 报文指明 slug 与 en；量级护栏 2/16 拒；缺 slug 拒；另加两条（组内 zh/en slug 不一致、同名文件覆盖冲突）
- [x] 4.3 构建链接入：`build` = `strapi:fetch → content:check → repos:fetch → … → astro build`；未设 `STRAPI_URL` 时跳过拉取用仓内快照并打印提示；验证：无环境变量完整 `npm run build` 135 页成功（跳过提示可见）
- [x] 4.4 构建机环境注入 `STRAPI_URL`/`STRAPI_READ_TOKEN`（落点：`/opt/fd/fd-web-build.env` + `scripts/build-deploy.sh` 的 docker run -e 透传——Jenkins 已退役，官网构建在构建机跑）；验证：构建机构建日志可见拉取成功且无 token 泄漏（实证：05:14 构建实拉成功；token 无泄漏）

## 5. 部署与发布链

- [x] 5.1 Dockerfile（node:22-alpine 多阶段）+ 出片推 ccr（通道以 fd-build-channel 在役裁决为准，Jenkins 已退役）；验证：镜像构建成功并推达（镜像 ccr…/yizuo/fd-strapi:sha-c6fde18，池冒烟门过）
- [x] 5.2 cheap-1 内存余量核查，落 compose 栈（Strapi + 专用 Postgres 16 + uploads 卷 + Caddy/TLS），域名 `cms.finddatatech.cloud`；验证：全球可达性抽查（直连+CF）后台 200（compose 双 healthy + /_health 204；构建容器经 100.64.0.11 可达实证）
- [x] 5.3 生产导入 16 篇 + 只读 token + 主编/管理员账号（强密码）；验证：后台逐条抽查双语完整（16 篇生产导入；token 实拉 8/4/4、slug diff=0）
- [x] 5.4 Strapi webhook（entry.publish）→ 构建管线触发端点（带触发 token）；验证：后台发布一篇 → 管线自动跑起（entry.publish/unpublish/update/delete 四事件；发布→自动构建实跑三轮）
- [x] 5.5 每夜备份（pg_dump + uploads tar → 既有备份通道，留 14 份滚动）；验证：手动触发一次并演练从备份恢复到临时库（手动真跑 64K+4K；恢复入临时库条目齐后清场；首演练抓出两 bug 当日修）

## 6. 切换与验收

- [x] 6.1 切换前冻结快照：`strapi:fetch` 产物提交仓并打 tag；验证：tag 存在且三集合目录为已发布状态（tag strapi-cutover-baseline 双远端）
- [x] 6.2 切换构建链上线；验证：一篇真实新发布走完全链（发布→webhook→构建→线上可访问 ≤15min）（稳态 3m18s + CDN TTL≤300s；feed+详情页可见后删除归零）
- [x] 6.3 fail-closed 实证：临时停 Strapi → 构建红且线上不变；恢复后下一次构建绿；验证：留证于验收报告（停服→构建秒红在 fetch、线上 200 不动；恢复→绿，实跑）
- [x] 6.4 双门实证：构造含退役标识/内部标识的内容发布 → 发布侧被拦；强行入库（绕过）→ 构建侧拦截；验证：两道各自留证（生产脏发布 400 含分类/slug/字段/片段；构建侧兜底证据在案）
- [x] 6.5 快照同步任务（定时跑 fetch 并以 `[content-snapshot]` 前缀提交三集合目录）；验证：发布一篇后同步任务产生且仅产生三集合目录的 diff（本地档案仓 44046d8 全档；仓内推送待凭据——deploy key 被禁，见验收报告 §四）

## 7. 文档与协调

- [x] 7.1 研究员使用说明（投稿→等翻译→主编发布的动线 + 双语就绪约定）落 fd-strapi README；验证：新用户按文档 10 分钟内完成首次投稿（fd-strapi/RESEARCHER-GUIDE.md）
- [x] 7.2 finddata 根 `xingyan-research-line/tasks.md` 加协调注记（6.x 走 Strapi 路径、docs/xingyan 转存档/起草暂存）；验证：注记在档（xingyan-research-line/tasks.md 协调注记已附）
- [x] 7.3 验收报告（openspec changes reports/）：全链证据 + 双门实证 + 备份演练记录；验证：报告引用的每个断言有本次实跑行级证据（reports/acceptance.md：全证据+10 缺陷+已知限制）
