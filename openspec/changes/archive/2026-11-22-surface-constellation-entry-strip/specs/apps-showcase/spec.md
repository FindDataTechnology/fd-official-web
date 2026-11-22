# Spec Delta

## ADDED Requirements

### Requirement: Constellation line entry strip

萬星线页（`/products/constellation` 与 `/zh/products/constellation`）SHALL 在 app 卡列表**上方**提供
一条线级入口带，含三个入口与两个实时数字：

- 入口：进目录（`https://wanxing.finddatatech.cloud/#/catalog`）、对接文档
  （`https://wanxing.finddatatech.cloud/#/docs`）、部署者控制台
  （`https://wanxing.finddatatech.cloud/#/console`），三个入口 SHALL 各自直达对应面。

入口带 SHALL 沿用站点既有的线页入口样式（`wire` 线的 entry 组），MUST NOT 引入新的视觉语汇；
五线阶梯、LineTabs 与线页 tab 导航 SHALL 保持不变，MUST NOT 因此新增第六条线。入口带 SHALL NOT 承载
任何价格、费率或额度数字——计费口径只存在于萬星自己的页面。

#### Scenario: Both locales carry the strip

- **WHEN** a visitor opens `/products/constellation` or `/zh/products/constellation`
- **THEN** the entry strip renders above the app cards with the three entries labelled in the page locale

#### Scenario: Entries reach the Wanxing surfaces

- **WHEN** a visitor follows the catalog, docs, or console entry
- **THEN** they land on the corresponding Wanxing surface (`#/catalog`, `#/docs`, `#/console`)

#### Scenario: No pricing figures on the strip

- **WHEN** the strip is inspected in either locale
- **THEN** it carries no price, rate, or allowance figure, and it links no pricing page

### Requirement: Constellation line strip carries build-time service figures

萬星线页入口带 SHALL 呈现两个服务数字：在役 agent 数与近 7 天回合数。两者 SHALL 来自构建期导出的
committed 快照（`src/data/constellation-status.json`），MUST NOT 硬编码在页面代码、规格或文案里；
快照的导出时刻 SHALL 与数字一并呈现，使陈旧自证。

任一数字在快照中缺失时，该格 SHALL 整格省略，MUST NOT 渲染成 `0`。

#### Scenario: Numbers come from the snapshot

- **WHEN** the strip renders its in-service agent count and 7-day turn count
- **THEN** each value equals the corresponding value in the committed snapshot export, and the export instant is visible beside them

#### Scenario: A missing figure is omitted, never zero

- **WHEN** the snapshot carries no `agents` or no `turns7d`
- **THEN** that figure is not rendered at all, and no `0` stands in for it

### Requirement: Constellation status snapshot is a build-time export

构建 SHALL 用一个导出脚本从萬星公开状态端点（`GET /api/wanxing/v1/status`）生成
`src/data/constellation-status.json`，包含 `agents`（在役 agent 数）、`turns7d`（近 7 天回合数）与
`generated_at` 导出时刻。

当端点不可达、响应形状不符、或任一值缺失时，脚本 SHALL **保留上一份快照原样**（不写成空值、不写部分
字段），记录一条警告，并以退出码 0 结束——构建 MUST NOT 因该端点不可用而失败，页面 MUST NOT 因缺数而
渲染空白或伪造数字。

站点同源请求 SHALL NOT 在运行时访问萬星：快照是唯一数据来源。

#### Scenario: Export runs with a reachable endpoint

- **WHEN** the export runs and the endpoint answers with both values
- **THEN** the snapshot file is rewritten with the fresh values and a new `generated_at`

#### Scenario: Unreachable endpoint keeps the previous snapshot

- **WHEN** the endpoint is unreachable or answers with a shape the script does not recognize
- **THEN** the existing snapshot is left untouched, a warning names the failure, and the build succeeds

#### Scenario: Missing values never render as zero

- **WHEN** the snapshot carries no `agents` or no `turns7d` (fresh checkout with an empty export)
- **THEN** the strip omits that figure entirely rather than rendering `0` as a fact

#### Scenario: No runtime dependency on Wanxing

- **WHEN** a built page is served in a browser
- **THEN** no request is issued from the site to the Wanxing origin, and the site renders identically whether or not Wanxing is reachable

### Requirement: Constellation line cards describe the current product set

线卡与线页上的萬星一句话（主页线卡与产品目录 tab 共用）SHALL 覆盖该线**已在售的产品集合**，而不是只
描述其中最早的一款；它 SHALL 仍按 `product-portal` 的供给域框架表述（以供给域身份描述，不自称集群本体）。

#### Scenario: The one-liner covers the line's products

- **WHEN** a visitor reads the constellation one-liner on the homepage card wall or the line page, in either locale
- **THEN** it describes the line's serving/runtime role across its products rather than naming a single product as the whole line

#### Scenario: The supply-domain framing holds

- **WHEN** the constellation one-liner renders
- **THEN** it describes the line in supply-domain terms and does not claim to be the cluster platform itself
