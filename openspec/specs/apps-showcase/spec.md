# apps-showcase Specification

## Purpose
Hand-curated bilingual product/app pages for the five product lines — independent of the GitHub fetch pipeline, line-classified at build time, deep-linkable per line.

## Requirements

### Requirement: Hand-curated apps collection

The site SHALL provide an `apps` content collection of hand-written, bilingual
(`en` / `zh`) app entries that is independent of the GitHub fetch pipeline:
apps content is committed to the repo and renders without network access. Each
entry SHALL carry at minimum a name, tagline, kind, and a `line` field whose
value is one of the five product lines (`base`, `lex`, `wire`, `facet`,
`constellation`); an entry SHALL carry a demo/entry URL wherever a live entry
point exists. An entry with a missing or unknown `line` SHALL fail the build
rather than render unclassified.

#### Scenario: App entry renders in both locales

- **WHEN** an app has both an `en` and a `zh` entry
- **THEN** `/products/<slug>` and `/zh/products/<slug>` render their respective locale's content

#### Scenario: Apps render without GitHub

- **WHEN** the site builds with no GitHub API access
- **THEN** the products pages still render in full (they do not depend on `fetch-repos.mjs`)

#### Scenario: Unknown line fails the build

- **WHEN** an app entry declares a `line` outside the five-line set
- **THEN** the build fails with an error naming the entry and the invalid value

### Requirement: Apps grid page

The site SHALL provide a line-tabbed products catalog at `/products` (EN) and
`/zh/products` (中文) with one tab per product line (`base`, `lex`, `wire`,
`facet`, `constellation`) in magnitude order. Each line SHALL be reachable via a
distinct, deep-linkable URL. On every line page the tab navigation SHALL be
present.

The `/products` and `/zh/products` URLs SHALL render the five-line overview: the
magnitude-ladder narrative, the five-line cards linking to each line page, and
the tab navigation. They MUST NOT render a single line's dedicated landing page,
and MUST NOT duplicate the content of any `/products/<line>` page.

Non-base lines SHALL list their entries with name, tagline, and a link to each
detail page; when such a line holds few entries, the catalog SHALL lay them out
across the content width rather than leaving a single narrow card on an
otherwise empty area. The `base` line SHALL instead render its dedicated product
landing (see Base line landing page) at `/products/base` and
`/zh/products/base`.

#### Scenario: Products root renders the five-line overview

- **WHEN** a visitor opens `/products` or `/zh/products`
- **THEN** the page renders the magnitude-ladder narrative and one card per product line linking to that line's page, with the tab navigation present, and does not render the base line's landing sections

#### Scenario: Products root is distinct from the base line page

- **WHEN** the HTML of `/products` is compared with that of `/products/base`
- **THEN** the two pages differ in their main content (overview versus landing), and each is self-describing in title and description metadata

#### Scenario: Grid lists all apps

- **WHEN** a visitor selects a non-base line tab
- **THEN** only entries whose `line` matches appear, each with name, tagline, and detail link in the selected locale

#### Scenario: Tabs filter entries by line

- **WHEN** a visitor opens a non-base line tab
- **THEN** the catalog lists exactly the entries of that line, and no others

#### Scenario: Line tabs are deep-linkable

- **WHEN** a visitor opens a line's catalog URL directly
- **THEN** the page for that line renders with its tab active

#### Scenario: A thin line does not read as empty

- **WHEN** a visitor opens a non-base line that has a single entry
- **THEN** that entry is laid out across the content width, and the page does not present a large empty content area

#### Scenario: Base tab lands on the product landing

- **WHEN** a visitor opens `/products/base` or `/zh/products/base`
- **THEN** the dedicated base landing renders with the base tab active, not the generic entry grid

### Requirement: Base line landing page

`/products/base` and `/zh/products/base` SHALL render a dedicated, bilingual product landing for the base line in place of the generic line catalog, at the same URLs, while keeping the five-line tab navigation so all lines stay cross-reachable. The landing SHALL present, in order: a dual-track hero, a value-proposition section, a product-tour section, an all-platform matrix, a self-host quickstart, the desktop download band, and a closing section. The closing section SHALL link to the release-notes page, the roadmap page, and the GitHub organization, and SHALL keep the base line's app entries reachable through links to their detail pages. The other four lines SHALL keep the generic catalog view unchanged.

#### Scenario: Landing renders the seven sections in order

