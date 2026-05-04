# PR-014 OIDC Staging Readiness

## Status

PR-014 status: READY-FOR-OIDC-PROVISIONING.

No real OIDC provider credentials, issuer, JWKS URL, audience, or smoke tokens
are available in this workspace, so no public staging deployment or remote OIDC
smoke was run.

## Recommended Strategy

Recommended strategy: **A. Use a real OIDC provider for staging**.

Reasons:

- Public staging runs with `NODE_ENV=production`, and the API intentionally
  rejects `AUTH_MODE=dev-header` in production.
- Current OIDC code verifies JWT issuer, audience, and signature through JWKS.
- Smoke coverage already supports bearer tokens through role-specific env vars.
- Tenant isolation depends on trusted token claims, so platform-only protection
  is not enough for production-mode route validation.

Fallback strategies:

- B. Private platform-protected staging can be used only as a short internal
  infrastructure check, but it must not be called production-mode auth and must
  not expose `AUTH_MODE=dev-header` publicly.
- C. Stay local-only until OIDC is ready when no IdP account is available.

## Required Env

Runtime:

- `NODE_ENV=production`
- `AUTH_MODE=oidc`
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

Smoke:

- `API_SMOKE_BASE_URL`
- `API_SMOKE_AUTH_MODE=oidc`
- `API_SMOKE_EXPECT_PERSISTENCE=1`
- `API_SMOKE_ADMIN_TOKEN`
- `API_SMOKE_AUDITOR_TOKEN`
- `API_SMOKE_LEARNER_TOKEN`
- `API_SMOKE_CONTENT_EDITOR_TOKEN`

## Required Claims

The current API maps OIDC claims directly to the internal actor:

| Claim       | Internal field   | Requirement                                                  |
| ----------- | ---------------- | ------------------------------------------------------------ |
| `sub`       | `actor.userId`   | Must be a UUID matching a seeded or provisioned user id.     |
| `tenant_id` | `actor.tenantId` | Must be a tenant UUID, not a slug.                           |
| `roles`     | `actor.roles`    | Array or comma-separated string of internal RBAC role names. |
| `aud`       | JWT audience     | Must match `OIDC_AUDIENCE`.                                  |
| `iss`       | JWT issuer       | Must match `OIDC_ISSUER_URL`.                                |
| `exp`       | JWT expiry       | Must be valid and unexpired.                                 |

`email` is parsed by config but is not currently used to build the request
actor.

## Required Users

Minimum staging smoke users:

- tenant admin for tenant Alpha.
- learner for tenant Alpha.
- security auditor for tenant Alpha.
- content editor for tenant Alpha.
- optional super admin for explicit cross-tenant policy checks.

See `STAGING_SMOKE_USERS.md`.

## Smoke Token Plan

Tokens must be obtained manually from the staging OIDC provider and set only in
shell environment variables. Do not commit tokens, write them to `.env`, or put
them in docs.

See `REMOTE_SMOKE_OIDC_TOKENS.md`.

## Risks

- If tokens contain tenant slugs instead of UUIDs, the current actor schema will
  reject them.
- If IdP role names differ from internal role names, the current API will treat
  them as invalid roles.
- If seed/demo data is not applied, smoke tokens must map to equivalent
  provisioned tenant/user IDs.
- Public staging without OIDC must remain blocked.

## Done Criteria

- OIDC provider created for staging.
- Issuer, audience, and JWKS URL configured on the platform.
- Claims produce internal UUID `sub` and UUID `tenant_id`.
- Smoke users exist with internal roles.
- Managed Postgres and Redis are configured.
- Migrations are applied with `prisma migrate deploy`.
- Optional demo seed decision is recorded.
- Remote OIDC smoke passes or has only documented step-up limitations.

## Local Validation

No real OIDC remote smoke was run because no provider credentials or tokens are
available. Local validation remains green:

| Command                                                                | Result | Notes                                                   |
| ---------------------------------------------------------------------- | ------ | ------------------------------------------------------- |
| `pnpm typecheck`                                                       | PASS   | Workspace typecheck passed.                             |
| `pnpm lint`                                                            | PASS   | Workspace lint passed.                                  |
| `pnpm test`                                                            | PASS   | API suite: 106 tests passed; web suite: 3 tests passed. |
| `pnpm test:integration`                                                | PASS   | 11 tests passed with real Docker Postgres/Redis env.    |
| `pnpm build`                                                           | PASS   | Web and API build passed.                               |
| `pnpm format:check`                                                    | PASS   | Prettier check passed.                                  |
| `pnpm ai:eval`                                                         | PASS   | 10 eval fixtures passed.                                |
| `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke`                        | PASS   | Local persistence smoke passed.                         |
| `API_SMOKE_EXPECT_PERSISTENCE=1 API_SMOKE_RATE_LIMIT=1 pnpm api:smoke` | PASS   | Local rate-limit smoke passed.                          |
