# PR-013 Staging Backend Provisioning

## Status

PR-013 status: READY-FOR-MANUAL-PROVISIONING.

The backend was not deployed because the current workspace does not have:

- Railway/Render/Fly CLI installed or authenticated.
- Managed staging `DATABASE_URL`.
- Managed staging `REDIS_URL`.
- OIDC issuer/audience/JWKS.
- Staging OIDC smoke users/tokens.
- Approved staging seed/demo-data decision.

## Can Deploy Immediately?

No.

Docker and Vercel CLI are available, but Vercel is only suitable for the current web deployment. The API is a Dockerized long-running Node HTTP service and should use a container runtime such as Railway or Render.

## CLI/Platform Audit

| Tool      | Result                  | Notes                                                                                      |
| --------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `vercel`  | Available and logged in | User `cuongnmhe181490`; web project exists. Not recommended for current API runtime shape. |
| `railway` | Not found               | Recommended target, but user must install/login.                                           |
| `render`  | Not found               | Backup target, configure through dashboard or CLI if installed.                            |
| `fly`     | Not found               | Possible container runtime, but more ops overhead.                                         |
| `docker`  | Available               | Local image build previously passed.                                                       |

## Platform Recommendation

Primary recommended platform: Railway.

Backup option: Render.

Decision details: `STAGING_PLATFORM_DECISION.md`.

## Environment Required

See `STAGING_ENV_CHECKLIST.md`.

Minimum public staging requirements:

- `NODE_ENV=production`
- `AUTH_MODE=oidc`
- `DATABASE_URL`
- `REDIS_URL`
- `OIDC_ISSUER_URL`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URL`
- `CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app`

Do not deploy public staging with `AUTH_MODE=dev-header`.

PR-014 OIDC readiness docs now define the exact staging auth setup:

- `PR014_OIDC_STAGING_READINESS.md`
- `OIDC_STAGING_CLAIMS.md`
- `STAGING_SMOKE_USERS.md`
- `REMOTE_SMOKE_OIDC_TOKENS.md`
- `RAILWAY_STAGING_CHECKLIST.md`

The current API requires OIDC `sub` and `tenant_id` claims to be internal UUIDs.

## Migration Status

No staging migration was run because no managed staging `DATABASE_URL` exists.

When available:

```bash
pnpm prisma:generate
pnpm exec prisma migrate deploy
```

Do not run `prisma migrate dev` or reset staging.

## Redis Status

No staging Redis connection test was run because no managed staging `REDIS_URL` exists.

Production mode requires Redis. Do not use in-memory rate limiting for public staging.

## Remote Smoke Status

No remote smoke was run because no API staging URL exists.

Remote smoke procedure: `REMOTE_SMOKE_REPORT.md` and `STAGING_DEPLOY_MANUAL_STEPS.md`.

## Local Verification

Local Docker was started for verification after Docker Desktop was relaunched.

| Check                                                                  | Result | Notes                                                           |
| ---------------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| Docker compose Postgres                                                | PASS   | `polyglot-postgres` healthy on local port `5432`.               |
| Docker compose Redis                                                   | PASS   | `polyglot-redis` healthy on local port `6379`.                  |
| `/health/ready` local                                                  | PASS   | `database=ok`, `redis=ok`; auth is degraded in local dev mode.  |
| `pnpm typecheck`                                                       | PASS   | Workspace typecheck passed.                                     |
| `pnpm lint`                                                            | PASS   | Workspace lint passed.                                          |
| `pnpm test`                                                            | PASS   | API suite: 106 tests passed; web suite: 3 tests passed.         |
| `pnpm test:integration`                                                | PASS   | 11 tests passed with real `TEST_DATABASE_URL`/`TEST_REDIS_URL`. |
| `pnpm build`                                                           | PASS   | Web and API build passed.                                       |
| `pnpm format:check`                                                    | PASS   | Prettier check passed.                                          |
| `pnpm ai:eval`                                                         | PASS   | 10 eval fixtures passed.                                        |
| `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke`                        | PASS   | Local persistence smoke passed against `http://127.0.0.1:4000`. |
| `API_SMOKE_EXPECT_PERSISTENCE=1 API_SMOKE_RATE_LIMIT=1 pnpm api:smoke` | PASS   | Local rate-limit stress smoke passed.                           |

## Risk If Deploying Without OIDC

High.

`AUTH_MODE=dev-header` is intentionally blocked when `NODE_ENV=production`. A public staging API without OIDC should not be exposed. If an internal temporary staging is required before OIDC exists, protect it at the platform/network layer and document that it is not production-mode auth.

## Commands To Run Manually

Railway happy path:

```bash
railway login
railway init
railway up --detach
```

Then configure env, run migrations, and smoke as documented in:

- `STAGING_DEPLOY_MANUAL_STEPS.md`
- `STAGING_DATABASE_RUNBOOK.md`
- `REMOTE_SMOKE_REPORT.md`

## PR-013 Verdict

READY-FOR-MANUAL-PROVISIONING.

Codex cannot safely deploy backend staging from this workspace without platform credentials and managed service URLs. The exact platform decision, env checklist, migration plan, manual deploy steps, and smoke procedure are now documented.

PR-014 narrows the auth blocker: create a real staging OIDC provider, configure
issuer/audience/JWKS and UUID-based `tenant_id` claims, then obtain smoke tokens
for tenant admin, learner, security auditor, and content editor.
