# PR-008 Content Studio and Source Registry Foundation

## Scope

PR-008 adds the first backend foundation for enterprise content operations:

- tenant-scoped Source Registry
- tenant-scoped Content Studio item/version workflow
- review queue
- license validation before publish
- audit events for content/source actions
- Prisma persistence and seed data

This PR does not build a UI, does not implement deep AI drafting, and does not sync content versions into live Course/Lesson records.

## Database Changes

Migration: `20260428003000_add_content_studio_foundation`

New models:

- `ContentSource`
- `ContentItem`
- `ContentVersion`
- `ContentReviewEvent`

All models are tenant-scoped and indexed by `tenantId`. Content sources are unique by `tenantId + reference`. Content versions are unique by `tenantId + contentItemId + version`.

## API Changes

New tenant routes:

- `GET /v1/admin/sources`
- `POST /v1/admin/sources`
- `PATCH /v1/admin/sources/:sourceId`
- `POST /v1/admin/sources/:sourceId/approve`
- `GET /v1/admin/content`
- `GET /v1/admin/content/items/:itemId`
- `POST /v1/admin/content/items`
- `POST /v1/admin/content/items/:itemId/versions`
- `POST /v1/admin/content/items/:itemId/submit-review`
- `POST /v1/admin/content/items/:itemId/versions/:versionId/approve`
- `POST /v1/admin/content/items/:itemId/versions/:versionId/publish`
- `POST /v1/admin/content/items/:itemId/versions/:versionId/rollback`
- `GET /v1/admin/review-queue`

## Permissions

- `source:read`: list/read source registry
- `source:write`: create/update source registry records
- `source:approve`: approve sources for publish workflows
- `content:read`: list/read content items
- `content:create`: create content items
- `content:update`: create versions and submit review
- `content:review`: approve versions and read review queue
- `content:publish`: publish approved/review versions after license validation
- `content:rollback`: restore a previous version

## Workflow

1. Content editor creates a source.
2. Tenant admin approves the source.
3. Content editor creates a content item.
4. Content editor creates a version with source lineage.
5. Content editor submits the version for review.
6. Reviewer/tenant admin approves the version.
7. Tenant admin publishes the version.
8. Rollback can repoint the item to a previous version.

## License Gate

Publish requires every linked source to be:

- tenant-scoped
- approved
- commercially allowed
- unexpired
- allowed for `display` or `reference`

## Security Notes

- Routes are tenant-guarded and RBAC/ABAC protected.
- Learners cannot access admin content operations.
- Cross-tenant source IDs do not resolve.
- Metadata rejects sensitive keys such as token, secret, password, API key, raw audio, and raw transcript.
- Audit events are written for create/update/approve/review/publish/rollback and denied sensitive actions.

## Known Limitations

- AI QA is a deterministic scaffold, not a full Content QA Agent.
- Content Studio versions do not yet publish into Course/Lesson runtime tables.
- Review assignment/ownership is not modeled yet.
- Append-only/tamper-evident content review history is not implemented.

## Next Readiness

This foundation is ready for a future Content QA Agent, source ingestion quarantine, and Course/Lesson publish sync.