- **WHEN** a visitor opens `/products/base`
- **THEN** the page renders the dual-track hero, value proposition, product tour, platform matrix, quickstart, download band, and closing section in that order, with the five-line tabs present

#### Scenario: zh mirror renders the same structure

- **WHEN** a visitor opens `/zh/products/base`
- **THEN** the page renders the same seven-section structure with Chinese copy

#### Scenario: Other lines keep the catalog

- **WHEN** a visitor opens a non-base line tab page (e.g. `/products/lex`)
- **THEN** the generic line catalog renders as before, with no landing sections

#### Scenario: Line app entries stay reachable

- **WHEN** a visitor reads the landing's closing section
- **THEN** the base line's app entries are linked to their detail pages

### Requirement: Dual-track hero

The landing hero SHALL present two tracks: a hosted-cloud track whose call-to-action offers contact-based activation — the hosted cloud is currently invite-only, so the CTA SHALL NOT promise or link self-service signup — and a local track that offers the self-host path: the quickstart commands to copy and an affordance that takes the visitor to the download band.

#### Scenario: Cloud CTA stays invite-consistent

- **WHEN** a visitor reads the cloud track
- **THEN** the CTA reads as contact-to-activate and does not link a self-service signup page

#### Scenario: Local track jumps to the download band

- **WHEN** a visitor activates the local track's download affordance
- **THEN** the visitor is taken to the download band section of the same page

### Requirement: Product tour section with live-demo deep link

The landing SHALL include a product-tour section that illustrates the product in the site's CSS-drawn mockup style (no real screenshots, no user data), and SHALL offer a call-to-action that takes the visitor to the live demo page in the same locale.

#### Scenario: Tour CTA reaches the demo page

- **WHEN** a visitor follows the tour section's demo call-to-action on `/products/base`
- **THEN** the visitor reaches `/demo`; on `/zh/products/base`, the visitor reaches `/zh/demo`

### Requirement: Platform matrix and self-host quickstart

The landing SHALL include an all-platform matrix stating the surfaces the platform runs on — web, WeChat mini-program, macOS, Windows — and a self-host quickstart section presenting the public repository's clone, install, and start commands as copyable text, linking to the repository for the full guide.

#### Scenario: Matrix covers the four surfaces

- **WHEN** a visitor reads the platform matrix
- **THEN** web, mini-program, macOS, and Windows are each stated

#### Scenario: Quickstart commands are copyable and linked

- **WHEN** a visitor reads the quickstart section
- **THEN** the clone/install/start commands appear as copyable text with a link to the public repository

### Requirement: App detail pages
The site SHALL render each app entry at `/products/<slug>` and
`/zh/products/<slug>`, including the line it belongs to, the narrative body,
and a call-to-action linking to the app's demo or entry URL. An unknown slug
SHALL 404.

#### Scenario: Detail page renders narrative and CTA
- **WHEN** a visitor opens a known app detail page
- **THEN** the page renders the app's line, narrative content, and a demo/entry call-to-action

#### Scenario: Unknown app 404s
- **WHEN** a visitor requests `/products/<unknown>`
- **THEN** the site returns a 404

### Requirement: Legacy /apps URLs redirect
`/apps`, `/zh/apps`, `/apps/<slug>`, and `/zh/apps/<slug>` SHALL redirect to
their `/products` equivalents so existing external links keep working.

#### Scenario: Legacy catalog URL redirects
- **WHEN** a visitor requests `/apps` or `/zh/apps`
- **THEN** they are redirected to `/products` (resp. `/zh/products`)

#### Scenario: Legacy detail URL redirects
- **WHEN** a visitor requests `/apps/<slug>` or `/zh/apps/<slug>`
- **THEN** they are redirected to `/products/<slug>` (resp. `/zh/products/<slug>`)

### Requirement: Launch content across five lines

The collection SHALL cover all five product lines, with at least one entry per
line. Each entry SHALL belong to exactly one line, and SHALL state only
capabilities verifiable against the corresponding project. Entries whose line
membership is owned by another contract SHALL follow that contract.

#### Scenario: Every line has at least one entry

- **WHEN** a visitor opens the products catalog
- **THEN** each of the five line tabs lists at least one entry

#### Scenario: Entry capabilities are verifiable

- **WHEN** a visitor reads an entry's detail page
- **THEN** every capability it claims is verifiable against the corresponding project, and its entry point (if any) is live

