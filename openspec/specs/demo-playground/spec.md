# demo-playground

## Purpose

Defines the `/demo` surface — a bilingual product tour of the Platform assistant (the PaaS product line) with a trial entry: a call-to-action into the deployed Platform and a published shared demo account a visitor can sign in with.

## Requirements

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
