---
name: "Cloud Data Federation"
tagline: "The commercial edition of the Wire line: five federated databases — statistical yearbooks, Chinese law, World Bank, GTA listed-company panel, and the China city panel — served read-only through one login-gated MCP endpoint."
kind: "Commercial data service"
line: wire
order: 20
---

Cloud Data Federation is FindData's hosted data service for paying users. It
reuses the open core's catalog, cache, and dispatch — but every response is
served through a single login-gated MCP endpoint at
[mcp.finddatatech.cloud](https://mcp.finddatatech.cloud), with unified
FindData branding and no per-source wiring exposed to the client.

## What is inside

- **Statistical yearbook catalog** — 53,900+ yearbook indicators, searchable
  by name, readable as annual series per region and edition.
- **Chinese law corpus** — laws and regulations with full text, an
  authoritative-sources document corpus (government rules, treaties,
  inspections, judicial interpretations), all 278 SPC guiding cases with
  structured sections, and a China court-judgment snapshot covering judgment
  years 2010–2026 (~16.7M records, ~99.9% with captured bodies).
- **World Bank (WDI)** — 1,499 indicators, annual series across countries,
  searchable in Chinese or English.
- **GTA listed-company panel** — 1,000+ financial-report variables, firm-year
  reads.
- **China city panel** — 297 cities, 2000–2024.
- **Firm registry snapshots** — industrial-and-commercial registration
  profiles and new-firm counts by year, province, and industry.
- **The unified indicator registry** — search results carry the registry's
  unified semantic codes alongside native source codes, so the same indicator
  keeps one identity across sources.

Sources declare their coverage honestly: documents that were never fetched
say so (`content_available: false`), and the per-source registration state is
queryable through a coverage tool rather than claimed in prose.

## Access

Login-gated; tokens are issued per customer through the gateway. Delivery is
by container image only — the source code is not public. Reach out for
access.
