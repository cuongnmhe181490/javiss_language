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
