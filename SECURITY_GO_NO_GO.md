# Security Go/No-Go

| Item                                          | Status | Evidence                                                                           | Command/test                              | Notes                                                     |
| --------------------------------------------- | ------ | ---------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| Dev-header blocked in production              | GO     | `apps/api/src/config.ts` rejects `NODE_ENV=production` with `AUTH_MODE=dev-header` | `pnpm test` config tests                  | Local demo may use dev-header only in development         |
| `AUTH_MODE` documented                        | GO     | `.env.example`, `ENVIRONMENT_READINESS.md`, `README.md`                            | `pnpm format:check`                       | Staging must use OIDC                                     |
| OIDC config required for production auth      | GO     | `config.ts`, `OIDC_INTEGRATION.md`                                                 | `pnpm test`                               | Real IdP pilot remains P2                                 |
| CORS allowlist not wildcard in production     | GO     | `config.ts` production validation                                                  | `pnpm test`                               | Use explicit HTTPS origins                                |
| No hardcoded secrets                          | GO     | Env examples contain local placeholders only                                       | review plus `pnpm lint`                   | No real provider key added                                |
| No raw token logging                          | GO     | logger redaction, speaking token hash storage                                      | `logging.spec.ts`, `speaking.spec.ts`     | Recheck when adding providers                             |
| No raw transcript/audio logging               | GO     | no raw audio path, transcript access is permissioned                               | `speaking.spec.ts`                        | Text fallback transcript is stored and scoped             |
| Tenant isolation tests pass                   | GO     | tenant, AI, speaking, content cross-tenant tests                                   | `pnpm test`                               | Smoke includes tenant negative case                       |
| Cross-tenant negative tests pass              | GO     | `app.spec.ts`, `ai.spec.ts`, `speaking.spec.ts`, `content.spec.ts`                 | `pnpm test`                               | Covers read/mutation probing                              |
| `super_admin` justification policy documented | GO     | `AUTHZ_POLICY.md`, recovery audit                                                  | `pnpm test`                               | Only explicit routes allow cross-tenant access            |
| Audit success/denied works                    | GO     | audit routes and events                                                            | `pnpm test`, `pnpm api:smoke`             | Export step-up is covered                                 |
| Answer key not leaked to learner              | GO     | learning service redaction                                                         | `pnpm test`, `pnpm api:smoke`             | Smoke checks `answerKey` and `correctOptionIndex` absence |
| AI system prompt not exposed                  | GO     | AI policy/refusal and agent list filtering                                         | `pnpm test`, `pnpm ai:eval`, smoke        | Provider remains mock                                     |
| Provider secrets not in repo                  | GO     | no credentialed provider added                                                     | review                                    | Future provider keys must use secret manager              |
| Rate limit works                              | GO     | Redis limiter and stress smoke                                                     | `pnpm test:integration`, rate-limit smoke | Redis required in production                              |
| Security headers present                      | GO     | `errors.ts` response headers                                                       | `app.spec.ts`                             | Includes CSP, frame, referrer, content type               |
| Health endpoints do not leak secrets          | GO     | readiness summarizes status only                                                   | `app.spec.ts`, smoke                      | Do not expose full config                                 |

Go/no-go result: GO for beta demo/staging preparation. No-go for production launch until remaining P2 items are handled and staging is exercised with real OIDC and platform secrets.

## PR-016 CSP Report-Only Review

The web deployment keeps CSP in `Content-Security-Policy-Report-Only`.

Current beta stance:

- Do not switch to enforced CSP in PR-016.
- Keep `frame-ancestors 'none'`, `object-src 'none'`, and scoped
  `connect-src` entries.
- Avoid broad `*` wildcards.
- Review deployed runtime behavior before enforcement because Next/Vercel may
  still require inline/eval allowances depending on the build/runtime path.

Future enforcement checklist:

- Deploy preview with Report-Only enabled.
- Review browser console and any CSP reports.
- Confirm Next runtime, fonts, images, metadata, and route transitions work.
- Try removing or narrowing `unsafe-inline` and `unsafe-eval`.
- Enforce only after Lighthouse, Playwright smoke, and production route smoke
  remain clean.
