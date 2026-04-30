# AI Output Schema

## Tutor Reply Schema

Current schema version: `tutor_reply_v1`

Provider `output` payload:

```json
{
  "content": "Short tutor reply",
  "citations": [
    {
      "sourceType": "lesson",
      "sourceId": "uuid",
      "label": "Lesson title"
    }
  ],
  "safetyFlags": {
    "policyVersion": "ai-safety-v1"
  }
}
```

## Validation Rules

- `content` must be non-empty and under API message limits.
- `citations` must use known source types: `course`, `lesson`, `lesson_block`.
- `sourceId` must be a UUID.
- Non-refusal tutor replies with lesson context must cite the active lesson.
- `inputTokens`, `outputTokens`, and `costEstimate` must be non-negative.
- Refusals must set `safetyFlags.refused = true` and a reason.
- Extra fields are rejected. Schema error details do not echo secret-like or malicious field names back to the user response.

## Additional PR-007 Schemas

`content_qa_v1`

- `agentId`
- `policyVersion`
- `rubricVersion`
- `status`
- `riskLevel`
- `checks[]`
- `findings[]`

`speaking_feedback_v1`

- `feedbackItems[]`
- `nextMicroGoal`
- `scoringStatus`

`safe_fallback_v1`

- `content`
- `citations[]`
- `safetyFlags.refused=true`
- `safetyFlags.reason`

## Response Shaping

The API returns persisted assistant messages. It does not return stored prompt text or provider hidden/system prompts.

## Current Storage

PR-007 stores orchestration metadata in `AIMessage.safetyFlags`:

- `outputSchemaVersion`
- `routingDecision`
- `evalGate`
- `latencyMs`
- `schemaValidationResult`
- `fallbackReason`
- `requestId`
- `traceId`

A future migration can promote these fields to first-class columns if analytics needs indexed queries.
