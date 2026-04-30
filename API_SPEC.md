# Polyglot AI Academy - API Spec

## PR-004 Learning Core

Learner endpoints:

- `GET /v1/courses`
- `GET /v1/courses/:courseId`
- `GET /v1/lessons/:lessonId`
- `POST /v1/lessons/:lessonId/start`
- `POST /v1/lessons/:lessonId/complete`
- `GET /v1/progress/me`
- `GET /v1/assignments/me`

Admin/content endpoints:

- `POST /v1/admin/courses`
- `PATCH /v1/admin/courses/:courseId`
- `POST /v1/admin/courses/:courseId/publish`
- `POST /v1/admin/modules`
- `POST /v1/admin/lessons`
- `PATCH /v1/admin/lessons/:lessonId`
- `POST /v1/admin/lessons/:lessonId/publish`
- `POST /v1/admin/lessons/:lessonId/blocks`
- `POST /v1/admin/assignments`

Short `/v1/...` learning routes resolve tenant from actor claims/dev headers. Tenant-path equivalents under `/v1/tenants/:tenantId/...` remain supported. See `LEARNING_API.md` for request/response examples and role requirements.

## PR-005 AI Tutor Chat Foundation

Learner AI endpoints:

- `GET /v1/ai/agents`
- `POST /v1/ai/conversations`
- `GET /v1/ai/conversations/:conversationId`
- `POST /v1/ai/conversations/:conversationId/messages`

Short `/v1/ai/...` routes resolve tenant from actor claims/dev headers. Tenant-path equivalents under `/v1/tenants/:tenantId/ai/...` remain supported. See `AI_CHAT_API.md` for request/response examples.

Current AI provider behavior is local deterministic mock only. No external LLM provider is called in PR-005.

## PR-006 Speaking Realtime Foundation

Speaking endpoints:

- `POST /v1/speaking/sessions`
- `GET /v1/speaking/sessions/:sessionId`
- `POST /v1/speaking/sessions/:sessionId/text-fallback`
- `GET /v1/speaking/sessions/:sessionId/report`
- `POST /v1/speaking/sessions/:sessionId/end`

Short `/v1/speaking/...` routes resolve tenant from actor claims/dev headers. Tenant-path equivalents under `/v1/tenants/:tenantId/speaking/...` remain supported. See `SPEAKING_REALTIME_API.md`.

Current realtime behavior is local scaffold only. No SFU, STT, TTS, or pronunciation provider is called in PR-006.

## 1. API principles

- REST for core CRUD/workflows.
- WebRTC/SFU plus WebSocket events for realtime speaking.
- `/v1` version prefix.
- Authenticated requests resolve tenant context before domain access.
- Runtime validation for body, params and query.
- Standard error envelope.

Error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "req_123",
    "timestamp": "2026-04-27T10:00:00.000Z",
    "details": {}
  }
}
```

Rate limits return `RATE_LIMITED` with retry timing in `details.retryAfter`.

## 2. Auth, SSO and SCIM

| Method | Path                                | Purpose                      | Auth                          |
| ------ | ----------------------------------- | ---------------------------- | ----------------------------- |
| POST   | `/v1/auth/register`                 | Email signup                 | public + rate limit           |
| POST   | `/v1/auth/login`                    | Email login                  | public + rate limit           |
| POST   | `/v1/auth/logout`                   | End session                  | user                          |
| POST   | `/v1/auth/password-reset/request`   | Request reset                | public + rate limit           |
| POST   | `/v1/auth/password-reset/confirm`   | Confirm reset                | public + token                |
| GET    | `/v1/sso/oidc/:tenantSlug/start`    | Start OIDC auth code + PKCE  | public                        |
| GET    | `/v1/sso/oidc/:tenantSlug/callback` | OIDC callback                | public                        |
| POST   | `/v1/sso/saml/:tenantSlug/acs`      | SAML ACS bridge              | public + signature validation |
| GET    | `/v1/scim/v1/Users`                 | SCIM list users              | SCIM token                    |
| POST   | `/v1/scim/v1/Users`                 | SCIM create user             | SCIM token                    |
| PATCH  | `/v1/scim/v1/Users/:id`             | SCIM update/deprovision user | SCIM token                    |
| GET    | `/v1/scim/v1/Groups`                | SCIM list groups             | SCIM token                    |
| POST   | `/v1/scim/v1/Groups`                | SCIM create group            | SCIM token                    |
| PATCH  | `/v1/scim/v1/Groups/:id`            | SCIM update group            | SCIM token                    |

Rules:

- No implicit OAuth flow.
- Refresh/session rotation.
- SCIM token maps to exactly one tenant.
- Every SCIM sync event is audited.

## 3. Tenant and enterprise admin

| Method | Path                              | Purpose                           | Permission                           |
| ------ | --------------------------------- | --------------------------------- | ------------------------------------ |
| GET    | `/v1/tenants/current`             | Current tenant config             | tenant member                        |
| PATCH  | `/v1/tenants/current/branding`    | Update branding                   | `tenant.branding.update`             |
| PATCH  | `/v1/tenants/current/data-policy` | Update retention/export/residency | `tenant_policy:update` + step-up MFA |
| GET    | `/v1/admin/users`                 | User list                         | `user:read_basic`                    |
| GET    | `/v1/admin/groups`                | Group list                        | `group.read`                         |
| POST   | `/v1/admin/groups`                | Create group                      | `group.write`                        |
| POST   | `/v1/admin/assignments`           | Assign course/path                | `assignment.write`                   |
| GET    | `/v1/admin/analytics/cohorts`     | Cohort analytics                  | `analytics.read`                     |
| GET    | `/v1/admin/audit-events`          | Audit log                         | `audit:list`                         |

## 4. Learner APIs

| Method | Path                                 | Purpose                    |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/v1/learner/dashboard`              | Dashboard summary          |
| POST   | `/v1/onboarding/profile`             | Save target language/goals |
| POST   | `/v1/placement-tests/:id/attempts`   | Submit placement attempt   |
| GET    | `/v1/courses`                        | Course list                |
| GET    | `/v1/lessons/:lessonId`              | Lesson detail              |
| POST   | `/v1/lessons/:lessonId/progress`     | Save lesson progress       |
| POST   | `/v1/exercises/:exerciseId/attempts` | Submit attempt             |
| GET    | `/v1/review/queue`                   | SRS/mistake review queue   |

