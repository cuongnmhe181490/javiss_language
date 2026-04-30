# AI Orchestration

## Purpose

AI orchestration centralizes provider selection, safety policy, output validation, cost metadata, and release gating for AI tutor turns. Routes and services must not call external model providers directly.

## Current Architecture

- `AiTutorService` validates tenant conversation access and lesson grounding context.
- `DefaultAiOrchestrator` runs the AI release path.
- `ProviderRegistry` stores provider implementations and rejects secret-like provider metadata.
- `ModelRouter` chooses provider/model from task, language, tenant model policy, cost limit, safety requirement, and provider health.
- `evaluateAiPolicy` blocks prompt extraction, cross-tenant source scope, disabled tenant tasks, oversized input, quota exhaustion, unsupported tutor agent/tool configurations, and actor permission failures before provider execution.
- `validateAiTaskOutput` enforces task-specific structured output schemas and lesson citation requirements.
- `MockAiProvider` remains deterministic for local development, tests, smoke, and offline eval.

## Request Lifecycle

1. Tenant context and actor are resolved by the API foundation.
2. RBAC/ABAC authorizes `ai_tutor:chat`.
3. Conversation, agent, prompt, and lesson context are loaded through tenant-scoped repositories.
4. The orchestrator checks `PromptVersion.evalStatus === approved`.
5. Policy preflight refuses known prompt-injection attempts without provider execution.
6. Router filters provider registry candidates by tenant policy, language, task type, cost, safety, and health.
7. Provider output is schema-validated.
8. Schema failure discards provider output and returns a safe fallback.
9. Lesson-grounded replies require at least one lesson citation unless refused.
10. Assistant message persists provider/model/token/cost plus orchestration metadata in `safetyFlags`.
11. Audit event records sanitized provider, model, cost, latency, output schema, routing, fallback, and refusal metadata.

## Metadata

Assistant messages include:

- `provider`
- `modelId`
- `promptVersion`
- `policyVersion`
- `inputTokens`
- `outputTokens`
- `costEstimate`
- `safetyFlags.outputSchemaVersion`
- `safetyFlags.routingDecision`
- `safetyFlags.evalGate`
- `safetyFlags.latencyMs`
- `safetyFlags.schemaValidationResult`
- `safetyFlags.fallbackReason`
- `safetyFlags.requestId`
- `safetyFlags.traceId`

## Production Provider Path

Future real providers should implement `AiProvider` and be registered in `ProviderRegistry`. They must not log raw prompts, bearer tokens, customer documents, audio, transcript data, or system prompt text. Provider errors should map to safe fallback behavior or standard API envelopes and keep internal provider details server-side.

Provider acceptance requires passing `pnpm ai:eval` plus the normal API test suite.
