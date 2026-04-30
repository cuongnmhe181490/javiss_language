# Content QA Agent

## Purpose

The Content QA Agent is the tenant-scoped quality gate for Content Studio versions before they can be approved or published.

PR-009 implements it as deterministic backend logic. It is intentionally not an external LLM call yet.

## Agent Metadata

- `agentId`: `content-qa-agent-v1`
- `policyVersion`: `content-qa-policy-v1`
- `rubricVersion`: `content-rubric-v1`
- Output storage: `ContentVersion.aiQa`

## Current Checks

| Check             | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `content_shape`   | Body must not be empty.                   |
| `lineage_present` | Version must reference source IDs.        |
| `source_status`   | Referenced sources must be approved.      |
| `level_metadata`  | Lesson content must carry level metadata. |
| `policy_lint`     | Known prompt-injection phrases fail QA.   |

## Output Shape

```json
{
  "agentId": "content-qa-agent-v1",
  "policyVersion": "content-qa-policy-v1",
  "rubricVersion": "content-rubric-v1",
  "status": "passed",
  "riskLevel": "low",
  "checks": [
    {
      "name": "content_shape",
      "status": "passed"
    }
  ],
  "findings": []
}
```

## Workflow

1. Author creates a content item and version.
2. Author submits the version for review.
3. Backend runs Content QA and stores `aiQa`.
4. Reviewer can run QA again with `POST /qa`.
5. Approve and publish are blocked unless QA passed.
6. Tenant admin can sync a published lesson version into runtime learning content.

## Guardrails

- The agent cannot publish content.
- The agent cannot sync content to learning runtime.
- The agent does not call tools outside deterministic source/content checks.
- Prompt text, source secrets, raw audio, and raw transcripts must not be stored in QA metadata.

## Remaining Work

- External LLM/content QA provider with eval gating.
- Citation-level validation against source passages.
- CEFR/JLPT/HSK/TOPIK rubric-specific checks.
- Tamper-evident QA run history.
- Human reviewer assignment and signoff policy.
