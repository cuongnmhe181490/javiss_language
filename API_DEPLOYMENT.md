# API Deployment

## Scope

This document covers staging deployment readiness for `apps/api`. It does not choose a hosting provider and does not contain secrets.

## Build

Local build:

```bash
pnpm --filter @polyglot/api build
```

Docker build from repository root:

```bash
docker build -f apps/api/Dockerfile -t polyglot-api:staging .
```

## Runtime

Start command:

```bash
node dist/main.js
```

Container command:

```bash
docker run --rm --env-file .env.staging -p 4000:4000 polyglot-api:staging
```

Do not commit `.env.staging`.

## Required Services

- Managed PostgreSQL exposed through `DATABASE_URL`.
- Managed Redis exposed through `REDIS_URL`.
- OIDC provider exposed through issuer/audience/JWKS env.

## Health Checks

Use:

- `GET /health`
- `GET /health/live`
- `GET /health/ready`

Staging is ready only when `/health/ready` reports:

- `database.status=ok`
- `redis.status=ok`

`AUTH_MODE=oidc` should report auth healthy when OIDC config is complete. `AUTH_MODE=dev-header` is blocked in production mode.

## Migrations

Run migrations as a release task, not in the API container startup:

```bash
pnpm exec prisma migrate deploy
```

The API container must not run migrations automatically on boot.

## Smoke

Remote smoke:

```powershell
$env:API_SMOKE_BASE_URL="https://api-staging.example.com"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
pnpm api:smoke
```

OIDC staging smoke:

```powershell
$env:API_SMOKE_AUTH_MODE="oidc"
$env:API_SMOKE_ADMIN_TOKEN="<tenant-admin-token>"
$env:API_SMOKE_AUDITOR_TOKEN="<security-auditor-token>"
$env:API_SMOKE_LEARNER_TOKEN="<learner-token>"
$env:API_SMOKE_CONTENT_EDITOR_TOKEN="<content-editor-token>"
pnpm api:smoke
```

## Logging

Use `LOG_LEVEL=info` for staging by default. Do not log:

- database URLs
- Redis URLs
- bearer tokens
- OIDC keys
- raw prompts or system prompts
- raw transcript/audio payloads

## Rollback

1. Keep the previous image/deployment available.
2. If readiness fails, stop traffic to the new deployment.
3. Roll back application image first.
4. Treat database rollback as a separate reviewed operation.
5. Use managed Postgres backup/restore for unrecoverable staging data problems.
