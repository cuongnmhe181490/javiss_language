# PR-007 AI Orchestration Provider Pilot

## Scope

PR-007 moves AI tutor generation behind an orchestration layer while keeping the deterministic mock provider for local development and CI. The hardening pass adds a task-aware provider contract, provider registry, model router policy, deterministic fallback behavior, structured output validation, observability metadata, and an offline eval harness. It does not call external LLM APIs, does not add production provider credentials, and does not implement realtime speaking intelligence.

## Implemented

- `DefaultAiOrchestrator` wraps tutor generation with eval gate, policy preflight, model routing, output schema validation, fallback handling, latency metadata, cost metadata, and routing metadata.
- `AiTutorService` now depends on `AiOrchestrator`, not a raw model provider.
- Prompt-injection attempts are refused before the provider is called.
- Approved tutor output must cite the active lesson when lesson context is present.
- AI message audit metadata now records provider, model, cost estimate, latency, output schema version, refusal status, and routing decision.
- API smoke checks now verify orchestration metadata on tutor replies.
- `ProviderRegistry` and `ModelRouter` select providers by task type, language, tenant policy, cost, safety requirement, and provider health.
- `MockAiProvider` simulates success, timeout, invalid schema, safety refusal, provider unavailable, and cost estimation.
- `validateAiTaskOutput` validates tutor chat, content QA, speaking feedback scaffold, and safe fallback schemas.
- `apps/api/src/ai-eval.ts` runs 10 deterministic acceptance cases without API keys.

## Not In Scope

- Real OpenAI/Anthropic/Azure/Vertex provider integration.
- BYOK and production provider credentials.
- Streaming token transport.
- Persisted AI eval dataset results.
- Realtime speaking pronunciation scoring.

## Files Added

- `apps/api/src/ai-orchestration-domain.ts`
- `apps/api/src/ai-orchestrator.ts`
- `apps/api/src/ai-model-router.ts`
- `apps/api/src/ai-output-validation.ts`
- `apps/api/src/ai-policy.ts`
- `apps/api/src/ai-observability.ts`
- `apps/api/src/ai-eval.ts`
- `apps/api/src/ai-orchestration.spec.ts`
- `AI_ORCHESTRATION.md`
- `MODEL_ROUTER.md`
- `AI_OUTPUT_SCHEMA.md`
- `AI_POLICY.md`
- `AI_OBSERVABILITY.md`

## Behavior

The tutor request flow is:

1. Load tenant-scoped conversation, active agent, approved prompt, and optional lesson context.
2. Run eval release gate.
3. Run policy preflight.
4. Select provider/model route from the provider registry.
5. Call provider only if policy and router allow.
6. Validate provider output schema and grounding.
7. Discard invalid output and return a safe fallback when needed.
8. Persist user and assistant messages with provider/model/prompt/policy/cost/schema/fallback metadata.
9. Audit success/refusal with sanitized metadata.

## Known Limitations

- Default routing selects deterministic mock providers because no production credentials are configured.
- Eval gate checks prompt status and schema presence, while `pnpm ai:eval` runs deterministic fixtures. It does not persist eval datasets yet.
- Orchestration metadata is stored in `AIMessage.safetyFlags` JSON to avoid a migration in this PR.
- Provider latency is measured around the local provider call; external provider network timing is future work.

## Readiness For Next PR

Verdict after hardening: READY-BETA for mock-backed provider acceptance gates.

The next AI PR can safely add a real provider implementation behind `AiProvider`, tenant model policy persistence, and eval dataset execution without changing the learner chat API contract.
