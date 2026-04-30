# Model Router

## Contract

AI routes must call an orchestrator, not a provider. The orchestrator builds an `AiTaskRequest`, runs policy, asks `ModelRouter` for a route, invokes the selected provider, validates structured output, and returns either validated output or a safe fallback.

Supported task types:

- `tutor_chat`
- `content_qa`
- `speaking_feedback`
- `fallback_safe_response`

## Provider Interface

Providers implement `AiProvider` in `apps/api/src/ai-provider.ts`:

- `providerId`
- `supportedTasks`
- `supportedLanguages`
- `timeoutMs`
- `metadata` with model capabilities and no secret-like keys
- `estimateCost(input)`
- `healthCheck()`
- `invoke(input)`

Provider input includes tenant, actor, task type, language, prompt version, policy version, payload, source scope, request id, and trace id. Provider output includes `output`, `usage`, `costEstimate`, `latencyMs`, `providerId`, `modelId`, `safetyResult`, `schemaValidationResult`, and `finishReason`.

## Registry And Selection

`ProviderRegistry` stores providers and filters candidates by:

- task type
- language
- tenant allowed providers
- tenant allowed models
- provider model capabilities
- safety requirement

`ModelRouter` then applies:

- tenant AI enabled flag
- tenant allowed task list
- request cost limit
- tenant max estimated cost
- tenant remaining budget
- provider health

The router returns a route decision only. It never invokes the provider.

## Default Mock Provider

`MockAiProvider` is deterministic and supports:

- success
- timeout
- invalid schema
- safety refusal
- provider unavailable
- cost estimates

It supports all PR-007 hardening tasks without internet access or API credentials.

## Fallback Behavior

Fallbacks are explicit and metadata-bearing:

| Case                    | Behavior                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| Policy denied           | No provider call; safe refusal output; `policy_denied` event         |
| Cost quota exceeded     | No provider call; safe fallback; `quota_exceeded` finish reason      |
| Provider unavailable    | No provider call when health fails; safe fallback                    |
| Provider timeout        | Safe fallback with `provider_timeout` reason                         |
| Provider error          | Safe fallback with `provider_error` reason                           |
| Schema validation fail  | Invalid output is discarded; safe fallback is returned and persisted |
| Provider safety refusal | Refusal metadata is preserved and event marks fallback usage         |

## Acceptance Gates

PR-007 is READY-BETA when:

- no AI route bypasses orchestration
- provider contract tests cover success, timeout, invalid schema, unavailable, safety refusal, cost, and metadata secret rejection
- policy tests cover task enablement, permissions, source scope, input size, quota, and prompt extraction
- schema tests cover valid output, missing fields, malicious extra fields, invalid output, and fallback
- eval harness runs offline with no API key
- audit/log metadata never contains raw prompt, system prompt, token, or secret fields
