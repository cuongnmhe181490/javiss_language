# Staging Deploy Manual Steps

Use this runbook when platform credentials are not available to Codex.

Recommended target: Railway. Backup: Render.

PR-014 update: before deploying public staging, complete OIDC provider setup
from `PR014_OIDC_STAGING_READINESS.md`, `OIDC_STAGING_CLAIMS.md`, and
`STAGING_SMOKE_USERS.md`. Public staging must use `AUTH_MODE=oidc`.

## 1. Create Project

Railway:

```bash
railway login
railway init
```

Render:

- Create a new Web Service.
- Use Docker runtime.
- Set build context to repository root.
- Set Dockerfile path to `apps/api/Dockerfile`.

## 2. Provision Postgres

Railway:

- Add PostgreSQL plugin/service.
- Copy the private connection string into API service env as `DATABASE_URL`.

Render:

- Add managed PostgreSQL.
- Copy internal connection string into API service env as `DATABASE_URL`.

Do not paste the URL into docs or git.

## 3. Provision Redis

Railway:

- Add Redis plugin/service.
- Copy the private Redis URL into API service env as `REDIS_URL`.

Render:

- Add Render Redis or Upstash Redis.
- Copy Redis URL into API service env as `REDIS_URL`.

Do not use in-memory rate limiting for public staging.

## 4. Configure API Env

Set:

```text
NODE_ENV=production
AUTH_MODE=oidc
PORT=<platform-provided>
CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app
LOG_LEVEL=info
OTEL_SERVICE_NAME=polyglot-api-staging
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
OIDC_ISSUER_URL=<issuer>
OIDC_AUDIENCE=<audience>
OIDC_JWKS_URL=<jwks-url>
OIDC_TENANT_CLAIM=tenant_id
OIDC_ROLES_CLAIM=roles
OIDC_SUB_CLAIM=sub
OIDC_EMAIL_CLAIM=email
```

Also set:

```text
DATABASE_URL=<managed-postgres-url>
REDIS_URL=<managed-redis-url>
```

The `tenant_id` token claim must contain the internal tenant UUID. Current code
does not resolve tenant slugs during OIDC authentication.

## 5. Deploy API Image

Railway example:

```bash
railway up --detach
```

Render:

- Trigger deploy from dashboard.
- Confirm Dockerfile path is `apps/api/Dockerfile`.

## 6. Run Migrations

Run once from a trusted shell/job with staging `DATABASE_URL`:

```bash
pnpm prisma:generate
pnpm exec prisma migrate deploy
```

Do not run:

```bash
pnpm prisma:migrate
pnpm exec prisma migrate dev
pnpm exec prisma migrate reset
```

## 7. Optional Demo Seed

Only if staging demo data is approved:

```bash
pnpm prisma:seed
pnpm db:verify
```

If OIDC smoke is used, staging users/tokens must map to seeded tenant/user IDs or equivalent staged fixtures.

## 8. Public Health Smoke

```powershell
curl.exe -I https://<api-staging-url>/health
curl.exe -I https://<api-staging-url>/health/live
curl.exe -I https://<api-staging-url>/health/ready
```

`/health/ready` must report database and Redis `ok`.

## 9. Authenticated Remote Smoke

Set tokens externally in the shell. Do not write tokens to files.

```powershell
$env:API_SMOKE_BASE_URL="https://<api-staging-url>"
$env:API_SMOKE_AUTH_MODE="oidc"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
$env:API_SMOKE_ADMIN_TOKEN="<tenant-admin-token>"
$env:API_SMOKE_AUDITOR_TOKEN="<security-auditor-token>"
$env:API_SMOKE_LEARNER_TOKEN="<learner-token>"
$env:API_SMOKE_CONTENT_EDITOR_TOKEN="<content-editor-token>"
pnpm api:smoke
```

Token setup details: `REMOTE_SMOKE_OIDC_TOKENS.md`.

Optional after normal smoke passes:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

## 10. Rollback

1. Keep the previous image/deployment available.
2. If readiness fails, roll back app image first.
3. Do not reset staging DB.
4. Use managed backup/restore only after explicit review.
5. Preserve logs and failed migration output.
