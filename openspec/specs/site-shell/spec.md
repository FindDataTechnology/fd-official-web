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
existing org copyright link.

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

### Requirement: Consistent branding
All pages SHALL share a consistent header, navigation, and styling presenting
the company positioning: FindData Technology / 寻数科技 focuses on text and
data processing, builds an ecosystem around it, and serves individuals and
small teams in the AI era with infrastructure and auxiliary tools.

#### Scenario: Hero communicates the value prop
- **WHEN** a visitor loads the homepage
- **THEN** the hero states the company ecosystem positioning in the selected locale
