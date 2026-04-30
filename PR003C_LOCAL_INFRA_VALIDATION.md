# PR-003C Local Infra Validation & Database Smoke

## Objective

Validate the backend foundation against real local Postgres/Redis before continuing beyond PR-003C. This pass did not add Course/AI/Speaking/Content features; later PR code already exists in the workspace and was not rolled back.

## Environment

- Workspace: `D:\javiss_language`
- Live validation date: 2026-04-30
- Shell: PowerShell
- Git: not initialized in this workspace.
- API process: started locally on port `4000` for smoke validation.

## Docker Status

Status: passed.

Commands checked:

| Command                                  | Result | Notes                                                                    |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `docker --version`                       | Passed | Docker version 29.4.1.                                                   |
| `docker compose version`                 | Passed | Docker Compose v5.1.3.                                                   |
| `docker ps`                              | Passed | Docker CLI reachable; no containers were running before Compose startup. |
| `docker compose up -d`                   | Passed | Started local Postgres and Redis.                                        |
| `docker compose ps`                      | Passed | `polyglot-postgres` and `polyglot-redis` healthy.                        |
| `docker compose logs postgres --tail=80` | Passed | Postgres initialized and accepted connections.                           |
| `docker compose logs redis --tail=80`    | Passed | Redis ready to accept TCP connections.                                   |

## Port Status

| Port   | Before startup | After startup                 |
| ------ | -------------- | ----------------------------- |
| `4000` | Free           | Local API listening.          |
| `5432` | Free           | Bound by `polyglot-postgres`. |
| `6379` | Free           | Bound by `polyglot-redis`.    |

## Postgres / Redis Status

Status: passed.

- Postgres service: `postgres:16-alpine`, container `polyglot-postgres`, healthy.
- Redis service: `redis:7-alpine`, container `polyglot-redis`, healthy.
- Compose credentials: local dev user/database from `docker-compose.yml`; password not repeated here beyond the checked local config.
- Dev database: `polyglot_dev`.
- Test database: `polyglot_test`, created manually in the local Postgres container for integration validation.

## Environment Used

Local validation used development-only values:

- `NODE_ENV=development`
- `PORT=4000`
- `AUTH_MODE=dev-header`
- `DATABASE_URL` targeting local `polyglot_dev`
- `TEST_DATABASE_URL` targeting local `polyglot_test`
- `REDIS_URL=redis://localhost:6379`
- `TEST_REDIS_URL=redis://localhost:6379`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `LOG_LEVEL=debug`
- `OTEL_SERVICE_NAME=polyglot-api-local`
- `RATE_LIMIT_WINDOW_SECONDS=60`
- `RATE_LIMIT_MAX_REQUESTS=120`

No production secret was introduced.

## Prisma Migration / Seed Status

| Command                                            | Result                                 | Notes                                                                                            |
| -------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm prisma:generate`                             | Passed                                 | Prisma Client generated.                                                                         |
| `pnpm prisma:migrate`                              | Passed                                 | Script now runs `prisma migrate dev --name local_dev` and exits cleanly; schema already in sync. |
| `pnpm exec prisma migrate status`                  | Passed                                 | `polyglot_dev` schema is up to date with 6 migrations.                                           |
| `pnpm exec prisma migrate deploy` with test DB URL | Passed                                 | Applied migrations to `polyglot_test`, including `20260430091230_pr003c_validation`.             |
| `pnpm prisma:seed`                                 | Passed after direct Prisma adapter fix | Seed completed against `polyglot_dev`.                                                           |
| `pnpm db:verify`                                   | Passed                                 | Verified seed counts and cross-tenant samples.                                                   |

UUID policy after validation:

- Decision: use application-generated UUIDs through Prisma Client.
- `prisma/schema.prisma` keeps `@default(uuid()) @db.Uuid`.
- `20260430091230_pr003c_validation` drops DB-side UUID defaults; this is intentional for the current policy.
- Raw SQL inserts must provide explicit UUID IDs.
- No PostgreSQL UUID extension is required for normal Prisma/API/seed/test insert paths.
- Detailed policy: `UUID_POLICY.md`.

`pnpm db:verify` reported:

- tenants: 2
- users: 4
- memberships: 4
- audit events: 51
- courses: 5
- lessons: 4
- assignments: 1
- AI agents: 2
- prompt versions: 1
- speaking sessions: 3
- speaking transcript segments: 5
- content sources: 4
- content items: 3
- content versions: 3

## Integration Test Status

Command:

```powershell
pnpm test:integration
```

Result: passed live.

- Vitest: `1 passed (1)`
- Tests: `11 passed (11)`
- DB/Redis skips: none.

Coverage confirmed by the live integration suite:

- DB connection.
- Tenant repository reads.
- Cross-tenant identity isolation.
- Audit create/list/filter/pagination persistence.
- Audit export persistence through the API path.
- Step-up persistence and expiry.
- Learning, AI, speaking, and content repository persistence.
- Readiness DB/Redis checks.
- Redis-backed rate limiter.

## API Health / Ready Status

API started with real `DATABASE_URL` and `REDIS_URL`.

| Endpoint            | Result | Notes                                                                                                                                               |
| ------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`       | Passed | `status=ok`.                                                                                                                                        |
| `GET /health/live`  | Passed | `status=ok`.                                                                                                                                        |
| `GET /health/ready` | Passed | `checks.database.status=ok`, `checks.redis.status=ok`. Overall status was `degraded` only because local `AUTH_MODE=dev-header` marks auth degraded. |

