# Recovery Audit PR-004 to PR-009

## 1. Executive conclusion

- Overall status: backend code has advanced through the PR-004 to PR-009 domains and PR-007 hardening is READY-BETA with mock-backed provider acceptance gates; P1 recovery issues are closed.
- Highest risk area: PR-007 still has no credentialed real provider canary, but router/provider/policy/schema/eval acceptance gates now exist.
- Can continue new development: Yes, while treating real provider onboarding and canary evaluation as the next scoped AI production step.
- Recommended next action: add a credentialed provider implementation behind `AiProvider` and run the same acceptance/eval gates against that provider.
- Verification snapshot: Docker Postgres/Redis are healthy; latest run used `polyglot_local_password` from `docker-compose.yml`; `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm build`, `pnpm format:check`, persistence smoke, and rate-limit stress smoke passed. An earlier retry with the placeholder password failed authentication and was rerun successfully with the compose credential.
- P1 recovery update: UUID policy is documented in `UUID_POLICY.md`; targeted negative cross-tenant tests were added for content publish/rollback/sync, AI conversation/message, speaking session/report/fallback/end; `super_admin` cross-tenant behavior is documented and tested end-to-end.

## 2. PR status matrix

| PR                                      | Intended scope                                                                               | Evidence files                                                                                                                                                                                                                                                                                         | Implemented? | Tests?                      | Smoke? | Docs? | Risk                                                                                                                           | Verdict    |
| --------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | --------------------------- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| PR-004 Learning Core                    | Courses, modules, lessons, blocks, vocabulary, grammar, exercises, progress, assignments     | `prisma/migrations/20260427210000_add_learning_core`, `apps/api/src/learning-*`, `PR004_LEARNING_CORE.md`, `LEARNING_DOMAIN_MODEL.md`, `LEARNING_API.md`                                                                                                                                               | Yes          | Unit/API and DB integration | Yes    | Yes   | Medium: group assignment support is basic; answer-key redaction is tested but should stay guarded in future content sync work. | PASS       |
| PR-005 AI Tutor Chat                    | Agents, prompt versions, conversations, messages, structured tutor output, provider scaffold | `prisma/migrations/20260427223000_add_ai_tutor_chat_foundation`, `apps/api/src/ai-*`, `PR005_AI_TUTOR_CHAT_FOUNDATION.md`, `AI_CHAT_API.md`, `AI_OUTPUT_SCHEMA.md`                                                                                                                                     | Yes          | Unit/API and DB integration | Yes    | Yes   | Medium: provider is deterministic/mock; production model/provider behavior is not validated.                                   | PASS       |
| PR-006 Speaking Realtime                | Speaking sessions, realtime token scaffold, transcript segments, text fallback, report       | `prisma/migrations/20260427233000_add_speaking_realtime_foundation`, `apps/api/src/speaking-*`, `PR006_SPEAKING_REALTIME_FOUNDATION.md`, `SPEAKING_REALTIME_API.md`                                                                                                                                    | Yes          | Unit/API and DB integration | Yes    | Yes   | Medium: realtime media path is scaffold only; report/transcript privacy must remain permission-gated.                          | PASS       |
| PR-007 AI Orchestration / Model Router  | Provider abstraction, router, policy layer, prompt release gate, cost/safety metadata        | `apps/api/src/ai-provider.ts`, `apps/api/src/ai-model-router.ts`, `apps/api/src/ai-orchestrator.ts`, `apps/api/src/ai-policy.ts`, `apps/api/src/ai-output-validation.ts`, `apps/api/src/ai-observability.ts`, `apps/api/src/ai-eval.ts`, `PR007_AI_ORCHESTRATION_PROVIDER_PILOT.md`, `MODEL_ROUTER.md` | Yes          | Unit/API/eval               | Yes    | Yes   | Medium: no real provider credentials/canary yet; cost remains estimated rather than billing-backed.                            | READY-BETA |
| PR-008 Content Studio / Source Registry | Source registry, content items/versions, review queue, license lineage, publish gates        | `prisma/migrations/20260428003000_add_content_studio_foundation`, `apps/api/src/content-*`, `PR008_CONTENT_STUDIO_SOURCE_REGISTRY.md`, `CONTENT_STUDIO_API.md`, `SOURCE_REGISTRY.md`                                                                                                                   | Yes          | Unit/API and DB integration | Yes    | Yes   | Low: targeted cross-tenant negative tests now cover publish/rollback/sync resource probing.                                    | PASS       |
| PR-009 Content QA / Publish / Sync      | QA workflow, publish/rollback, sync published content into learning                          | `apps/api/src/content-qa-agent.ts`, `apps/api/src/content-services.ts`, `PR009_CONTENT_QA_PUBLISH_SYNC.md`, `CONTENT_QA_AGENT.md`, `CONTENT_QUALITY_WORKFLOW.md`                                                                                                                                       | Yes          | Unit/API and DB integration | Yes    | Yes   | Low: sync path has tenant-boundary regression coverage and answer-key safety remains covered by learning/smoke tests.          | PASS       |

