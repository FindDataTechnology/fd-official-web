# indicator-catalog Specification

## Purpose
The public indicator catalog: a build-time export of the live MCP concept catalog into `src/data/indicators.json`, and the bilingual `/indicators` pages that let a visitor browse distributions, search concepts, and drill into a single indicator. The homepage's headline statistics derive from the same export so the two surfaces can never disagree.

## Requirements

### Requirement: Build-time indicator catalog export
The build SHALL regenerate `src/data/indicators.json` from the live MCP concept catalog (via `list_concepts`, called per entity type to bypass the server-side row cap), including each concept's bilingual names, category, unit, measure, frequency, entity type, source, and deprecation flag, plus export-level metadata: `generated_at`, the MCP-derived `tools_count`, and the active (non-deprecated) concept count. When the MCP endpoint is unreachable, no token is configured, or the export errors, the build SHALL keep the previous snapshot byte-for-byte (never rewriting it with empty or partial content) and still succeed, logging a warning that names the failure.

#### Scenario: Export runs with a reachable endpoint
- **WHEN** `npm run indicators:fetch` runs with a reachable MCP endpoint and valid token
- **THEN** `src/data/indicators.json` is rewritten with every concept, a fresh `generated_at` timestamp, and the tool count derived from `tools/list`

#### Scenario: Build survives without data access
- **WHEN** the MCP endpoint is unreachable or `FD_INDICATORS_MCP_TOKEN` is unset
- **THEN** the script logs a warning, keeps the previous `indicators.json` unchanged, and exits successfully

#### Scenario: Failure never blanks the snapshot
- **WHEN** the export errors partway (network failure, MCP tool error, empty result, or a dropped batch)
- **THEN** the existing `indicators.json` is left untouched rather than overwritten with an empty or truncated catalog

#### Scenario: Token never reaches built output
- **WHEN** the site is built and deployed
- **THEN** no page, script, or JSON artifact contains the export token

### Requirement: Catalog distribution dashboard
The indicators page SHALL render charts summarizing the embedded catalog — counts by category, entity type, frequency, and source — as hand-rolled SVG with no new runtime dependencies.

#### Scenario: Dashboard renders from embedded data
- **WHEN** a visitor opens the indicators page
- **THEN** distribution charts for category, entity type, frequency, and source render client-side from `indicators.json` without any network request

#### Scenario: High-cardinality dimensions stay readable
- **WHEN** a dimension (e.g. category) has more than 12 distinct values
- **THEN** the chart shows the top 12 by count with the remainder grouped into an "other" segment

### Requirement: Instant client-side indicator search
The page SHALL provide a search box that filters the indicator list client-side, matching against `code`, `name_en`, and `name_zh`, case-insensitively, with no network calls.

#### Scenario: Typing filters the list
- **WHEN** a visitor types a query (e.g. "GDP" or "营业收入")
- **THEN** the list instantly shows only indicators whose code, English name, or Chinese name matches

#### Scenario: No results is an explicit state
- **WHEN** the query matches no indicator
- **THEN** a visible empty-state message is shown instead of a blank area

### Requirement: Indicator drill-down with chart
Selecting an indicator from the list SHALL open a detail view showing its full metadata and a "try it live" link to the flagship product page. When the export captured a sample series for that indicator, the detail view SHALL also render it as a time-series line chart with a hover tooltip; otherwise it SHALL present a metadata-only view without rendering a broken or empty chart.

#### Scenario: Drill-down with sample data
- **WHEN** a visitor selects an indicator for which a sample series was exported
- **THEN** a line chart of the sample points renders with a hover tooltip showing date and value

#### Scenario: Drill-down without sample data
- **WHEN** a visitor selects an indicator with no exported sample series
- **THEN** the metadata view renders with a note and a link to the flagship product page, and no chart is drawn

### Requirement: Export freshness is visible
The indicators page SHALL display the export's `generated_at` date to the visitor in the page locale, so a stale catalog is self-evident rather than presented as current.

#### Scenario: As-of date renders
- **WHEN** a visitor opens the indicators page
- **THEN** the catalog's export date is visible near the page header in the current locale

### Requirement: Homepage stats derive from the export with complete labels
The homepage (EN and ZH) SHALL derive its statistics from the same `indicators.json` export the indicators page serves: active indicator concept count, data source count, and MCP tool count (plus entity and observation counts when the export carries them). Every rendered stat SHALL display a localized label in the page locale; a stat whose source value is missing SHALL be omitted entirely rather than rendered with a number and an empty label.

#### Scenario: Stats match the catalog
- **WHEN** the homepage renders
- **THEN** each stat equals the corresponding value in the current `indicators.json` export

#### Scenario: Every stat has a label
- **WHEN** a stat block renders in either locale
- **THEN** the number is accompanied by a non-empty localized label string

#### Scenario: Missing value omits the stat
- **WHEN** the export lacks a field a stat depends on (e.g. no `tools_count`)
- **THEN** that stat block is not rendered at all

### Requirement: Bilingual pages and navigation
The indicators page SHALL exist in both English (`/indicators`) and Chinese (`/zh/indicators`) as mirrored pages with locale-appropriate strings, and the site header SHALL include an indicators navigation entry in both locales.

#### Scenario: Language switch preserves the page
- **WHEN** a visitor switches language while on `/indicators`
- **THEN** they land on `/zh/indicators` (and vice versa)

#### Scenario: Navigation entry present
- **WHEN** the header renders in English
- **THEN** an "Indicators" nav link to `/indicators` is present; in Chinese, a "数据指标" link to `/zh/indicators`
