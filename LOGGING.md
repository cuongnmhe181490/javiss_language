# Structured Logging

## Format

API logs are JSON lines with:

- `timestamp`
- `level`
- `event`
- `requestId`
- `tenantId`
- `actorId`
- `method`
- `route`
- `status`
- `durationMs`

## Redaction

The logger redacts keys matching:

- authorization.
- cookie.
- set-cookie.
- token.
- secret.
- password.
- raw audio.
- raw transcript.
- API key.

Raw request bodies are not logged by default.

## Example

```json
{
  "event": "api.request",
  "level": "info",
  "requestId": "req_123",
  "tenantId": "11111111-1111-4111-8111-111111111111",
  "method": "GET",
  "route": "/v1/tenants/:tenantId",
  "status": 200,
  "durationMs": 6
}
```

## What Not To Log

- Authorization headers.
- Cookies.
- Passwords or reset tokens.
- Provider API keys.
- Raw audio.
- Raw transcripts.
- Full enterprise documents.
