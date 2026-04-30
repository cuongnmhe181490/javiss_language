# Work Resume Status

## 1. Current conclusion

- Current phase: Mixed codebase with later PR code present, but PR-003C live local infra validation is now complete.
- Confidence: High for Docker/Postgres/Redis, Prisma, seed, integration, and API smoke status as of 2026-04-30.
- Can continue to PR-004: Yes for infrastructure readiness. Note: PR-004 and later code already exists and should be audited before further feature work.
- Reason: Docker/Postgres/Redis are running healthy; Prisma migrations and seed passed; `db:verify` passed; live DB/Redis integration passed with no skips; persistence smoke passed with `/health/ready` reporting `database=ok` and `redis=ok`.

Latest PR-003C live validation on 2026-04-30:

- `docker --version`: Docker version 29.4.1.
- `docker compose version`: Docker Compose v5.1.3.
- `docker compose up -d`: passed.
- Postgres: `polyglot-postgres`, healthy, bound to `localhost:5432`.
- Redis: `polyglot-redis`, healthy, bound to `localhost:6379`.
- API: started on port `4000` with real `DATABASE_URL` and `REDIS_URL`.
- `/health/ready`: `database=ok`, `redis=ok`; overall `degraded` only because local `AUTH_MODE=dev-header`.
- Result: PR-003C passed live validation. The validation sequence was rerun successfully on 2026-04-30 after Docker was available.

## 2. What exists

| Area              | Evidence files                                                                                                                    | Status         | Notes                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| Workspace         | `package.json`, `pnpm-workspace.yaml`, `turbo.json`                                                                               | Present        | pnpm monorepo with `apps/*` and `packages/*`.                                                   |
| Git               | none                                                                                                                              | Not a git repo | `git rev-parse --is-inside-work-tree` failed. No branch/status available.                       |
| API app           | `apps/api/src/app.ts`, `apps/api/src/server.ts`                                                                                   | Present        | HTTP API with health, tenant, audit, learning, AI, speaking, content routes.                    |
| Web app           | `apps/web`                                                                                                                        | Present        | Next.js app builds successfully.                                                                |
| Packages          | `packages/authz`, `packages/contracts`, `packages/tenant-core`, `packages/config`, `packages/design-tokens`, `packages/ui`        | Present        | Authz/tenant/contracts have source and built dist output.                                       |
| PR-003 docs       | `PR003_BACKEND_FOUNDATION_AUDIT.md`, `TENANT_CONTEXT.md`, `AUTHZ_POLICY.md`, `AUDIT_LOGGING.md`, `SECURITY_BASELINE.md`           | Present        | Backend foundation documented.                                                                  |
| PR-003B docs/code | `PR003B_PERSISTENCE_AUTH_READINESS.md`, `DATABASE.md`, `OIDC_INTEGRATION.md`, `LOGGING.md`, `OBSERVABILITY.md`, `STEP_UP_AUTH.md` | Present        | Prisma, Redis rate limit, OIDC/JWKS, logging, tracing, readiness exist.                         |
| PR-003C docs      | `PR003C_LOCAL_INFRA_VALIDATION.md`, `scripts/verify-db-seed.mjs`                                                                  | Complete       | Live Docker/Postgres/Redis validation passed on 2026-04-30.                                     |
| PR-004 docs/code  | `PR004_LEARNING_CORE.md`, `LEARNING_DOMAIN_MODEL.md`, `LEARNING_API.md`, `apps/api/src/learning-*`                                | Present        | Learning core is implemented, not merely planned.                                               |
| Later PRs         | `PR005*`, `PR006*`, `PR007*`, `PR008*`, `PR009*`, matching API source files                                                       | Present        | AI tutor, speaking, AI orchestration, content studio, QA/sync scaffolds exist.                  |
| Env examples      | `.env.example`, `apps/api/.env.example`                                                                                           | Present        | Include `DATABASE_URL`, `TEST_DATABASE_URL`, `REDIS_URL`, OIDC, CORS, rate limit, tracing vars. |
| Docker compose    | `docker-compose.yml`                                                                                                              | Present        | Defines Postgres 16 and Redis 7 with healthchecks.                                              |

## 3. What is incomplete

