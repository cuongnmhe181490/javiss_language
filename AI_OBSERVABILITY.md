# AI Observability

## Required Fields

Every orchestrated AI call carries:

- `requestId`
- `traceId`
- `tenantId`
- `taskType`
- `providerId`
- `modelId`
- `latencyMs`
- usage tokens or units
- `costEstimate`
- `schemaValidationResult`
- `finishReason`
- optional `fallbackReason`

Tutor chat persists the same metadata in `AIMessage` fields and `safetyFlags` JSON.

## Event Types

`apps/api/src/ai-observability.ts` normalizes AI call events:

- `success`
- `provider_error`
- `schema_error`
- `policy_denied`
- `fallback_used`

The API route audit event for AI message creation/refusal remains the persisted audit trail. It records provider, model, cost, latency, schema version, route decision, and refusal status without raw prompts.

## Redaction Rules

AI observability helpers redact:

- API keys
- bearer tokens
- secrets
- passwords
- raw prompt fields
- system prompt fields
- developer message fields
- user message/content fields

Provider metadata is rejected if it contains secret-like keys.

## Failure Metadata

Fallbacks include explicit reasons:

- `policy_denied`
- `cost_quota_exceeded`
- `provider_unavailable`
- `provider_timeout`
- `provider_error`
- `schema_validation_failed`
- `provider_safety_refusal`

Invalid provider output is not persisted as a valid answer. Only the safe fallback output and the schema failure metadata are persisted.

## Current Limitations

- Metrics are emitted through in-process event objects and existing audit metadata. There is no external metrics backend in this PR.
- Cost is estimated by provider contract. Real billing reconciliation is future work.
- Latency for mock provider is deterministic; real provider latency will be measured when credentials are added.
