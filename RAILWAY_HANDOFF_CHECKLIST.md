# Railway Handoff Checklist

No Railway tokens, database passwords, Redis passwords, OIDC client secrets, or
smoke bearer tokens belong in this file.

## 1. Repository Handoff

- Confirm the local repo is clean.
- Confirm remote target:
  `https://github.com/cuongnmhe181490/javiss_language`
- Push only after manual approval:

```powershell
git push origin master
```

- Do not push `.env`, `.vercel`, `.codex`, logs, build outputs, or local
  dependency folders.

## 2. Railway Project

- Create a Railway project for Polyglot AI Academy API staging.
- Connect the GitHub repository after it is pushed.
- Create one API service.
- Configure service root/build to use:
  - Dockerfile: `apps/api/Dockerfile`
  - Runtime command from Dockerfile: `node dist/main.js`
- Do not create a separate backend service from the web app.
- Keep the public web beta on Vercel:
  `https://web-delta-azure-40.vercel.app`

## 3. Managed Services

Provision in Railway:

- Managed Postgres
- Managed Redis

Operational notes:

- Keep API, Postgres, and Redis in the same Railway region when possible.
- Store generated connection strings only in Railway secret variables.
- Do not paste managed URLs into docs, tests, or source files.

## 4. Required API Environment

Set these in Railway service variables:

```text
NODE_ENV=production
AUTH_MODE=oidc
PORT=<railway-provided-port-if-needed>
DATABASE_URL=<managed-postgres-url>
REDIS_URL=<managed-redis-url>
OIDC_ISSUER_URL=<staging-issuer-url>
OIDC_AUDIENCE=<api-audience>
OIDC_JWKS_URL=<staging-jwks-url>
OIDC_TENANT_CLAIM=tenant_id
OIDC_ROLES_CLAIM=roles
OIDC_SUB_CLAIM=sub
OIDC_EMAIL_CLAIM=email
CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app
LOG_LEVEL=info
OTEL_SERVICE_NAME=polyglot-api-staging
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
```

Optional later:

```text
OTEL_EXPORTER_OTLP_ENDPOINT=<collector-endpoint>
AUDIT_EXPORT_STEP_UP_TTL_SECONDS=600
API_MAX_BODY_BYTES=1048576
API_VERSION=<release-identifier>
```

Forbidden for public staging:

```text
AUTH_MODE=dev-header
```

## 5. OIDC Preparation

Create a staging OIDC application/client.

Required token behavior:

- `iss` matches `OIDC_ISSUER_URL`.
- `aud` matches `OIDC_AUDIENCE`.
- JWKS endpoint matches `OIDC_JWKS_URL`.
- Tenant claim is emitted as a UUID, not a slug.
- Roles claim emits app roles such as:
  - `tenant_admin`
  - `security_auditor`
  - `learner`
  - `content_editor`

Seed tenant UUIDs expected by current smoke/data:

| Tenant | Tenant UUID                            | Slug                         |
| ------ | -------------------------------------- | ---------------------------- |
| Alpha  | `11111111-1111-4111-8111-111111111111` | `javiss-global-hospitality`  |
| Beta   | `22222222-2222-4222-8222-222222222222` | `kansai-retail-language-lab` |

If the IdP can only emit organization slugs, staging smoke will require a
future code change to resolve slugs to tenant UUIDs before auth context is
created.

## 6. Migration Command

Run after Railway env is complete and the first deploy image is available.

Recommended Railway shell/job commands:

```bash
pnpm prisma:generate
pnpm exec prisma migrate deploy
```

Optional seed after approval:

```bash
pnpm prisma:seed
pnpm db:verify
```

Do not run destructive reset commands against staging.

## 7. Health Check

Railway health check path:

```text
/health/ready
```

Readiness must report:

- API process live
- database ok
- redis ok
- auth ok when `AUTH_MODE=oidc` and OIDC config is complete

Do not route public demo traffic until readiness is healthy.

## 8. Remote Smoke

After Railway deploy, migrations, seed decision, and OIDC token setup:

```powershell
$env:API_SMOKE_BASE_URL="https://<railway-api-domain>"
$env:API_SMOKE_AUTH_MODE="oidc"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
$env:API_SMOKE_ADMIN_TOKEN="<tenant-admin-token>"
$env:API_SMOKE_AUDITOR_TOKEN="<security-auditor-token>"
$env:API_SMOKE_LEARNER_TOKEN="<learner-token>"
$env:API_SMOKE_CONTENT_EDITOR_TOKEN="<content-editor-token>"
pnpm api:smoke
```

Then run rate-limit stress:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

Clear smoke token env vars from the shell after the run.

## 9. Post-Deploy Checks

- `GET /health`
- `GET /health/live`
- `GET /health/ready`
- Normal API smoke with persistence expectation.
- Rate-limit smoke.
- Railway logs for boot/config errors.
- Logs for accidental secret/token leakage.
- CORS from `https://web-delta-azure-40.vercel.app`.

## 10. Rollback

- Prefer app rollback before database rollback.
- Keep the previous successful deployment available.
- If readiness fails, disable public traffic first.
- Restore managed database backup only after confirming schema or data damage.
