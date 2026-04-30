# Audit Logging

## PR-004 Learning Events

Success events:

- `course:create`
- `course:update`
- `course:publish`
- `lesson:create`
- `lesson:update`
- `lesson:publish`
- `lesson:start`
- `lesson:complete`
- `assignment:create`

Denied events:

- Admin/content/progress learning actions set `auditDenied=true` in the authorization helper.

Metadata rules:

- Do not store exercise `answerKey`.
- Do not store raw transcript/audio.
- Do not store token, cookie, password, or secret values.
- Existing audit metadata sanitizer remains in `@polyglot/tenant-core`.

## PR-005 AI Tutor Events

Success events:

- `ai_conversation:create`
- `ai_message:create`
- `ai_message:refused`

Denied events:

- `ai_tutor:chat` when an actor without chat permission attempts to create a conversation or send a message.

Metadata rules:

- Store agent ID, lesson ID, conversation ID, provider, model ID, and refusal boolean only when useful.
- Do not store `PromptVersion.promptText`.
- Do not store raw provider credentials, bearer tokens, cookies, or tenant secrets.
- Do not store raw audio or raw transcript data in AI chat audit metadata.

## PR-006 Speaking Events

Success events:

- `speaking_session:create`
- `speaking_session:end`
- `speaking_text_fallback:create`

Denied events:

- `speaking_session:create` when an actor without speaking creation permission attempts to create a session.

Metadata rules:

- Store session ID, lesson ID, mode, provider, status, and latency only when useful.
- Do not store raw realtime tokens or token hashes in audit metadata.
- Do not store raw audio.
- Text fallback transcript is stored in `SpeakingTranscriptSegment`; audit metadata should only reference the segment/session ID.

## Event Schema

Minimum fields:

- `id`
- `tenantId`
- `actorId`
- `actorRole`
- `action`
- `resourceType`
- `resourceId`
- `outcome`: `success`, `denied`, or `failure`
- `ip`
- `userAgent`
- `requestId`
- `metadata`
- `createdAt`

## Current Implementation

- Schema lives in `packages/contracts`.
- Event factory and metadata sanitization live in `packages/tenant-core`.
- API uses Prisma-backed audit persistence when `DATABASE_URL` is configured.
- In-memory audit storage remains for unit tests/local fallback only.
- Audit list supports pagination and filters for `actorId`, `action`, `outcome`, `from`, and `to`.
- Audit export supports `format=json` and `format=csv` as scaffold queue responses.
- Audit export requires `audit:export` plus fresh step-up MFA.
- Denied audit export attempts are audited when an actor exists.
- Successful audit export attempts are audited.
- PR-007 AI tutor message events include sanitized provider/model/cost/latency/schema/routing/refusal metadata.
- PR-008 content/source events record source create/update/approve and content item/version review/publish/rollback actions.
- PR-009 adds content QA and runtime sync audit coverage through `content:ai_qa` and `content:sync_learning`.

## Sanitization Rules

Audit metadata drops keys matching sensitive patterns:

- authorization.
- cookie.
- password.
- secret.
- token.
- API key/private key.
- raw audio.
- raw transcript.

Do not log provider keys, session tokens, reset tokens, raw audio, raw transcripts, or full sensitive documents.

## Production Requirements

- Store events in append-only durable storage.
- Restrict update/delete paths.
- Sign or hash event chains if tamper evidence is required.
- Export via background job, not inline response.
- Export delivery should use short-lived signed URL or secure admin download.
- Retention must follow tenant policy and legal hold rules.
- All admin policy changes, SSO changes, exports, sensitive transcript/audio access, and tenant document operations must be audited.

## Current API Endpoints

- `GET /v1/tenants/:tenantId/audit-events`
- `POST /v1/tenants/:tenantId/audit-events/export?format=json`
- `POST /v1/tenants/:tenantId/audit-events/export?format=csv`

## Done Criteria For Production Upgrade

- Denied, success, and failure outcomes are recorded for sensitive actions.
- Audit storage is durable and append-only.
- Metadata redaction is tested.
- Pagination and filters are covered by integration tests.
- Export is step-up protected and itself audited.
- Cross-tenant audit reads are denied.