## 3. API route inventory

| METHOD | PATH                                                                | Domain         | Permission                       | Tenant required | Test coverage                            | Smoke coverage                   | Risk                                            |
| ------ | ------------------------------------------------------------------- | -------------- | -------------------------------- | --------------- | ---------------------------------------- | -------------------------------- | ----------------------------------------------- |
| GET    | `/health`                                                           | Platform       | Public                           | No              | `app.spec.ts`                            | Yes                              | Low                                             |
| GET    | `/health/live`                                                      | Platform       | Public                           | No              | `app.spec.ts`                            | Yes                              | Low                                             |
| GET    | `/health/ready`                                                     | Platform       | Public                           | No              | `app.spec.ts`, integration readiness     | Yes, DB/Redis persistence mode   | Low                                             |
| GET    | `/v1/tenants/:tenantId`                                             | Tenant         | `tenant:read`                    | Yes             | `app.spec.ts`                            | Yes, including cross-tenant deny | Low                                             |
| GET    | `/v1/tenants/:tenantId/audit-events`                                | Audit          | `audit:list`                     | Yes             | `app.spec.ts`, integration               | Yes                              | Low                                             |
| POST   | `/v1/tenants/:tenantId/audit-events/export`                         | Audit          | `audit:export` + step-up         | Yes             | `app.spec.ts`, integration               | Yes, denied and step-up paths    | Low                                             |
| GET    | `/v1/courses`                                                       | Learning       | `course:list`                    | Yes             | `learning.spec.ts`                       | Yes                              | Low                                             |
| GET    | `/v1/courses/:courseId`                                             | Learning       | `course:read`                    | Yes             | `learning.spec.ts`                       | Yes                              | Low                                             |
| GET    | `/v1/lessons/:lessonId`                                             | Learning       | `lesson:read`                    | Yes             | `learning.spec.ts`                       | Yes, answer-key redaction        | Low                                             |
| POST   | `/v1/lessons/:lessonId/start`                                       | Learning       | `lesson:start`                   | Yes             | `learning.spec.ts`, integration          | Yes                              | Low                                             |
| POST   | `/v1/lessons/:lessonId/complete`                                    | Learning       | `lesson:complete`                | Yes             | `learning.spec.ts`, integration          | Yes                              | Low                                             |
| GET    | `/v1/progress/me`                                                   | Learning       | `progress:read_own`              | Yes             | `learning.spec.ts`, integration          | Yes                              | Low                                             |
| GET    | `/v1/assignments/me`                                                | Learning       | `assignment:read`                | Yes             | `learning.spec.ts`                       | Yes                              | Medium: group support is placeholder-level.     |
| POST   | `/v1/admin/courses`                                                 | Learning admin | `course:create`                  | Yes             | `learning.spec.ts`                       | Yes, learner denied              | Low                                             |
| PATCH  | `/v1/admin/courses/:courseId`                                       | Learning admin | `course:update`                  | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| POST   | `/v1/admin/courses/:courseId/publish`                               | Learning admin | `course:publish`                 | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| POST   | `/v1/admin/modules`                                                 | Learning admin | `course:update`                  | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| POST   | `/v1/admin/lessons`                                                 | Learning admin | `lesson:create`                  | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| PATCH  | `/v1/admin/lessons/:lessonId`                                       | Learning admin | `lesson:update`                  | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| POST   | `/v1/admin/lessons/:lessonId/publish`                               | Learning admin | `lesson:publish`                 | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| POST   | `/v1/admin/lessons/:lessonId/blocks`                                | Learning admin | `lesson:update`                  | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| POST   | `/v1/admin/assignments`                                             | Learning admin | `assignment:create`              | Yes             | `learning.spec.ts`                       | Partial                          | Medium                                          |
| GET    | `/v1/ai/agents`                                                     | AI             | `agent:read`                     | Yes             | `ai.spec.ts`                             | Yes, prompt hidden               | Low                                             |
| POST   | `/v1/ai/conversations`                                              | AI             | `ai_tutor:chat`                  | Yes             | `ai.spec.ts`, integration                | Yes                              | Medium: real provider not validated.            |
| GET    | `/v1/ai/conversations/:id`                                          | AI             | `ai_conversation:read_own`       | Yes             | `ai.spec.ts`                             | Partial                          | Medium                                          |
| POST   | `/v1/ai/conversations/:id/messages`                                 | AI             | `ai_tutor:chat`                  | Yes             | `ai.spec.ts`, `ai-orchestration.spec.ts` | Yes, safety refusal path         | Medium                                          |
| POST   | `/v1/speaking/sessions`                                             | Speaking       | `speaking_session:create`        | Yes             | `speaking.spec.ts`, integration          | Yes                              | Medium                                          |
| GET    | `/v1/speaking/sessions/:id`                                         | Speaking       | `speaking_session:read_own`      | Yes             | `speaking.spec.ts`                       | Yes                              | Low                                             |
| POST   | `/v1/speaking/sessions/:id/end`                                     | Speaking       | `speaking_session:end_own`       | Yes             | `speaking.spec.ts`                       | Yes                              | Low                                             |
| POST   | `/v1/speaking/sessions/:id/text-fallback`                           | Speaking       | `speaking_session:text_fallback` | Yes             | `speaking.spec.ts`, integration          | Yes                              | Medium: transcript privacy must remain guarded. |
| GET    | `/v1/speaking/sessions/:id/report`                                  | Speaking       | `speaking_report:read`           | Yes             | `speaking.spec.ts`                       | Yes                              | Medium: report includes transcript text.        |
| GET    | `/v1/admin/sources`                                                 | Content        | `source:read`                    | Yes             | `content.spec.ts`                        | Yes                              | Low                                             |
| POST   | `/v1/admin/sources`                                                 | Content        | `source:write`                   | Yes             | `content.spec.ts`                        | Yes                              | Low                                             |
| PATCH  | `/v1/admin/sources/:sourceId`                                       | Content        | `source:write`                   | Yes             | `content.spec.ts`                        | Partial                          | Medium                                          |
| POST   | `/v1/admin/sources/:sourceId/approve`                               | Content        | `source:approve`                 | Yes             | `content.spec.ts`                        | Yes                              | Low                                             |
| GET    | `/v1/admin/content`                                                 | Content        | `content:read`                   | Yes             | `content.spec.ts`                        | Yes                              | Low                                             |
| GET    | `/v1/admin/review-queue`                                            | Content        | `content:review`                 | Yes             | `content.spec.ts`                        | Partial                          | Medium                                          |
| POST   | `/v1/admin/content/items`                                           | Content        | `content:create`                 | Yes             | `content.spec.ts`                        | Yes, learner denied              | Low                                             |
| GET    | `/v1/admin/content/items/:itemId`                                   | Content        | `content:read`                   | Yes             | `content.spec.ts`                        | Partial                          | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/versions`                          | Content        | `content:update`                 | Yes             | `content.spec.ts`                        | Yes                              | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/submit-review`                     | Content        | `content:update`                 | Yes             | `content.spec.ts`                        | Yes                              | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/approve`       | Content        | `content:review`                 | Yes             | `content.spec.ts`                        | Yes                              | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/qa`            | Content        | `content:review`                 | Yes             | `content.spec.ts`                        | Yes                              | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/publish`       | Content        | `content:publish`                | Yes             | `content.spec.ts`                        | Yes                              | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/sync-learning` | Content        | `content:sync_learning`          | Yes             | `content.spec.ts`                        | Yes, learner denied              | Medium                                          |
| POST   | `/v1/admin/content/items/:itemId/versions/:versionId/rollback`      | Content        | `content:rollback`               | Yes             | `content.spec.ts`                        | Yes                              | Medium                                          |

