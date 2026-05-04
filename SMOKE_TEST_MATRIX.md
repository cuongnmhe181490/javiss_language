# Smoke Test Matrix

Current smoke script: `apps/api/scripts/smoke-api.mjs`.

Run:

```powershell
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
pnpm api:smoke
```

Rate-limit stress:

```powershell
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

| Domain           | Endpoint/Flow                                                | Smoke covered? | Persistence covered?                          | Negative case? | Notes                                                                     |
| ---------------- | ------------------------------------------------------------ | -------------- | --------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| Health           | `/health`, `/health/live`, `/health/ready`                   | Yes            | Yes, DB/Redis readiness required when enabled | No             | Deep dependency checks only with `API_SMOKE_EXPECT_PERSISTENCE=1`         |
| Tenant           | `GET /v1/tenants/:tenantId`                                  | Yes            | Yes                                           | Yes            | Cross-tenant tenant read denied                                           |
| Audit            | List and export                                              | Yes            | Yes                                           | Yes            | Export without step-up denied, with step-up queued                        |
| Learning         | Courses, lesson read, start, complete, progress, assignments | Yes            | Yes                                           | Yes            | Learner answer-key leak check is included                                 |
| AI tutor         | Agent list, conversation create, message                     | Yes            | Yes                                           | Yes            | Prompt text hidden and injection refused                                  |
| AI orchestration | Provider/model/prompt/policy/cost/schema metadata            | Yes            | Yes                                           | Yes            | Deep router/fallback cases covered by `pnpm ai:eval` rather than smoke    |
| Speaking         | Session create/read, text fallback, report, end              | Yes            | Yes                                           | Yes            | Token hash non-exposure and auditor denial covered                        |
| Content source   | Source list, create, approve                                 | Yes            | Yes                                           | Yes            | Content editor approve denied                                             |
| Content workflow | Item/version/review/QA/approve/publish/sync                  | Yes            | Yes                                           | Yes            | Full but bounded content flow; no large fixtures                          |
| Admin learning   | Admin create course                                          | Yes            | Yes                                           | Yes            | Learner create course denied                                              |
| Rate limit       | Tenant route stress                                          | Opt-in         | Redis-backed when persistence env is set      | Yes            | Runs only with `API_SMOKE_RATE_LIMIT=1` to avoid slow/noisy default smoke |

No additional endpoint was added to smoke for PR-010 because existing smoke already covers the release-critical paths. Deep provider fallback, schema failure, source-scope denial, and quota cases remain in the deterministic AI eval harness to keep smoke stable and external-provider-free.

## Web Smoke

PR-015 expands web smoke coverage to:

- `/`
- `/login`
- `/register`
- `/demo-speaking`
- `/dashboard`
- `/grammar`
- `/speaking`
- `/listening`
- `/reading`
- `/placement`
- `/curriculum`
- `/manifest.webmanifest`
- `/sitemap.xml`
- `/robots.txt`
- `/og-image.svg`

Required checks:

- route returns `200`
- route returns HTML for page routes
- canonical metadata exists for key pages
- `og:image` metadata exists
- sitemap and robots do not contain localhost when `NEXT_PUBLIC_SITE_URL` is set
- security headers remain present in production preview

PR-015 production smoke result:

- Date/time: 2026-05-05 01:15:16 +07:00
- Base URL: `https://web-delta-azure-40.vercel.app`
- Command: `WEB_BASE_URL=https://web-delta-azure-40.vercel.app NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app pnpm --filter @polyglot/web smoke:routes`
- Result: PASS
- Covered routes/assets: `/`, `/login`, `/register`, `/demo-speaking`, `/dashboard`, `/grammar`, `/speaking`, `/listening`, `/reading`, `/placement`, `/curriculum`, `/manifest.webmanifest`, `/sitemap.xml`, `/robots.txt`, `/og-image.svg`

PR-016 local smoke result:

- Date/time: 2026-05-05 +07:00
- Base URL: `http://127.0.0.1:3000`
- Command:
  `WEB_BASE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app pnpm --filter @polyglot/web smoke:routes`
- Result: PASS
- Covered routes/assets: `/`, `/login`, `/register`, `/demo-speaking`,
  `/dashboard`, `/grammar`, `/speaking`, `/listening`, `/reading`,
  `/placement`, `/curriculum`, `/manifest.webmanifest`, `/sitemap.xml`,
  `/robots.txt`, `/og-image.svg`, `/icon.svg`, `/apple-icon.svg`
- Browser audit add-ons: no horizontal overflow, no console errors, one `h1`
  on audited pages, and keyboard focus starts with skip-to-content.
