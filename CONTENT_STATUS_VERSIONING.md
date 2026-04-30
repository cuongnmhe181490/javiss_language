# Content Status And Versioning

## Statuses

- `draft`: editable authoring state.
- `review`: ready for review but not learner-visible.
- `published`: learner-visible.
- `archived`: hidden without hard delete.

## Course Rules

- Learners see only published courses.
- Content editors can create and update draft/review courses.
- Tenant admins can publish.
- Publishing sets `publishedAt` and increments `version`.
- Updating published content increments `version` when the actor has publish-level permission.

## Lesson Rules

- Learners see only published lessons in published courses.
- Content editors can create and update draft/review lessons.
- Tenant admins can publish lessons.
- Learner lesson responses never include `answerKey`.

## Current Versioning Implementation

PR-004 implements:

- `version` integer on course and lesson.
- `publishedAt` timestamp.
- audit events for create, update, publish, start, complete, and assignment create.

PR-008/PR-009 add:

- Content Studio `ContentItem` and `ContentVersion` records.
- deterministic QA metadata on `ContentVersion.aiQa`.
- publish validation metadata on `ContentVersion.validation`.
- explicit sync from a published lesson content version to an existing runtime `Lesson`.
- audit events for QA, publish, rollback, and runtime sync.

PR-004 does not yet implement:

- immutable content snapshots.
- diff review.
- rollback to prior content version.
- block/exercise materialization from Content Studio versions.

Those belong in later Content Studio materialization and data pipeline PRs.
