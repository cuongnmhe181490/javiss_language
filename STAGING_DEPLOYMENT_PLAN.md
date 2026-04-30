# Staging Deployment Plan

## Recommended Architecture

- Web service: Next.js app.
- API service: Node.js API.
- Managed PostgreSQL.
- Managed Redis.
- Object storage placeholder for future audio/object retention.
- OIDC identity provider.
- Central log sink.
- Optional OTLP collector.

## Services Needed

API:

- Runs `apps/api/dist/main.js`.
- Requires Postgres and Redis.
- Exposes `/health/live` and `/health/ready`.

Web:

- Runs Next.js build output.
- Uses `NEXT_PUBLIC_API_BASE_URL`.

Postgres:

- Stores tenant, audit, learning, AI, speaking, and content data.

Redis:

- Backs rate limiting.

Object storage:

- Placeholder only. Do not demo raw audio retention as production-ready until this exists.

## Env Vars

Use `ENVIRONMENT_READINESS.md`.

Production-mode staging must use:

- `NODE_ENV=production`
- `AUTH_MODE=oidc`
- explicit `CORS_ALLOWED_ORIGINS`
- `DATABASE_URL`
- `REDIS_URL`
- OIDC issuer/audience/JWKS

## Database Migration Plan

1. Snapshot or backup staging database.
2. Run `pnpm prisma:generate` in build.
3. Apply migrations once from a controlled release job.
4. Verify migration status.
5. Run `pnpm db:verify` if seed/demo data is expected.

Do not delete migrations. Do not run destructive resets on staging.

## Seed Strategy

- Seed a demo tenant only when the staging database is dedicated to demo.
- Do not seed real customer data.
- Keep seeded users and tenant ids documented for demo.
- Re-run seed only when demo data reset is intentional.

## Health Checks

- `/health/live`: process liveness.
- `/health/ready`: database and Redis readiness plus auth mode status.

Expected staging readiness can be `degraded` only if auth mode intentionally reports non-production local mode. Production-mode staging should use OIDC and avoid that degradation.

## Smoke After Deploy

```powershell
$env:API_SMOKE_BASE_URL="https://<api-staging-origin>"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
pnpm api:smoke
```

Run rate-limit stress only with approval:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

Run:

```powershell
pnpm ai:eval
```

## Rollback

- Keep previous web/API artifact available.
- If deploy fails before migration, roll back app artifact.
- If migration was applied, restore database backup only after confirming rollback compatibility.
- If Redis fails, route readiness should fail; rollback or fix Redis before demo.
- Disable demo traffic until smoke passes again.

## Backup

- Take a database backup before every staging migration.
- Retain at least one known-good pre-demo backup.
- Validate restore process before first external demo.

## Logs

Capture:

- API request logs.
- Health/readiness failures.
- Audit events.
- AI event metadata.
- Rate-limit errors.

Do not log raw prompts, system prompts, provider secrets, raw transcripts, raw audio, cookies, or bearer tokens.

## Monitoring

Minimum staging monitors:

- API process health.
- `/health/ready`.
- Postgres connectivity.
- Redis connectivity.
- 5xx rate.
- Rate-limit 429 rate.
- Audit event write failures.
- AI schema/fallback/refusal rate.

## Known Constraints

- No real AI provider canary yet.
- No production realtime speaking media path.
- No object storage retention implementation.
- No persisted AI billing ledger or eval history.
- OIDC must be piloted with the target IdP before production.
