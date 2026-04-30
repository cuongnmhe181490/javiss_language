# Content Studio API

All routes are tenant-scoped and require dev-header/OIDC tenant context.

## Content Items

`GET /v1/admin/content`

Query:

- `type`
- `status`
- `page`
- `pageSize`

`POST /v1/admin/content/items`

Permission: `content:create`

```json
{
  "type": "lesson",
  "title": "Greeting a guest",
  "slug": "greeting-a-guest-draft",
  "language": "en",
  "level": "A1",
  "metadata": {}
}
```

`GET /v1/admin/content/items/:itemId`

Permission: `content:read`

Returns the item and version history.

## Versions

`POST /v1/admin/content/items/:itemId/versions`

Permission: `content:update`

```json
{
  "sourceIds": ["20202020-2020-4202-8202-202020202011"],
  "changeSummary": "Initial draft",
  "body": {
    "objective": "Learner can greet a guest politely."
  }
}
```

`POST /v1/admin/content/items/:itemId/submit-review`

Permission: `content:update`

```json
{
  "versionId": "uuid",
  "comments": "Ready for review."
}
```

`POST /v1/admin/content/items/:itemId/versions/:versionId/approve`

Permission: `content:review`

Approval requires `aiQa.status` to be `passed`.

`POST /v1/admin/content/items/:itemId/versions/:versionId/qa`

Permission: `content:review`

Re-runs deterministic Content QA and stores the result on the version:

```json
{
  "data": {
    "aiQa": {
      "agentId": "content-qa-agent-v1",
      "policyVersion": "content-qa-policy-v1",
      "rubricVersion": "content-rubric-v1",
      "status": "passed",
      "riskLevel": "low",
      "checks": []
    }
  }
}
```

`POST /v1/admin/content/items/:itemId/versions/:versionId/publish`

Permission: `content:publish`

Publish requires QA to pass, then runs the license gate before marking the version and item as published.

`POST /v1/admin/content/items/:itemId/versions/:versionId/sync-learning`

Permission: `content:sync_learning`

Sync is explicit and only supports published lesson content in PR-009.

```json
{
  "lessonId": "99999999-9999-4999-8999-999999999991",
  "publishLesson": true
}
```

Supported `body.lesson` fields are `title`, `description`, `language`, `targetLevel`, `estimatedMinutes`, and `objectives`.

`POST /v1/admin/content/items/:itemId/versions/:versionId/rollback`

Permission: `content:rollback`

Rollback points the item back to a selected version after source validation.

## Review Queue

`GET /v1/admin/review-queue`

Permission: `content:review`

Returns versions in `review` status with their parent item.

## Error Examples

License source not approved:

```json
{
  "error": {
    "code": "content_license.source_not_approved",
    "message": "Source must be approved before publish.",
    "details": {
      "sourceId": "uuid",
      "status": "draft"
    },
    "requestId": "req",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```

QA not passed:

```json
{
  "error": {
    "code": "content_qa.not_passed",
    "message": "Content QA must pass before publish.",
    "details": {
      "aiQa": {
        "status": "failed"
      }
    },
    "requestId": "req",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```

Sensitive metadata:

```json
{
  "error": {
    "code": "content.metadata_sensitive",
    "message": "Metadata contains sensitive keys.",
    "details": {
      "key": "apiToken"
    },
    "requestId": "req",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```
