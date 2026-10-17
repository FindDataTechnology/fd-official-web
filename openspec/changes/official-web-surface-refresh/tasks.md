## 1. 管道重构（注册表，先于任何新内容类型）

- [x] 1.1 把 `scripts/fetch-strapi.mjs` 中按 `kind` 硬编码的 `COLLECTIONS`/`STRING_FIELDS`/`OPTIONAL_FIELDS`/`toMarkdown` 分支收敛为单一声明式注册表（每行声明 api/dir/kind/required/optional/serialize/twin），既有三种类型的序列化行为保持不变。验证：`node scripts/fetch-strapi.mjs --fixture scripts/fixtures/strapi` 后 `git status` 干净（fixture 字节契约）。（已实测：16 文件写入、`src/content` 零变动；`STRING_FIELDS`/`OPTIONAL_FIELDS`/`toMarkdown` 三个旧表全删，改为行内 `required`/`optional`/`serialize`/`validate`）
- [x] 1.2 把 `src/lib/xingyan.ts` 的逐集合加载/排序/twins 逻辑改为按注册表循环，`loadXingyanSurface` 返回值结构不变。验证：`npm run build` 通过且 `git status` 无内容文件变动；`--self-test` 门禁仍过。（实现取「机制抽取」而非字面循环：三集合数据类型不同（课程按 order、feed 按 date），抽出 `loadPaired(collection, kindLabel, compare)` 泛型函数承载 加载→分语言→twins 门→排序 同一不变量，保留类型安全；137 页构建过、内容零漂移、内容门禁自测过）
- [x] 1.3 为注册表的 `twin: 'fields'` 策略补齐 fixture 用例与校验路径（与 `'locale'` 走同一套必填/枚举检查）。验证：新增 fixture 用例后 `--fixture` 仍字节干净，且故意制造缺字段时构建点名失败。（实现为 `fetch-strapi.mjs --self-test`：9 例覆盖两种策略的成对/必填/日期/同 slug 冲突与路径形状，全过。过程中三条用例的期望值被真实行为纠正——paired 缺 en 与 slug 冲突会分别按 doc/locale 独立计数，说明校验确实在逐条点名而非笼统报错）

## 2. CMS：update 内容类型

- [x] 2.1 在 fd-strapi 新增 `update` 内容类型：`slug`（uid，非本地化）、`date`（date，非本地化）、`line`（枚举 base/lex/wire/facet/constellation/xingyan，非本地化）、`kind`（枚举 release/feature/fix/note，非本地化）、`title_zh`/`title_en`（string 必填）、`summary_zh`/`summary_en`（text 必填）、`version`（string 可选）、`url`（string 可选）。验证：本地 schema 合法、重建后后台可新建该类型条目。 （`src/api/update/` 四件套：schema + routes/controllers/services；`pluginOptions.i18n.localized=false`——单条目双语字段不走 locale 配对）
- [x] 2.2 重建 fd-strapi 镜像并滚动发布到 cheap-1，确认既有三种内容类型读写不受影响。验证：`GET /api/updates?locale=*` 返回 200 且 `courses/briefings/research-articles` 三接口仍 200；官网拉取链仍拉到 8 个文件。 （出片 sha-8032497（源 7164c3e）经 testaction003 构建 5m6s → relay 回灌 ccr → cheap-1 滚动；`/api/updates?locale=*` 200；courses/briefings/research-articles 三接口仍 200）
- [x] 2.3 把现有 17 条原始 commit 记录整理为双语动态种子内容并在 CMS 发布（合并同源条目、改写为访客可读标题与摘要，内部流水不进 feed）。验证：CMS 中已发布条目数 ≥5 且每条四个语言字段齐全；`/updates` 构建后无 `ci(`/`chore(` 原文。 （6 条双语种子：自助注册/桌面 v1.3.1/MCP 鉴权加固/独立分支/行业源批次二/官网登录入口；原始 commit 的 `ci(`/`chore(` 全部改写为访客可读标题）

## 3. 官网：updates 页与管道退役

- [x] 3.1 `src/content.config.ts` 新增 `updates` 集合 schema（zod：四个语言字段必填、`line`/`kind` 枚举、`date` 正则），`fetch-strapi.mjs` 注册表新增该集合（`twin: 'fields'`）。验证：`npm run strapi:fetch` 后 `src/content/updates/` 出现文件且 zod 校验通过。 （zod 四语言字段必填 + line/kind 枚举 + date 正则；注册表 `twin:'fields'` 行；在线拉取实测 26 文件含 updates 6 条）
- [x] 3.2 重做 `/updates`、`/zh/updates`：日志栅格（日期左栏 + 竖细线）、月份分隔、产品线过滤条（客户端即时过滤 + URL 参数镜像）、按线标显示 `LineMark`。验证：本地构建后页面含月份分隔与线过滤控件；`?line=base` 打开时预置过滤；禁用 JS 时全量列表仍可见。 （日志栅格 62px 日期栏 + 月份分隔 + 线过滤条；`?line=base` 预置过滤；无 JS 时全量列表仍可见——过滤只 hidden 行）
- [x] 3.3 从 `scripts/fetch-repos.mjs` 移除 updates 抓取逻辑并删除 `src/data/updates.json`（在 3.2 验证通过后执行）。验证：构建日志不再出现 `[updates]` 行；`grep -r updates.json src/ scripts/` 无引用；构建仍通过。 （fetch-repos.mjs 移除 parseChangelog/fetchUpdates/内部前缀表/两个上限常量与写盘块；`src/data/updates.json` 已删；全仓 grep 无残留引用）

