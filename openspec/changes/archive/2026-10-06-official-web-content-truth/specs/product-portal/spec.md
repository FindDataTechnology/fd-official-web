## MODIFIED Requirements

### Requirement: Research and services footnote

The homepage SHALL include a company-level research and services footnote in
both locales. Every claim, link, and number in the footnote SHALL be verified
against real artifacts; nothing unverifiable SHALL be published. A research
output (paper, dataset, benchmark) SHALL be listed only when an artifact exists
to point at: by domain and title, with a link when a public link exists, and
without a link when none does. A claimed output for which no artifact can be
located SHALL be omitted from the footnote rather than stated. The small-model
fine-tuning service SHALL be listed, as it is verifiable.

#### Scenario: Footnote lists both papers

- **WHEN** both a data-domain and a legal-domain research output have locatable artifacts
- **THEN** each is listed by domain, with a real link if one is public and without a link if none is

#### Scenario: Unverifiable output omitted

- **WHEN** no artifact can be located for a claimed research output
- **THEN** that claim does not appear in the footnote in either locale

#### Scenario: No fabricated evidence

- **WHEN** the footnote renders
- **THEN** it contains no testimonials, metrics, or references that cannot be verified against actual artifacts