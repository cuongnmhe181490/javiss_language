# Speaking Realtime API

All speaking routes require authenticated actor context and tenant membership.

Short routes:

- `/v1/speaking/...`

Tenant-path routes:

- `/v1/tenants/:tenantId/speaking/...`

## Create Speaking Session

`POST /v1/speaking/sessions`

Permission: `speaking_session:create`

Request:

```json
{
  "lessonId": "99999999-9999-4999-8999-999999999991",
  "mode": "role_play",
  "targetLanguage": "en",
  "networkProfile": "weak",
  "scenario": {
    "scenario": "Greeting a hotel guest",
    "role": "front desk staff",
    "goal": "Use a polite welcome and one follow-up question.",
    "usefulPhrases": ["Good morning", "Welcome to the hotel"]
  }
}
```

Response:

```json
{
  "data": {
    "session": {
      "id": "session-uuid",
      "status": "connecting",
      "mode": "role_play",
      "targetLanguage": "en",
      "roomName": "tenant-...:speaking-...",
      "sfuProvider": "mock-livekit",
      "sttProvider": "mock-stt",
      "ttsProvider": "mock-tts",
      "llmProvider": "mock-tutor-v1"
    },
    "realtime": {
      "provider": "mock-livekit",
      "roomName": "tenant-...:speaking-...",
      "token": "dev_rt_...",
      "tokenExpiresAt": "2026-04-27T10:10:00.000Z",
      "turnServerPolicy": "managed",
      "qos": {
        "bitratePolicy": "low_adaptive",
        "reconnect": true,
        "textFallbackEnabled": true
      }
    }
  }
}
```

The response includes the raw join token once. The database stores only `tokenHash`.

## Get Session

`GET /v1/speaking/sessions/:sessionId`

Permission: `speaking_session:read_own`

Learners may read only their own session. Tenant admins and scoped staff require `speaking_session:manage`.

## Text Fallback

`POST /v1/speaking/sessions/:sessionId/text-fallback`

Permission: `speaking_session:text_fallback`

Request:

```json
{
  "text": "Good morning. Welcome to the hotel.",
  "language": "en"
}
```

Response:

```json
{
  "data": {
    "fallbackMode": true,
    "learnerSegment": {
      "sequence": 0,
      "speaker": "learner",
      "text": "Good morning. Welcome to the hotel."
    },
    "assistantSegment": {
      "sequence": 1,
      "speaker": "assistant",
      "text": "Text fallback received. Try one shorter sentence, then continue when voice reconnects."
    }
  }
}
```

## Report

`GET /v1/speaking/sessions/:sessionId/report`

Permission: `speaking_report:read`

Current report is a scaffold:

- session status
- duration
- latency
- provider metadata
- transcript segments
- text fallback usage
- next micro-goal
- `scoringStatus=not_implemented`

Pronunciation, fluency, grammar, and vocabulary scoring are intentionally not implemented in PR-006.

## End Session

`POST /v1/speaking/sessions/:sessionId/end`

Permission: `speaking_session:end_own`

Request:

```json
{
  "outcome": "completed",
  "latencyMs": 260
}
```

Response returns the updated session with `status=ended` or `status=failed`.

## Error Examples

Owner mismatch:

```json
{
  "error": {
    "code": "speaking_session.not_owner",
    "message": "Access denied.",
    "details": {
      "reason": "speaking_session_not_owned_by_actor"
    },
    "requestId": "req_123",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```

Closed session fallback:

```json
{
  "error": {
    "code": "speaking_session.closed",
    "message": "Speaking session is already closed.",
    "details": {},
    "requestId": "req_123",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```