## 4. Database/migration inventory

| Migration                                         | Models added                                                                                                                  | Seed coverage                                             | Integration coverage                                                                   | Risk                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `20260427190000_init_enterprise_foundation`       | Tenant, User, Membership, AuditEvent, AuthIdentity, StepUpSession, RateLimitBucket                                            | Tenants, users, memberships, audit sample, step-up sample | Tenant lookup, audit persistence/export, step-up persistence, readiness, Redis limiter | Low                                                                             |
| `20260427210000_add_learning_core`                | Course, CourseModule, Lesson, LessonBlock, VocabularyItem, GrammarPoint, Exercise, LessonProgress, CourseProgress, Assignment | Published/draft learning samples and assignments          | Learning progress and tenant-scoped repository paths                                   | Medium                                                                          |
| `20260427223000_add_ai_tutor_chat_foundation`     | AIAgent, PromptVersion, AIConversation, AIMessage                                                                             | Agent, approved prompt, sample conversation path          | AI conversation/message persistence                                                    | Medium                                                                          |
| `20260427233000_add_speaking_realtime_foundation` | SpeakingSession, SpeakingRealtimeToken, SpeakingTranscriptSegment                                                             | Speaking sample data and text fallback path               | Speaking session, token hash, transcript persistence                                   | Medium                                                                          |
| `20260428003000_add_content_studio_foundation`    | ContentSource, ContentItem, ContentVersion, ContentReviewEvent                                                                | Sources, content item/version, review workflow samples    | Content source registry and workflow persistence                                       | Medium                                                                          |
| `20260430091230_pr003c_validation`                | No new models; drops DB-side UUID defaults for app-generated IDs                                                              | Not applicable                                            | Covered indirectly by migrate/seed/db verify and integration tests                     | Low: app-generated UUID policy is documented; raw SQL inserts must provide IDs. |

