## MODIFIED Requirements

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

## ADDED Requirements

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
