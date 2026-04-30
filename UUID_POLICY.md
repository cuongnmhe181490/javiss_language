# UUID Policy

## Decision

Polyglot AI Academy uses application-generated UUIDs through Prisma Client for all primary keys.

The current policy is:

- Prisma schema fields keep `@default(uuid()) @db.Uuid`.
- Prisma Client supplies UUID values during normal `create` operations.
- PostgreSQL columns do not rely on DB-side `gen_random_uuid()` or `uuid_generate_v4()` defaults after `20260430091230_pr003c_validation`.
- Raw SQL inserts must provide explicit UUID primary keys.

## Current implementation

- `prisma/schema.prisma` declares UUID primary keys with Prisma `@default(uuid())`.
- `prisma/migrations/20260430091230_pr003c_validation/migration.sql` drops DB-side defaults from existing UUID `id` columns.
- `apps/api/src/prisma-client.ts` creates Prisma Client through the PostgreSQL driver adapter.
- `prisma/seed.ts`, repository code, integration tests, and API mutations insert through Prisma Client or pass explicit deterministic seed IDs.

## Why

This keeps ID generation consistent across local development, tests, and production without requiring a PostgreSQL UUID extension as part of the application contract.

The app already needs deterministic IDs for seed fixtures and integration cleanup. Prisma-generated IDs also keep the repository contract portable for test doubles and future non-raw insert paths.

## Impact on Prisma

Repository and API code can create records without passing `id`; Prisma Client generates valid UUIDs from the schema default.

This is covered by unit/API tests and live integration tests that create:

- audit events
- step-up sessions
- learning progress
- AI conversations/messages
- speaking sessions/tokens/transcript segments
- content sources/items/versions/review events

## Impact on raw SQL

Raw SQL insert scripts must include explicit UUID primary keys for every table with an `id` column.

Do not assume PostgreSQL will generate IDs automatically. If a future operational script needs DB-side UUID defaults, add a reviewed migration and update this policy intentionally.

## Migration notes

No new migration is required for the current policy.

`20260430091230_pr003c_validation` is retained. It documents the current app-generated-ID posture by removing DB-side defaults that Prisma migrate had detected during local infra validation.

If the project later chooses DB-generated UUIDs, use `gen_random_uuid()` with `pgcrypto` and add an idempotent extension migration such as:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Then restore DB defaults in a dedicated migration and update Prisma/docs/tests together.

## Test coverage

Current coverage:

- `pnpm test` exercises repository/API create paths that omit IDs.
- `pnpm test:integration` verifies live Prisma persistence creates IDs successfully.
- `pnpm prisma:seed` uses explicit deterministic IDs where fixtures need stable references.
- `pnpm db:verify` confirms seeded records and cross-tenant samples exist.

## Production recommendation

Keep application-generated UUIDs unless there is a concrete production need for raw SQL insert ergonomics or independent DB writers.

If independent writers are introduced, prefer a deliberate DB-default migration rather than ad hoc SQL defaults in production only. Dev, test, and production must use the same UUID policy.
