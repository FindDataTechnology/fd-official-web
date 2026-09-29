## ADDED Requirements

### Requirement: Public-only offline fallback
The committed fallback feed (`src/data/updates.json`) MUST NOT contain entries from any repo that is not on the committed public repo list (`src/data/repos.json`). When the fallback contains entries for repos absent from the public list, those entries SHALL be dropped at render time, and the fallback SHALL be regenerated clean on the next successful fetch. A degraded build MUST never publish activity from a non-public repo.

#### Scenario: Stale fallback contains a now-private repo
- **WHEN** the committed fallback still holds entries for a repo that has since become private (absent from the committed public repo list)
- **THEN** those entries are excluded from the rendered feed, and the other entries render normally

#### Scenario: Clean fallback after a successful build
- **WHEN** a build fetches the GitHub API successfully
- **THEN** the regenerated fallback contains entries only for repos on the public list, so the next degraded build serves only public-repo activity
