## ADDED Requirements

### Requirement: Wire line pricing entry

The wire line's catalog page (`/products/wire` and `/zh/products/wire`) SHALL offer, alongside the platform entry CTA, a pricing call-to-action linking to the Wire platform's pricing page (`https://wire.finddatatech.cloud/#/pricing`). The main site SHALL NOT carry plan prices, row quotas, or any pricing figures for the Wire line — the platform's pricing page is the single source of truth for pricing numbers.

#### Scenario: Pricing CTA reaches the platform pricing page
- **WHEN** a visitor follows the pricing call-to-action on `/products/wire` or `/zh/products/wire`
- **THEN** they land on the Wire platform pricing page

#### Scenario: No pricing figures on the main site
- **WHEN** the wire line's catalog and app detail pages are inspected in either locale
- **THEN** no plan price or row-quota figure appears for the Wire line
