# PR-006 Speaking Realtime Foundation

## Scope

PR-006 adds the first backend foundation for speaking sessions. It prepares the SaaS core for WebRTC/SFU integration without implementing real media transport yet.

Implemented:

- Tenant-scoped speaking session persistence.
- One-time realtime join token response with only token hash persisted.
- Speaking transcript segment persistence for text fallback.
- Session lifecycle endpoints for create, read, text fallback, report scaffold, and end.
- QoS scaffold for adaptive bitrate, reconnect, and text fallback.
- RBAC/ABAC permissions for learner-owned sessions and tenant management.
- Audit events for session creation, end, text fallback, and denied create attempts.
- Smoke and API tests for tenant isolation, ownership, token hygiene, and fallback flow.

## Not In Scope

- Real WebRTC/SFU room creation.
- LiveKit server SDK integration.
- STUN/TURN credential minting.
- Streaming STT/TTS.
- Pronunciation scoring.
- Voice activity detection.
- Realtime AI turn-taking.
- Browser speaking UI.

## Database Changes

Migration:

- `prisma/migrations/20260427233000_add_speaking_realtime_foundation/migration.sql`

Models:

- `SpeakingSession`
- `SpeakingRealtimeToken`
- `SpeakingTranscriptSegment`

All models are tenant-scoped and indexed by tenant.

## API Changes

Learner endpoints:

- `POST /v1/speaking/sessions`
- `GET /v1/speaking/sessions/:sessionId`
- `POST /v1/speaking/sessions/:sessionId/text-fallback`
- `GET /v1/speaking/sessions/:sessionId/report`
- `POST /v1/speaking/sessions/:sessionId/end`

Short `/v1/speaking/...` routes resolve tenant from actor context. Tenant-path equivalents under `/v1/tenants/:tenantId/speaking/...` also pass through centralized tenant context.

## Permissions

New permissions:

- `speaking_session:read_own`
- `speaking_session:end_own`
- `speaking_session:text_fallback`
- `speaking_session:manage`

Existing permissions used:

- `speaking_session:create`
- `speaking_report:read`

Role behavior:

- `learner`: create/read/end own sessions, use text fallback, read own report.
- `tenant_admin`: manage speaking sessions inside tenant.
- `lnd_manager` and `teacher`: manage/report surface for future team coaching workflows.
- `security_auditor`: no speaking session control.

## Security Notes

- Raw realtime tokens are returned once and not stored.
- `SpeakingRealtimeToken.tokenHash` is not returned to clients.
- Session reads require same tenant plus owner or `speaking_session:manage`.
- Transcript text fallback is tenant-scoped.
- No raw audio is stored in PR-006.
- Provider fields are mock names only: `mock-livekit`, `mock-stt`, `mock-tts`, `mock-tutor-v1`.

## Tests

Added/updated:

- `apps/api/src/speaking.spec.ts`
- `apps/api/src/prisma-repositories.integration.spec.ts`
- `packages/authz/src/index.spec.ts`
- `apps/api/scripts/smoke-api.mjs`

Covered:

- Learner creates speaking session and receives one-time token.
- Token hash does not leak.
- Learner reads own session.
- Text fallback creates learner and assistant transcript segments.
- Report returns scaffold metrics.
- Session end updates status and latency.
- Security auditor create is denied and audited.
- Another learner cannot read another user's session.
- Cross-tenant session route is blocked.
- Prisma integration persists speaking session, token hash, and transcript when `TEST_DATABASE_URL` is available.

## Known Limitations

- Realtime provider is mock/scaffold only.
- Report does not include pronunciation, fluency, or grammar scoring.
- Token validation/revocation endpoint is not exposed.
- QoS values are policy metadata only, not enforced by a media service.
- No object storage for audio.
- No synthetic media test yet.

## Next PR Recommendation

Recommended next PR: AI Orchestration Provider Pilot.

Rationale: PR-005 created chat scaffolding and PR-006 created speaking session scaffolding. The next useful move is a provider-neutral AI orchestration layer with model routing, output schema validation, eval gates, and cost/latency tracking before real speaking intelligence is connected.
