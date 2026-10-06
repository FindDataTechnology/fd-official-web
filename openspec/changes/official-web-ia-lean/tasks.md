# Tasks — official-web-ia-lean

依赖：无（可与其它 change 并行；不改 /data、/repos、/docs 页面本体与 URL）。

## 1. 导航收敛到三项

- [ ] 1.1 `src/components/Layout.astro`：导航数组改为 产品 / 动态 / 演示（移除 数据/仓库/文档）
- [ ] 1.2 页脚沉没行扩为两组成员：数据板块 · 数据指标 · 仓库 · 文档（第一组）/ 路线图 · 发布（第二组）；
      仓库中文标签保持 仓库
- [ ] 1.3 当前项高亮逻辑随数组更新；390px 下导航可读性复验

## 2. 沉没面的所属页入口

- [ ] 2.1 `src/components/ProductCatalog.astro`：wire 线页加「数据板块」入口区块（线标 + 简介 + 入口钮，
      复用 demo-cta 先例；仅 line === 'wire' 时渲染）
- [ ] 2.2 open-data-mcp 详情页（`src/pages/fd-open-data-mcp.astro`）加文档入口（3 篇文档列表或入口行）
- [ ] 2.3 旗舰页同时确认 /data 入口可见（与 2.1 互为双保险，spec 场景要求线页与详情页双可达）

## 3. 首页「开源」区块

- [ ] 3.1 `src/pages/index.astro`、`src/pages/zh/index.astro`：新增开源区块——
      GitHub 组织地址（github.com/FindDataTechnology）+ 公开仓计数（构建期取自 repos.json）
      + 双入口（仓库一览 → /repos、GitHub 组织 ↗）；mono 窄带控制台形态
- [ ] 3.2 `src/i18n.ts`：开源区块文案键（双语）

## 4. /demo 命名：壹座线上版

- [ ] 4.1 `src/i18n.ts`：zh `demo.cta` → 「打开壹座线上版」；en `demo.cta` → "Open Base Online"
- [ ] 4.2 `src/i18n.ts`：zh/en `demo.hero.sub` 的产品称呼同步（壹座线上版 / Base Online）
- [ ] 4.3 `src/components/TourMockup.astro`：窗口标题「壹座线上版 · supplier-review」/
      "Base online · supplier-review"；aria-label 同步
- [ ] 4.4 范围纪律：features 四条与 trial 文案保持不动（描述 Platform 产品本身，非本次范围）

## 5. 使命句

- [ ] 5.1 `src/i18n.ts`：zh `demo.*` 不涉及；zh hero 副题句尾注入「，推动信息平权」；
      en hero 副题句尾注入 "— advancing information equality"（各一句，中英事实同步）

## 6. 验证与发货

- [ ] 6.1 `openspec validate official-web-ia-lean --strict` 通过
- [ ] 6.2 `npm run build` 通过；`npm run content:check` 通过
- [ ] 6.3 本地双语截图核对：首页三屏（hero/阶梯/开源区块）、导航 390px、wire 线页、旗舰页、/demo、
      /docs、/updates、/repos（URL 全保留回归）
- [ ] 6.4 `impeccable detect --json` 过一遍改动文件
- [ ] 6.5 发货：镜像构建 → roll → 公网验收（导航三项、页脚入口、开源区块、404 回归）→ 截图归档 reports/