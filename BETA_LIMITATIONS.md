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

## Web Learning Surface

- `/dashboard` uses local demo learning data.
- Login and register pages are beta-safe placeholders, not real auth flows.
- Speaking demo remains mock-only and does not request microphone access.
- Public learning pages are SEO/product surfaces, not deep course delivery.
- The web app does not call the API until backend staging has a public URL and
  OIDC is configured.
- PR-016 improves accessibility, tap targets, landmarks, and beta copy only.
  It does not add production auth, real learner data, API calls, or speaking
  provider integration.
- PR-016 is deployed to the web production alias and passed route, metadata,
  security header, Playwright, and Lighthouse retests. This does not change the
  backend/API/provider limitations above.

## What This Beta Can Safely Demonstrate

- Tenant-scoped API behavior.
- RBAC/ABAC and audit events.
- Learning runtime flows.
- Mock AI tutor with citations and prompt refusal.
- Speaking session lifecycle and fallback/report scaffold.
- Content source/review/publish/sync workflow.
- Release gates: typecheck, lint, tests, integration, build, format, smoke, AI eval.
