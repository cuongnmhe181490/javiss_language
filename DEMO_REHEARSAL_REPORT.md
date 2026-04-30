# Demo Rehearsal Report

Date: 2026-04-30

## 1. Verdict

- READY FOR LOCAL DEMO: yes.
- READY FOR STAGING REHEARSAL: yes, with staging credentials/platform still required.

The local clean/staging-like run completed with Docker Desktop, Postgres, Redis, API, web dev shell, seed verification, quality gates, persistence smoke, rate-limit smoke, and AI eval passing. No real provider keys were added and no external AI provider was called.

## 2. Environment

| Component              | Result     | Notes                                                            |
| ---------------------- | ---------- | ---------------------------------------------------------------- |
| Docker                 | PASS       | Docker Desktop 4.71.0, Engine 29.4.1                             |
| Docker Compose         | PASS       | Docker Compose v5.1.3                                            |
| Node                   | PASS       | Node v24.13.0                                                    |
| pnpm                   | PASS       | pnpm 10.30.0                                                     |
| Postgres               | PASS       | `polyglot-postgres`, healthy, port 5432                          |
| Redis                  | PASS       | `polyglot-redis`, healthy, port 6379                             |
| Port 4000              | PASS       | Free before API start; API later listened on 4000                |
| Port 3000              | PASS       | Web dev server listened on 3000                                  |
| Local env files        | PASS       | No `.env` or `apps/api/.env` file present; shell env was used    |
| Containers cleanliness | READY-BETA | Existing local Docker volumes were reused; no reset was required |
| API                    | PASS       | `pnpm dev:api` started and health endpoints responded            |
| Web                    | PASS       | `pnpm dev:web` started; `GET /` returned 200                     |

## 3. Commands Run

| Command                                                                | Result      | Notes                                                                       |
| ---------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| Read PR-010/demo/env/staging/security/beta/smoke/README docs           | PASS        | Baseline docs reviewed first                                                |
| `docker version`                                                       | PASS        | Docker server available                                                     |
| `docker compose version`                                               | PASS        | Compose available                                                           |
| `node --version`, `corepack --version`, `pnpm --version`               | PASS        | Node/pnpm environment valid                                                 |
| Port check for 4000/5432/6379                                          | PASS        | 5432/6379 in use by Docker; 4000 free                                       |
| `.env` and `apps/api/.env` check                                       | PASS        | No committed/local env file required                                        |
| `docker compose up -d`                                                 | PASS        | Existing containers reused                                                  |
| `docker compose ps`                                                    | PASS        | Postgres and Redis healthy                                                  |
| `pnpm install --frozen-lockfile`                                       | FAIL, fixed | Lockfile was stale against API package manifest                             |
| `pnpm install --no-frozen-lockfile`                                    | PASS        | Updated `pnpm-lock.yaml` only                                               |
| Re-run `pnpm install --frozen-lockfile`                                | PASS        | Lockfile now valid for clean install                                        |
| `pnpm prisma:generate`                                                 | PASS        | Prisma Client generated                                                     |
| `pnpm prisma:migrate`                                                  | PASS        | Already in sync                                                             |
| `pnpm prisma:seed`                                                     | PASS        | Seed command executed                                                       |
| `pnpm db:verify`                                                       | PASS        | Seed verification passed                                                    |
| `pnpm dev:api`                                                         | PASS        | API started on `http://127.0.0.1:4000`                                      |
| `GET /health`, `/health/live`, `/health/ready`                         | PASS        | DB and Redis ok; overall degraded only due to dev-header auth               |
| `pnpm dev:web`                                                         | PASS        | Web started on `http://localhost:3000`                                      |
| `GET http://127.0.0.1:3000`                                            | PASS        | Returned 200                                                                |
| `pnpm typecheck`                                                       | PASS        | Workspace typecheck passed                                                  |
| `pnpm lint`                                                            | PASS        | Workspace lint passed                                                       |
| `pnpm test`                                                            | PASS        | 97 API tests passed, 11 integration guards skipped in aggregate test script |
| `TEST_DATABASE_URL` + `TEST_REDIS_URL` `pnpm test:integration`         | PASS        | 11/11 live integration tests passed                                         |
| `pnpm build`                                                           | PASS        | Web/API/packages built                                                      |
| `pnpm format:check`                                                    | PASS        | Passed after formatting updated lockfile/docs                               |
| `API_SMOKE_EXPECT_PERSISTENCE=1 pnpm api:smoke`                        | PASS        | Persistence smoke passed                                                    |
| `API_SMOKE_EXPECT_PERSISTENCE=1 API_SMOKE_RATE_LIMIT=1 pnpm api:smoke` | PASS        | Rate-limit stress smoke passed                                              |
| `pnpm ai:eval`                                                         | PASS        | 10/10 deterministic AI eval cases passed                                    |
| Stop API/web processes                                                 | PASS        | Ports 3000 and 4000 cleared                                                 |
| `docker compose down`                                                  | PASS        | Containers stopped; volumes preserved                                       |

