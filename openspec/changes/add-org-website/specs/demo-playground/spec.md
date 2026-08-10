## ADDED Requirements

### Requirement: Browser playground without signup
The `/demo` page SHALL let a visitor query the live backend from the browser without creating an account or providing a token.

#### Scenario: Query runs without credentials
- **WHEN** a visitor submits a valid query (concept + entity + date) on `/demo`
- **THEN** the page returns results from the live backend without any visitor-supplied credentials

### Requirement: Token never exposed to the browser
The bearer token for the backend SHALL be injected server-side by a same-origin proxy route; the token MUST NOT be sent to or stored in the browser.

#### Scenario: Token stays on the server
- **WHEN** the playground calls the backend
- **THEN** the token is added by the server-side proxy and never appears in the browser's network or storage

### Requirement: Playground UX
The `/demo` page SHALL provide a form for concept/entity/date input, a results view, and clear error messaging.

#### Scenario: Valid query shows results
- **WHEN** a valid query is submitted
- **THEN** the results view shows the returned data

#### Scenario: Invalid query shows an error
- **WHEN** a query fails or is malformed
- **THEN** the page shows a readable error message rather than a blank state

### Requirement: Playground works over plain HTTP (IP phase)
During the IP-first phase the playground SHALL function over `http://<ip>` so the demo is usable before the domain/HTTPS swap.

#### Scenario: Demo usable by IP
- **WHEN** a visitor loads `http://124.220.7.175/demo`
- **THEN** the playground is functional against the live backend
