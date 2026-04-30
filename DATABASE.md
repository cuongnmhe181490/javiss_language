# Database Foundation

## Overview

PR-003B adds PostgreSQL as the production database path through Prisma ORM.

Schema file:

- `prisma/schema.prisma`

Migration:

- `prisma/migrations/20260427190000_init_enterprise_foundation/migration.sql`
- `prisma/migrations/20260427210000_add_learning_core/migration.sql`
- `prisma/migrations/20260427223000_add_ai_tutor_chat_foundation/migration.sql`
- `prisma/migrations/20260427233000_add_speaking_realtime_foundation/migration.sql`
- `prisma/migrations/20260428003000_add_content_studio_foundation/migration.sql`
- `prisma/migrations/20260430091230_pr003c_validation/migration.sql`

UUID policy:

- Current decision: application-generated UUIDs through Prisma Client.
- Prisma schema keeps `@default(uuid()) @db.Uuid`; PostgreSQL columns do not rely on DB-side UUID defaults after `20260430091230_pr003c_validation`.
- Raw SQL inserts must provide explicit IDs.
- See `UUID_POLICY.md` for details and production guidance.

## Models

- `Tenant`
- `User`
- `UserTenantMembership`
- `AuditEvent`
- `AuthIdentity`
- `StepUpSession`
- `RateLimitBucket`
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
- `AIAgent`
- `PromptVersion`
- `AIConversation`
- `AIMessage`
- `SpeakingSession`
- `SpeakingRealtimeToken`
- `SpeakingTranscriptSegment`
- `ContentSource`
- `ContentItem`
- `ContentVersion`
- `ContentReviewEvent`

## Tenant Constraints

- Tenant-owned tables include `tenantId`.
- `User` has unique `tenantId + email` and `tenantId + externalId`.
- `UserTenantMembership` has unique `tenantId + userId`.
- Audit queries require tenant scope in repository methods.
- Learning queries require tenant scope in repository methods.
- Course slug is unique per tenant.
- Lesson slug is unique per tenant and course.
- Lesson progress is unique per tenant, user, and lesson.
- Course progress is unique per tenant, user, and course.
- AI agent, prompt, conversation, and message queries require tenant scope.
- AI conversation reads require same tenant plus owner match or `ai_conversation:manage`.
- Speaking session, token, and transcript queries require tenant scope.
- Speaking session reads require same tenant plus owner match or `speaking_session:manage`.
- Speaking realtime tokens persist only `tokenHash`, not raw join token.
- Content source, item, version, and review event queries require tenant scope.
- Content source reference is unique per tenant.
- Content version number is unique per tenant and content item.
- Routes never call Prisma directly.

## Local Development

Start services:

```bash
docker compose up -d
```

Generate client:

```bash
pnpm prisma:generate
```

Run migrations:

```bash
pnpm prisma:migrate
```

Seed local data:

```bash
pnpm prisma:seed
```

Seed includes two tenants plus tenant admin, learner, security auditor, and super admin sample identities.
PR-004 seed also includes English/Japanese sample courses, modules, lessons, blocks, vocabulary, grammar, exercise, and learner assignment data.
PR-005 seed also includes tenant-scoped Tutor Coach agents for both sample tenants and one approved prompt version for the sample tenant.
PR-006 seed also includes one sample speaking session and transcript segment for the sample tenant.
PR-008 seed also includes approved content sources for two tenants, one sample content item, and one published content version.
PR-009 does not add a migration; it reuses `ContentVersion.aiQa` and `ContentVersion.validation` JSON fields for QA results and runtime sync metadata.

Verify seed data:

```bash
pnpm db:verify
```

The verifier connects with `DATABASE_URL` or `TEST_DATABASE_URL`, checks that the two sample tenants,
core seed users, memberships, audit table, and step-up table are present, and exits with code `1` if
foundation data is missing.

## Integration Tests

Live database integration tests are opt-in so the default unit suite can run without Docker:

```bash
$env:TEST_DATABASE_URL="postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_test?schema=public"
$env:TEST_REDIS_URL="redis://localhost:6379"
pnpm test:integration
```

Use a separate test database such as `polyglot_test` when possible. The integration suite creates and
deletes deterministic `integration-*` tenants and does not require the seeded dev tenants.

## Backup Note

Production must use managed PostgreSQL backups, point-in-time recovery, tested restore runbooks, and environment-specific retention policies. Local Docker volumes are not backup-safe.