## 5. RBAC/ABAC audit

- Permissions added: learning (`course:*`, `lesson:*`, `progress:*`, `assignment:*`), AI (`agent:read`, `ai_tutor:chat`, `ai_conversation:*`), speaking (`speaking_session:*`, `speaking_report:read`), source/content (`source:*`, `content:*`), and existing tenant/audit/data permissions.
- Role mapping exists for `super_admin`, `tenant_admin`, `lnd_manager`, `content_editor`, `linguist_reviewer`, `teacher`, `learner`, `support`, `security_auditor`, and `data_protection_officer`.
- ABAC tenant checks are enforced through tenant context and repository methods accepting `tenantId`. Cross-tenant denial is explicitly tested for tenant, learning, AI, speaking, and content publish/rollback/sync paths.
- Learner visibility is guarded: draft courses/lessons are hidden and lesson `answerKey` / `correctOptionIndex` are redacted in learner-facing responses and smoke.
- Admin/content routes generally audit success and denied sensitive paths. `auditDenied` is configured for high-risk create/export/chat/session/content mutations.
- `super_admin` broad behavior is constrained: no magic bypass by default; only explicitly opted-in routes can allow cross-tenant access with justification and audit. End-to-end tests cover allowed tenant read, missing justification, route without opt-in, and security auditor non-inheritance.

