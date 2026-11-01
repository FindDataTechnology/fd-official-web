---
date: "2026-11-01"
title: "The ontology now has a rollback-able history: events, snapshots and an integrity self-check"
summary: "The ontology (entity and relationship declarations) on the Wire platform previously had only a single 'current state': mistakes left no trace, the ontology could not be exported, and nothing could be rolled back. This release adds a semantic versioning layer — every change appends one immutable event carrying the full before/after state; version snapshots can be taken on a schedule or on demand, each with a content digest; any two versions can be compared field by field; the ontology exports to JSON/YAML in one click; rollback to any version keeps history append-only; and an integrity self-check ('folded events vs current state') catches direct database writes that bypass the service layer. A live eight-step drill passed end to end: publish, modify, count, compare, export, roll back, re-publish with an identical digest, self-check consistent."
kind: note
tags: [ontology, versioning, audit]
sources:
  - id: src-1
    label: "Wire platform ontology versioning documentation: version semantics (bumping a version = taking a snapshot), write-surface discipline (single write entry point; bypassing writes never enter the event stream), export format (schema_version), and the two recovery paths"
  - id: src-2
    label: "2026-11-01 live drill record: eight steps passed in a real customer environment (publish → modify an entity → unpublished-change count 1 → field-level diff → export JSON/YAML → rollback digest aligned → re-publish created no new version → integrity self-check consistent)"
  - id: src-3
    label: "Regression baseline (2026-11-01): backend suite 1718 passing, including 28 new ontology-versioning tests; frontend suite 1077 passing, including 10 new version-section tests"
claims:
  - id: c0001
    section: "Bottom line first"
    type: number
    evidence: [src-2]
  - id: c0002
    section: "Verification"
    type: number
    evidence: [src-3]
---

## Bottom line first

The Wire platform ontology = the business declarations of entities and relationships (business name, bound dataset, primary-key columns, relationship targets). Since 2026-11-01 the ontology carries full semantic versioning, and every capability has been exercised in a real customer environment (the drill environment held an existing ontology of 5 entities and 5 relationships).

| Capability | What it does | Where |
| --- | --- | --- |
| Change events | Every create/update/delete appends one immutable event with the full before/after state | Recorded automatically, no action needed |
| Version snapshots | "Bumping a version" = taking a snapshot of the current state with a content digest; a daily snapshot runs automatically and skips days with zero changes | "Take a release" button on the console Entities page |
| Version comparison | Compare any two versions entry by entry: added / removed / field-level changes with before → after values | "Compare with current" button on a version row |
| Version export | Export JSON or YAML — a chosen version or the current state, optionally with change provenance | "Export" buttons in the version section |
| Rollback | Return to any version: a plan preview first, then step-by-step execution after confirmation; history only grows | "Roll back to this version" button on a version row (owner only) |
| Integrity self-check | Compares "folded events vs current state" and exposes direct database writes that bypass the service layer | "Integrity self-check" badge in the version section |

The eight-step live drill passed end to end: take a release → modify one entity → unpublished-change count reads 1 → the field-level diff matches the expectation → export JSON and YAML → after rollback the current state's digest equals the target version's → publishing again honestly reports "content matches vN, no new version" → the integrity self-check reports consistent.

## The problem before: only a "current state"

Before versioning shipped, the ontology was a single current state, and three everyday actions were all untraceable:

| Action | Before versioning | After |
| --- | --- | --- |
| Change primary-key columns or column notes | Overwritten in place, no record | The event records the full before/after state; the field-level difference shows in version comparison |
| Delete an entity or relationship | The object is simply gone | The event preserves the deleted object's full content |
| Take the ontology elsewhere | No export entry point | One-click JSON/YAML export; the document carries a content digest for verification |

"Unpublished changes" counts events: the number of changes that landed after the latest snapshot. Modifying the same entity twice counts as 2 unpublished changes, while version comparison shows 1 net change — the two numbers answer two different questions, and both are reported as real data.

## Design: four decisions

**Decision one: events and the ontology share one database transaction.** If the event write fails, the ontology write fails. Cross-database dual writes cannot guarantee consistency, and "the ontology changed but no event exists" is precisely the defect this mechanism exists to eliminate. The write surface converges on a single write entry point: console operations, AI declaration actions, and rollback execution all go through it, each carrying its operator and origin markers.

**Decision two: the content digest covers semantic content only.** The snapshot digest hashes a canonicalized form of the ontology: entry ordering, key ordering and type shapes are all normalized first, and timestamps are excluded. The same content always yields the same digest at any moment — rolling back to a version and publishing again makes the system honestly report "content matches vN" instead of creating a new version. That is the digest guarantee applied directly.

**Decision three: a snapshot is a release decision, not a changelog.** The daily snapshot runs once a day and silently skips days with zero changes; a manual release can be taken at any time with a label; identical digests never produce duplicate snapshots. The daily version is the timeline; the manual version is a release decision — different semantics, both retained.

**Decision four: rollback = replay the plan, not table overwrite.** Rollback never overwrites tables back to an old state — that would create a hole in history with no events. A rollback first produces a plan preview (which entries will be created / updated / deleted); after the owner confirms, each step executes through the same write entry point and lands one rollback event per step; if any step fails validation mid-way, execution stops honestly, the already-executed steps keep their events, and another rollback can correct them. Rollback is therefore always itself rollback-able.

## Application scenarios: who uses it and how

- **Customer administrators**: read the version timeline and unpublished-change count on the console Entities page; take a labelled release at milestones (e.g. "smoke-test ontology final"); roll back to any release when something breaks.
- **AI consumers**: the Wire supply surface reads ontology export documents through public search; `schema_version` is the export format version, and consumers branch on it to judge the document shape.
- **Platform operations**: the integrity self-check is the only grounded detection for direct writes that bypass the service layer — when the current state disagrees with the folded events, the badge turns red and lists each differing entry.

## Verification

| Verification surface | Result | Scope |
| --- | --- | --- |
| Backend regression suite | 1718 tests passing | Includes 28 new ontology-versioning tests: events, snapshots, diff, export, rollback, self-check |
| Frontend regression suite | 1077 tests passing | Includes 10 new version-section component tests |
| Live drill | Eight steps passed | Real customer environment, existing ontology (5 entities / 5 relationships); the steps are listed in the bottom-line table |

The drill's rollback exercised the field-level update path: modify one entity's description → unpublished-change count reads 1 → the diff hits that field → rollback executes 1 step with aligned digests → publishing again creates no new version. Rollback of deletion-shaped changes (restoring deleted objects from a snapshot while preserving their original identifiers) is covered by the same test suite.

## Boundaries and recovery

Two boundaries, stated plainly:

1. **Direct writes that bypass the write surface never enter the event stream.**
   - Any change made around the single write entry point (such as manual database surgery) produces no events.
   - The integrity self-check is what exposes such changes: the current state disagrees with the folded events, the badge turns red, and each differing entry is listed.
   - When an incident genuinely requires a direct write, take a manual release immediately afterwards to fold the resulting state into version history.
2. **Semantic versioning does not replace database backups.**
   - Versioning covers ontology semantics (entities and relationships) only — not data rows or any other platform data.
   - Semantic rollback answers "what changed between this version and that one, and how to return to one"; corruption or catastrophic deletion recovers from the daily database-level backup.
   - The two recovery paths complement, not replace, each other.
