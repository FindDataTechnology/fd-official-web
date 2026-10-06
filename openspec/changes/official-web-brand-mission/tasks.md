# Tasks — official-web-brand-mission

## 1. 品牌标「寻」

- [x] 1.1 新增 `src/components/BrandMark.astro`：阳文实底印章（薄荷圆角方 + 深墨「寻」，Songti），尺寸 prop（xs 22 / md 32 / lg 48）
- [x] 1.2 `src/components/Layout.astro`：导航品牌行 = 寻印(xs) + `Find**Data**` wordmark
- [x] 1.3 `public/favicon.svg` 替换为寻印（SVG：薄荷圆角方 + 深墨「寻」，无外部字体依赖的 serif 栈）；
      16px 可读性实测
- [x] 1.4 OG 分享图重制：`scripts/og-card-en/zh.html` 加寻印 → 重截 `public/og/*.png`

## 2. 首页差异化（B）

- [x] 2.1 `src/i18n.ts`：新增五线定位句键 `line.base/lex/wire/facet/constellation.why`（双语，用户标准用语）+
      EN 译文（Base: "The execution foundation — on every platform"；Lex: "Infrastructure for text processing"；
      Wire: "AI infrastructure for the data domain"；Facet: "Infrastructure for sharing AI agent presets"；
      Constellation: "Runtime infrastructure for AI agents"）
- [x] 2.2 首页 rung 卡：desc 替换为定位句（首页讲为什么；/products 保留是什么）——`line.${l}.why`
- [x] 2.3 hero 副题句尾更新：zh「……促进信息平权和社会公平。」en "…— advancing information equality and social fairness."
- [x] 2.4 使命块：阶梯之下，细线上边 + mono 标签「使命 / Mission」+ 公司使命全文（双语）
- [ ] 2.5 首页既有区块保持：statline、开源区块、当前进展链接行（或按 B 精神降为链接行——实现时定）

## 3. 词汇落档

- [x] 3.1 根 `CONTEXT.md`：「线标」词条补「父印 寻」一句（公司父印 = 序列化逻辑的顶层）
- [x] 3.2 站点 `CONTEXT.md`：品牌标词条（寻印 = favicon/导航/OG 的品牌标来源）

## 4. 验证与发货

- [x] 4.1 `openspec validate official-web-brand-mission --strict` 通过
- [x] 4.2 `npm run build` + `content:check` 通过
- [x] 4.3 本地双语截图核对：导航（寻印+wordmark）、首页全屏（rung 定位句/使命块/开源区块）、favicon 16px 实测；
      `impeccable detect` 过改动文件
- [ ] 4.4 发货：镜像构建 → roll → 公网验收（favicon/导航/首页定位句/使命块/OG）→ 截图归档 reports/