## 6. Tenant isolation audit

- Repository queries inspected use `tenantId` in learning, AI, speaking, content, tenant, and audit access paths.
- Route handlers are tenant-scoped through path `:tenantId` or dev-header tenant context, then pass tenant context into services.
- Cross-tenant tests exist for core tenant reads, learning course reads, AI agent/conversation access, speaking session/report/fallback/end access, and content publish/rollback/sync resource probing.
- Smoke checks cross-tenant tenant access and several tenant-scoped workflow paths. Unit/API tests now carry the detailed P1 negative route matrix.
- No direct tenant leak was found in content, AI, or speaking services during this audit. P1 coverage hardening has been added.

## 7. Audit logging audit

- Learning start/complete and admin course/lesson/module/assignment mutations emit audit events.
- AI conversation create/message success paths emit audit events; denied chat paths are covered by `auditDenied`; prompt-injection refusal is tested and smoked.
- Speaking session create/end/text fallback emit audit events; denied session access is tested.
- Content source create/update/approve and content item/version/review/QA/publish/sync/rollback emit audit events or review events, with denied learner content actions audited.
- Cross-tenant denied mutation attempts for content publish/rollback/sync, AI messages, and speaking fallback/end are audited without exposing foreign-tenant resource details.
- Sensitive audit export denied paths are audited and step-up protected.
- Metadata sanitization exists for audit metadata and content metadata/body through secret-like key rejection. Tests cover a content metadata secret token not being stored.

## 8. Security/privacy audit

- Learner answer-key leak: no observed leak. `learning-services.ts` redacts answer keys and smoke asserts no `answerKey` / `correctOptionIndex`.
- Raw audio/raw transcript logging: no raw audio path found. Speaking stores text fallback transcript segments and returns them only through permissioned session/report reads.
- Prompt/system prompt exposure: agent list and smoke hide `promptText`; AI output is schema-validated and prompt-injection refusal is tested.
- AI structured output: `ai-output-validation.ts` validates provider output and grounded lesson citation requirements.
- Rate limit: Redis-backed limiter passes integration. Stress smoke exists behind `API_SMOKE_RATE_LIMIT=1` but was not run in this audit.
- OIDC/dev-header boundary: production dev-header fail-fast was previously covered by config/auth tests; current smoke used development `AUTH_MODE=dev-header`.
- Production safety: no new production bypass found, but real OIDC/JWKS remains scaffold-level from earlier foundation work.

## 9. Test coverage audit

- Unit: authz package tests, tenant-core package tests, API config/logging/tracing/rate-limit/auth-provider tests.
- API: `app.spec.ts`, `learning.spec.ts`, `ai.spec.ts`, `ai-orchestration.spec.ts`, `speaking.spec.ts`, `content.spec.ts`.
- Integration DB: `prisma-repositories.integration.spec.ts` passed live with 11 tests and no DB/Redis skip.
- Redis: integration covers Redis-backed rate limiter storage.
- Smoke: `apps/api/scripts/smoke-api.mjs` passed with `API_SMOKE_EXPECT_PERSISTENCE=1`.
- Latest command results: `pnpm test` passed with 99 API tests and no API skips when `TEST_DATABASE_URL` / `TEST_REDIS_URL` were set; `pnpm test:integration` passed 11/11; `/health/ready` reported `database=ok` and `redis=ok` with overall `degraded` only because local auth used `AUTH_MODE=dev-header`.
- Authz: role and permission mapping covered in package tests and API route denial tests.
- Tenant isolation: covered for tenant, learning, AI, speaking; content/source has coverage but needs more route-by-route cross-tenant negative cases.
- AI safety: prompt/system prompt extraction refusal, output schema, no prompt leak, citation grounding, prompt release gate, provider timeout/unavailable/schema failure fallback, source-scope denial, quota denial, and metadata redaction tests exist.
- Content workflow: source approval, QA, license gate, publish, rollback, sync, denied learner mutation, and audit checks exist.
- Missing/weak tests: credentialed real provider canary and persisted billing-backed cost enforcement. UUID policy, content/AI/speaking cross-tenant negative tests, super-admin cross-tenant override semantics, rate-limit stress smoke, and mock-backed PR-007 eval are now covered.

