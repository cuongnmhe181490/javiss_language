# Staging Environment Matrix

No real secrets are stored in this file.

| Variable                           | Required | Example                                            | Notes                                                                        |
| ---------------------------------- | -------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `NODE_ENV`                         | Yes      | `production`                                       | Staging should run production-mode safety checks.                            |
| `PORT`                             | Yes      | platform-provided or `4000`                        | API listens on this port; `API_PORT` can override when set.                  |
| `API_PORT`                         | Optional | `4000`                                             | Prefer platform `PORT` unless a runtime needs a separate API port variable.  |
| `DATABASE_URL`                     | Yes      | managed Postgres URL                               | Required in production mode. Do not commit.                                  |
| `REDIS_URL`                        | Yes      | managed Redis URL                                  | Required in production mode for rate limiting/readiness.                     |
| `AUTH_MODE`                        | Yes      | `oidc`                                             | `dev-header` is blocked when `NODE_ENV=production`.                          |
| `OIDC_ISSUER_URL`                  | Yes      | `https://issuer.example.com/`                      | Required when `AUTH_MODE=oidc`.                                              |
| `OIDC_AUDIENCE`                    | Yes      | `polyglot-api-staging`                             | Required when `AUTH_MODE=oidc`.                                              |
| `OIDC_JWKS_URL`                    | Yes      | `https://issuer.example.com/.well-known/jwks.json` | Required when `AUTH_MODE=oidc`.                                              |
| `OIDC_TENANT_CLAIM`                | Yes      | `tenant_id`                                        | Must map to seeded/staging tenant IDs.                                       |
| `OIDC_ROLES_CLAIM`                 | Yes      | `roles`                                            | Must map to app roles such as `tenant_admin`, `learner`, `security_auditor`. |
| `OIDC_SUB_CLAIM`                   | Yes      | `sub`                                              | Actor user ID claim.                                                         |
| `OIDC_EMAIL_CLAIM`                 | Optional | `email`                                            | Parsed for future identity workflows.                                        |
| `OIDC_JWKS_TIMEOUT_MS`             | Optional | `2000`                                             | Keep bounded to avoid request hangs.                                         |
| `CORS_ALLOWED_ORIGINS`             | Yes      | `https://web-delta-azure-40.vercel.app`            | No wildcard in production. Include staging web domains if any.               |
| `LOG_LEVEL`                        | Yes      | `info`                                             | Avoid `debug` in shared staging unless diagnosing.                           |
| `OTEL_SERVICE_NAME`                | Yes      | `polyglot-api-staging`                             | Used in tracing/log correlation.                                             |
| `OTEL_EXPORTER_OTLP_ENDPOINT`      | Optional | collector URL                                      | Optional until an observability backend is selected.                         |
| `RATE_LIMIT_WINDOW_SECONDS`        | Yes      | `60`                                               | Redis-backed limiter window.                                                 |
| `RATE_LIMIT_MAX_REQUESTS`          | Yes      | `120`                                              | Request ceiling per bucket.                                                  |
| `AUDIT_EXPORT_STEP_UP_TTL_SECONDS` | Optional | `600`                                              | Step-up freshness window.                                                    |
| `API_MAX_BODY_BYTES`               | Optional | `1048576`                                          | Request body size guard.                                                     |
| `API_VERSION`                      | Optional | release version                                    | Returned in health responses.                                                |

## Production Safety Rules

- Never use `AUTH_MODE=dev-header` in staging/prod production mode.
- Never use `CORS_ALLOWED_ORIGINS=*` in staging/prod production mode.
- Do not commit `DATABASE_URL`, `REDIS_URL`, OIDC tokens, or smoke tokens.
- Staging smoke in `AUTH_MODE=oidc` requires role-specific bearer tokens:
  - `API_SMOKE_ADMIN_TOKEN`
  - `API_SMOKE_AUDITOR_TOKEN`
  - `API_SMOKE_LEARNER_TOKEN`
  - `API_SMOKE_CONTENT_EDITOR_TOKEN`

## Current Blocker

Staging cannot run in production mode until real OIDC configuration exists. For a local demo only, use development mode with `AUTH_MODE=dev-header`; do not expose that configuration publicly.