| Item                                       | Risk                                                                                                 | Required next action                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Later PR code not audited in this pass     | Codebase has PR-004 through PR-009-era implementation beyond the PR-003C scope.                      | Audit later PR code before choosing repair or continuation work.                                 |
| Rate-limit stress smoke skipped by default | Redis health and Redis integration passed, but `API_SMOKE_RATE_LIMIT=1` stress path was not enabled. | Optional: run `API_SMOKE_RATE_LIMIT=1 pnpm api:smoke` if rate-limit stress evidence is required. |
| Workspace not git repo                     | Cannot identify branch, uncommitted changes, or safe diff boundary.                                  | Initialize/restore git metadata if change tracking is required.                                  |

## 4. Commands checked

| Command                                         | Result                  | Notes                                                                                                                                                |
| ----------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `Get-ChildItem -Force`                          | Passed                  | Root inventory collected.                                                                                                                            |
| `git rev-parse --is-inside-work-tree`           | Failed                  | Not a git repository.                                                                                                                                |
| `rg --files`                                    | Failed                  | `rg.exe` access denied; used PowerShell fallback.                                                                                                    |
| `docker --version`                              | Passed                  | Docker version 29.4.1.                                                                                                                               |
| `docker compose version`                        | Passed                  | Docker Compose v5.1.3.                                                                                                                               |
| `docker ps`                                     | Passed                  | Initially no containers; after Compose, Postgres/Redis running.                                                                                      |
| Port 4000 check                                 | Passed                  | Initially free; later owned by the local API process.                                                                                                |
| Port 5432 check                                 | Passed                  | Initially free; later bound by `polyglot-postgres`.                                                                                                  |
| Port 6379 check                                 | Passed                  | Initially free; later bound by `polyglot-redis`.                                                                                                     |
| `docker compose up -d`                          | Passed                  | Started Postgres and Redis.                                                                                                                          |
| `docker compose ps`                             | Passed                  | `polyglot-postgres` and `polyglot-redis` healthy.                                                                                                    |
| `docker compose logs postgres --tail=80`        | Passed                  | Postgres initialized and ready to accept connections.                                                                                                |
| `docker compose logs redis --tail=80`           | Passed                  | Redis ready to accept connections.                                                                                                                   |
| `pnpm prisma:generate`                          | Passed                  | Prisma Client generated.                                                                                                                             |
| `pnpm prisma:migrate`                           | Passed                  | Script now runs `prisma migrate dev --name local_dev` and exits cleanly; schema already in sync.                                                     |
| `pnpm exec prisma migrate status`               | Passed                  | `polyglot_dev` schema up to date with 6 migrations.                                                                                                  |
| `pnpm exec prisma migrate deploy`               | Passed                  | Applied migrations to `polyglot_test`, including `20260430091230_pr003c_validation`.                                                                 |
| `pnpm prisma:seed`                              | Passed after direct fix | Seed required Prisma PostgreSQL driver adapter.                                                                                                      |
| `pnpm db:verify`                                | Passed                  | Verified 2 tenants, 4 users, memberships, audit, learning, AI, speaking, and content seed data; dev DB also contains accumulated smoke-created rows. |
| `pnpm test:integration`                         | Passed live             | `11 passed (11)`, no DB/Redis skips.                                                                                                                 |
| API health checks                               | Passed                  | `/health` ok, `/health/live` ok, `/health/ready` has `database=ok` and `redis=ok`.                                                                   |
| `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke` | Passed                  | Persistence smoke passed; rate-limit stress was skipped because `API_SMOKE_RATE_LIMIT` was not enabled.                                              |
| `pnpm typecheck`                                | Passed                  | All workspace typechecks passed after adapter fix.                                                                                                   |
| `pnpm lint`                                     | Passed                  | Web ESLint and API TypeScript lint passed.                                                                                                           |
| `pnpm test`                                     | Passed                  | API unit suite `84 passed                                                                                                                            | 11 skipped`; integration is covered separately with no skips. |
| `pnpm build`                                    | Passed                  | Web, packages, and API build passed.                                                                                                                 |
| `pnpm format:check`                             | Passed                  | Prettier check passed after formatting changed docs and lockfile.                                                                                    |

## 5. API status

