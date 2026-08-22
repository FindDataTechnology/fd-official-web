## MODIFIED Requirements

### Requirement: Repo card content
Each repo card SHALL display the repo name, description, primary language, star count, last-updated date, and a link to its GitHub page. When a repo's description is null or empty, the card SHALL render a localized fallback string rather than a blank line.

#### Scenario: Card shows API data
- **WHEN** a repo card renders
- **THEN** it shows name, description, language, stars, updated date, and links to `https://github.com/FindDataTechnology/<repo>`

#### Scenario: Null description renders fallback
- **WHEN** a repo has no GitHub description (null or empty)
- **THEN** its card renders a localized fallback string (e.g. "No description available" / "暂无描述") instead of a blank line
