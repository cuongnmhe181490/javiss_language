# PR-005 AI Tutor Chat Foundation

## Scope

PR-005 adds the first tenant-scoped AI tutor chat foundation on top of PR-004 learning content.

Implemented:

- Tenant-scoped `AIAgent`, `PromptVersion`, `AIConversation`, and `AIMessage` schema.
- Prisma migration `20260427223000_add_ai_tutor_chat_foundation`.
- Seeded Tutor Coach agents for two tenants and one approved prompt version for the sample tenant.
- Provider-neutral `AiModelProvider` interface with deterministic `MockTutorProvider`.
- Learner API for listing tutor agents, creating conversations, reading own conversation, and sending messages.
- Lesson-grounded mock responses with citations to lessons and lesson blocks.
- Prompt-injection refusal scaffold.
- Audit events for conversation creation, message creation, refused message, and denied chat attempts.
- RBAC/ABAC permissions for AI tutor chat, conversation ownership, prompt governance, and agent reads.
- Unit/API tests and optional Prisma integration coverage.

## Not In Scope

- Real LLM provider credentials or external API calls.
- Streaming chat responses.
- RAG over tenant documents.
- Tenant Knowledge Agent.
- Pronunciation coaching, realtime speaking, STT/TTS, or WebRTC.
- Prompt authoring/admin UI.
- Full AI eval runner.

## API Changes

Learner routes:

- `GET /v1/ai/agents`
- `POST /v1/ai/conversations`
- `GET /v1/ai/conversations/:conversationId`
- `POST /v1/ai/conversations/:conversationId/messages`

Short `/v1/ai/...` routes resolve tenant from the authenticated actor. Tenant-path equivalents under `/v1/tenants/:tenantId/ai/...` also work through the central tenant resolver.

## Permissions

New permissions:

- `ai_tutor:chat`
- `ai_conversation:read_own`
- `ai_conversation:manage`
- `prompt:read`
- `prompt:write`
- `prompt:approve`

Role behavior:

- `learner`: can list agents, create own tutor conversations, read own conversations, and send messages.
- `tenant_admin`: can chat, manage conversations, and manage/approve prompts.
- `lnd_manager` and `teacher`: can manage conversations for team review workflows later.
- `content_editor` and `linguist_reviewer`: can read prompts, not approve.
- `security_auditor`: cannot chat or edit AI content.

## Safety And Trust Controls

- Prompt text is stored in `PromptVersion` but never returned by learner endpoints.
- Mock provider refuses common prompt-injection patterns.
- Agent lookup is tenant-scoped.
- Conversation reads require owner match or `ai_conversation:manage`.
- Conversation context validates published lesson/course scope.
- Assistant messages include provider, model, prompt version, policy version, tokens, cost estimate, citations, and safety flags.
- No customer data is sent to external providers in this PR.

## Tests

Added/updated coverage:

- `apps/api/src/ai.spec.ts`
- `apps/api/src/prisma-repositories.integration.spec.ts`
- `packages/authz/src/index.spec.ts`
- `apps/api/scripts/smoke-api.mjs`

Covered flows:

- Learner lists same-tenant active agents.
- Prompt text is not exposed.
- Conversation creation with lesson grounding.
- Message creation persists user and assistant messages.
- Assistant response includes citations.
- Prompt injection is refused.
- Learner cannot read another user's conversation.
- Cross-tenant agent and course context are blocked.
- Security auditor is denied chat and the denial is audited.
- Prisma integration persists AI conversations/messages when `TEST_DATABASE_URL` is available.

## Known Limitations

- Provider is deterministic mock only.
- Prompt eval status is stored but not evaluated by a runner yet.
- Conversation list endpoint is not exposed yet.
- AI cost tracking is per message scaffold only.
- No streaming token delivery.
- No tool execution layer yet.
- No admin prompt/version lifecycle API yet.

## Next PR Readiness

PR-005 keeps the foundation ready for either:

- PR-006 Speaking Realtime Foundation, if the next priority is speaking outcomes.
- PR-006B AI Orchestration Provider Pilot, if the next priority is replacing mock chat with real provider routing and eval gates.

Recommendation: move next to Speaking Realtime Foundation because the product priority puts speaking outcome first, and the AI tutor foundation now has enough structure to connect later.