## 4. Demo Flows Verified

| Flow                          | Result | Evidence                                                    | Notes                                                                       |
| ----------------------------- | ------ | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Health/readiness              | PASS   | `/health`, `/health/live`, `/health/ready` manual and smoke | Local readiness is `degraded` due to dev-header auth; DB/Redis are ok       |
| Learner course list           | PASS   | Smoke                                                       | Published course visible, draft hidden                                      |
| Learner course detail         | PASS   | Manual `GET /v1/courses/444...`                             | Course detail returned with module data                                     |
| Learner lesson detail         | PASS   | Manual and smoke                                            | No `answerKey` or `correctOptionIndex` leak                                 |
| Lesson start/complete         | PASS   | Smoke                                                       | Persistence-backed learner progress path                                    |
| Progress and assignments      | PASS   | Smoke                                                       | `/progress/me`, `/assignments/me`                                           |
| Tenant read                   | PASS   | Smoke                                                       | Tenant read with dev headers                                                |
| Cross-tenant negative case    | PASS   | Smoke and manual                                            | Tenant A admin denied tenant B read with 403                                |
| Audit list/export             | PASS   | Smoke and manual                                            | List returned events; export denied without step-up and queued with step-up |
| Content source/workflow       | PASS   | Smoke                                                       | Source create/approve, item/version/review/QA/approve/publish/sync          |
| AI agent list                 | PASS   | Smoke                                                       | Prompt text hidden                                                          |
| AI conversation/message       | PASS   | Smoke                                                       | Mock provider reply includes citation and orchestration metadata            |
| AI safety refusal             | PASS   | Smoke and AI eval                                           | System prompt extraction refused without prompt leak                        |
| Speaking session              | PASS   | Smoke                                                       | Session create/read/end                                                     |
| Speaking text fallback/report | PASS   | Smoke                                                       | Text fallback transcript and report scaffold verified                       |
| Web shell                     | PASS   | Manual `GET /`                                              | Web app starts; API demo flows are stronger than full UI flow at this stage |

## 5. Issues Found

| Priority      | Issue                                                                                                                             | Fix                                                                              | Status   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| P1 demo setup | `pnpm install --frozen-lockfile` failed because `pnpm-lock.yaml` was stale against `apps/api/package.json` dependency specifiers. | Ran `pnpm install --no-frozen-lockfile`, updated and formatted `pnpm-lock.yaml`. | RESOLVED |
| P3 docs       | README quality commands did not mention `pnpm ai:eval` or rate-limit smoke env.                                                   | Updated README.                                                                  | RESOLVED |
| P3 docs       | Demo runbook did not explicitly explain local `/health/ready` degraded status from dev-header auth.                               | Updated `DEMO_RUNBOOK.md`.                                                       | RESOLVED |
| P3 local data | Local Docker volumes were reused, so DB counts include prior smoke-created rows.                                                  | No reset needed; documented as non-blocking.                                     | ACCEPTED |

## 6. Remaining Risks

P0: none.

P1: none.

P2:

- Credentialed real-provider canary.
- Persisted tenant AI budget/billing ledger.
- Persisted eval run history.
- Staging with real OIDC/platform secrets has not been executed.
- Production SFU/STT/TTS/object storage remains future work.

## 7. Next Recommendation

B. Staging deployment rehearsal.

Rationale: local demo rehearsal is now clean enough for handoff. Before adding real provider canary work, run the same startup, migration, smoke, rate-limit, and AI eval gates against a staging-like deployed environment with managed Postgres/Redis and OIDC configuration.
