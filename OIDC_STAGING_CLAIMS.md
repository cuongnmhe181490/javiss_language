# OIDC Staging Claims

No token values belong in this file.

## Current Code Mapping

The API uses `OidcAuthProvider` to verify JWTs with JWKS, issuer, and audience.
After verification, `mapOidcClaimsToActor` maps claims directly into
`actorSchema`.

There is no slug-to-tenant lookup in the auth layer. The staging token tenant
claim must therefore be the internal tenant UUID unless code is changed in a
future PR.

## Claim Matrix

| Required claim | Example value                          | Maps to                 | Validation rule                                               | Failure behavior                  |
| -------------- | -------------------------------------- | ----------------------- | ------------------------------------------------------------- | --------------------------------- |
| `iss`          | `https://idp.example.com/`             | `OIDC_ISSUER_URL`       | JWT issuer must exactly match config.                         | `401 AUTH_INVALID_TOKEN`          |
| `aud`          | `polyglot-api-staging`                 | `OIDC_AUDIENCE`         | JWT audience must match config.                               | `401 AUTH_INVALID_TOKEN`          |
| `sub`          | `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb` | `actor.userId`          | Must be a string and valid UUID.                              | `401 AUTH_INVALID_TOKEN`          |
| `tenant_id`    | `11111111-1111-4111-8111-111111111111` | `actor.tenantId`        | Must be a string and valid UUID.                              | `401 AUTH_INVALID_TOKEN`          |
| `roles`        | `["tenant_admin"]`                     | `actor.roles`           | Must be an array or comma-separated string of internal roles. | `401 AUTH_INVALID_TOKEN`          |
| `email`        | `tenant.admin@example.test`            | Currently informational | Optional in current request actor mapping.                    | No direct auth failure if absent. |
| `exp`          | Provider-generated timestamp           | Token lifetime          | Must be unexpired.                                            | `401 AUTH_EXPIRED_TOKEN`          |

## Supported Role Values

Role claims must use internal role names:

- `super_admin`
- `tenant_admin`
- `lnd_manager`
- `content_editor`
- `linguist_reviewer`
- `teacher`
- `learner`
- `support`
- `security_auditor`
- `data_protection_officer`

## Tenant Mapping

Seeded staging/demo tenants:

| Tenant | Required token `tenant_id`             | Slug                         |
| ------ | -------------------------------------- | ---------------------------- |
| Alpha  | `11111111-1111-4111-8111-111111111111` | `javiss-global-hospitality`  |
| Beta   | `22222222-2222-4222-8222-222222222222` | `kansai-retail-language-lab` |

Use the UUID in tokens. The slug is useful for IdP organization naming but is
not currently accepted by the API as the tenant claim.

## Provider Setup Notes

- Configure a staging API audience such as `polyglot-api-staging`.
- Configure custom claims for `tenant_id` and `roles`.
- Keep role names identical to internal RBAC names.
- Keep token TTL short enough for staging safety but long enough for smoke
  execution.
- Do not put secrets, client secrets, or tokens in repository files.