## 10. Smoke coverage audit

- PR-004: covered. Smoke checks course list/detail, lesson answer-key redaction, lesson start/complete, progress, assignments, and learner admin denial.
- PR-005: covered. Smoke checks AI agents, conversation create, message, safety refusal, citations, and no prompt exposure.
- PR-006: covered. Smoke checks speaking session create/read/end, text fallback, report, token hash non-exposure, and denied auditor access.
- PR-007: covered for mock-backed hardening. Smoke checks orchestration metadata and prompt-injection refusal; `pnpm ai:eval` covers router/policy/schema/fallback/quota fixtures. Real provider canary remains future work.
- PR-008: covered. Smoke checks source registry, source approval, content item/version, review, publish, and denied learner mutation.
- PR-009: covered. Smoke checks QA/publish/sync-learning and rollback paths.
- Rate-limit stress: passed with `API_SMOKE_RATE_LIMIT=1`.

## 11. Issues backlog

| Priority              | Issue                                                                                                                  | File(s)                                                                                                           | Risk                                                                                            | Fix plan                                                                                                                   | Done criteria                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| P1 tenant/authz/audit | RESOLVED: UUID default migration policy needed a decision.                                                             | `UUID_POLICY.md`, `DATABASE.md`, `PR003C_LOCAL_INFRA_VALIDATION.md`                                               | Raw SQL inserts require explicit IDs by policy.                                                 | App-generated UUID policy documented; no new migration required.                                                           | Prisma/API/seed/test paths continue to pass.                                                        |
| P1 tenant/authz/audit | RESOLVED: Later PR admin routes needed a negative cross-tenant route matrix.                                           | `apps/api/src/content.spec.ts`, `apps/api/src/ai.spec.ts`, `apps/api/src/speaking.spec.ts`, `apps/api/src/app.ts` | Regression risk reduced.                                                                        | Added targeted tests for content publish/rollback/sync, AI conversation/message, and speaking session/report/fallback/end. | Tests verify error envelope, no leak, audit where configured, and unchanged state.                  |
| P1 tenant/authz/audit | RESOLVED: `super_admin` cross-tenant override behavior was not fully specified end-to-end.                             | `AUTHZ_POLICY.md`, `apps/api/src/context.ts`, `apps/api/src/app.ts`, `apps/api/src/app.spec.ts`                   | Route policy is explicit.                                                                       | `GET /v1/tenants/:tenantId` is the only current cross-tenant opt-in; justification and audit are required.                 | Tests cover tenant admin deny, super admin allow/deny, non-opt-in route deny, and auditor deny.     |
| P2 AI production      | PR-007 has provider/router/policy/schema/eval gates, but still no credentialed real provider canary.                   | `apps/api/src/ai-provider.ts`, `apps/api/src/ai-model-router.ts`, `apps/api/src/ai-eval.ts`                       | Production provider latency, safety, billing, and structured output reliability are not proven. | Add a real provider behind `AiProvider`, keep routes unchanged, and run acceptance/eval gates plus canary monitoring.      | Real provider passes eval, fallback, quota, redaction, and smoke gates without prompt/secret leaks. |
| P2 test/smoke gaps    | RESOLVED: Rate-limit stress smoke had not been run.                                                                    | `apps/api/scripts/smoke-api.mjs`, `apps/api/src/rate-limit*.ts`                                                   | Low.                                                                                            | Ran `API_SMOKE_RATE_LIMIT=1` in local validation.                                                                          | Stress smoke passed: `GET tenant eventually rate-limits`.                                           |
| P2 test/smoke gaps    | `pnpm test` reports skipped integration guards when DB/Redis env is absent, while `pnpm test:integration` passes live. | `apps/api/src/prisma-repositories.integration.spec.ts`, package scripts                                           | Green aggregate test output can be misread without understanding skip policy.                   | Document split between unit and live integration scripts, or exclude integration file from unit script if desired.         | Test docs make skip policy explicit.                                                                |
| P3 docs/cleanup       | Smoke mutates local dev persistence and can accumulate audit/content rows.                                             | `apps/api/scripts/smoke-api.mjs`, seed docs                                                                       | Repeated local smoke can make counts noisy.                                                     | Optionally add unique smoke tags and cleanup guidance, not destructive cleanup by default.                                 | Repeated smoke remains understandable and idempotent enough for dev validation.                     |

