# PR-012 Staging Backend Deployment Readiness

## Executive Verdict

Status: READY-BETA for staging deployment preparation.

The API can be deployed to a staging platform once managed PostgreSQL, managed Redis, and OIDC credentials are available. This PR does not deploy the backend and does not add domain features.

## What Was Audited

| Area                        | Status                 | Notes                                                                                                  |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| API package scripts         | Ready                  | `build`, `start`, `test`, `test:integration`, and `ai:eval` exist in `apps/api/package.json`.          |
| Entrypoint                  | Ready                  | `apps/api/src/main.ts` calls `startServer`; production start is `node dist/main.js`.                   |
| PORT binding                | Ready                  | `createApiConfig` reads `API_PORT` or `PORT`; server listens on configured port.                       |
| Health endpoints            | Ready                  | `/health`, `/health/live`, `/health/ready` exist. Readiness checks database and Redis when configured. |
| Production auth safety      | Ready                  | `NODE_ENV=production` blocks `AUTH_MODE=dev-header`.                                                   |
| OIDC production requirement | Ready with credentials | `AUTH_MODE=oidc` requires issuer, audience, and JWKS URL.                                              |
| CORS production safety      | Ready                  | Wildcard origins are blocked in production.                                                            |
| Prisma                      | Ready                  | `prisma generate` and `prisma migrate deploy` are supported; staging must not use `migrate dev`.       |
| Logging                     | Ready-BETA             | Structured JSON logger exists; docs require no raw secrets/prompts in logs.                            |
| Docker artifact             | Added                  | `apps/api/Dockerfile`, `apps/api/.dockerignore`, and root `.dockerignore` added.                       |
| Remote smoke                | Ready-BETA             | Existing smoke supports `API_SMOKE_BASE_URL`; OIDC token env support was added.                        |

## Blockers Before Real Staging Deploy

- Select a hosting platform/container runtime.
- Provision managed PostgreSQL and Redis.
- Configure OIDC issuer/audience/JWKS and create staging test users/tokens.
- Decide whether staging seed/demo data is allowed.
- Configure CORS to include `https://web-delta-azure-40.vercel.app` and any staging web URL.
- Configure backup/restore policy for managed PostgreSQL.

## Required Environment

See `STAGING_ENV_MATRIX.md`.

Minimum production-mode staging values:

- `NODE_ENV=production`
- `AUTH_MODE=oidc`
- `PORT` or platform-provided port
- `DATABASE_URL`
- `REDIS_URL`
- `OIDC_ISSUER_URL`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URL`
- `CORS_ALLOWED_ORIGINS`
- `OTEL_SERVICE_NAME=polyglot-api-staging`

## Start Command

```bash
node dist/main.js
```

Container command:

```bash
docker run --env-file <staging-env-file> -p 4000:4000 polyglot-api:staging
```

Do not commit the env file.

## Migration Command

Run from a trusted CI job or one-off release task:

```bash
pnpm prisma:generate
pnpm exec prisma migrate deploy
```

Do not run `prisma migrate dev` in staging or production.

## Smoke Command

Local/staging dev-header mode:

```powershell
$env:API_SMOKE_BASE_URL="https://api-staging.example.com"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
pnpm api:smoke
```

OIDC staging mode:

```powershell
$env:API_SMOKE_BASE_URL="https://api-staging.example.com"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
$env:API_SMOKE_AUTH_MODE="oidc"
$env:API_SMOKE_ADMIN_TOKEN="<tenant-admin-token>"
$env:API_SMOKE_AUDITOR_TOKEN="<security-auditor-token>"
$env:API_SMOKE_LEARNER_TOKEN="<learner-token>"
$env:API_SMOKE_CONTENT_EDITOR_TOKEN="<content-editor-token>"
pnpm api:smoke
```

OIDC smoke skips audit export step-up success unless the platform provides a real step-up flow or persisted step-up fixture.

Optional rate-limit stress:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

## Rollback Plan

1. Keep the previous container image/deployment available.
2. If health/readiness fails after deploy, route traffic back to the previous deployment.
3. Do not run destructive database rollback automatically.
4. For schema problems, restore from managed Postgres backup or apply a reviewed forward migration.
5. Disable staging traffic while preserving logs and DB state for diagnosis.

## Done Criteria

- Docker build passes.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm build`, `pnpm format:check` pass.
- `pnpm ai:eval` passes.
- Local persistence smoke passes.
- Rate-limit stress smoke passes.
- Runbooks and env matrix are present.

## Verification Results

Validation date/time: 2026-05-01 23:01 +07:00

Docker:

- `docker compose up -d`: passed.
- `polyglot-postgres`: healthy.
- `polyglot-redis`: healthy.
- `docker build -f apps/api/Dockerfile -t polyglot-api:staging .`: passed.

Quality gates:

| Command                 | Result                       |
| ----------------------- | ---------------------------- |
| `pnpm typecheck`        | Passed                       |
| `pnpm lint`             | Passed                       |
| `pnpm test`             | Passed, API 106 tests passed |
| `pnpm test:integration` | Passed, 11/11                |
| `pnpm build`            | Passed                       |
| `pnpm format:check`     | Passed                       |
| `pnpm ai:eval`          | Passed, 10/10                |

Local API smoke:

- `/health/ready` reported `database=ok` and `redis=ok`.
- `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke`: passed.
- `API_SMOKE_EXPECT_PERSISTENCE=1 API_SMOKE_RATE_LIMIT=1 pnpm api:smoke`: passed.
- Local API process was stopped after smoke.

## PR-012 Verdict

PR-012 is complete for staging readiness. Real deployment remains blocked on platform credentials, managed Postgres/Redis, and OIDC configuration.
