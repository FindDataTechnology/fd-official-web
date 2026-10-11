# apps-showcase delta

## ADDED Requirements

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
