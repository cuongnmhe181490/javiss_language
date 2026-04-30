# PR-009 Content QA Agent and Publish Sync

## Scope

PR-009 turns the PR-008 Content Studio workflow into a safer publish path:

- Deterministic Content QA Agent scaffold for content versions.
- QA gate before approval and publish.
- Explicit publish sync from published Content Studio lesson versions into learning runtime lessons.
- Tenant-scoped API routes, RBAC/ABAC checks, and audit events.
- Smoke coverage for QA, sync, and denied sync attempts.

## Not in Scope

- External LLM-based content review.
- Full lesson block/exercise materialization from content versions.
- Reviewer assignment queues.
- Tamper-evident review event chains.
- Automatic sync on publish.

## API Changes

- `POST /v1/admin/content/items/:itemId/versions/:versionId/qa`
  - Permission: `content:review`
  - Re-runs deterministic QA and stores the result in `ContentVersion.aiQa`.

- `POST /v1/admin/content/items/:itemId/versions/:versionId/sync-learning`
  - Permission: `content:sync_learning`
  - Requires the version to be `published`.
  - Syncs supported lesson fields into an existing runtime lesson.

## QA Gate

Approval and publish now require `version.aiQa.status === "passed"`.

Current checks:

- Content body is not empty.
- Source lineage exists.
- Sources are approved.
- Lesson level metadata exists.
- Prompt injection phrases are blocked by a deterministic policy lint.

## Publish Sync Behavior

Sync supports lesson content only. The target lesson is resolved from:

1. `body.lessonId` from the sync request.
2. `ContentItem.metadata.runtimeLessonId`.
3. `ContentVersion.body.runtimeSync.lessonId`.

Supported lesson fields:

- `title`
- `description`
- `language`
- `targetLevel`
- `estimatedMinutes`
- `objectives`
- `status=published` when `publishLesson=true`

## Security Notes

- Sync is separate from publish; publish does not silently mutate learner runtime content.
- Learners and content editors cannot sync published content into runtime lessons.
- Denied sync attempts are audited as `content:sync_learning`.
- QA and sync routes use the central tenant context and repository layer.

## Tests

Added coverage for:

- QA failure on prompt-injection content.
- Approval blocked when QA fails.
- Published content sync updates the learning runtime lesson.
- Learner sync denied and audit event persisted.
- Authz policy for `content:sync_learning`.

## Known Limitations

- QA is deterministic scaffold, not an external AI evaluator.
- QA checks are stored in JSON but not versioned in a separate eval run table yet.
- Sync updates lesson scalar fields only; it does not create lesson blocks or exercises.
- No automatic rollback from learning runtime to previous synced version yet.

## Next PR Readiness

PR-009 leaves Course/Lesson runtime stable and Content Studio publish safer. The next backend PR can either:

- Build PR-010 Content-to-Lesson materialization for blocks/exercises, or
- Start PR-005/next Speaking Realtime provider integration if speaking is the higher business priority.
