# AI Policy

## Scope

PR-007 policy checks are deterministic guardrails around AI orchestration. They are not a substitute for provider-side moderation, but they fail closed before provider invocation for known unsafe or disallowed cases.

Policy implementation lives in `apps/api/src/ai-policy.ts`.

## Checks

The policy layer checks:

- tenant AI task is enabled
- task type is in tenant allowed task list
- actor has the required permission for the task
- source scope belongs to the current tenant
- source usage is allowed for the task
- content QA has source scope metadata
- input payload is under tenant max input size
- tenant output policy is configured
- tenant cost budget is positive
- system prompt extraction markers
- jailbreak and prompt-injection markers
- tutor agent scope is `tutor_coach`
- tutor agent has required tools: `lesson_lookup`, `hint_generator`

## Task Permissions

| Task                     | Permission             |
| ------------------------ | ---------------------- |
| `tutor_chat`             | `ai_tutor:chat`        |
| `content_qa`             | `content:review`       |
| `speaking_feedback`      | `speaking_report:read` |
| `fallback_safe_response` | `ai_tutor:chat`        |

## Denial Behavior

Policy denial does not call a provider. The orchestrator returns a safe refusal or fallback with:

- `provider=policy`
- `modelId=policy-refusal`
- `safetyFlags.refused=true`
- reason in `safetyFlags.reason`
- request/trace id metadata
- audit action through the existing AI message refusal path

## Source Scope

Source scope entries include:

- `tenantId`
- `sourceType`
- `sourceId`
- optional `allowedUsage`

Any cross-tenant source is denied. Content QA requires at least one source scope entry because QA without source metadata cannot validate lineage.

## Current Limitations

- No external moderation provider is called.
- Quota is deterministic policy/router metadata, not a persisted tenant billing ledger.
- Jailbreak detection is pattern-based and intentionally conservative.
- Real provider integration must keep these checks and add provider-specific safety gates.
