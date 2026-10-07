# site-shell

## Purpose

Defines the bilingual site shell for the FindData Technology official website — core pages, navigation, and consistent branding across English (default) and Simplified Chinese locales.

## Requirements

### Requirement: Bilingual site (EN default, 中文)
The site SHALL be served in two locales, English and Simplified Chinese, using `astro:i18n` with `en` as the default locale and `zh` as a prefixed non-default locale (`/` for EN, `/zh/...` for 中文).

#### Scenario: English is the default
- **WHEN** a visitor requests the site root path
- **THEN** they receive the English version at `/`

#### Scenario: Chinese available via prefix
- **WHEN** a visitor requests `/zh`
- **THEN** they receive the Chinese version of the homepage

#### Scenario: Language switcher present
- **WHEN** a visitor opens any page
- **THEN** a language switcher is available in the navigation allowing switching between EN and 中文

### Requirement: Core site structure

The site SHALL provide the following pages: homepage with hero, `/products`
(line-tabbed catalog), `/repos`, `/docs`, `/demo`, `/indicators`, and a footer
with org links. `/apps` URLs SHALL redirect to `/products` equivalents. The
footer SHALL include a GitHub icon linking to the FindDataTechnology org and a
"view source" link to the `fd-official-web` repository, both alongside the
existing org copyright link. The footer SHALL also carry both filing statements
as text links: the ICP filing number (`粤ICP备2026118740号-1`) linked to the MIIT
filing site, and the public-security filing number (`粤公网安备44030002016558号`)
linked to the national public-security filing query platform. The filing labels
SHALL be rendered verbatim in both locales (filing numbers are legal
identifiers and are not translated) and no badge image SHALL be added.

#### Scenario: All core pages render

- **WHEN** a visitor navigates to each core page
- **THEN** each returns HTTP 200 with content in the selected locale

#### Scenario: Apps page available in both locales

- **WHEN** a visitor requests `/products` or `/zh/products` (or a legacy `/apps` URL, which redirects there)
- **THEN** the line-tabbed products catalog renders in the corresponding locale

#### Scenario: Navigation includes Apps

- **WHEN** a visitor views the header navigation
- **THEN** a "Products" (EN) / "产品" (中文) entry links to the products catalog

#### Scenario: Indicators page available in both locales

- **WHEN** a visitor requests `/indicators` or `/zh/indicators`
- **THEN** the indicators page renders in the corresponding locale

#### Scenario: Footer links to GitHub org

- **WHEN** a visitor views the footer
- **THEN** it links to the FindDataTechnology GitHub org

#### Scenario: Footer GitHub icon links to org

- **WHEN** a visitor clicks the GitHub icon in the footer
- **THEN** they are taken to `https://github.com/FindDataTechnology`

#### Scenario: Footer view-source link points to this repo

- **WHEN** a visitor clicks the "view source" link in the footer
- **THEN** they are taken to `https://github.com/FindDataTechnology/fd-official-web`

#### Scenario: ICP filing shown in footer

- **WHEN** a visitor views the footer on the CN-served site
- **THEN** the ICP filing number (`粤ICP备2026118740号-1`) is linked to `https://beian.miit.gov.cn/`

#### Scenario: Public-security filing shown in footer

- **WHEN** a visitor views the footer in either locale
- **THEN** the public-security filing number (`粤公网安备44030002016558号`) is linked to the national public-security filing query platform (`https://beian.mps.gov.cn/`)

### Requirement: Consistent branding

All pages SHALL share a consistent header, navigation, and styling presenting
the company positioning: FindData Technology / 寻数科技 focuses on text and
data processing, builds an ecosystem around it, and serves individuals and
small teams in the AI era with infrastructure and auxiliary tools.

The homepage hero SHALL state that company positioning and SHALL NOT lead with a
single product line's value proposition. Below the hero copy the homepage SHALL
present the five product lines in their magnitude order, each with its line mark
and its line name; quantitative statistics SHALL render as secondary
information rather than as the hero's primary message.

#### Scenario: Hero communicates the value prop

- **WHEN** a visitor loads the homepage
- **THEN** the hero states the company ecosystem positioning in the selected locale

#### Scenario: Hero does not lead with one line