## 4. 官网：星研内容架构（索引页 + RSS）

- [x] 4.1 新增三栏索引页 `/research/academy`、`/research/briefings`、`/research/articles` 与 `/zh` 对应（只渲染元数据，不内联正文）。验证：构建后四个新路由 200，页面不含条目正文（抽一条正文首句 grep 不到）。 （六个索引页：academy/briefings/articles × zh/en；只渲染元数据，正文首句 grep 不到）
- [x] 4.2 索引页接入分类过滤：学院按 `level`、内参按 `tags`、研究按 `kind`+`tags`，过滤状态镜像到 URL 参数。验证：带参打开预置过滤；点击过滤项后列表变化；URL 反映当前值。 （学院按 level 分组、内参按 tags、研究按 kind+tags；过滤镜像到 ?tag=/?kind=；URL 预置生效）
- [x] 4.3 新增 `/research/feed.xml`（三栏合并 RSS：标题、日期、详情页绝对 URL），`/briefings.json` 契约不变。验证：feed 通过 XML 解析器校验；条目链接为绝对 URL；`/briefings.json` 响应结构与改动前一致。 （`/research/feed.xml` XML 解析通过、6 条、绝对 URL；`/briefings.json` 未改动）
- [ ] 4.4 落地页改为「精选 + 查看全部」：课程全量（按层分组）、内参与研究各取最新 5 条，每栏给出指向索引页的入口。验证：构造超过 5 条的内参 fixture 后落地页仍只渲染 5 条且出现「查看全部」。

## 5. 官网：星研页重设计（impeccable）

- [ ] 5.1 按 impeccable 流程跑 `context` 载入 PRODUCT/DESIGN 与 surface brief，走 new-work playbook 产出设计计划（token 复用、布局概念、签名单元素、ASCII 线框），在写代码前完成自评与修订。验证：设计计划落档（change 目录下）且明确列出复用/新增的 token。
- [ ] 5.2 实现两栏观测台布局：学院主仪表（`use` 层 01/02/03 编号 + 子午线节点、`build` 层单列并标注前置）+ 编辑内容侧栏（内参/研究信号日志，mono 日期 + 标签 + hairline 分隔）。验证：本地构建后 `/research` 与 `/zh/research` 分组正确，`use` 组不含 `build` 课，移动端纵向堆叠无溢出。
- [ ] 5.3 浏览器批量验收一轮（桌面 + 移动同时截图），按 impeccable 的有界修复原则一次修完发现项，最多再确认一轮后停止。验证：截图留存，修复项清单关闭。

## 6. 官网：/products 总览页

- [ ] 6.1 `/products`、`/zh/products` 改为五线总览（阶梯叙事 + 五线卡 + `LineTabs`），`/products/base` 保持现有落地页不变。验证：两页 HTML 主内容不同（总览 vs 落地）；`/products` 上能 grep 到阶梯叙事与五个线卡链接。
- [ ] 6.2 核对总览页的 title/description 元数据与 `/products/base` 不重复。验证：两页 `<title>` 与 meta description 均不同且各自自描述。

## 7. 端到端验收

- [ ] 7.1 全链构建：`npm run content:check`、`npm run build` 均退出 0；双语成对、语言判据、内容完整性三门同时生效。验证：命令退出码 0，构建产物页数符合预期。
- [ ] 7.2 生产抽查：`/research` 分组与精选正确、三栏索引页可达且过滤可用、`/updates` 显示 CMS 内容且可按线过滤、`/research/feed.xml` 可被解析、`/products` 为总览且 `/products/base` 仍为落地页。验证：线上逐项 curl + HTML 断言留证。
- [ ] 7.3 CMS 发布闭环：在 CMS 新建并发布一条动态，确认 webhook 触发重建且该条出现在线上 `/updates`；随后下架并确认消失。验证：两次发布各留构建日志与线上截图。
- [ ] 7.4 诊断并修复构建期 `[repos] fetch failed (HTTP 403)`（token 失效或限流），使 `/repos` 数据不再冻结在 2026-10-08。验证：构建日志出现 `[repos] fetched N repos` 且 `src/data/repos.json` 的 `generated_at` 为当日。
