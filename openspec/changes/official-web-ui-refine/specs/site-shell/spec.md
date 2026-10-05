## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Navigation grouping and current location

The header navigation SHALL present at most six top-level entries, grouped by
audience rather than listing every surface; the remaining surfaces SHALL stay
reachable from grouped footer links and from the pages that own them. The
navigation SHALL indicate the current location. On narrow viewports the
navigation SHALL remain fully readable, with no horizontal scrolling and no
clipped labels. The Chinese label for the repositories surface SHALL be 仓库,
matching the workspace vocabulary (仓库 = code carrier, 产品 = capability unit).

#### Scenario: Header stays scannable

- **WHEN** a visitor views any page
- **THEN** the header shows at most six top-level entries plus the language switcher

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

- **WHEN** a visitor reads the Chinese navigation
- **THEN** the repositories entry is labelled 仓库

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