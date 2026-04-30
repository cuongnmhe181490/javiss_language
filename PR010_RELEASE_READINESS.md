# PR-010 Release Readiness

Date: 2026-04-30

## Current System Status

Overall verdict: READY-BETA for local demo and staging preparation.

PR status:

- PR-003C: PASS with Docker/Postgres/Redis validation.
- PR-004: PASS.
- PR-005: PASS.
- PR-006: PASS.
- PR-007: READY-BETA.
- PR-008: PASS.
- PR-009: PASS.
- PR-010: READY-BETA release readiness documentation and validation.

No P0/P1 issues are open. Remaining P2 items are a credentialed real-provider canary, persisted tenant AI budget/billing ledger, and persisted eval run history.

## Ready For Beta Demo

- Tenant-scoped API with RBAC/ABAC and audit events.
- PostgreSQL/Prisma persistence through Docker Compose.
- Redis-backed rate limiting.
- Learning core learner/admin flows.
- AI tutor chat with deterministic mock provider, citations, prompt safety, structured output validation, and orchestration metadata.
- Speaking foundation with session lifecycle, one-time token scaffold, transcript text fallback, report scaffold, and tenant guards.
- Content Studio source/content/review/publish/sync flow.
- API smoke script with persistence and opt-in rate-limit stress.
- Offline AI eval harness with deterministic router/policy/schema/fallback cases.

## Not Production-Ready

- No credentialed real AI provider canary.
- No persisted tenant AI billing ledger.
- No persisted eval run history.
- Speaking realtime providers are mock/scaffold, not production SFU/STT/TTS.
- OIDC is implemented as a scaffold and still needs a real IdP pilot.
- Object storage/audio retention is not productionized.
- Staging deployment has not been executed against a real platform.

## Required Env Vars

Local API:

- `NODE_ENV=development`
- `AUTH_MODE=dev-header`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `DATABASE_URL=postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_dev?schema=public`
- `REDIS_URL=redis://localhost:6379`

Local integration:

- `TEST_DATABASE_URL=postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_test?schema=public`
- `TEST_REDIS_URL=redis://localhost:6379`

Staging API:

