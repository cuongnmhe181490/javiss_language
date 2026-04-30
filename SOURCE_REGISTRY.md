# Source Registry

## Purpose

The Source Registry is the license-first catalog for content operations. Content versions must link to tenant-scoped sources so publish workflows can prove lineage and license status.

## Source Fields

- `id`
- `tenantId`
- `sourceName`
- `sourceType`
- `reference`
- `licenseType`
- `allowedUsage`
- `commercialAllowed`
- `attributionRequired`
- `attributionText`
- `expirationDate`
- `dataResidencyConstraint`
- `status`
- `createdBy`
- `reviewedBy`
- `approvedAt`
- `metadata`
- `createdAt`
- `updatedAt`

## Allowed Usage

- `display`
- `retrieval`
- `train`
- `eval`
- `reference`

Current publish requires `display` or `reference`.

## Status Lifecycle

- `draft`: created but not cleared
- `pending_review`: reserved for future source review workflow
- `approved`: can be used for publish if license checks pass
- `blocked`: cannot be used
- `expired`: cannot be used

## Enterprise Rules

- Never publish content from a source that is not approved.
- Never publish from expired sources.
- Never publish commercial content from a source where `commercialAllowed=false`.
- Never store provider keys, auth tokens, passwords, raw transcripts, raw audio, or secrets in metadata.
- Cross-tenant source IDs must not resolve.

## Current API

- `GET /v1/admin/sources`
- `POST /v1/admin/sources`
- `PATCH /v1/admin/sources/:sourceId`
- `POST /v1/admin/sources/:sourceId/approve`