## 12. Recommended repair order

1. Treat PR-007 as READY-BETA for mock-backed acceptance gates.
2. Add a credentialed provider/canary PR before claiming production real-provider PASS.
3. Continue new development only after selecting the next scoped PR and preserving the current tenant/security test posture.

## 13. Exact next prompt

Plan the next scoped PR without adding feature code yet: either add a credentialed real provider behind the PR-007 `AiProvider` contract and run canary/eval gates, or start the next product PR from the READY-BETA recovery baseline. Preserve UUID policy, super-admin cross-tenant policy, and tenant isolation tests. Run full quality gates after any implementation.

## 14. PR-010 Release readiness result

PR-010 added release readiness documentation, environment readiness, demo/staging runbooks, smoke matrix, security go/no-go checklist, and beta limitations without adding domain features, provider credentials, migrations, or UI changes.

Release docs:

- `PR010_RELEASE_READINESS.md`
- `ENVIRONMENT_READINESS.md`
- `DEMO_RUNBOOK.md`
- `SMOKE_TEST_MATRIX.md`
- `STAGING_DEPLOYMENT_PLAN.md`
- `SECURITY_GO_NO_GO.md`
- `BETA_LIMITATIONS.md`

Environment updates:

- `.env.example` and `apps/api/.env.example` now include `TEST_REDIS_URL` and smoke script variables used by the current validation flow.
- No real secrets or provider keys were added.

Overall beta readiness:

- Current overall verdict: READY-BETA for safe local demo and staging preparation.
- Go/no-go: GO for beta demo/staging prep after quality gates, persistence smoke, rate-limit stress smoke, and AI eval pass.
- No-go for production launch until the remaining P2 items are complete and staging has been exercised with real OIDC/platform secrets.

Remaining P2:

1. Credentialed real-provider canary.
2. Persisted tenant AI budget/billing ledger.
3. Persisted eval run history.

PR-010 did not change product domain scope. It documents the release boundary and operational checklist needed before demo/staging.

## 15. PR-012 Staging backend readiness result

PR-012 added staging backend deployment readiness artifacts without deploying the API or adding domain features.

Deployment artifacts:

- `apps/api/Dockerfile`
- `apps/api/.dockerignore`
- `.dockerignore`
- `API_DEPLOYMENT.md`
- `STAGING_ENV_MATRIX.md`
- `STAGING_DATABASE_RUNBOOK.md`
- `WEB_API_INTEGRATION_READINESS.md`
- `PR012_STAGING_BACKEND_DEPLOYMENT_READINESS.md`

Remote smoke readiness:

- `API_SMOKE_BASE_URL` supports remote base URLs.
- `API_SMOKE_AUTH_MODE=oidc` supports role-specific bearer tokens through `API_SMOKE_ADMIN_TOKEN`, `API_SMOKE_AUDITOR_TOKEN`, `API_SMOKE_LEARNER_TOKEN`, and `API_SMOKE_CONTENT_EDITOR_TOKEN`.
- OIDC smoke skips the audit export step-up success path until a real staging step-up flow or persisted fixture exists.

Remaining staging blockers:

1. Platform/container credentials.
2. Managed PostgreSQL and Redis.
3. OIDC issuer/audience/JWKS and smoke test tokens.
4. A decision on whether staging demo seed data is allowed.

## 16. PR-013 Staging backend provisioning result

PR-013 status: READY-FOR-MANUAL-PROVISIONING.

