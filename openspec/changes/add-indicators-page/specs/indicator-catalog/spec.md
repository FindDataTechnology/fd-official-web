## ADDED Requirements

### Requirement: Build-time indicator catalog export
The build SHALL regenerate `src/data/indicators.json` from the live MCP concept catalog (via `list_concepts`, called per entity type to bypass the server-side row cap), including each concept's bilingual names, category, unit, measure, frequency, entity type, and source. When the MCP endpoint is unreachable or no token is configured, the build SHALL fall back to the last committed snapshot and still succeed.

#### Scenario: Export runs with a reachable endpoint
- **WHEN** `npm run indicators:fetch` runs with a reachable MCP endpoint and valid token
- **THEN** `src/data/indicators.json` is rewritten with every concept and a `generated_at` timestamp

#### Scenario: Build survives without data access
- **WHEN** the MCP endpoint is unreachable or `FD_INDICATORS_MCP_TOKEN` is unset
- **THEN** the script logs a warning, keeps the previous committed `indicators.json`, and exits successfully

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
Selecting an indicator from the list SHALL open a detail view showing its full metadata and a "try it live" link to the demo page. When the export captured a sample series for that indicator, the detail view SHALL also render it as a time-series line chart with a hover tooltip; otherwise it SHALL present a metadata-only view without rendering a broken or empty chart.

#### Scenario: Drill-down with sample data
- **WHEN** a visitor selects an indicator for which a sample series was exported
- **THEN** a line chart of the sample points renders with a hover tooltip showing date and value

#### Scenario: Drill-down without sample data
- **WHEN** a visitor selects an indicator with no exported sample series
- **THEN** the metadata view renders with a note and a link to the demo page, and no chart is drawn

### Requirement: Bilingual pages and navigation
The indicators page SHALL exist in both English (`/indicators`) and Chinese (`/zh/indicators`) as mirrored pages with locale-appropriate strings, and the site header SHALL include an indicators navigation entry in both locales.

#### Scenario: Language switch preserves the page
- **WHEN** a visitor switches language while on `/indicators`
- **THEN** they land on `/zh/indicators` (and vice versa)

#### Scenario: Navigation entry present
- **WHEN** the header renders in English
- **THEN** an "Indicators" nav link to `/indicators` is present; in Chinese, a "数据指标" link to `/zh/indicators`
