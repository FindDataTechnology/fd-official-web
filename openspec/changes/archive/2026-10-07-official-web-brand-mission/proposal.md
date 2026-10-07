## Why

全站的品牌标识是建站工具的默认 favicon（Astro logo，从未替换），导航栏是纯文字无图标——而全站已经形成了一套自己的图标语言（五线朱文印章）。同时首页与各子页内容高度重合（阶梯卡=目录、进展卡=路线图、统计行=指标页），首页缺少自己的「为什么」。公司使命（推动信息平权与社会公平）也尚未在官网出现。

**用户已定的标准用语**（2026-10-06）：
- 公司使命：专注数据处理和文本处理的AI软件基础设施工作，促进信息平权和社会公平
- 五线定位：壹座=全平台可用的执行底座；识律=文本处理基础设施；柏讯=数据领域的AI基础设施；谦面=AI智能体预设分享基础设施；萬星=AI智能体的运行基础设施

## What Changes

- **品牌标「寻」**：阳文实底印章（薄荷圆角方 + 深墨「寻」，Songti）作为公司父印——
  - 替换 `public/favicon.svg`（Astro 默认 logo → 寻印，16px 实底可读）
  - 导航栏 wordmark 前加 22px 寻印
  - OG 分享图同步换新品牌标
- **首页差异化（B）**：
  - 五线 rung 卡的描述改为**定位句**（上面的五线标准用语，双语）——首页讲「为什么存在」，/products 保留「是什么」详情
  - hero 副题句尾更新为使命用语（促进信息平权和社会公平）
  - 新增**使命块**：阶梯之下，细线 + mono 标签「使命 / Mission」+ 公司使命全文（双语）
- **CONTEXT.md**：「线标」词条补「父印 寻」一句

范围红线：/products 的「是什么」描述不动；features/trial 文案不动；URL 与导航三项（产品/动态/演示）不动。

## Capabilities

### New Capabilities

（无新增能力——纯品牌资产与文案，无行为契约变化）

### Modified Capabilities

（无规格 delta：favicon、导航图标、OG 图、使命与定位文案均无规格锚定；product-portal 的卡片墙要求「一行描述」由定位句继续满足）

## Impact

- 新增 `src/components/BrandMark.astro`（阳文寻印，尺寸属性）
- `public/favicon.svg` 替换；`scripts/og-card-en/zh.html` + `public/og/*.png` 重制
- `src/components/Layout.astro`（导航品牌行）、`src/pages/index.astro`、`src/pages/zh/index.astro`（rung 定位句、使命块）、`src/i18n.ts`
- `CONTEXT.md`（工作区根）：「线标」词条补父印
- 关联：ADR-0003（父印寻 = 序列化逻辑的公司级延伸）


**Captured decisions (grill 2026-10-06)**：印式=阳文实底（Q1/Q2 推荐）；使命块=独立块（Q3 推荐）；五线定位句=用户标准用语（Q4，上文明文）。
**Specs deliberate skip**：无行为契约变化——favicon/导航图标/OG/使命与定位文案均无规格锚定，product-portal 卡片墙的「一行描述」由定位句继续满足。