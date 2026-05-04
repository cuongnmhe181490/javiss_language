# Railway Staging Checklist

No Railway tokens or service credentials belong in this file.

## Project Setup

- Create or select a Railway account/workspace.
- Create a new Railway project for Polyglot API staging.
- Connect the GitHub repository when available, or deploy from local CLI after
  login.
- Configure the API service to build from `apps/api/Dockerfile`.
- Keep web deployment on Vercel unless a separate staging web deployment is
  created.

## Managed Services

- Add managed Postgres.
- Add managed Redis.
- Confirm both services are in the same region as the API when possible.
- Copy service connection strings into Railway secret variables, not docs.

## Runtime Env

Set at minimum:

- `NODE_ENV=production`
- `AUTH_MODE=oidc`
- `PORT` if Railway does not inject one automatically.
- `DATABASE_URL`
- `REDIS_URL`
- `OIDC_ISSUER_URL`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URL`
- `OIDC_TENANT_CLAIM=tenant_id`
- `OIDC_ROLES_CLAIM=roles`
- `OIDC_SUB_CLAIM=sub`
- `OIDC_EMAIL_CLAIM=email`
- `CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app`
- `LOG_LEVEL=info`
- `OTEL_SERVICE_NAME=polyglot-api-staging`
- `RATE_LIMIT_WINDOW_SECONDS=60`
- `RATE_LIMIT_MAX_REQUESTS=120`

## Health Check

- Configure Railway health check path: `/health/ready`.
- Do not open demo traffic until readiness reports database and Redis ok.

## Migration

Run once from a trusted Railway shell/job after env is set:

```bash
pnpm prisma:generate
pnpm exec prisma migrate deploy
```

Optional demo seed only after approval:

```bash
pnpm prisma:seed
pnpm db:verify
```

Do not run `prisma migrate dev` or reset staging.

## Logs

Check Railway logs for:

- config boot errors
- OIDC JWKS fetch failures
- database connection failures
- Redis connection failures
- readiness failures
- secret/token leakage, which should not occur

## Remote Smoke

After deploy and OIDC token setup:

```powershell
$env:API_SMOKE_BASE_URL="https://<railway-api-domain>"
$env:API_SMOKE_AUTH_MODE="oidc"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
pnpm api:smoke
```

Then run rate-limit stress:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

## Rollback

- Keep the previous successful deployment available.
- Prefer app rollback before database rollback.
- Restore database from managed backup only after confirming schema/data damage.
- Disable public traffic if `/health/ready` fails.
