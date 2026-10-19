## 1. 快照脚本

- [x] 1.1 加 `echarts` 为 devDependency（仅构建期用），验证：`npm install` 后 `node -e "require('echarts')"` 成功且 `package.json` 的 dependencies 未变
- [x] 1.2 新增 `scripts/fetch-showcase.mjs`：抓 `/api/v1/showcase/dashboards` 列表，逐个抓详情，把 `raw_option` 面板用 echarts SSR 渲染为 SVG 字符串，验证：手工跑一次生成 `src/data/showcase.json`，含看板条目与每图的 svg 字段
- [x] 1.3 KPI 面板转纯文本字段（label/value/subtitle），不存 SVG，验证：快照中 kpi 面板无 svg 键、有 value 字段
- [x] 1.4 降级：网络错/非 2xx/空列表 → 告警 + exit 0 + 不覆盖既有快照，验证：断网跑一次，快照文件 mtime 不变且退出码 0
- [x] 1.5 快照记录抓取时刻与各看板 `refreshed_at`，验证：文件含时间字段
- [x] 1.6 体积控制：列表摘要与详情 SVG 分离（列表不内联大段 SVG），验证：列表页相关数据不含 svg 键

## 2. 页面与组件

- [x] 2.1 新增 `src/components/ShowcaseBoard.astro`：列表卡（标题/面板数/截至时间）与详情块（KPI 卡网格 + 图表 SVG 内联 + 文本兜底），验证：组件在两种模式下都能渲染
- [x] 2.2 新增 `src/pages/showcase.astro` + `src/pages/zh/showcase.astro`（列表），验证：`astro build` 后两语言列表页均生成且含条目
- [x] 2.3 新增 `src/pages/showcase/[slug].astro` + `src/pages/zh/showcase/[slug].astro`（详情，静态生成每个看板），验证：构建产物中每个看板各有一份详情 HTML
- [x] 2.4 详情页含跳转柏讯交互版的外部链接，验证：HTML 中含 `wire.finddatatech.cloud/#/showcase/` 链接
- [x] 2.5 空态：快照无看板时列表显「筹备中」，验证：临时置空快照构建，页面出现空态文案而非空白

## 3. 导航与 i18n

- [x] 3.1 `src/i18n.ts` 加 `nav.showcase` 与页面文案键（中英齐备），验证：两语言键都存在
- [x] 3.2 `Layout.astro` 导航加橱窗入口（数据类目下，与 data/indicators 并列），验证：站内任意页导航可见该入口且指向对应语言路径
- [x] 3.3 页面注入描述性 title 与 description（不注入 noindex），验证：构建产物 HTML 的 head 含二者且无 robots=noindex

## 4. 收口

- [x] 4.1 `npm run build` 全链通过（含新脚本与既有 content:check），验证：退出码 0
- [x] 4.2 无 JS 验证：构建产物详情页的图表以 `<svg>` 内联存在（不依赖脚本注入），验证：grep 构建产物中的 svg 标签与 kpi 数值
- [x] 4.3 跑 `openspec validate official-web-showcase --strict`，验证：输出 valid
