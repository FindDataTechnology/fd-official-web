## REMOVED Requirements

### Requirement: Browser playground without signup
- **Reason**: The playground's backend query (`ai_search` against the deployed MCP) currently returns concept metadata with null names and no values, making the page a broken showcase. The product decision (2026-09-21) is that the public demo surface is the Platform product tour instead of the MCP query playground.
- **Migration**: `/demo` becomes the Platform product tour (see ADDED requirements). The query form, result view, and demo-proxy are retired; no replacement MCP query UI is promised by this capability.

### Requirement: Token never exposed to the browser
- **Reason**: This existed to protect the MCP bearer token used by the playground. With the playground removed, no server-side token proxy is needed on the site.
- **Migration**: The demo proxy process and its nginx route are decommissioned. If a server-side proxied query surface returns later, its token-handling requirement must be re-specified.

### Requirement: Playground UX
- **Reason**: Superseded by the product tour requirements below; there is no query form or results view to specify.
- **Migration**: Form/results/error UX requirements are replaced by the tour page requirements.

### Requirement: Playground works over plain HTTP (IP phase)
- **Reason**: The IP-first phase ended with the 2026-08-21 domain cutover; the site serves HTTPS on `www.finddatatech.cloud`. The requirement is obsolete regardless of the playground's removal.
- **Migration**: None — the IP fallback continues to serve the same content over HTTP by nginx default; no per-page requirement remains.

## ADDED Requirements

### Requirement: Platform product tour page
The `/demo` page (and `/zh/demo`) SHALL be a bilingual product tour for the Platform product: feature highlights (streaming agent chat, document RAG, agents/MCP/scheduled work), representative visuals, and a prominent call-to-action that opens the Platform at `https://craw.finddatatech.cloud`.

#### Scenario: Tour renders in both locales
- **WHEN** a visitor opens `/demo` or `/zh/demo`
- **THEN** the page renders the Platform tour with locale-appropriate copy and a visible CTA linking to `https://craw.finddatatech.cloud`

#### Scenario: Tour renders without backend dependencies
- **WHEN** the page is built with no MCP endpoint reachable
- **THEN** the tour renders in full (it makes no runtime backend queries)

### Requirement: Trial entry with published demo account
The tour page SHALL present the shared demo account (dedicated demo credentials approved for public publication) with a copy affordance for each field and a clear label that it is a shared public demo account, in both locales.

#### Scenario: Demo credentials are displayed and copyable
- **WHEN** a visitor opens the tour page in either locale
- **THEN** the demo account's identifier and password are visible with one-click copy affordances and a "shared demo account" label

#### Scenario: Credentials are sourced outside built artifacts of other pages
- **WHEN** any page other than the tour renders
- **THEN** it contains no demo credentials
