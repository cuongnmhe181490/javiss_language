# API Security Baseline

## Headers

All JSON responses include:

- `cache-control: no-store`
- `content-security-policy: default-src 'none'; base-uri 'none'; frame-ancestors 'none'`
- `content-type: application/json; charset=utf-8`
- `permissions-policy: camera=(), microphone=(), geolocation=()`
- `referrer-policy: no-referrer`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `x-request-id`

## CORS Policy

- `CORS_ALLOWED_ORIGINS` is required.
- Production rejects wildcard `*`.
- API only reflects `access-control-allow-origin` when the request origin is explicitly allowlisted.
- Do not trust browser CORS as an authorization boundary.

## Request ID

- Client may pass `x-request-id`.
- Server generates one when missing.
- Every error response includes `requestId` and `timestamp`.
- `x-request-id` is returned in response headers.

## Request Size

- `API_MAX_BODY_BYTES` controls the handler guard.
- Current adapter needs one follow-up for a typed 413 response on chunked stream overflow.

## Rate Limit Policy

Current:

- Redis-backed limiter when `REDIS_URL` is configured.
- process-local in-memory limiter only for test/local fallback.
- key includes tenant ID and actor/IP.
- returns `RATE_LIMITED` with `resetAt` and `retryAfter`.

Production target:

- Redis or API gateway backed.
- separate policies for auth, AI, speaking, export, admin mutations, and upload.
- tenant-level quotas and abuse alerts.

## Logging Redaction

Current:

- Audit metadata sanitizes sensitive keys.

Production target:

- structured logger.
- PII/token redaction.
- no Authorization, cookie, reset token, provider key, raw audio, or raw transcript in logs.
- OpenTelemetry trace/request/tenant correlation.

## Config Checklist

Required:

- `NODE_ENV`
- `PORT` or `API_PORT`
- `AUTH_MODE`
- `CORS_ALLOWED_ORIGINS`
- `LOG_LEVEL`
- `AUDIT_EXPORT_STEP_UP_TTL_SECONDS`
- `RATE_LIMIT_WINDOW_SECONDS`
- `RATE_LIMIT_MAX`
- `API_MAX_BODY_BYTES`

Optional:

- `DATABASE_URL` outside production.
- `REDIS_URL` outside production.

Production blockers:

- `AUTH_MODE=dev-header`.
- wildcard CORS.
- missing OIDC provider configuration.
- missing `DATABASE_URL`.
- missing `REDIS_URL`.
- missing durable audit migration rollout.

## PR-003B Update

- Prisma/PostgreSQL schema and repository implementation exist.
- Redis-backed rate limiting exists and production fails without `REDIS_URL`.
- OIDC/JWKS provider validates signature, issuer, audience, expiration, and claim mapping.
- Structured JSON request logging and redaction helpers exist.
- OpenTelemetry request span helpers exist; exporter SDK wiring is environment work.

## PR-003C Local Infra Validation

- `docker-compose.yml` defines Postgres and Redis healthchecks.
- `pnpm db:verify` checks seed data without printing connection strings.
- `pnpm test:integration` runs live Prisma tests only when `TEST_DATABASE_URL` is set.
- Redis integration tests run only when `TEST_REDIS_URL` is set.
