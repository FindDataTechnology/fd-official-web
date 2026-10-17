## Context

See `proposal.md` — Why. Constraints that shape the approach:

- **Strapi v5 + build-time pull.** Editorial content lives in the self-hosted Strapi on cheap-1; the site build pulls it into committed markdown (`scripts/fetch-strapi.mjs`), and the pulled files feed the zod schemas, the bilingual twins gate (`src/lib/twins.ts`), and the content-integrity gate. Publishing already triggers a rebuild via the `official-web-deploy` webhook (events: publish/unpublish/update/delete).
- **The pull pipeline is `kind`-hardcoded.** 11 branch points in `fetch-strapi.mjs` and 9 in `lib/xingyan.ts` encode per-collection field lists, serialization quirks, and validation. Adding a fourth content type by copying the pattern reproduces every quirk (the `updated` bare-date/Date-object trap from the previous change was one of them).
- **`--fixture` is a byte-for-byte contract.** `scripts/fixtures/strapi/*.json` must round-trip the committed markdown exactly (`git status` stays clean). This is the safety net that makes refactoring the pipeline safe.
- **A large-list precedent already exists.** `IndicatorsExplorer.astro` embeds ~720 KB of metadata, does instant client-side search, and mirrors filter state into URL params. Index pages can reuse that pattern rather than inventing pagination.
- **Design system is owned.** `DESIGN.md` + `.impeccable/design.json` define the token world (midnight-indigo surfaces, single mint accent, mono readouts, flat-by-doctrine elevation). Any redesign must live inside it, not replace it.
- **Current volume is small** (4 courses, 4 briefings, 2 articles, 17 update entries). The design must be cheap today and correct at 10×.

## Goals / Non-Goals

**Goals:**
- Star-yan surfaces stay stable in size as content grows: landing = curated, indexes = complete.
- One declarative place to add a content type; adding the fifth type touches no existing type's logic.
- Updates become editorially authored and CMS-managed end to end.
- `/products` becomes the five-line overview the spec already describes.
- The redesign is executed through impeccable (context → new-work → build → one batched visual verification), inside the existing token world.

**Non-Goals:**
- No server-side search, no `/page/<n>` pagination routes, no CMS-side full-text index.
- No migration of `releases` (announcement posts) or `roadmap` into the new mechanism; they keep their current loaders.
- No change to `/briefings.json`'s contract.
- No new visual world: this is a refinement/expansion of the incumbent identity, not a redesign of the brand.
- No per-line RSS feeds in this change (one combined feed only).

## Decisions

### D1 — Landing/index split with a fixed curated cap

Landing shows: all courses (they are few and path-ordered), and the newest N briefings/articles (N = 5). Each column ends with a "view all" link to its index. Indexes render metadata only.

*Why not* keep everything on the landing and let it grow: the page's job is orientation, not enumeration; a 60-item wall fails that job. *Why not* make the landing purely navigational (no items at all): the landing would lose its editorial signal and become a menu.

The cap is a single constant per column, so raising it later is a one-line change; the spec only requires that the landing does not scale with total volume.

### D2 — Index pages: metadata inlined, filtering client-side, no pagination routes

Index pages render all entries' metadata (title/summary/date/tags/kind) into the HTML, then filter in-page via a small inline script, mirroring state into `?tag=` / `?kind=` / `?level=` params.

*Alternatives:* (a) server-side pagination routes — doubles the i18n route tree and adds little for content that is read by browsing, not deep paging; (b) build-time filtered static pages per tag — combinatorially explodes the build as tags grow. Client-side filtering over inlined metadata is O(1) routes and already proven by `IndicatorsExplorer`.

Body text stays out of the index, so the page weight grows with entry *count* only, not with entry *length*.

### D3 — Upgrade threshold recorded at 300 metadata entries per column

Below 300, single-page + "load more" batching. At or above, the column upgrades to server-side batching or a dedicated search surface. Recorded in the spec as an explicit trigger so this decision is revisited by data, not by vibes.

*Why 300:* at ~1 KB of metadata per entry (title + summary + tags), 300 entries is ~300 KB inlined — the same order as the already-shipped 720 KB indicators payload, and comfortably under a typical 1 MB HTML budget once the existing site chrome is counted.

### D4 — Content-type registry replaces `kind` branching

`fetch-strapi.mjs` gains a single `COLLECTIONS` table where each entry declares: `api`, `dir`, `kind`, `required` fields, `optional` fields, an optional `serialize(e)` hook for fields needing special quoting/formatting, and a `twin` strategy (`'locale'` for paired entries, `'fields'` for single-entry bilingual fields).

Everything currently expressed as `if (kind === 'academy') …` moves into either the table row or that row's hook. `lib/xingyan.ts`'s per-collection load/sort/twin logic becomes a loop over the same table.

*Why not* a plugin system or a config file on disk: a table in the script is already declarative, keeps types and fixtures in one place, and avoids inventing a schema language for four rows.

*Safety:* the refactor is validated by `--fixture` byte equality before and after. If the fixture diff is non-zero, the refactor is wrong — no exceptions.

