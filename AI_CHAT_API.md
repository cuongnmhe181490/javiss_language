# AI Chat API

All AI chat routes require authenticated actor context and tenant membership.

Short routes resolve tenant from the actor:

- `/v1/ai/...`

Tenant-path routes are also supported:

- `/v1/tenants/:tenantId/ai/...`

## List Tutor Agents

`GET /v1/ai/agents`

Permission: `agent:read`

Response:

```json
{
  "data": [
    {
      "id": "17171717-1717-4171-8171-171717171711",
      "tenantId": "11111111-1111-4111-8111-111111111111",
      "name": "Polyglot Tutor Coach",
      "scope": "tutor_coach",
      "allowedTools": ["lesson_lookup", "hint_generator", "rubric_scorer"],
      "promptVersion": "tutor-coach-v1",
      "policyVersion": "ai-safety-v1",
      "status": "active"
    }
  ]
}
```

Prompt text is not returned.

## Create Conversation

`POST /v1/ai/conversations`

Permission: `ai_tutor:chat`

Request:

```json
{
  "agentId": "17171717-1717-4171-8171-171717171711",
  "lessonId": "99999999-9999-4999-8999-999999999991",
  "title": "Practice greeting"
}
```

Rules:

- Agent must exist in the current tenant and be active.
- Agent scope must be `tutor_coach`.
- Lesson context must be published.
- Course context, if provided, must be published and match the lesson.

Response:

```json
{
  "data": {
    "id": "conversation-uuid",
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "userId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "agentId": "17171717-1717-4171-8171-171717171711",
    "lessonId": "99999999-9999-4999-8999-999999999991",
    "courseId": "44444444-4444-4444-8444-444444444444",
    "title": "Practice greeting",
    "status": "active"
  }
}
```

## Get Conversation

`GET /v1/ai/conversations/:conversationId`

Permission: `ai_conversation:read_own`

Learners may read only their own conversations. Admin/team review workflows require `ai_conversation:manage`.

Response includes the agent and persisted messages. It does not include prompt text.

## Send Message

`POST /v1/ai/conversations/:conversationId/messages`

Permission: `ai_tutor:chat`

Request:

```json
{
  "content": "Can you give me a hint for this lesson?"
}
```

Response:

```json
{
  "data": {
    "userMessage": {
      "role": "user",
      "content": "Can you give me a hint for this lesson?"
    },
    "assistantMessage": {
      "role": "assistant",
      "content": "Let's focus on Greeting a guest...",
      "citations": [
        {
          "sourceType": "lesson",
          "sourceId": "99999999-9999-4999-8999-999999999991",
          "label": "Greeting a guest"
        }
      ],
      "safetyFlags": {
        "policyVersion": "ai-safety-v1"
      },
      "provider": "mock",
      "modelId": "mock-tutor-v1",
      "promptVersion": "tutor-coach-v1",
      "policyVersion": "ai-safety-v1",
      "costEstimate": 0
    }
  }
}
```

## Error Examples

Cross-tenant agent lookup:

```json
{
  "error": {
    "code": "ai_agent.not_found",
    "message": "AI agent not found.",
    "details": {},
    "requestId": "req_123",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```

Conversation ownership denial:

```json
{
  "error": {
    "code": "ai_conversation.not_owner",
    "message": "Access denied.",
    "details": {
      "reason": "conversation_not_owned_by_actor"
    },
    "requestId": "req_123",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```

## Security Notes

- Do not expose `PromptVersion.promptText` in learner APIs.
- Do not send raw tokens or secrets in messages or audit metadata.
- Do not add real provider keys to `.env.example`.
- Validate output schema before turning on a real provider.