The API was not deployed because the environment does not yet have a staging
API project/runtime, managed `DATABASE_URL`, managed `REDIS_URL`, OIDC
issuer/audience/JWKS configuration, or OIDC smoke tokens. Vercel CLI is logged
in and the web project exists, but Vercel is not the recommended runtime for the
current Docker-based long-running API service. Railway is the primary
recommendation; Render is the backup option.

PR-013 artifacts:

- `PR013_STAGING_BACKEND_PROVISIONING.md`
- `STAGING_PLATFORM_DECISION.md`
- `STAGING_ENV_CHECKLIST.md`
- `STAGING_DEPLOY_MANUAL_STEPS.md`
- `REMOTE_SMOKE_REPORT.md`

Remote smoke status:

- Public remote health smoke: blocked because no API staging URL exists.
- Authenticated OIDC smoke: blocked because no API staging URL or role-specific
  smoke tokens exist.
- Local persistence and quality gates remain the validation baseline until
  manual staging provisioning is complete.

PR-013 local verification:

- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm test`: pass, including 106 API tests and 3 web tests.
- `pnpm test:integration`: pass, 11 tests against real Docker Postgres/Redis
  env.
- `pnpm build`: pass.
- `pnpm format:check`: pass.
- `pnpm ai:eval`: pass, 10 fixtures.
- Local persistence smoke: pass.
- Local rate-limit smoke: pass.

## 18. PR-016 web beta production result

PR-016 status: PRODUCTION-PASS for the web beta surface.

Production alias: `https://web-delta-azure-40.vercel.app`  
Final deployment URL:
`https://web-rghzpaq5x-cuongnmhe181490s-projects.vercel.app`

Scope:

- Web accessibility polish.
- Footer and skip-to-content support.
- Dashboard/learning CTA label clarity.
- Web route/PWA/SEO/security readiness already introduced by PR-011/PR-015.

Production retest:

- Web route smoke: pass.
- Metadata: production-safe, no localhost.
- Security headers: present.
- Lighthouse: Performance 94, Accessibility 100, Best Practices 100, SEO 100.
- Browser console errors: none.
- Horizontal overflow: false.

Remaining web beta limitations:

- Dashboard data is demo-only.
- Login/register remain placeholders.
- Speaking remains mock-only.
- CSP remains Report-Only.
- Backend staging blockers from PR-013/PR-014 remain unchanged.

## 17. PR-014 OIDC staging readiness result

PR-014 status: READY-FOR-OIDC-PROVISIONING.

OIDC staging strategy is now documented. The recommended path is a real staging
OIDC provider with production-mode `AUTH_MODE=oidc`; private platform-protected
staging is acceptable only as a temporary infrastructure check and must not
expose `AUTH_MODE=dev-header` publicly.

PR-014 artifacts:

- `PR014_OIDC_STAGING_READINESS.md`
- `OIDC_STAGING_CLAIMS.md`
- `STAGING_SMOKE_USERS.md`
- `REMOTE_SMOKE_OIDC_TOKENS.md`
- `RAILWAY_STAGING_CHECKLIST.md`

Important auth constraint:

- Current code maps `sub` directly to `actor.userId`.
- Current code maps `tenant_id` directly to `actor.tenantId`.
- `actor.userId` and `actor.tenantId` must be UUIDs.
- Tenant slug mapping is not implemented in the auth layer.

Remaining deploy blockers:

1. Railway or Render project/runtime.
2. Managed Postgres.
3. Managed Redis.
4. Real OIDC issuer/audience/JWKS.
5. Role-specific staging smoke tokens.
6. Staging seed/demo data decision.

PR-014 local verification:

- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm test`: pass, including 106 API tests and 3 web tests.
- `pnpm test:integration`: pass, 11 tests against real Docker Postgres/Redis
  env.
- `pnpm build`: pass.
- `pnpm format:check`: pass.
- `pnpm ai:eval`: pass, 10 fixtures.
- Local persistence smoke: pass.
- Local rate-limit smoke: pass.
