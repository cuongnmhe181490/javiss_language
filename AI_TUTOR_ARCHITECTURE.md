# AI Tutor Architecture

## Purpose

The PR-005 tutor chat foundation gives learners contextual help inside the learning core without introducing provider secrets or production LLM dependency yet.

The design goal is to make later provider routing, eval gates, cost controls, and tenant-specific agents fit behind stable interfaces.

## Data Model

- `AIAgent`: tenant-scoped agent configuration.
- `PromptVersion`: versioned prompt, output schema, safety rules, and eval status.
- `AIConversation`: learner-owned conversation tied to an agent and optional course/lesson context.
- `AIMessage`: user/assistant turn with citations, safety flags, provider/model metadata, token counts, and cost estimate.

Every table includes `tenantId` and repository methods require tenant scope.

## Runtime Flow

1. Request context resolves actor and tenant.
2. RBAC/ABAC checks permission and tenant membership.
3. Tutor service resolves the active tenant-scoped agent.
4. Optional lesson/course context is validated as published and same-tenant.
5. User message is persisted.
6. Provider abstraction generates a structured assistant message.
7. Assistant message is persisted with citations and safety flags.
8. Audit event records success, refusal, or denied chat action.

## Provider Abstraction

Current interface:

- `AiModelProvider.generateTutorReply(input)`

Current implementation:

- `MockTutorProvider`

The mock provider is deterministic and local. It does not call an external model and does not use API keys.

PR-007 adds the first orchestration layer:

- model router
- output schema validation
- eval-gated prompt/model version rollout
- pre-provider policy refusal for prompt injection
- cost and latency metadata on persisted assistant messages

Future provider implementations should still add provider timeout/retry policy, tenant budget enforcement, safety classifier hooks, and OpenTelemetry spans for model calls without PII.

## Grounding

PR-005 grounding is intentionally simple:

- lesson title
- lesson objectives
- lesson blocks as citation sources

The assistant response cites lesson and lesson block IDs. Tenant document RAG is not included in this PR.

## Tenant Isolation

- Agent lookup uses `tenantId + agentId`.
- Prompt lookup uses `tenantId + agentId + version`.
- Conversation lookup uses `tenantId + conversationId`.
- Message lookup uses `tenantId + conversationId`.
- Learners can only read their own conversations.
- Admin/team reads require `ai_conversation:manage`.

## Safety Controls

- Prompt text is never returned by learner APIs.
- Tool execution is not implemented, so no tool can be called outside an allow-list.
- Prompt injection is refused by a deterministic pattern scaffold.
- PR-007 refuses known prompt-injection attempts before calling the provider.
- Refusal output records `safetyFlags.refused=true`.
- Message metadata records prompt, policy, provider, model, cost, latency, schema version, eval gate, and routing decision for traceability.

## Production Upgrade Path

Before using a real model provider:

- Add provider-specific config validation.
- Add signed/provider-key secret management.
- Run AI evals for prompt and model changes.
- Validate structured output schema.
- Add model call tracing and redacted logging.
- Add budget enforcement per tenant.
- Add content and tenant-doc grounding policy.
- Add red-team test set for prompt injection and data exfiltration.
