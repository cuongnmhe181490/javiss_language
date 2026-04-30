# PR-007 Hardening Report

Date: 2026-04-30

## Current PR-007 Surface

Implemented code:

- `apps/api/src/ai-orchestrator.ts` centralizes tutor reply generation behind `DefaultAiOrchestrator`.
- `apps/api/src/ai-provider.ts` defines a tutor-only `AiModelProvider` with deterministic `MockTutorProvider`.
- `apps/api/src/ai-model-router.ts` selects `mock/mock-tutor-v1` for tutor replies and `policy/policy-refusal` for refusals.
- `apps/api/src/ai-policy.ts` blocks unsupported tutor agent scopes, missing tutor tools, and prompt-injection phrases.
- `apps/api/src/ai-output-validation.ts` validates tutor provider output with Zod and requires lesson grounding citations.
- `apps/api/src/ai-services.ts` sends chat messages through the orchestrator instead of calling a provider directly.
- `apps/api/src/app.ts` audits AI message creation/refusal with sanitized provider/model/cost/latency/schema/routing metadata.

Implemented tests:

- `apps/api/src/ai-orchestration.spec.ts` covers happy path routing metadata, policy refusal before provider call, prompt eval gate, and ungrounded output rejection.
- `apps/api/src/ai.spec.ts` covers tenant-scoped agent listing, conversation creation, prompt-injection refusal, prompt non-exposure, same-tenant ownership denial, and cross-tenant conversation denial.
- `apps/api/scripts/smoke-api.mjs` checks AI agents, chat, citations, orchestration metadata, prompt-injection refusal, and refusal audit event.

Implemented docs:

- `PR007_AI_ORCHESTRATION_PROVIDER_PILOT.md`
- `AI_ORCHESTRATION.md`
- `MODEL_ROUTING.md`
- `AI_OUTPUT_SCHEMA.md`
- `PROMPT_SAFETY.md`
- `AI_EVAL_PLAN.md`

## Mock And Pilot Boundaries

Mock/pilot code:

- `MockTutorProvider` is the only provider implementation.
- `selectTutorRoute` hard-codes `mock/mock-tutor-v1` and only supports tutor replies.
- Cost tracking is returned by provider output and persisted as metadata, but quota enforcement is not implemented.
- Latency is measured around deterministic local orchestration, not around a real network provider.
- Content QA uses deterministic local checks in `content-qa-agent.ts`, not the PR-007 provider/router contract.
- Speaking report remains scaffolded with `scoringStatus: "not_implemented"` and mock realtime/STT/TTS/LLM provider names.

## Production-Ready Pieces

- AI message route does not bypass orchestration for tutor chat.
- Prompt text is not exposed by AI agent listing or prompt-injection responses.
- Tenant-scoped conversation, agent, prompt, lesson, and message repository access exists.
- Same-tenant ownership and cross-tenant conversation protections are tested.
- Tutor output schema validation exists and rejects missing grounding citations.
- Prompt eval status and output schema presence are checked before provider use.
- Refusals and successful messages are audited with sanitized metadata.
- AIMessage already has provider, modelId, promptVersion, policyVersion, token, cost, and safetyFlags JSON fields, so no migration is required for hardening metadata.

## Scaffold Or Gaps

- Provider contract is tutor-specific and lacks `providerId`, `supportedTasks`, `supportedLanguages`, `estimateCost`, `healthCheck`, timeout config, and sanitized metadata.
- There is no provider registry.
- Router does not accept task type, language, tenant policy, cost limit, latency preference, safety requirement, or provider availability.
- Fallback behavior is incomplete for provider unavailable, timeout, schema validation failure, policy denial, and quota exceeded.
- Structured output validation only covers tutor reply output. It does not expose task-specific schemas for content QA, speaking feedback scaffold, or fallback responses through one validation layer.
- Policy layer does not yet check tenant task enablement, source scope, actor permission inside orchestration, max input/output size, quota, cross-tenant source references, or deterministic jailbreak markers beyond a small injection regex.
- Observability has audit metadata, but no shared AI event builder for success, provider error, schema error, policy denied, and fallback used.
- No deterministic AI eval harness exists.
- Tests do not cover provider timeout, provider unavailable, invalid schema fallback, safety refusal from provider, cost quota exceeded, provider metadata secret redaction, or eval fixture cases.