## 5. Speaking APIs

| Method | Path                                      | Purpose                               |
| ------ | ----------------------------------------- | ------------------------------------- |
| POST   | `/v1/speaking-sessions`                   | Create session and receive room token |
| GET    | `/v1/speaking-sessions/:id`               | Session status                        |
| POST   | `/v1/speaking-sessions/:id/end`           | End session                           |
| GET    | `/v1/speaking-sessions/:id/report`        | Session report                        |
| POST   | `/v1/speaking-sessions/:id/text-fallback` | Submit text fallback turn             |

Implemented PR-006 paths use `/v1/speaking/sessions...`; the older `/v1/speaking-sessions...` shape remains a target compatibility alias for later routing cleanup.

Realtime events:

- `session.connected`
- `mic.state_changed`
- `transcript.partial`
- `transcript.final`
- `ai.response.delta`
- `ai.response.final`
- `feedback.item_created`
- `network.weak`
- `session.reconnected`

## 6. AI and agent APIs

| Method | Path                                    | Purpose                         | Permission                 |
| ------ | --------------------------------------- | ------------------------------- | -------------------------- |
| GET    | `/v1/ai/agents`                         | List active tutor agents        | `agent:read`               |
| POST   | `/v1/ai/conversations`                  | Create tutor conversation       | `ai_tutor:chat`            |
| GET    | `/v1/ai/conversations/:id`              | Read own conversation           | `ai_conversation:read_own` |
| POST   | `/v1/ai/conversations/:id/messages`     | Send tutor message              | `ai_tutor:chat`            |
| GET    | `/v1/admin/agents`                      | List tenant agents              | `agent:read`               |
| POST   | `/v1/admin/agents`                      | Create tenant agent             | `agent:write`              |
| PATCH  | `/v1/admin/agents/:id`                  | Update agent scope/tools/status | `agent:write`              |
| POST   | `/v1/admin/agents/:id/evals`            | Run agent eval                  | `agent:eval`               |
| POST   | `/v1/admin/agents/:id/prompt-versions`  | Create prompt version           | `prompt:write`             |
| POST   | `/v1/admin/prompt-versions/:id/approve` | Approve prompt version          | `prompt:approve`           |

Rules:

- Agent tool calls must match allow-list.
- Tenant Knowledge Agent retrieval is tenant-scoped.
- Output schema validation required.
- PR-007 tutor chat responses are generated through `DefaultAiOrchestrator`.
- Assistant message metadata includes `provider`, `modelId`, `promptVersion`, `policyVersion`, token counts, `costEstimate`, and orchestration details in `safetyFlags`.
- Prompt-injection refusals return a normal assistant message with `safetyFlags.refused=true`; hidden prompt text is never returned.

## 7. Content APIs

| Method | Path                                                            | Purpose                       |
| ------ | --------------------------------------------------------------- | ----------------------------- |
| GET    | `/v1/admin/content`                                             | Content item list             |
| POST   | `/v1/admin/content/items`                                       | Create content item           |
| GET    | `/v1/admin/content/items/:id`                                   | Read content item             |
| POST   | `/v1/admin/content/items/:id/versions`                          | Create version                |
| POST   | `/v1/admin/content/items/:id/submit-review`                     | Submit review                 |
| POST   | `/v1/admin/content/items/:id/versions/:versionId/qa`            | Run content QA                |
| POST   | `/v1/admin/content/items/:id/versions/:versionId/approve`       | Approve version               |
| POST   | `/v1/admin/content/items/:id/versions/:versionId/publish`       | Publish version               |
| POST   | `/v1/admin/content/items/:id/versions/:versionId/sync-learning` | Sync published lesson content |
| POST   | `/v1/admin/content/items/:id/versions/:versionId/rollback`      | Roll back version             |
| GET    | `/v1/admin/review-queue`                                        | Review queue                  |
| GET    | `/v1/admin/sources`                                             | Source registry               |
| POST   | `/v1/admin/sources`                                             | Create source                 |
| PATCH  | `/v1/admin/sources/:id`                                         | Update source                 |
| POST   | `/v1/admin/sources/:id/approve`                                 | Approve source                |

Content publish requires QA status `passed` and approved, commercially cleared, unexpired source lineage. Runtime lesson sync is explicit, requires `content:sync_learning`, and supports published lesson content only in PR-009.

## 8. API Done Criteria

- Tenant context required for tenant resources.
- OIDC/SCIM/RBAC endpoints are first-class.
- Speaking and AI endpoints track session/model/prompt/policy versions.
- Admin/content actions are permission-gated and audited.
- Cross-tenant and object-level authorization tests exist.