| METHOD | PATH                                                                | PURPOSE                          | AUTH/TENANT REQUIRED           | STATUS                                               |
| ------ | ------------------------------------------------------------------- | -------------------------------- | ------------------------------ | ---------------------------------------------------- |
| GET    | `/health`                                                           | Process health                   | No                             | Implemented                                          |
| GET    | `/health/live`                                                      | Liveness                         | No                             | Implemented                                          |
| GET    | `/health/ready`                                                     | Readiness checks                 | No                             | Implemented; DB/Redis checks require env-backed deps |
| GET    | `/v1/tenants/:tenantId`                                             | Tenant read                      | Yes                            | Implemented                                          |
| GET    | `/v1/tenants/:tenantId/audit-events`                                | Audit list/filter/page           | Yes, `audit:list`              | Implemented                                          |
| POST   | `/v1/tenants/:tenantId/audit-events/export`                         | Audit export queue               | Yes, `audit:export` + step-up  | Implemented                                          |
| GET    | `/v1/courses`                                                       | Learner course list              | Yes, actor tenant              | Implemented                                          |
| GET    | `/v1/courses/:courseId`                                             | Course detail                    | Yes                            | Implemented                                          |
| GET    | `/v1/lessons/:lessonId`                                             | Lesson detail                    | Yes                            | Implemented                                          |
| POST   | `/v1/lessons/:lessonId/start`                                       | Start lesson progress            | Yes, `lesson:start`            | Implemented                                          |
| POST   | `/v1/lessons/:lessonId/complete`                                    | Complete lesson progress         | Yes, `lesson:complete`         | Implemented                                          |
| GET    | `/v1/progress/me`                                                   | Learner progress dashboard       | Yes, `progress:read_own`       | Implemented                                          |
| GET    | `/v1/assignments/me`                                                | Learner assignments              | Yes, `assignment:read`         | Implemented                                          |
| POST   | `/v1/admin/courses`                                                 | Create course                    | Yes, `course:create`           | Implemented                                          |
| PATCH  | `/v1/admin/courses/:courseId`                                       | Update course                    | Yes, `course:update`           | Implemented                                          |
| POST   | `/v1/admin/courses/:courseId/publish`                               | Publish course                   | Yes, `course:publish`          | Implemented                                          |
| POST   | `/v1/admin/modules`                                                 | Create module                    | Yes, `lesson:create`           | Implemented                                          |
| POST   | `/v1/admin/lessons`                                                 | Create lesson                    | Yes, `lesson:create`           | Implemented                                          |
| PATCH  | `/v1/admin/lessons/:lessonId`                                       | Update lesson                    | Yes, `lesson:update`           | Implemented                                          |
| POST   | `/v1/admin/lessons/:lessonId/publish`                               | Publish lesson                   | Yes, `lesson:publish`          | Implemented                                          |
| POST   | `/v1/admin/lessons/:lessonId/blocks`                                | Create lesson block              | Yes, `lesson:update`           | Implemented                                          |
| POST   | `/v1/admin/assignments`                                             | Create assignment                | Yes, `assignment:create`       | Implemented                                          |
| GET    | `/v1/ai/agents`                                                     | List tutor agents                | Yes, `agent:read`              | Implemented                                          |
| POST   | `/v1/ai/conversations`                                              | Create AI conversation           | Yes, `ai_tutor:chat`           | Implemented                                          |
| GET    | `/v1/ai/conversations/:conversationId`                              | Read own/manage AI conversation  | Yes                            | Implemented                                          |
| POST   | `/v1/ai/conversations/:conversationId/messages`                     | Send AI tutor message            | Yes, `ai_tutor:chat`           | Implemented                                          |
| POST   | `/v1/speaking/sessions`                                             | Create speaking session          | Yes, `speaking_session:create` | Implemented                                          |
| GET    | `/v1/speaking/sessions/:sessionId`                                  | Read speaking session            | Yes, owner/manage              | Implemented                                          |
| POST   | `/v1/speaking/sessions/:sessionId/text-fallback`                    | Add text fallback turn           | Yes, owner                     | Implemented                                          |
| GET    | `/v1/speaking/sessions/:sessionId/report`                           | Speaking report scaffold         | Yes                            | Implemented                                          |
| POST   | `/v1/speaking/sessions/:sessionId/end`                              | End speaking session             | Yes, owner                     | Implemented                                          |
| GET    | `/v1/admin/sources`                                                 | Source registry list             | Yes, `source:read`             | Implemented                                          |
| POST   | `/v1/admin/sources`                                                 | Create source                    | Yes, `source:write`            | Implemented                                          |
| PATCH  | `/v1/admin/sources/:sourceId`                                       | Update source                    | Yes, `source:write`            | Implemented                                          |
| POST   | `/v1/admin/sources/:sourceId/approve`                               | Approve source                   | Yes, `source:approve`          | Implemented                                          |
| GET    | `/v1/admin/content`                                                 | Content item list                | Yes, `content:read`            | Implemented                                          |
| GET    | `/v1/admin/review-queue`                                            | Content review queue             | Yes, `content:review`          | Implemented                                          |
| POST   | `/v1/admin/content/items`                                           | Create content item              | Yes, `content:create`          | Implemented                                          |
| GET    | `/v1/admin/content/items/:itemId`                                   | Content item detail              | Yes, `content:read`            | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/versions`                          | Create content version           | Yes, `content:update`          | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/submit-review`                     | Submit content review            | Yes, `content:update`          | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/approve`       | Approve version                  | Yes, `content:review`          | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/qa`            | Run deterministic QA             | Yes, `content:review`          | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/publish`       | Publish version                  | Yes, `content:publish`         | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/sync-learning` | Sync published content to lesson | Yes, `content:sync_learning`   | Implemented                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/rollback`      | Roll back version                | Yes, `content:rollback`        | Implemented                                          |

## 6. Database status

- Prisma models: `Tenant`, `User`, `UserTenantMembership`, `AuditEvent`, `AuthIdentity`, `StepUpSession`, `RateLimitBucket`, `Course`, `Module`, `Lesson`, `LessonBlock`, `VocabularyItem`, `GrammarPoint`, `Exercise`, `LessonProgress`, `CourseProgress`, `Assignment`, `ContentSource`, `ContentItem`, `ContentVersion`, `ContentReviewEvent`, `AIAgent`, `PromptVersion`, `AIConversation`, `AIMessage`, `SpeakingSession`, `SpeakingRealtimeToken`, `SpeakingTranscriptSegment`.
- Migrations: 6 migrations. Latest is `20260430091230_pr003c_validation`, generated during PR-003C validation to resolve Prisma schema drift on UUID defaults. Earlier migrations include `init_enterprise_foundation`, `add_learning_core`, `add_ai_tutor_chat_foundation`, `add_speaking_realtime_foundation`, and `add_content_studio_foundation`.
- Seed: `prisma/seed.ts` exists and seeds at least two tenants plus users, memberships, audit event, learning content, AI tutor data, speaking sample data, and content studio sample data.
- Docker/Postgres/Redis: Docker is available. Compose started healthy Postgres 16 and Redis 7 on local ports 5432 and 6379. Compose uses `POSTGRES_USER=polyglot`, local development password, and `POSTGRES_DB=polyglot_dev`.
- Integration tests: Present in `apps/api/src/prisma-repositories.integration.spec.ts`; live run passed `11 passed (11)` with `TEST_DATABASE_URL` and `TEST_REDIS_URL` set. No DB/Redis skip remains in the integration command.

## 7. Security/tenant status

- Auth: `dev-header` and `oidc` modes exist. `dev-header` is blocked in production. OIDC uses `jose`, `createRemoteJWKSet`, and `jwtVerify`; this is real JWT/JWKS verification structure, not a pure stub.
- Tenant isolation: Central scope resolution and `@polyglot/tenant-core` helpers exist. Authz enforces tenant match by default; super admin cross-tenant requires explicit allow plus justification in package logic.
- RBAC/ABAC: `@polyglot/authz` contains role-to-permission mapping for `super_admin`, `tenant_admin`, `lnd_manager`, `content_editor`, `linguist_reviewer`, `teacher`, `learner`, `support`, `security_auditor`, and `data_protection_officer`. Permission set covers PR-004 and later domains.
- Audit: Audit append/list/export exist. Denied sensitive actions are audited when handlers pass `auditDenied: true`. Metadata sanitizer drops sensitive keys such as token, password, secret, authorization, raw audio, and raw transcript.
- Rate limit: Redis-backed limiter exists and is selected when `REDIS_URL` is set; in-memory fallback is allowed outside production. Production requires `REDIS_URL`.
- Logging/tracing: JSON logger and OpenTelemetry request span scaffolding exist with request/tenant metadata hygiene.
- Security headers/CORS/body guard: `jsonResponse` adds security headers and allowlisted CORS. Body size guard exists in app and server adapter.

## 8. Recommended next step

C. Start PR-004

Reason: PR-003C live validation is now complete. Because this workspace already contains PR-004 through later PR code, the practical next step is to audit/repair the later PR implementation rather than blindly add new feature code.

## 9. Exact next prompt to run

PR-003C live validation is complete. Audit the existing PR-004 through PR-009-era code against the project docs and tests, identify gaps/regressions without adding new feature scope, and propose the safest repair/continuation plan.