- `NODE_ENV=production`
- `AUTH_MODE=oidc`
- `CORS_ALLOWED_ORIGINS` set to explicit HTTPS origins
- `DATABASE_URL`
- `REDIS_URL`
- `OIDC_ISSUER_URL`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URL`
- OIDC claim mapping variables as needed

## Local Startup Flow

1. Start Docker Desktop.
2. Run `docker compose up -d`.
3. Run `pnpm install` if dependencies are missing.
4. Run `pnpm prisma:generate`.
5. Run `pnpm prisma:migrate`.
6. Run `pnpm prisma:seed`.
7. Run `pnpm db:verify`.
8. Start API with local env and `pnpm dev:api`.
9. Start web with `pnpm dev:web`.
10. Verify `/health/live` and `/health/ready`.
11. Run persistence smoke.

## Staging Deployment Flow

1. Provision Postgres and Redis.
2. Configure API and web env vars from `ENVIRONMENT_READINESS.md`.
3. Run Prisma migrations once against staging.
4. Seed only demo-safe tenant data.
5. Deploy API and web.
6. Check `/health/live` and `/health/ready`.
7. Run `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke` against staging base URL.
8. Run rate-limit stress only in a controlled staging window.
9. Review audit events and logs.
10. Mark staging as demo-ready only after go/no-go checklist passes.

## Demo Script

Use `DEMO_RUNBOOK.md`.

Recommended demo order:

1. Health/readiness.
2. Tenant and audit list.
3. Learner course/lesson/progress flow.
4. AI tutor mock chat with citation and prompt refusal.
5. Speaking mock session/text fallback/report.
6. Content source/content item/review/publish/sync.
7. Audit export step-up denial and success.

## Smoke Test Matrix

Use `SMOKE_TEST_MATRIX.md`.

Current smoke covers health, tenant read, audit, learning, AI tutor, speaking, content, negative auth/tenant cases, persistence readiness, and opt-in rate-limit stress.

## Security Checklist

Use `SECURITY_GO_NO_GO.md`.

Release blocker examples:

- `AUTH_MODE=dev-header` with `NODE_ENV=production`.
- Wildcard CORS in production.
- Missing OIDC issuer/audience/JWKS in OIDC mode.
- Any committed real secret.
- Failing tenant isolation, audit, rate-limit, prompt leak, or answer-key leak checks.

## Domain Readiness

| Domain              | Status     | Evidence files                                                                | Tests                                          | Smoke coverage                           | Remaining risks                                    |
| ------------------- | ---------- | ----------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| Backend foundation  | READY      | `apps/api/src/app.ts`, `README.md`, `PR003C_LOCAL_INFRA_VALIDATION.md`        | `app.spec.ts`, config/logging/rate-limit tests | health/live/ready                        | Production deployment not executed                 |
| Tenant/RBAC/ABAC    | READY      | `AUTHZ_POLICY.md`, `packages/authz/src/index.ts`, `apps/api/src/context.ts`   | `app.spec.ts`, `packages/authz` tests          | tenant read, cross-tenant deny           | Real IdP claims not piloted                        |
| Audit logging       | READY      | `AUDIT_LOGGING.md`, `packages/tenant-core/src/index.ts`                       | audit tests in API suite                       | audit list/export, denied events         | Export worker is queued scaffold only              |
| PostgreSQL/Prisma   | READY      | `prisma/schema.prisma`, migrations, `DATABASE.md`                             | live integration 11/11                         | readiness database ok, persistence flows | Backup/restore not platform-tested                 |
| Redis/rate-limit    | READY      | `apps/api/src/rate-limit.ts`                                                  | Redis integration test                         | readiness redis ok, rate-limit stress    | Redis HA not configured locally                    |
| Learning core       | READY      | `PR004_LEARNING_CORE.md`, `LEARNING_API.md`                                   | `learning.spec.ts`, integration                | courses, lessons, progress, assignments  | Group assignment remains basic                     |
| AI tutor chat       | READY-BETA | `PR005_AI_TUTOR_CHAT_FOUNDATION.md`, `AI_CHAT_API.md`                         | `ai.spec.ts`                                   | conversation/message/refusal             | Provider is mock                                   |
| Speaking foundation | READY-BETA | `PR006_SPEAKING_REALTIME_FOUNDATION.md`, `SPEAKING_REALTIME_API.md`           | `speaking.spec.ts`                             | session/text fallback/report             | No production SFU/STT/TTS                          |
| AI orchestration    | READY-BETA | `PR007_AI_ORCHESTRATION_PROVIDER_PILOT.md`, `MODEL_ROUTER.md`, `AI_POLICY.md` | `ai-orchestration.spec.ts`, `ai-eval.ts`       | AI metadata and refusal                  | No credentialed provider canary                    |
| Content studio      | READY      | `PR008_CONTENT_STUDIO_SOURCE_REGISTRY.md`, `PR009_CONTENT_QA_PUBLISH_SYNC.md` | `content.spec.ts`                              | source/item/review/publish/sync          | Content QA is deterministic scaffold               |
| Security hardening  | READY-BETA | `SECURITY_GO_NO_GO.md`, `SECURITY_BASELINE.md`                                | security tests across API suite                | negative auth/tenant, headers            | Real IdP and staging TLS not piloted               |
| Observability       | READY-BETA | `OBSERVABILITY.md`, `AI_OBSERVABILITY.md`, `LOGGING.md`                       | logging/tracing tests                          | request id and audit metadata            | No external metrics backend                        |
| Docs                | READY      | PR-010 docs plus enterprise docs                                              | format check                                   | N/A                                      | Must stay updated as provider/staging changes land |

## Known Limitations

See `BETA_LIMITATIONS.md`.

## Rollback Plan

Local demo:

- Stop API/web processes.
- Run `docker compose down` to stop backing services.
- Re-run seed to restore demo data if needed.

Staging:

- Keep previous API/web image or artifact.
- Back up database before migration.
- If migration fails, stop rollout and restore backup.
- If API health fails after deploy, rollback API first, then web if needed.
- Disable demo traffic until smoke passes.

## Go/No-Go Checklist

Go when:

- Quality gates pass.
- Persistence smoke passes.
- Rate-limit smoke passes.
- AI eval passes.
- Security go/no-go checklist has no blocked item.
- Demo runbook has been rehearsed against the target environment.

No-go when:

- Any P0/P1 appears.
- Any required environment variable is missing in staging.
- Dev-header auth is enabled in production mode.
- Smoke fails or readiness reports database/redis error.
- Real secrets appear in source, docs, logs, or demo output.
