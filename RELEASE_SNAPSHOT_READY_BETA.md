# Release Snapshot Ready Beta

Snapshot date/time: 2026-05-05 +07:00

## Current Web Production

- Production web URL: `https://web-delta-azure-40.vercel.app`
- Final PR-016 deployment URL:
  `https://web-rghzpaq5x-cuongnmhe181490s-projects.vercel.app`
- Web status: PRODUCTION-PASS for public beta demo.

## Current Git Snapshot

- Snapshot base commit before PR-017 docs:
  `27469ae3604164238d096b369e93e3855304e394`
- Branch: `master`
- Remote: `origin` -> `https://github.com/cuongnmhe181490/javiss_language`
- Local branch was ahead of `origin/master` by 3 commits before PR-017 docs.
- Push status: not pushed by PR-017.

## PR Status Matrix

| Area                                | Status          | Notes                                                                                     |
| ----------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| PR-011 Deployment UX/SEO/Security   | PASS            | CTA routes fixed, production metadata safe, security headers present.                     |
| PR-013 Backend staging provisioning | HANDOFF-READY   | Railway/Render plan exists; no managed services provisioned yet.                          |
| PR-014 OIDC staging readiness       | HANDOFF-READY   | Claims/users/token plan documented; IdP not provisioned.                                  |
| PR-015 Web dashboard/PWA readiness  | PRODUCTION-PASS | Dashboard and learning routes, PWA manifest, sitemap, robots deployed.                    |
| PR-016 Web beta QA polish           | PRODUCTION-PASS | Accessibility uplift, skip link, footer landmarks, responsive audit deployed.             |
| PR-017 Release snapshot/handoff     | LOCAL-PASS      | Release snapshot and Railway handoff checklist prepared; gates passed; no deploy or push. |

## Local Gates Summary

Latest PR-016/PR-017 verification baseline:

- `pnpm typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm test`: PASS, including API `97 passed | 11 skipped`
- `pnpm build`: PASS
- `pnpm format:check`: PASS
- `pnpm --filter @polyglot/web smoke:routes`: PASS against production alias
  when `WEB_BASE_URL` is set
- `pnpm ai:eval`: PASS, 10 fixtures passed

Known skips:

- API integration-style tests skip when managed/local `TEST_DATABASE_URL` and
  `TEST_REDIS_URL` are not provided. This is not a web production blocker.

## Production Web Audit Summary

Production alias: `https://web-delta-azure-40.vercel.app`

Final PR-016 production checks:

- Routes `/`, `/login`, `/register`, `/demo-speaking`: `200 OK`
- Full web route smoke: PASS
- No `http://localhost:3000` in production metadata
- Canonical, `og:url`, `og:image`, and Twitter image metadata present
- Security headers present:
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `X-Frame-Options`
  - `Permissions-Policy`
  - `Content-Security-Policy-Report-Only`
- Lighthouse:
  - Performance: `94`
  - Accessibility: `100`
  - Best Practices: `100`
  - SEO: `100`
- Browser console errors: none
- Horizontal overflow: false

## Secret Scan Summary

PR-017 local scan result:

- No real `.env` file found outside ignored/dependency paths.
- Tracked env files are examples only:
  - `.env.example`
  - `apps/api/.env.example`
- `.gitignore` and `.dockerignore` exclude `.env`, `.env.*`, `.vercel`,
  `.codex`, build outputs, logs, and dependency folders.
- No real provider key, GitHub token, Vercel token, Railway token, private key,
  or cloud access key pattern was found in tracked source.
- Placeholder local URLs and test strings exist in docs/tests, for example
  local Postgres/Redis examples and redaction tests. These are not production
  credentials.

## Backend Staging Status

Backend staging is not deployed.

Missing manual infrastructure:

- GitHub push of the repo.
- Railway project/service.
- Managed Postgres.
- Managed Redis.
- Public API staging domain.
- Real OIDC provider/client.
- OIDC smoke users and role-specific tokens.
- Staging migration run.
- Remote persistence smoke.

Important constraint:

- Public staging must use `AUTH_MODE=oidc`.
- Do not expose `AUTH_MODE=dev-header` on a public Railway deployment.

## Remaining P2

- Provision Railway or equivalent backend staging.
- Configure managed Postgres and Redis.
- Configure OIDC issuer/audience/JWKS and UUID tenant claim.
- Run migrations with `prisma migrate deploy`.
- Run remote API smoke with OIDC tokens.
- Review CSP reports before enforcing CSP.
- Replace dashboard demo data only after backend staging and auth are ready.
- Keep speaking mock-only until a provider integration PR is explicitly scoped.

## Safe Next Actions

1. Review this snapshot and `RAILWAY_HANDOFF_CHECKLIST.md`.
2. Push the current branch to GitHub only after confirming the remote target.
3. Create Railway project and connect the GitHub repo.
4. Add managed Postgres and Redis.
5. Set Railway secrets from the checklist, never in source files.
6. Configure OIDC staging users/tokens.
7. Run `pnpm exec prisma migrate deploy` in Railway after env is complete.
8. Run remote health and smoke checks.
