# Beta Limitations

This project is READY-BETA for local demo and staging preparation, not full production launch.

## AI

- AI provider is mock/offline-ready.
- No credentialed real-provider canary has been run.
- Model routing, provider contract, fallback behavior, and eval harness exist, but real provider latency, structured output reliability, safety behavior, and cost behavior are not proven.
- Tenant AI budget and billing ledger are not persisted.
- Eval run history is not persisted.

## Speaking

- Speaking realtime is foundation/scaffold.
- SFU provider is mock.
- STT provider is mock.
- TTS provider is mock.
- Speaking scoring/reporting is scaffolded and not a production pronunciation assessment system.
- Object storage and audio retention are not productionized.

## Auth And Security

- OIDC scaffold exists but has not been piloted with a real IdP in staging.
- Dev-header auth is local-only and blocked in production config.
- Staging TLS, WAF/API gateway, and platform-level secret management are not exercised in this repo.

## Deployment

- Staging deployment plan exists but has not been executed against a real hosting platform.
- Backup and restore process is documented but not platform-tested.
- Central metrics/log pipeline is not wired to an external backend.

## Data And Content

- Content QA is deterministic and useful for gating demo flows, not a full AI quality system.
- Seed/demo data is synthetic and should not be treated as customer-ready content.

## What This Beta Can Safely Demonstrate

- Tenant-scoped API behavior.
- RBAC/ABAC and audit events.
- Learning runtime flows.
- Mock AI tutor with citations and prompt refusal.
- Speaking session lifecycle and fallback/report scaffold.
- Content source/review/publish/sync workflow.
- Release gates: typecheck, lint, tests, integration, build, format, smoke, AI eval.