### D5 — `update` content type: one entry, bilingual fields (not locale pairs)

`update` carries `title_zh`/`title_en` and `summary_zh`/`summary_en` on a single record, following the `roadmap` precedent, instead of two locale-paired entries under the twins gate.

*Why:* an update is a single dated fact; pairing two CMS entries doubles the authoring steps for no editorial gain, and the twins gate would fail builds whenever a translation lags. Making all four fields required in the zod schema keeps the "no half-translated page" guarantee without the pairing machinery.

*Trade-off:* this is the first content type with `twin: 'fields'` — the registry must express both strategies, which is exactly the generalization the registry exists for.

### D6 — Updates page: log grid, month separators, line filter

Date in a left rail (mono, hairline rule), month as a separator, line filter as a client-side row above the feed with URL mirroring. The signature element of the page is the log grid itself.

*Why not* card grid: cards imply equivalence and invite decoration; a dated log reads as a record of work, which is what the page is.

### D7 — Research page: observatory instrument panel, academy as the main gauge

Two-column layout (academy ~2/3, editorial rail ~1/3). Courses are the only content with real ordering and prerequisites, so they carry the structure: `use` tier numbered (01/02/03) along a descending meridian line with nodes, `build` tier set apart with its prerequisite stated. Briefings and articles share the rail as a "signal log" — mono dates, tag pills, hairline separators, no card borders.

*Why not* keep three equal columns: the columns are no longer equal in weight (4 courses with tiers and dates versus 2 articles), and equal columns assert a false equivalence. *Why* numbering only in the `use` tier: numbering is information only where order is real; the build tier has one entry and a prerequisite, which the `->` treatment expresses better.

The meridian line is the single place the page spends boldness; everything else stays quiet — the Chanel rule.

### D8 — `/products` root becomes the overview; base landing stays at `/products/base`

The overview reuses the homepage's ladder-rail visual language (five cards, ladder characters, numerals) plus `LineTabs`. `/products/base` keeps `BaseLanding` unchanged.

*Why:* the spec already requires the root to present the five-line narrative; the current implementation drifted. Fixing the routing (not the spec) also removes the near-duplicate page pair.

### D9 — Spec surgery: REMOVE + ADD for `updates-feed`, not MODIFY

The four existing `updates-feed` requirements describe repo-derived sourcing, including commit-prefix filtering scenarios. A MODIFIED block must reproduce every existing scenario, which would keep assertions about machinery that no longer exists. So the change removes those four requirements (with Reason/Migration) and adds the replacement set.

*Why not* MODIFIED: it would either preserve false scenarios or require the validator's scenario-completeness rule to be worked around — the honest expression is "this contract is replaced".

## Risks / Trade-offs

- **Registry refactor silently changes serialization** → Gate on `--fixture` byte equality before/after; the fixture diff is the acceptance criterion, and it runs in CI-equivalent local builds.
- **`update` becomes the first `twin: 'fields'` type; the registry generalization is under-tested** → Add a second `fields`-strategy fixture case; assert both strategies through the same validation path in the fixture run.
- **Client-side filtering regresses accessibility / no-JS** → The unfiltered full list renders server-side; filtering is progressive enhancement. Filter links are real anchors carrying params, so no-JS users still get per-value pages via query params (server ignores unknown params and renders all — documented in tasks as an explicit check).
- **CMS single point of failure for updates** → The committed snapshot keeps builds green; the trade-off is that a stale snapshot can ship stale updates, mitigated by the webhook-triggered rebuild and the 6 h cron.
- **Landing cap hides new content** → "View all" is present on every column and the cap is per-column constant; the newest items are always the ones shown.
- **Design work drifting into a rebrand** → impeccable's refinement mode: incumbent identity, copy, and tokens preserved; the meridian line is the only new signature element.
- **`/products` change breaks external deep links** → URLs are unchanged; only the content at the root moves. `/products/base` was already public.

## Migration Plan

1. **CMS first**: add the `update` content type, rebuild the Strapi image, roll it, verify the collection API responds for both locales.
2. **Pipeline**: refactor `fetch-strapi.mjs` to the registry, add `updates` as the first `fields`-strategy collection; prove fixture byte equality for the three existing collections before adding `updates`.
3. **Seed content**: author the current 17 raw entries into a handful of bilingual updates in the CMS; publish.
4. **Site surfaces**: index pages + RSS, updates page, research redesign, products overview — each independently deployable; the build gate (content-integrity + twins) runs on every build.
5. **Retire**: remove the updates fetch from `fetch-repos.mjs` and delete `src/data/updates.json` only after the CMS path is live and verified.

**Rollback**: steps 1–4 are independently revertible (the `update` type can stay unused; pages can be reverted by commit). Step 5 is a deletion — it lands last, after the CMS path is proven, and the old JSON file remains in git history.

## Open Questions

- Whether per-line RSS feeds are worth adding — deferrable; the combined feed covers the subscription need, and adding per-line feeds is additive.
- Whether `releases` should eventually move onto the same registry — deferrable; it is a hand-written collection today and out of scope.
