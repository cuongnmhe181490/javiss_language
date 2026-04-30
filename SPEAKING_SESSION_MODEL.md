# Speaking Session Model

## Entities

## `SpeakingSession`

Tenant-scoped lifecycle record for a learner speaking session.

Key fields:

- `tenantId`
- `userId`
- `lessonId`
- `mode`: `drill`, `role_play`, `pronunciation_lab`
- `status`: `created`, `connecting`, `active`, `ended`, `failed`
- `targetLanguage`: `en`, `zh`, `ja`, `ko`
- `scenario`
- provider names
- QoS metadata
- `startedAt`, `endedAt`, `expiresAt`
- latency and cost estimates

## `SpeakingRealtimeToken`

One-time realtime access token record.

Rules:

- Store `tokenHash`, never raw token.
- Scope by `tenantId`, `sessionId`, and `userId`.
- Expire quickly.
- Add revocation support before production media launch.

## `SpeakingTranscriptSegment`

Tenant-scoped transcript/fallback segment.

Fields:

- `sequence`
- `speaker`: `learner`, `assistant`, `system`
- `text`
- `language`
- `romanization`
- final/partial flag
- confidence and timing placeholders

PR-006 only writes text fallback segments. Realtime STT partial/final segments come later.

## Lifecycle

1. `connecting`: API creates session and returns join token.
2. `active`: future realtime service marks media connected.
3. `ended`: user or service ends successfully.
4. `failed`: service or user reports failure.

## Tenant Isolation

- All tables include `tenantId`.
- Repository methods require `tenantId`.
- API routes require centralized tenant context.
- Session reads require same tenant plus owner match or `speaking_session:manage`.

## QoS Policy

Current metadata:

- adaptive bitrate policy
- reconnect enabled
- text fallback enabled
- max reconnect seconds

Future media service should enforce:

- bitrate fallback
- voice-to-text fallback
- reconnect resume
- session token expiry
- TURN/STUN policy

## Production Gaps

- LiveKit/managed SFU integration.
- TURN credential minting.
- Token signature validation.
- Realtime state transitions.
- STT/TTS streaming.
- Audio object storage and retention policy.
- Pronunciation/fluency scoring.
- Synthetic realtime tests.
