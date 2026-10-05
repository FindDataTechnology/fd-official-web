# Spec: roadmap

## Purpose
Bilingual three-phase roadmap page presenting the org's development phases.

## Requirements

### Requirement: Three-phase roadmap page
The site SHALL provide a bilingual roadmap page (`/roadmap`, `/zh/roadmap`) presenting the org's three development phases, in order: 蝉蜕 Chántuì (2–3 months, multiple iterations bringing the product to a usable state), 卧龙 Wòlóng (3 months, enriching content e.g. data coverage), 九天 Jiǔtiān (1 year, internationalization). Each phase MUST display its name (Chinese + pinyin), time horizon, goal, and current status (in-progress / planned).

#### Scenario: Visitor views roadmap
- **WHEN** a visitor navigates to `/roadmap`
- **THEN** they see all three phases in order, each with name, period, goal, and a visible status indicator

#### Scenario: Chinese roadmap parity
- **WHEN** a visitor navigates to `/zh/roadmap`
- **THEN** they see the same three phases with Chinese copy

### Requirement: Content-driven phase data
Roadmap phases SHALL be defined as entries in a `roadmap` content collection (one Markdown file per phase) with frontmatter carrying at least: phase name, pinyin, period, goal, status, and display order. Updating phase progress MUST require only editing that file's frontmatter — no page code changes.

#### Scenario: Status update without code change
- **WHEN** a maintainer changes a phase's `status` field in its content file and rebuilds
- **THEN** the roadmap page and homepage strip reflect the new status with no template edits

### Requirement: Homepage roadmap strip
The homepage SHALL include a compact strip showing the three phases with their status, linking to the full `/roadmap` page.

#### Scenario: Homepage shows current phase
- **WHEN** a visitor views the homepage
- **THEN** they see the three-phase strip with the in-progress phase visually distinguished, and can click through to `/roadmap`

### Requirement: Phase progress stated truthfully
Each roadmap phase MAY carry a list of deliverables. When such a list is present, every item SHALL be either work that has already shipped (and is stated as shipped) or work that is explicitly planned — an item whose work has shipped SHALL NOT continue to be presented as future work. A phase's period SHALL be updated when it no longer describes the phase's actual horizon.

#### Scenario: Shipped deliverables are not shown as future work
- **WHEN** a visitor reads a phase whose listed deliverables have shipped
- **THEN** those items are marked as completed or removed from the future plan, in both locales

#### Scenario: Period reflects reality
- **WHEN** a phase's stated period no longer matches its actual elapsed or expected horizon
- **THEN** the period is updated in the phase's content file, in both locales

#### Scenario: Both locales stay in sync
- **WHEN** a phase's goal, period, or deliverable list is edited
- **THEN** the English and Chinese fields of that phase state the same facts
