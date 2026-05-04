# Staging Platform Decision

## Current CLI/Login State

| Platform     | CLI State             | Login/Project State  | Deployment Fit                                                                                                                   |
| ------------ | --------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Vercel       | Installed, logged in  | Web projects visible | Good for current web. Not recommended for this API shape because the API is a long-running Node HTTP service packaged as Docker. |
| Railway      | CLI not found         | Unknown              | Best fit if user provisions/logs in: Docker deploy, managed Postgres/Redis, env secrets, logs, easy one-off jobs.                |
| Render       | CLI not found         | Unknown              | Good backup: Docker web service plus managed Postgres/Redis or external Redis.                                                   |
| Fly.io       | CLI not found         | Unknown              | Good container runtime, but managed Postgres/Redis usually needs extra operational work or external providers.                   |
| Docker local | Installed and working | Local only           | Valid for build validation, not public staging.                                                                                  |

## Primary Recommendation

Primary recommended platform: **Railway**.

Reasons:

- Supports Dockerfile-based services.
- Provides managed PostgreSQL and Redis in the same project.
- Has environment secret management.
- Has logs and public service domains.
- Has practical cheap/free-ish staging ergonomics.
- Supports one-off commands for migration jobs.
- Fits the current `apps/api/Dockerfile` without changing application code.

## Backup Option

Backup: **Render**.

Reasons:

- Supports Docker web services.
- Supports managed PostgreSQL.
- Supports environment variables and logs.
- Redis can be provided by Render Redis or Upstash.
- Health checks and rollback are operationally straightforward.

## Not Recommended For API Staging

Vercel is not recommended for the backend API in its current form.

The current API is a Node HTTP server started with:

```bash
node dist/main.js
```

It expects long-running process semantics, managed Postgres, managed Redis, and Docker packaging. Vercel remains appropriate for the already deployed web app, but deploying this API to Vercel would require a separate serverless adapter or framework conversion, which is outside PR-013.

## Decision

Use Railway as the target manual provisioning path unless the user chooses Render.

Do not deploy backend staging until:

- Railway or Render account/project access is available.
- Managed Postgres is provisioned.
- Managed Redis is provisioned.
- OIDC issuer/audience/JWKS are configured.
- Staging smoke users/tokens exist.
