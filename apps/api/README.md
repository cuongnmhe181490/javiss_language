# Polyglot API

`@polyglot/api` is the first BFF/API foundation for the enterprise SaaS platform.

Current scope:

- health endpoint for deployment checks.
- tenant-aware actor extraction from development headers.
- deny-by-default authorization with `@polyglot/authz`.
- tenant-scoped sample endpoints.
- audit export sample with step-up MFA enforcement.
- learning core, AI tutor chat, speaking realtime, Content Studio, Content QA, and publish sync foundations.
- standardized error format with request ID and timestamp.
- strict CORS allowlist behavior.
- config validation that blocks dev-header auth in production.
- PostgreSQL/Prisma repositories with in-memory test fallbacks.

Development actor headers are non-production scaffolding only:

- `x-dev-user-id`
- `x-dev-tenant-id`
- `x-dev-roles`
- `x-dev-groups`
- `x-dev-mfa-verified-at`

Production auth will replace these headers with OIDC session/JWT validation, SCIM-provisioned identities, device/session revocation, and policy-driven step-up MFA.

## Required local env

PowerShell example:

```powershell
$env:NODE_ENV="development"
$env:AUTH_MODE="dev-header"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
$env:DATABASE_URL="postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_dev?schema=public"
$env:REDIS_URL="redis://localhost:6379"
pnpm dev
```

`AUTH_MODE=dev-header` is blocked when `NODE_ENV=production`.

## Smoke test

Start the API, then from the repo root run:

```bash
pnpm api:smoke
```
