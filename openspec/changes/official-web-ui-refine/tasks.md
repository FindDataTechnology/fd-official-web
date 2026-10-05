# Tasks — official-web-ui-refine

依赖：`official-web-content-truth` 先归档（同一批文件，避免冲突）。

## 1. 批次一 · token 层

- [ ] 1.1 `public/global.css` 重排配色角色：薄荷 `--accent` 为唯一品牌强调（CTA、数字、当前项）；
      蓝紫 `--accent-2` 仅用于内文链接；区块标题改用 `--text`
- [ ] 1.2 新增层级 token：`--surface-raised`（feature 卡底色）、`--border-strong`（hover / 当前项）；
      `--bg` 允许 ±5% 内微调，品牌五色不变
- [ ] 1.3 六级字号阶梯（display / h1 / h2 / body / label / mono），替换现有临时字号
- [ ] 1.4 中文标题行高 1.15 → 1.3；中英混排的字距与字重统一（只用 400 / 600 / 700）
- [ ] 1.5 间距刻度（4/8 基准）与章节节奏三档（首屏后 / 章节间 / 组内）
- [ ] 1.6 材质三级：feature 卡（启用 `DESIGN.md` 既有阴影词汇）/ 标准卡 / 行式列表
- [ ] 1.7 共享 header / footer 同步新 token；当前页高亮；`:focus-visible` 统一

## 2. 批次一 · 缺陷修复

- [ ] 2.1 `src/components/RepoCard.astro`：内容包进 `.card-main`，名称 / 描述 / 元信息各占一行；
      补 hover 反馈（对应 repo-showcase 的新要求）
- [ ] 2.2 `src/components/ProductCatalog.astro`：线内应用 ≤2 时改用整行 feature 布局；
      tab 当前项可见高亮（对应 apps-showcase 的新要求）
- [ ] 2.3 导航分组（design D5）：主导航收窄到六项（产品 / 数据 / 仓库 / 文档 / 动态 / 演示），
      `indicators`、`roadmap`、`releases` 下沉页脚分组与落地页入口；中文「项目」→「仓库」
- [ ] 2.4 手机端导航：390px 下换行或折叠后可读，无横向滚动、无标签截断
- [ ] 2.5 零 JS 校验：禁用 JS 后导航、展开与布局行为一致（下拉用原生 `<details>` 或纯 CSS）

## 3. 批次二 · 首页与身份

- [ ] 3.1 首页 hero 改公司定位（中英文案；`src/i18n.ts`、`src/pages/index.astro`、
      `src/pages/zh/index.astro`）
- [ ] 3.2 hero 下补五线阶梯（线标 + 线名 + 链接各线 tab，按数量级顺序）
- [ ] 3.3 统计降为一行次要信息；数字仍来自构建期导出
- [ ] 3.4 五个线标 inline SVG 组件（阶梯字 壹 / 识 / 柏 / 谦 / 萬，官网统一墨色），
      用于首页线卡与线页
- [ ] 3.5 `/repos` 按线分组：本地线归属表（与 `FEATURED` 同性质），缺归属进「其他」组
- [ ] 3.6 中英 OG 图（1200×630）产出 + 每页 `og:image` 与卡片元信息声明
- [ ] 3.7 拉丁显示字体自托管接入（仅标题与 kicker 的拉丁字符），并排对照定选型

## 4. 规格与文档

- [ ] 4.1 补齐 `apps-showcase` 与 `product-portal` 的 `Purpose` 占位符
      （按 openspec 指引直接更新主规格文件）
- [ ] 4.2 新增站点仓 `CONTEXT.md`（站点域词汇：线标 / 门面 / 公开面在站点的用法）
- [ ] 4.3 用 impeccable 的 `document` 流程生成站点仓 `DESIGN.md`（从新 token 层提取）

## 5. 验证与上线

- [ ] 5.1 `openspec validate official-web-ui-refine --strict` 通过
- [ ] 5.2 批次一：本地全页桌面 / 移动截图核对（对比度、溢出、折行、导航、当前项）
- [ ] 5.3 批次一上线（Jenkins → Harbor → ArgoCD）后中英对照截图归档 `reports/batch-1/`
- [ ] 5.4 批次二：同上，另加 `og:image` 探针与五线阶梯、线页、`/repos` 分组截图，
      归档 `reports/batch-2/`
- [ ] 5.5 记录回退锚点：每批上线前后的镜像 tag，便于单批回退