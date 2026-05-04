# Remote Smoke Report

## Current Status

Status: authenticated remote smoke is blocked because no API staging deployment URL or OIDC smoke tokens are available.

No backend staging deployment was performed in PR-013.

## Public Health Smoke

Not run against a remote API because `API_SMOKE_BASE_URL` for a real API staging URL is not available.

When staging exists, run:

```powershell
curl.exe -I https://<api-staging-url>/health
curl.exe -I https://<api-staging-url>/health/live
curl.exe -I https://<api-staging-url>/health/ready
```

Expected:

- `/health`: `200 OK`
- `/health/live`: `200 OK`
- `/health/ready`: `200 OK`
- readiness body reports `database.status=ok`
- readiness body reports `redis.status=ok`

## Authenticated Smoke

Not run remotely because OIDC smoke tokens are missing.

Required shell-only env:

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

Token acquisition and claim requirements are documented in
`REMOTE_SMOKE_OIDC_TOKENS.md` and `OIDC_STAGING_CLAIMS.md`.

Optional rate-limit stress:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

## Skipped Cases

- Authenticated tenant/audit/learning/AI/speaking/content smoke.
- Audit export success path in OIDC smoke until a real step-up flow or persisted step-up staging fixture exists.
- Remote rate-limit stress.

## Local Smoke Baseline

Local Docker-backed smoke remains passing in PR-013:

- `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke`
- `API_SMOKE_EXPECT_PERSISTENCE=1 API_SMOKE_RATE_LIMIT=1 pnpm api:smoke`

Local `/health/ready` returned `database.status=ok` and `redis.status=ok`; the
overall local status is `degraded` only because local verification uses
`AUTH_MODE=dev-header`.

## Blockers

1. API staging URL.
2. Managed Postgres.
3. Managed Redis.
4. OIDC issuer/audience/JWKS.
5. Staging OIDC users/tokens for smoke roles.
6. Decision on staging seed/demo data.
