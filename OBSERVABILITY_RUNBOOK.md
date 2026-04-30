# Polyglot AI Academy - Observability and Runbooks

## 1. Observability goals

Observability is required from the first enterprise release. The platform must show tenant-level usage, speaking quality, AI cost, security events, and reliability signals with enough detail to debug incidents without exposing sensitive learner or tenant content.

Required pillars:

- OpenTelemetry instrumentation.
- Structured logs.
- Metrics.
- Distributed traces.
- AI call tracing.
- Speaking session tracing.
- Cost tracking.
- Tenant-level usage.
- Error budgets.
- Alerting.

Recommended stack:

- OpenTelemetry.
- Prometheus.
- Loki.
- Grafana.
- Sentry.
- Optional: Tempo or Jaeger.

## 2. SLO targets

| Service area                   | SLO              |
| ------------------------------ | ---------------- |
| Web app availability           | 99.95%           |
| Core API availability          | 99.90%           |
| Realtime session setup success | 99.50%           |
| p95 lesson start               | <2s              |
| p95 first partial STT          | 300-500ms target |
| p95 first byte TTS             | <800ms target    |
| MTTR Sev-1                     | <30 minutes      |

SLO notes:

- These are product targets, not certification claims.
- Targets should be refined after baseline production telemetry.
- Realtime SLOs are segmented by region, provider, browser, and network quality.

## 3. Metrics taxonomy

Web:

- page load time.
- route error rate.
- hydration/client error rate.
- Core Web Vitals.
- PWA install/launch events.

Core API:

- request count.
- p50/p95/p99 latency.
- error rate by endpoint.
- auth failure rate.
- rate limit hits.
- DB query latency.
- cache hit rate.

Realtime:

- session setup success.
- ICE connection success.
- reconnect count.
- bitrate fallback count.
- first partial STT latency.
- TTS first byte latency.
- AI audible reply start latency.
- dropped session rate.

AI:

- request count by tenant/feature/agent.
- provider/model latency.
- token/audio cost.
- schema violation rate.
- moderation flag rate.
- grounded answer rate.
- refusal correctness sample rate.

Content:

- publish count.
- rollback count.
- review queue age.
- AI QA failure rate.
- learner complaint rate.
- source license risk distribution.

Enterprise:

- MAU by tenant.
- active learners by group.
- assignment completion.
- speaking minutes by cohort.
- manager dashboard usage.
- export events.
- SCIM sync success/failure.

Security:

- failed login spike.
- admin role change.
- SSO config change.
- data export.
- transcript/audio admin access.
- cross-tenant denial count.
- suspicious retrieval attempts.

## 4. Logging rules

Structured log fields:

- `timestamp`
- `level`
- `service`
- `environment`
- `request_id`
- `trace_id`
- `tenant_id`
- `actor_id` when available
- `action`
- `resource_type`
- `resource_id`
- `status`
- `latency_ms`
- `error_code`

Never log:

- passwords.
- reset tokens.
- access/refresh tokens.
- cookies.
- Authorization headers.
- raw audio.
- full transcript by default.
- raw tenant documents.
- provider API keys.
- full prompt with sensitive user/tenant context.

Redaction:

- PII fields.
- secrets.
- email where not needed.
- phone.
- IP if privacy policy requires truncation for analytics.

## 5. Tracing

Trace required flows:

- SSO login.
- SCIM sync.
- Learner lesson start.
- Speaking session lifecycle.
- AI tutor turn.
- Tenant Knowledge Agent retrieval.
- Content publish workflow.
- Data export.
- Admin sensitive action.

Speaking trace spans:

- token issue.
- SFU room creation.
- browser connected.
- STT stream start.
- first partial transcript.
- final transcript.
- LLM request.
- first LLM token.
- TTS request.
- first TTS byte.
- pronunciation scoring.
- report generation.

AI trace spans:

- policy check.
- prompt assembly.
- retrieval.
- provider call.
- output validation.
- safety post-check.
- cost record.

## 6. Alerts

P0/P1 alerts:

- Web/API availability below SLO.
- SSO login failure spike.
- Realtime setup success below threshold.
- Speaking latency spike.
- AI provider outage.
- AI cost spike by tenant.
- Cross-tenant retrieval suspicion.
- Wrong content published.
- Compromised admin account signal.
- Transcript/audio data incident.
- SCIM deprovision failures.

Alert payload must include:

- affected tenant(s).
- service.
- metric threshold.
- start time.
- runbook link.
- dashboard link.
- owner.

## 7. Runbook template

Each runbook must include:

- Signal.
- First action.
- Mitigation.
- Owner.
- Escalation.
- Rollback.
- Customer communication note.
- Postmortem checklist.

## 8. Required runbooks

### 8.1 SSO login failure spike

Signal:

- OIDC/SAML login failures exceed baseline for a tenant or globally.

First action:

- Check identity provider status, recent SSO config changes, certificate expiry, redirect URI mismatch, and deployment timeline.

Mitigation:

- Roll back SSO config if recently changed.
- Enable backup login for tenant admins if contract permits.
- Pause SCIM changes if identity provider outage is suspected.

Owner:

- Backend Lead + DevSecOps.

Escalation:

- Security Engineer, tenant IT contact.

Rollback:

- Revert tenant SSO config version.

Postmortem:

- Root cause, affected users, auth logs, prevention, customer notice.

### 8.2 Speaking latency spike

Signal:

- p95 first partial STT, TTS first byte, or audible reply start exceeds SLO.

First action:

- Segment by tenant, region, provider, browser, network, and SFU region.

Mitigation:

- Switch provider route if model router supports.
- Enable weak network mode.
- Reduce bitrate.
- Temporarily shift to text response fallback.

Owner:

- Realtime Lead + AI Engineer.

Rollback:

- Roll back latest realtime/AI release or provider config.

Postmortem:

- Latency stage, provider status, tenant impact, retry success.

### 8.3 Cross-tenant retrieval suspicion

Signal:

- Retrieval logs show tenant mismatch or denied cross-tenant access spike.

First action:

- Freeze affected agent/retrieval feature flag for tenant(s).
- Preserve logs and traces.

Mitigation:

- Disable Tenant Knowledge Agent for affected scope.
- Rotate retrieval index version if contamination suspected.
- Run cross-tenant test suite.

Owner:

- Security Engineer + AI Engineer.

Escalation:

- CTO, Legal/Compliance, tenant contact if confirmed.

Rollback:

- Revert retrieval policy/index version.

Postmortem:

- Data exposed or not, scope, root cause, remediation, notification decision.

### 8.4 AI cost spike

Signal:

- AI cost per tenant/feature exceeds budget threshold.

First action:

- Identify provider/model/agent/prompt version and tenant usage pattern.

Mitigation:

- Apply tenant quota or throttle.
- Route to cheaper model where quality gate allows.
- Disable runaway agent loop.
- Cache safe non-user-specific retrieval where permitted.

Owner:

- AI Engineer + Product Manager.

Rollback:

- Revert prompt/model/router change.

Postmortem:

- Cost driver, abuse or organic usage, guardrail update.

### 8.5 Wrong content published

Signal:

- Learner complaint, QA alert, or validation rollback alert.

First action:

- Unpublish or revert content version.
- Identify affected tenants, assignments, and learners.

Mitigation:

- Push corrected content to review queue.
- Notify managers if assigned content was affected.
- Create learner remediation drill if needed.

Owner:

- Content Lead + QA Lead.

Rollback:

- Restore previous content version.

Postmortem:

- Validation gap, reviewer path, source issue, prevention.

### 8.6 Provider outage

Signal:

- STT/TTS/LLM/provider error rate spike.

First action:

- Check provider status and internal routing changes.

Mitigation:

- Route to fallback provider.
- Disable affected feature for new sessions if no safe fallback.
- Preserve in-progress session state.

Owner:

- AI Engineer + DevSecOps.

Rollback:

- Revert provider route/model config.

Postmortem:

- Provider SLA, fallback success, customer impact.

### 8.7 Compromised admin account

Signal:

- Suspicious admin action, impossible travel, repeated failed MFA, unusual export.

First action:

- Revoke sessions and tokens for account.
- Freeze sensitive changes by actor.

Mitigation:

- Step-up verification.
- Review audit trail.
- Rotate affected credentials if needed.
- Notify security and tenant owner.

Owner:

- Security Engineer.

Rollback:

- Revert unauthorized changes via audit before/after data.

Postmortem:

- Attack path, data access, remediation, notification decision.

### 8.8 Transcript/audio data incident

Signal:

- Unauthorized transcript/audio access, object storage anomaly, signed URL leak.

First action:

- Revoke signed URLs and affected access tokens.
- Freeze affected storage prefix if needed.

Mitigation:

- Validate object ACLs.
- Rotate keys.
- Identify accessed objects.
- Notify Legal/Compliance.

Owner:

- Security Engineer + Data Protection Officer.

Rollback:

- Revert storage policy or deployment.

Postmortem:

- Exposure scope, affected tenants/users, retention, notification, controls.

## 9. Postmortem template

Required fields:

- Incident ID.
- Severity.
- Start/end time.
- Detection source.
- Affected tenants/users.
- Customer impact.
- Timeline.
- Root cause.
- What went well.
- What went poorly.
- Corrective actions.
- Owners and deadlines.
- Follow-up verification.

## 10. Observability Done Criteria

- SLOs are defined for web, API, and realtime.
- Metrics/logs/traces cover core learner, enterprise, AI, and content flows.
- Alerts link to runbooks.
- Required runbooks exist for the eight critical incident classes.
- Logs avoid raw sensitive transcript/audio/document/prompt content.
