# PR-004 Learning Core

## Scope

PR-004 adds the first tenant-scoped learning domain for Polyglot AI Academy:

- Course, Module, Lesson, LessonBlock.
- VocabularyItem, GrammarPoint, Exercise.
- LessonProgress and CourseProgress.
- Assignment.
- Learner dashboard API.
- Admin/content authoring API.
- RBAC/ABAC policy updates.
- Audit events for important learning actions.

## Not In Scope

- AI tutor chat.
- Realtime speaking.
- Pronunciation scoring.
- SRS scheduling.
- Full content version graph.
- Full group/team analytics.
- Data source ingestion pipeline.

## Database Changes

Migration:

- `prisma/migrations/20260427210000_add_learning_core/migration.sql`

Tables:

- `Course`
- `Module`
- `Lesson`
- `LessonBlock`
- `VocabularyItem`
- `GrammarPoint`
- `Exercise`
- `LessonProgress`
- `CourseProgress`
- `Assignment`

All new tables are tenant-scoped with `tenantId`, tenant indexes, and foreign keys where appropriate.

## Seed Data

`prisma/seed.ts` now adds:

- English A1 Workplace Starter course for sample tenant.
- English A2 Travel Draft course for draft visibility tests.
- Japanese N5 Retail Starter course for cross-tenant isolation.
- One module for each published course.
- Three English lessons and one Japanese lesson.
- Lesson blocks, vocabulary, grammar, exercise, and learner assignment sample data.

`pnpm db:verify` now checks learning seed counts as well as tenant/user foundation data.

## API Changes

Learner:

- `GET /v1/courses`
- `GET /v1/courses/:courseId`
- `GET /v1/lessons/:lessonId`
- `POST /v1/lessons/:lessonId/start`
- `POST /v1/lessons/:lessonId/complete`
- `GET /v1/progress/me`
- `GET /v1/assignments/me`

Admin/content:

- `POST /v1/admin/courses`
- `PATCH /v1/admin/courses/:courseId`
- `POST /v1/admin/courses/:courseId/publish`
- `POST /v1/admin/modules`
- `POST /v1/admin/lessons`
- `PATCH /v1/admin/lessons/:lessonId`
- `POST /v1/admin/lessons/:lessonId/publish`
- `POST /v1/admin/lessons/:lessonId/blocks`
- `POST /v1/admin/assignments`

Tenant-path equivalents under `/v1/tenants/:tenantId/...` also work for compatibility with the existing tenant context foundation.

## Permissions

Added:

- `course:list`, `course:read`, `course:create`, `course:update`, `course:publish`, `course:archive`
- `lesson:read`, `lesson:create`, `lesson:update`, `lesson:publish`, `lesson:start`, `lesson:complete`
- `assignment:read`, `assignment:create`, `assignment:update`
- `progress:read_own`, `progress:read_team`, `progress:update_own`
- `content:update`

Rules:

- Learners can read published learning content and update their own progress.
- Content editors can create/update draft and review content but cannot publish.
- Tenant admins can create/update/publish/archive learning content and create assignments.
- Security auditors cannot edit learning content.
- Cross-tenant access remains denied by default.

## Audit Events

Success events:

- `course:create`
- `course:update`
- `course:publish`
- `lesson:create`
- `lesson:update`
- `lesson:publish`
- `lesson:start`
- `lesson:complete`
- `assignment:create`

Denied events:

- Sensitive learning admin/progress actions use `auditDenied=true` in the authorization helper.

Metadata avoids `answerKey`, raw audio, transcript, token, and secret fields.

## Tests

Added:

- API tests for learner course visibility, lesson detail, progress start/complete, dashboard, assignments, admin create/publish, denied audit, validation errors, and cross-tenant blocks.
- Authz tests for learner, content editor, tenant admin, and security auditor learning permissions.
- Optional Prisma integration coverage for learning progress and assignment persistence when `TEST_DATABASE_URL` is set.
- Smoke coverage for learner courses, no answer key leak, progress, assignments, admin create, denied create, and denied audit.

## Known Limitations

- Group assignment uses `actor.groupIds`; a full `Group` repository/API remains for a later enterprise admin PR.
- Content versioning is currently `version` increment plus audit events, not a full immutable version graph.
- Exercises can be seeded and returned in lesson detail, but authoring endpoints for exercise/vocab/grammar are intentionally deferred.
- Live DB migration/seed requires Docker/Postgres availability.

## Next PR Readiness

PR-004 creates enough learning context for either AI Tutor Chat Foundation or Speaking Realtime Foundation. Since lessons, blocks, progress, assignments, and visibility rules are now present, the next best PR is **PR-005: AI Tutor Chat Foundation** so chat can ground responses in lesson context before realtime speaking is layered on top.