## Beta Release Risks

- A real provider could be added incorrectly by implementing only `generateTutorReply`, bypassing cost, health, timeout, language, and task policy.
- The hard-coded router can hide tenant policy gaps because every request always routes to the same mock model.
- Invalid provider output currently throws a 502 path instead of producing a controlled safe fallback for user-facing chat.
- Cost estimates are accepted but not enforced against tenant quota or request cost limits.
- Logs/audit events are mostly safe today, but there is no shared redaction contract for future AI call telemetry.
- Speaking and content QA are not yet unified under the router, so PR-007 cannot claim full multi-task orchestration without explicit scaffolds and eval coverage.

## Work Required In This PR

- Replace tutor-only provider contract with a task-aware provider interface and deterministic mock provider failure modes.
- Add provider registry and model router policy inputs for task type, language, tenant policy, cost limit, latency preference, safety requirement, and availability.
- Add fallback envelopes for policy denied, quota exceeded, provider unavailable, timeout, schema error, and provider safety refusal.
- Add Zod validation for tutor chat, content QA, speaking feedback scaffold, and safe fallback response.
- Add deterministic policy guardrails for allowed task, actor permission, source scope, system prompt exposure, cross-tenant source references, max input/output size, quota, and jailbreak markers.
- Add AI observability helpers that produce redacted structured events.
- Add a lightweight eval harness that runs offline fixtures without API keys or network access.
- Update docs and recovery audit with new PR-007 verdict and remaining limitations.
- Run the full required command set before claiming PASS or READY-BETA.

## Hardening Implemented

- `AiProvider` is now task-aware and includes provider id, supported tasks/languages, timeout config, sanitized metadata, `estimateCost`, `healthCheck`, and `invoke`.
- `ProviderRegistry` and `ModelRouter` route by task type, language, tenant policy, cost, safety requirement, and provider health.
- `MockAiProvider` simulates success, timeout, invalid schema, safety refusal, unavailable, and cost estimation.
- `validateAiTaskOutput` covers tutor chat, content QA, speaking feedback scaffold, and safe fallback schemas.
- `evaluateAiPolicy` covers task enablement, actor permission, source scope, cross-tenant sources, max input/output policy, quota, prompt extraction, jailbreak markers, and tutor tool/scope checks.
- AI fallback results now carry explicit reason metadata and discard invalid provider output.
- `ai-observability.ts` emits redacted structured AI call events.
- `apps/api/src/ai-eval.ts` runs 10 deterministic acceptance cases without API keys.
- AI send-message route passes request id/trace id into orchestration and persists schema/fallback metadata in `AIMessage.safetyFlags`.

## Current Verdict

PR-007 is READY-BETA with deterministic mock-backed provider acceptance gates. It is not marked full production real-provider PASS until a credentialed provider is added and canary/eval evidence is captured against that provider.

## Done Criteria

- Model router policy is explicit and tested.
- Provider contract is task-aware and tested.
- Mock provider simulates success, timeout, invalid schema, safety refusal, unavailable, and cost estimate.
- Structured output validation rejects bad output and prevents invalid answer persistence.
- Safety policy guardrails are deterministic and tested.
- Cost, latency, requestId/traceId, provider/model, and fallback reason metadata are emitted without raw prompt/secret exposure.
- AI chat route still goes through orchestration and persists metadata.
- Cross-tenant source scope and system prompt exposure remain blocked.
- Eval harness runs in CI without provider credentials.
- Required tests, integration, build, format check, smoke, and AI eval pass.
