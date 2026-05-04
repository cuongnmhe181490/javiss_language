# Staging Environment Checklist

No secret values belong in this file.

## Required Runtime Env

| Variable                           | Status   | Notes                                                 |
| ---------------------------------- | -------- | ----------------------------------------------------- |
| `NODE_ENV=production`              | Required | Enables production safety checks.                     |
| `AUTH_MODE=oidc`                   | Required | `dev-header` is forbidden for public staging.         |
| `PORT`                             | Required | Use platform-provided port when available.            |
| `DATABASE_URL`                     | Missing  | Provision managed Postgres first.                     |
| `REDIS_URL`                        | Missing  | Provision managed Redis first.                        |
| `OIDC_ISSUER_URL`                  | Missing  | Required for production-mode auth.                    |
| `OIDC_AUDIENCE`                    | Missing  | Required for token verification.                      |
| `OIDC_JWKS_URL`                    | Missing  | Required for JWT signature verification.              |
| `OIDC_TENANT_CLAIM`                | Required | Default can be `tenant_id`.                           |
| `OIDC_ROLES_CLAIM`                 | Required | Default can be `roles`.                               |
| `OIDC_SUB_CLAIM`                   | Required | Default can be `sub`.                                 |
| `OIDC_EMAIL_CLAIM`                 | Optional | Default can be `email`.                               |
| `CORS_ALLOWED_ORIGINS`             | Required | Must include `https://web-delta-azure-40.vercel.app`. |
| `LOG_LEVEL`                        | Required | Use `info` for staging.                               |
| `OTEL_SERVICE_NAME`                | Required | Use `polyglot-api-staging`.                           |
| `OTEL_EXPORTER_OTLP_ENDPOINT`      | Optional | Add when a collector exists.                          |
| `RATE_LIMIT_WINDOW_SECONDS`        | Required | Recommended: `60`.                                    |
| `RATE_LIMIT_MAX_REQUESTS`          | Required | Recommended: `120`.                                   |
| `AUDIT_EXPORT_STEP_UP_TTL_SECONDS` | Optional | Recommended: `600`.                                   |
| `API_MAX_BODY_BYTES`               | Optional | Recommended: `1048576`.                               |
| `API_VERSION`                      | Optional | Release identifier.                                   |

## PR-014 OIDC Readiness

OIDC staging readiness is documentation-ready but not provisioned. Required
manual inputs still missing:

- staging OIDC provider
- `OIDC_ISSUER_URL`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URL`
- role/tenant claim configuration
- smoke users and role-specific tokens

Claim details: `OIDC_STAGING_CLAIMS.md`.

Smoke user plan: `STAGING_SMOKE_USERS.md`.

## Required Smoke Env

| Variable                         | Status                      | Notes                             |
| -------------------------------- | --------------------------- | --------------------------------- |
| `API_SMOKE_BASE_URL`             | Missing until deploy        | Set to API staging URL.           |
| `API_SMOKE_AUTH_MODE=oidc`       | Required for public staging | Uses Authorization bearer tokens. |
| `API_SMOKE_EXPECT_PERSISTENCE=1` | Required                    | Verifies DB/Redis readiness.      |
| `API_SMOKE_ADMIN_TOKEN`          | Missing                     | Tenant admin staging token.       |
| `API_SMOKE_AUDITOR_TOKEN`        | Missing                     | Security auditor staging token.   |
| `API_SMOKE_LEARNER_TOKEN`        | Missing                     | Learner staging token.            |
| `API_SMOKE_CONTENT_EDITOR_TOKEN` | Missing                     | Content editor staging token.     |
| `API_SMOKE_RATE_LIMIT=1`         | Optional                    | Run after normal smoke passes.    |

## Staging Auth Strategy

Recommended: **A. Use a real OIDC provider**.

Acceptable options:

- A. Real OIDC provider with staging users and role/tenant claims.
- B. `AUTH_MODE=dev-header` only for local, non-public demos.
- C. Private platform-protected staging only as a temporary internal demo; document that it is not production-mode auth.

Public staging must not use `AUTH_MODE=dev-header`.

## Tenant Claim Requirement

Current code maps `OIDC_TENANT_CLAIM` directly to `actor.tenantId`, and
`actor.tenantId` must be a UUID. The staging token must emit the tenant UUID,
not the tenant slug.

Seed tenant values:

| Tenant | Token tenant UUID                      | Slug                         |
| ------ | -------------------------------------- | ---------------------------- |
| Alpha  | `11111111-1111-4111-8111-111111111111` | `javiss-global-hospitality`  |
| Beta   | `22222222-2222-4222-8222-222222222222` | `kansai-retail-language-lab` |

If the IdP only emits organization slugs, a future code change is required to
resolve slugs to tenant UUIDs before public staging smoke can pass.

## CORS

Minimum staging CORS:

```text
CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app
```

Add a staging web URL later if one is created. Do not use `*` with `NODE_ENV=production`.
