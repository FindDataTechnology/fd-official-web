## ADDED Requirements

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