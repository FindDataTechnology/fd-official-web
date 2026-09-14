## MODIFIED Requirements

### Requirement: Core site structure
The site SHALL provide the following pages: homepage with hero, `/repos`, `/docs`, `/demo`, `/indicators`, and a footer with org links. The footer SHALL include a GitHub icon linking to the FindDataTechnology org and a "view source" link to the `fd-official-web` repository, both alongside the existing org copyright link.

#### Scenario: All core pages render
- **WHEN** a visitor navigates to each core page
- **THEN** each returns HTTP 200 with content in the selected locale

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
