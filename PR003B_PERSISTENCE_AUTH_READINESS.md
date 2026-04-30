# PR-003B Persistence And Auth Readiness

## Objective

Upgrade PR-003 from safe in-memory scaffolding toward a production backend foundation without starting PR-004 course/lesson work.

## Scope

- PostgreSQL schema via Prisma.
- Tenant-scoped repository interfaces and Prisma implementation.
- Durable audit persistence path through `AuditRepository`.
- Redis-backed rate limiter implementation and production fail-safe.
- OIDC/JWKS provider scaffold with signature, issuer, audience, expiry, and claim mapping.
- Structured JSON logging with redaction.
- OpenTelemetry request span helper.
- Readiness checks for active database/Redis configuration.
- Step-up session persistence foundation.

## Files Changed

- `prisma/schema.prisma`
- `prisma/migrations/20260427190000_init_enterprise_foundation/migration.sql`
- `prisma/seed.ts`
- `docker-compose.yml`
- `apps/api/src/repositories.ts`
- `apps/api/src/prisma-repositories.ts`
- `apps/api/src/repository-factory.ts`
- `apps/api/src/rate-limit.ts`
- `apps/api/src/rate-limiter-factory.ts`
- `apps/api/src/auth-provider.ts`
- `apps/api/src/logging.ts`
- `apps/api/src/tracing.ts`
- `apps/api/src/readiness.ts`
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`

## Implementation Notes

- Default app path uses Prisma repositories when `DATABASE_URL` exists.
- In-memory repositories remain for unit tests and local fallback only.
- Production config requires `DATABASE_URL`, `REDIS_URL`, OIDC mode, and non-wildcard CORS.
- Redis rate limiting uses `INCR` + expiry and returns retry timing.
- OIDC uses `jose` Remote JWKS verification.
- Step-up checks accept either dev-header MFA evidence or persisted `StepUpSession`.
- Request logs are JSON and redact token/secret/password/cookie/raw audio/raw transcript fields.

## Risks

- Prisma integration tests are optional until Docker/DB is available in CI.
- OIDC provider is structurally real but needs a real enterprise IdP pilot.
- Redis limiter is implemented but default test suite uses in-memory store.
- OpenTelemetry currently provides API-level spans, not full exporter SDK wiring.

## Remaining Scaffolds

- No production SSO credentials or tenant-specific OIDC configuration UI.
- No migration deployment pipeline.
- No append-only/tamper-evident audit storage beyond relational persistence.
- No distributed trace exporter configured by default.

## Next PR Readiness

PR-004 can start only after the team accepts that course/lesson tables must follow the same repository rule: every tenant-scoped query requires `tenantId`, and no route may access Prisma directly.
