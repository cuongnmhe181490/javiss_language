# Environment Readiness

## Required Local Env

API local development:

```env
NODE_ENV=development
AUTH_MODE=dev-header
API_PORT=4000
PORT=4000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_dev?schema=public
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
API_MAX_BODY_BYTES=1048576
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=100
```

Integration tests:

```env
TEST_DATABASE_URL=postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_test?schema=public
TEST_REDIS_URL=redis://localhost:6379
```

Smoke:

```env
API_SMOKE_BASE_URL=http://127.0.0.1:4000
API_SMOKE_EXPECT_PERSISTENCE=1
API_SMOKE_RATE_LIMIT=1
```

## Required Staging Env

```env
NODE_ENV=production
AUTH_MODE=oidc
API_PORT=4000
PORT=4000
CORS_ALLOWED_ORIGINS=https://<web-staging-origin>
DATABASE_URL=<managed-postgres-url>
REDIS_URL=<managed-redis-url>
OIDC_ISSUER_URL=https://<issuer>
OIDC_AUDIENCE=<api-audience>
OIDC_JWKS_URL=https://<issuer>/.well-known/jwks.json
OIDC_TENANT_CLAIM=tenant_id
OIDC_ROLES_CLAIM=roles
OIDC_SUB_CLAIM=sub
OIDC_EMAIL_CLAIM=email
OIDC_JWKS_TIMEOUT_MS=2000
LOG_LEVEL=info
API_VERSION=<release-version>
```

Web staging:

```env
APP_ORIGIN=https://<web-staging-origin>
NEXT_PUBLIC_API_BASE_URL=https://<api-staging-origin>/v1
```

## Optional Env

- `OTEL_SERVICE_NAME`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `AUDIT_EXPORT_STEP_UP_TTL_SECONDS`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_MAX_REQUESTS`
- `API_SMOKE_BASE_URL`
- `API_SMOKE_RATE_LIMIT`

`RATE_LIMIT_MAX_REQUESTS` is preferred when both rate-limit max variables exist. `RATE_LIMIT_MAX` remains accepted for compatibility.

## Forbidden Env Practices

- Do not commit `.env` files containing real secrets.
- Do not put provider API keys in docs, examples, code, seed data, or tests.
- Do not set `AUTH_MODE=dev-header` with `NODE_ENV=production`.
- Do not use wildcard CORS in production.
- Do not share local Docker passwords as staging or production credentials.
- Do not log full database URLs, bearer tokens, cookies, API keys, raw prompts, raw transcripts, or raw audio.

## Secret Handling Rules

- Store staging secrets in the deployment platform secret manager.
- Rotate secrets from the platform, not from source code.
- Give each environment its own database, Redis, OIDC client, and future AI provider credentials.
- Use least-privilege database users where the platform supports it.
- Keep local demo credentials clearly local and replaceable.

## Rotation

Database:

- Create a new database credential.
- Update `DATABASE_URL` in staging secrets.
- Restart API.
- Verify `/health/ready`.
- Revoke the old credential after validation.

Redis:

- Create or rotate Redis token/password.
- Update `REDIS_URL`.
- Restart API.
- Verify readiness and rate-limit smoke.

OIDC:

- Rotate client/audience/JWKS from the IdP.
- Update OIDC env vars.
- Verify authenticated tenant routes.

Future AI provider:

- Add provider keys only to secret manager.
- Pass them through provider-specific env vars.
- Never expose them through `AiProvider.metadata`.

## Avoid Logging Secrets

The API logger redacts secret-like keys. AI observability helpers redact raw prompt/content fields and provider metadata rejects secret-like keys. Continue using structured metadata rather than raw request payload logs.

## AUTH_MODE

- Local demo: `AUTH_MODE=dev-header`, `NODE_ENV=development`.
- Staging/production: `AUTH_MODE=oidc`, `NODE_ENV=production`.
- Config rejects dev-header in production.

## DATABASE_URL

Use a PostgreSQL URL accepted by Prisma and `@prisma/adapter-pg`. Local Docker defaults are documented in `.env.example`. Staging must use managed credentials and must not reuse local passwords.

## REDIS_URL

Required in production. Without Redis, local development falls back only when `REDIS_URL` is omitted and `NODE_ENV` is not production. Staging should use managed Redis.

## OIDC

OIDC mode requires issuer URL, audience, JWKS URL, tenant claim, roles claim, subject claim, and email claim. The platform should validate issuer, audience, expiry, tenant, and roles.

## Future AI Provider Configuration

Add provider credentials later as environment variables such as `AI_<PROVIDER>_API_KEY`, but do not introduce them until a credentialed provider PR. Provider implementation must keep keys out of metadata, logs, test fixtures, docs, and API responses.
