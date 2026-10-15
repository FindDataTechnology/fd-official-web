## 1. fd-strapi 服务骨架

- [ ] 1.1 新建 fd-strapi 项目（finddata 工作区内），Strapi v5 CE + TypeScript；验证：`npm run develop` 本地起后台
- [ ] 1.2 建三个内容类型 briefing / academy / research，字段对齐现 frontmatter 契约（title/summary/date/tags/sources；academy 另有 order/pack_url），正文为 markdown 长文本；验证：后台可建草稿
- [ ] 1.3 开启 i18n（zh 默认 + en），三类型启用 localization；验证：同一条目可维护两语言版本
- [ ] 1.4 配社区 markdown 编辑器插件（正文带预览）；验证：后台粘贴 md 可见预览
- [ ] 1.5 角色映射落地（研究员=Author 只草稿、主编=Editor 可发布）；验证：Author 账号点发布被拒、Editor 可发布
- [ ] 1.6 只读 API token（三集合 published 读权限）；验证：REST 带 token 可拉已发布、拉不到草稿

## 2. 发布侧机检

- [ ] 2.1 实现发布生命周期钩子：加载规则清单，命中内部标识即阻止发布并提示类别；验证：含内部节点坐标的草稿发布被拦、移除后可过
- [ ] 2.2 构建脚本从 finddata `docs/xingyan/scripts/internal-identifiers.txt` 生成打包副本（两处头部注释互指）；验证：改原件重新生成，副本同步
- [ ] 2.3 空清单 fail-closed（清单缺失/为空时钩子拒绝放行发布）；验证：清空清单后发布一律被拦

## 3. 既有内容迁移

- [ ] 3.1 一次性导入脚本（entityService + locale 建双语对）读 fd-official-web 现仓 16 篇 md 建 entries；验证：后台逐集合抽查条目数 zh/en 各 8/4/4 且字段与原文一致
- [ ] 3.2 slug 与现 URL 完全一致（详情页链接不断）；验证：导出条目 slug 清单与仓内文件名 diff=0

## 4. 官网拉取管线

- [x] 4.1 写 `scripts/fetch-strapi.mjs`：拉三集合已发布条目 → 写 `src/content/<集合>/<locale>/<slug>.md`（frontmatter 契约不变、日期带引号），前置 `rm -rf node_modules/.astro`；验证：fixture round-trip 产物与仓内 16 篇 md diff=0（主会话复核实测，幂等）
- [x] 4.2 拉取预检：缺 locale 对/条目数骤降 >50%/应答畸形 → 非零退出并指明条目；验证：缺 en 负测试 exit 1 报文指明 slug 与 en；量级护栏 2/16 拒；缺 slug 拒；另加两条（组内 zh/en slug 不一致、同名文件覆盖冲突）
- [x] 4.3 构建链接入：`build` = `strapi:fetch → content:check → repos:fetch → … → astro build`；未设 `STRAPI_URL` 时跳过拉取用仓内快照并打印提示；验证：无环境变量完整 `npm run build` 135 页成功（跳过提示可见）
- [ ] 4.4 构建机环境注入 `STRAPI_URL`/`STRAPI_READ_TOKEN`（落点：`/opt/fd/fd-web-build.env` + `scripts/build-deploy.sh` 的 docker run -e 透传——Jenkins 已退役，官网构建在构建机跑）；验证：构建机构建日志可见拉取成功且无 token 泄漏

## 5. 部署与发布链

- [ ] 5.1 Dockerfile（node:22-alpine 多阶段）+ 出片推 ccr（通道以 fd-build-channel 在役裁决为准，Jenkins 已退役）；验证：镜像构建成功并推达
- [ ] 5.2 cheap-1 内存余量核查，落 compose 栈（Strapi + 专用 Postgres 16 + uploads 卷 + Caddy/TLS），域名 `cms.finddatatech.cloud`；验证：全球可达性抽查（直连+CF）后台 200
- [ ] 5.3 生产导入 16 篇 + 只读 token + 主编/管理员账号（强密码）；验证：后台逐条抽查双语完整
- [ ] 5.4 Strapi webhook（entry.publish）→ 构建管线触发端点（带触发 token）；验证：后台发布一篇 → 管线自动跑起
- [ ] 5.5 每夜备份（pg_dump + uploads tar → 既有备份通道，留 14 份滚动）；验证：手动触发一次并演练从备份恢复到临时库

## 6. 切换与验收

- [ ] 6.1 切换前冻结快照：`strapi:fetch` 产物提交仓并打 tag；验证：tag 存在且三集合目录为已发布状态
- [ ] 6.2 切换构建链上线；验证：一篇真实新发布走完全链（发布→webhook→构建→线上可访问 ≤15min）
- [ ] 6.3 fail-closed 实证：临时停 Strapi → 构建红且线上不变；恢复后下一次构建绿；验证：留证于验收报告
- [ ] 6.4 双门实证：构造含退役标识/内部标识的内容发布 → 发布侧被拦；强行入库（绕过）→ 构建侧拦截；验证：两道各自留证
- [ ] 6.5 快照同步任务（定时跑 fetch 并以 `[content-snapshot]` 前缀提交三集合目录）；验证：发布一篇后同步任务产生且仅产生三集合目录的 diff

## 7. 文档与协调

- [ ] 7.1 研究员使用说明（投稿→等翻译→主编发布的动线 + 双语就绪约定）落 fd-strapi README；验证：新用户按文档 10 分钟内完成首次投稿
- [ ] 7.2 finddata 根 `xingyan-research-line/tasks.md` 加协调注记（6.x 走 Strapi 路径、docs/xingyan 转存档/起草暂存）；验证：注记在档
- [ ] 7.3 验收报告（openspec changes reports/）：全链证据 + 双门实证 + 备份演练记录；验证：报告引用的每个断言有本次实跑行级证据
