# Staging Database Runbook

## Provision Managed Postgres

PR-013 status: no staging `DATABASE_URL` is currently configured in the local
environment or known platform env, so no staging migration was run. Use the
steps below once a managed staging database exists.

1. Create a managed PostgreSQL instance in the same region as the API runtime when possible.
2. Enable automated backups and point-in-time recovery.
3. Create a dedicated staging database and app user.
4. Restrict network access to the API runtime, CI migration runner, and trusted admin IPs.
5. Store the connection string as `DATABASE_URL` in the staging secret manager.

## Provision Managed Redis

PR-013 status: no staging `REDIS_URL` is currently configured. Public staging
must use managed Redis; do not fall back to in-memory rate limiting for a
production-mode staging API.

1. Create a managed Redis instance for rate limiting and readiness checks.
2. Require TLS/auth if the provider supports it.
3. Store the connection string as `REDIS_URL`.
4. Confirm the API runtime can connect before opening traffic.

## Generate Prisma Client

Run during image build or CI:

```bash
pnpm prisma:generate
```

## Apply Migrations

Run from a trusted one-off release job before shifting traffic:

```bash
pnpm exec prisma migrate deploy
```

PR-013 manual staging sequence:

1. Provision managed Postgres.
2. Set the platform secret `DATABASE_URL`.
3. Deploy the API image but keep traffic private or blocked until readiness passes.
4. Run `pnpm prisma:generate`.
5. Run `pnpm exec prisma migrate deploy` from a one-off release job or trusted shell.
6. If demo seed is approved, run `pnpm prisma:seed`.
7. Run `pnpm db:verify` against the staging database.
8. Confirm `/health/ready` reports database and Redis ready before public smoke.

Rules:

- Do not run `prisma migrate dev` on staging or production.
- Do not run `prisma migrate reset` on staging or production.
- Do not delete migrations.
- Review migration SQL before deploy.

## Seed Staging Demo Data

Staging seed is optional and must be an explicit decision.

If demo data is allowed:

```bash
pnpm prisma:seed
pnpm db:verify
```

Notes:

- Seed contains deterministic sample tenant/user IDs used by smoke tests.
- Do not seed customer data.
- Do not seed real secrets.
- If OIDC is used, staging test tokens must map to seeded user/tenant IDs or equivalent staging fixtures.
- Current OIDC auth expects `sub` and `tenant_id` claims to be UUIDs matching
  internal user and tenant IDs.
- The seeded Alpha tenant UUID is
  `11111111-1111-4111-8111-111111111111`.
- The seeded Beta tenant UUID is
  `22222222-2222-4222-8222-222222222222`.
- Tenant slugs are not accepted as token tenant IDs by current code.

## Verify Database

```bash
pnpm db:verify
```

Expected verification:

- at least two tenants
- users and memberships
- audit table
- step-up table
- learning sample data
- AI/speaking/content sample data when seed is enabled

## Backup And Rollback

Before migration:

1. Confirm latest backup exists.
2. Capture current migration status:

   ```bash
   pnpm exec prisma migrate status
   ```

3. Keep previous API image available.

Rollback:

- Prefer app rollback to the previous image when only runtime behavior is bad.
- Do not auto-revert schema.
- If schema/data is broken, restore staging from managed backup or apply a reviewed forward migration.
- Preserve logs and failed migration output for diagnosis.

## Disaster Safety

- Never reset staging DB without explicit approval.
- Never point staging at production database.
- Never run smoke tests against production unless they are explicitly production-safe and non-mutating.
