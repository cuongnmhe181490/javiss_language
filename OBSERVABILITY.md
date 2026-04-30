# Observability Baseline

## OpenTelemetry

PR-003B adds request span helper support through `@opentelemetry/api`.

Config:

- `OTEL_SERVICE_NAME`
- `OTEL_EXPORTER_OTLP_ENDPOINT` optional.

Local development works when no OTLP endpoint is configured.

## Span Attributes

Prepared attributes:

- `request.id`
- `tenant.id`
- `actor.id`
- `route`
- `http.request.method`
- `http.response.status_code`

PII such as email and raw token data is not included.

## PR-005 AI Tutor Metadata

AI tutor requests currently use the same HTTP request span baseline. Assistant messages persist provider/model metadata for later metrics:

- provider.
- model ID.
- prompt version.
- policy version.
- input/output token estimates.
- cost estimate.
- refusal/safety flags.

Future real provider calls should add child spans with non-PII attributes only:

- `tenant.id`
- `actor.id`
- `request.id`
- `ai.agent.id`
- `ai.provider`
- `ai.model_id`
- `ai.prompt_version`
- `ai.policy_version`
- `ai.outcome`

Do not add prompt text, user message content, transcripts, or tenant document text to span attributes.

## PR-006 Speaking Metadata

Speaking sessions persist operational metadata for future SLOs:

- SFU/STT/TTS/LLM provider names.
- session status.
- latency estimate.
- QoS policy.
- text fallback usage through transcript segment counts.

Future realtime service spans should include non-PII attributes only:

- `tenant.id`
- `actor.id`
- `request.id`
- `speaking.session.id`
- `speaking.provider.sfu`
- `speaking.status`
- `speaking.qos.profile`
- `speaking.text_fallback_used`

Do not add raw audio, raw transcript text, realtime tokens, or token hashes to traces/logs.

## Health Checks

- `/health/live`: process liveness only.
- `/health/ready`: repository, database, Redis, and auth readiness when configured.
- `/health`: compatibility alias.

With live Postgres and Redis enabled, a healthy local readiness response should look like:

```json
{
  "status": "degraded",
  "service": "polyglot-api",
  "version": "0.1.0",
  "checks": {
    "auth": { "status": "degraded" },
    "repositories": { "status": "ok" },
    "database": { "status": "ok" },
    "redis": { "status": "ok" }
  }
}
```

`auth=degraded` is expected in local `AUTH_MODE=dev-header`; production should use OIDC.

## Next Steps

- Add SDK/exporter initialization for staging/production.
- Add metrics for request latency, error rate, rate-limit hits, audit export attempts, and OIDC failures.
- Propagate trace context to AI/realtime services.
- Add model call latency, token, cost, refusal, and schema violation metrics before real provider rollout.
- Add realtime setup success, reconnect count, first partial STT latency, and text fallback rate metrics.

## PR-007 AI Orchestration Telemetry

Tutor assistant messages now persist AI metadata for later metrics:

- provider and model ID
- prompt and policy version
- input/output token counts
- cost estimate
- output schema version
- routing decision
- eval gate status
- latency in milliseconds
- refusal reason when applicable

The current implementation stores this metadata on the persisted message and sanitized audit event. Future work should emit dedicated OpenTelemetry spans and metrics for provider latency, schema failures, refusal rate, grounded answer rate, and cost per successful turn.