- **WHEN** a visitor reads the hero in either locale
- **THEN** no single product line's value proposition is presented as the company's offering

#### Scenario: Five lines are the hero's supporting structure

- **WHEN** a visitor reads past the hero copy
- **THEN** the five product lines appear in magnitude order, each with its line mark and name, and each linking to its catalog tab

#### Scenario: Statistics are secondary

- **WHEN** the homepage renders quantitative statistics
- **THEN** they are visually subordinate to the hero's positioning statement

### Requirement: Navigation grouping and current location

The header navigation SHALL present exactly three top-level entries —
Products (产品), Updates (动态), and Demo (演示) — the visitor's primary
journey. All other surfaces (数据板块, 仓库, 文档, 数据指标, 路线图, 发布)
SHALL stay reachable from grouped footer links and from the pages that own
them, with every URL preserved. The navigation SHALL indicate the current
location. On narrow viewports the navigation SHALL remain fully readable,
with no horizontal scrolling and no clipped labels. The Chinese label for
the repositories surface SHALL be 仓库 wherever it appears (footer or page
entries), matching the workspace vocabulary (仓库 = code carrier, 产品 =
capability unit).

#### Scenario: Header stays scannable

- **WHEN** a visitor views any page
- **THEN** the header shows exactly three top-level entries plus the language switcher

#### Scenario: Current location indicated

- **WHEN** a visitor is on a page reachable from the header
- **THEN** that entry is visually distinguished as the current location

#### Scenario: No clipped labels on narrow viewports

- **WHEN** a visitor views any page at a 390px-wide viewport
- **THEN** every navigation label is fully readable, with no horizontal scrolling

#### Scenario: Sunk surfaces remain reachable

- **WHEN** a surface is removed from the header
- **THEN** it remains reachable from the footer and from at least one owning page

#### Scenario: Chinese repositories label

- **WHEN** a visitor reads any Chinese navigation or footer entry for the repositories surface
- **THEN** it is labelled 仓库

### Requirement: Zero-JavaScript and accessibility floor

New or changed interface elements SHALL NOT require JavaScript: navigation,
disclosure, and layout behaviour SHALL be achieved with CSS or native HTML
elements. Body text SHALL meet a contrast ratio of at least 4.5:1, and large
text and graphical elements at least 3:1, against their backgrounds. Every
motion effect SHALL respect `prefers-reduced-motion`. Every interactive element
SHALL expose a visible keyboard focus indicator.

#### Scenario: Navigation works without JavaScript

- **WHEN** a visitor browses with JavaScript disabled
- **THEN** navigation, disclosure, and layout behave as they do with JavaScript enabled

#### Scenario: Contrast holds

- **WHEN** text and graphical elements are measured against their backgrounds
- **THEN** body text is at least 4.5:1 and large text and graphics at least 3:1

#### Scenario: Motion is optional

- **WHEN** the visitor's system requests reduced motion
- **THEN** non-essential motion is suppressed

#### Scenario: Keyboard focus visible

- **WHEN** a visitor tabs through interactive elements
- **THEN** each focused element shows a visible focus indicator

### Requirement: Social sharing image

Every page SHALL declare a social sharing image (Open Graph image plus the
matching card metadata) pointing at a site-hosted 1200×630 asset in the page's
locale, so that a shared link renders a card instead of an empty preview.

#### Scenario: Pages declare a share image

- **WHEN** any page's HTML is inspected
- **THEN** it declares an absolute `og:image` URL pointing at a site-hosted 1200×630 asset

#### Scenario: Locale-appropriate card

- **WHEN** a Chinese page is shared
- **THEN** its card uses the Chinese asset, and an English page uses the English asset

### Requirement: Line-attributed entry to the data catalog

The wire line page and the open-data-mcp app detail page SHALL each carry a
reachable entry to the data catalog (`/data`), presented with the wire line
mark, so the data surfaces remain discoverable after leaving the header.

#### Scenario: Data catalog reachable from the wire line

- **WHEN** a visitor browses the wire line page
- **THEN** an entry to the data catalog is visible, carrying the wire line mark

#### Scenario: Data catalog reachable from the flagship

- **WHEN** a visitor reads the open-data-mcp app detail page
- **THEN** an entry to the data catalog is visible
