# Learning API

All endpoints require authentication and tenant context. Short `/v1/...` routes resolve tenant from the actor. `/v1/tenants/:tenantId/...` remains supported for compatibility.

## Learner Endpoints

### GET `/v1/courses`

Permissions:

- `course:list`

Query:

- `language`: `en | zh | ja | ko`
- `level`
- `trackType`: `general | business | exam | travel | custom`
- `status`
- `page`
- `pageSize`

Learners are forced to `status=published` even if another status is requested.

Example:

```json
{
  "data": [
    {
      "id": "44444444-4444-4444-8444-444444444444",
      "language": "en",
      "targetLevel": "A1",
      "status": "published"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### GET `/v1/courses/:courseId`

Permissions:

- `course:read`

Returns course detail with modules and lesson summaries.

### GET `/v1/lessons/:lessonId`

Permissions:

- `lesson:read`

Learner responses include blocks and exercises but omit `answerKey`.

### POST `/v1/lessons/:lessonId/start`

Permissions:

- `lesson:start`

Creates or updates own lesson progress to `in_progress`.

### POST `/v1/lessons/:lessonId/complete`

Permissions:

- `lesson:complete`

Request:

```json
{
  "score": 88
}
```

Updates lesson and course progress.

### GET `/v1/progress/me`

Permissions:

- `progress:read_own`

Returns daily goal placeholder, stats, continue learning recommendation, assignments, and recent activity.

### GET `/v1/assignments/me`

Permissions:

- `assignment:read`

Returns active user/group assignments for the current actor.

## Admin / Content Endpoints

### POST `/v1/admin/courses`

Permissions:

- `course:create`

Request:

```json
{
  "language": "en",
  "trackType": "business",
  "targetLevel": "A1",
  "title": "English A1 Workplace Starter",
  "slug": "english-a1-workplace-starter",
  "description": "Practical workplace English."
}
```

### PATCH `/v1/admin/courses/:courseId`

Permissions:

- `course:update`

Content editors cannot directly update published courses unless they also have publish permission.

### POST `/v1/admin/courses/:courseId/publish`

Permissions:

- `course:publish`

Sets `status=published`, `publishedAt`, and increments `version`.

### POST `/v1/admin/modules`

Permissions:

- `course:update`

### POST `/v1/admin/lessons`

Permissions:

- `lesson:create`

### PATCH `/v1/admin/lessons/:lessonId`

Permissions:

- `lesson:update`

### POST `/v1/admin/lessons/:lessonId/publish`

Permissions:

- `lesson:publish`

### POST `/v1/admin/lessons/:lessonId/blocks`

Permissions:

- `lesson:update`

### POST `/v1/admin/assignments`

Permissions:

- `assignment:create`

Course must be published before assignment.

## Error Format

```json
{
  "error": {
    "code": "request.validation_failed",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        {
          "path": "slug",
          "message": "Use lowercase letters, numbers, and hyphens."
        }
      ]
    },
    "requestId": "req_123",
    "timestamp": "2026-04-27T10:00:00.000Z"
  }
}
```