Readiness response did not expose database URL, Redis URL, password, or token values.

## API Smoke Status

Command:

```powershell
API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke
```

Result: passed.

Smoke confirmed:

- health/live/ready.
- readiness reports database and redis ok.
- tenant read with dev headers.
- missing actor blocked.
- cross-tenant tenant read blocked.
- audit list allowed for security auditor.
- audit export without step-up blocked.
- audit export with step-up queued.
- audit export success event persisted in DB.
- learner course/progress/assignment paths.
- AI tutor basic paths and prompt-injection refusal scaffold.
- speaking session/text fallback/report/end paths.
- content source/content workflow/QA/publish/sync paths.
- denied actions produce audit events.

Rate-limit stress smoke was later run with `API_SMOKE_RATE_LIMIT=1` during recovery hardening and passed. Redis connectivity and Redis-backed limiter behavior were validated by readiness, integration tests, normal smoke, and stress smoke.

## Final Quality Gates

| Command             | Result | Notes                                                             |
| ------------------- | ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm typecheck`    | Passed | All workspace typechecks passed.                                  |
| `pnpm lint`         | Passed | Web ESLint and API TypeScript lint passed.                        |
| `pnpm test`         | Passed | API unit suite reported `84 passed                                | 11 skipped`; integration is reported separately with no DB/Redis skips. |
| `pnpm build`        | Passed | Web, packages, and API built successfully.                        |
| `pnpm format:check` | Passed | Prettier check passed after formatting changed docs and lockfile. |

## Issues Fixed

### Prisma Client required a driver adapter

- Files changed: `apps/api/src/prisma-client.ts`, `prisma/seed.ts`, `scripts/verify-db-seed.mjs`, `apps/api/src/prisma-repositories.integration.spec.ts`, package manifests/lockfile.
- Cause: Prisma Client v7 in this workspace requires a driver adapter when constructing `PrismaClient`.
- Fix: added `@prisma/adapter-pg`, `pg`, and `@types/pg`; updated Prisma client construction for API, seed, db verify, and integration tests.

### Audit rows returned nullable DB fields

- File changed: `apps/api/src/prisma-repositories.ts`.
- Cause: persisted `AuditEvent.ip` and `AuditEvent.userAgent` can be `NULL`, while the contract expects omitted/undefined optional strings.
- Fix: normalized `null` to `undefined` before parsing audit events.

### Test database was not migrated

- Cause: Compose creates `polyglot_dev`; `polyglot_test` had to be created and migrated for live integration tests.
- Fix: created `polyglot_test` locally and applied all migrations with `prisma migrate deploy` using the test DB URL.

### Prisma migrate dev needed a non-interactive migration name

- Files changed: `package.json`, `prisma/migrations/20260430091230_pr003c_validation/migration.sql`.
- Cause: `prisma migrate dev` did not exit cleanly without a migration name in this non-interactive validation run.
- Fix: updated `pnpm prisma:migrate` to pass a local default name and reran it successfully. The generated PR-003C validation migration was also applied to the test database.

## Files Changed

- `apps/api/package.json`
- `apps/api/src/prisma-client.ts`
- `apps/api/src/prisma-repositories.integration.spec.ts`
- `apps/api/src/prisma-repositories.ts`
- `package.json`
- `pnpm-lock.yaml`
- `prisma/migrations/20260430091230_pr003c_validation/migration.sql`
- `prisma/seed.ts`
- `scripts/verify-db-seed.mjs`
- `WORK_RESUME_STATUS.md`
- `PR003C_LOCAL_INFRA_VALIDATION.md`

## Remaining Risks

- Workspace is not a git repo, so branch/diff safety cannot be verified with git.
- Later PR code exists beyond PR-004/PR-009 and was not audited in this PR-003C-only pass.
- Rate-limit stress smoke is optional for routine local validation, but the opt-in stress path passed during recovery hardening.

## Readiness For PR-004

Current status: PR-003C passed live validation.

It is infrastructure-safe to continue. Because PR-004 and later code already exists in the workspace, the recommended next action is to audit/repair the later PR implementation rather than add new feature scope blindly.