### Requirement: Wire line pricing entry

The wire line's catalog page (`/products/wire` and `/zh/products/wire`) SHALL offer, alongside the platform entry CTA, a pricing call-to-action linking to the Wire platform's pricing page (`https://wire.finddatatech.cloud/#/pricing`). The main site SHALL NOT carry plan prices, row quotas, or any pricing figures for the Wire line — the platform's pricing page is the single source of truth for pricing numbers.

#### Scenario: Pricing CTA reaches the platform pricing page
- **WHEN** a visitor follows the pricing call-to-action on `/products/wire` or `/zh/products/wire`
- **THEN** they land on the Wire platform pricing page

#### Scenario: No pricing figures on the main site
- **WHEN** the wire line's catalog and app detail pages are inspected in either locale
- **THEN** no plan price or row-quota figure appears for the Wire line

### Requirement: Wire platform app page

The apps collection SHALL carry a bilingual entry for the Wire platform itself
(`en/wire-platform.md` / `zh/wire-platform.md`, `line: wire`, entry URL
`https://wire.finddatatech.cloud`), rendering at `/products/wire-platform` and
`/zh/products/wire-platform` and listed in the wire tab's catalog grid ahead of
the line's other entries. The entry SHALL present the platform's own
capabilities, not only its hosted data services, covering at minimum: the
free-tier self-service loop (SSO sign-in; datasets built from CSV/Excel upload
or the local connector; in-place row correction with single-row rollback and
honestly-labeled dangling rows; dashboards assembled in a visual editor from
KPI/line/bar/table panels; per-panel query binding over dataset, columns,
filters, sort, and row limit; preview; deterministic refresh that re-fetches by
binding into a new version with no LLM in the loop; CSV export of datasets and
whole dashboards; publishing with signed share links that pin a version, carry
a selectable expiry, and are noindex); the AI path (conversational dashboard
drafting with promotion of AI drafts, headless AI refresh, connectors, derived
transforms, joins, bulk writes, and the MCP tool surface) stated as gated
behind a dedicated cell with private delivery; transformation pipelines with a
lineage view and cron-scheduled refresh shared by datasets and dashboards; the
data-request channel (source URL, expectations, cadence; platform-side
evaluation, delivery, and automatic scope activation); and topic-based
source-pack subscriptions.

#### Scenario: Wire tab lists the platform entry first

- **WHEN** a visitor opens `/products/wire` or `/zh/products/wire`
- **THEN** the catalog grid lists the Wire platform entry with name, tagline, and detail link, ahead of the line's other entries, below the platform entry CTAs

#### Scenario: Detail page renders in both locales

- **WHEN** a visitor opens `/products/wire-platform` or `/zh/products/wire-platform`
- **THEN** the respective locale's page renders the platform's line, narrative, and a call-to-action to the platform entry URL

#### Scenario: Pricing stays on the platform pricing page

- **WHEN** a visitor reads the wire-platform detail page in either locale
- **THEN** no plan price, free-tier allowance figure, or row-quota figure appears, and the page links the Wire platform pricing page (`https://wire.finddatatech.cloud/#/pricing`) as the single source of pricing numbers

### Requirement: Wire platform claims stay production-verified

The wire-platform entry SHALL state only capabilities verified against the
production platform (E2E-verified full chain on 2026-10-11), in both locales
with equivalent meaning. It SHALL NOT phrase any capability as upcoming or
planned (no future-tense promises), and capabilities that require a dedicated
cell SHALL be labeled as such rather than presented as self-serve.

#### Scenario: Every claim is verifiable against the platform

- **WHEN** a visitor reads either locale's wire-platform page
- **THEN** each capability claimed is one exercised by the production E2E verification, and the AI-path capabilities are labeled as requiring a dedicated cell with private delivery

#### Scenario: No future-tense promises

- **WHEN** either locale's wire-platform page is inspected
- **THEN** no capability is framed as coming soon or planned; everything stated is available in production at the entry URL

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

#### Scenario: A zero read is refused, not recorded

- **WHEN** the status endpoint answers with `agents: 0` or `turns7d: 0`, or flags either value `stale: true`
- **THEN** the export keeps the previous snapshot unchanged and logs a warning — a zero is the endpoint failing to compute (it answers zeros when its own upstream is unreachable), not a fleet fact, and it MUST NOT overwrite a good snapshot or reach the page

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
