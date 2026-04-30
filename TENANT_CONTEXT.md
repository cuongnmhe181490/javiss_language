# Tenant Context

## Current Dev-Header Flow

`apps/api` currently resolves actor context through either `DevHeaderAuthProvider` or `OidcAuthProvider`, selected by `AUTH_MODE`.

Development headers:

- `x-dev-user-id`
- `x-dev-tenant-id`
- `x-dev-roles`
- `x-dev-groups`
- `x-dev-mfa-verified-at`

This is local scaffolding only. `AUTH_MODE=dev-header` is blocked when `NODE_ENV=production`.

## Production OIDC Claim Mapping

Production uses OIDC session/token validation:

| OIDC claim           | Internal field        |
| -------------------- | --------------------- |
| `sub`                | `actor.userId`        |
| `tenant_id` or org   | `actor.tenantId`      |
| `roles` or groups    | `actor.roles`         |
| `groups`             | `actor.groupIds`      |
| MFA/ACR/AMR evidence | `actor.mfaVerifiedAt` |

The current OIDC provider validates issuer, audience, expiry, signature, JWKS, and claim mapping. Tenant membership is enforced by the route/service layer after actor mapping. Session revocation and nonce/session binding remain production integration work.

## Tenant Resolution Strategy

- Public allowlist: `/health`, `/health/live`, `/health/ready`.
- Tenant routes must match `/v1/tenants/:tenantId/...`.
- `resolveRequestScope` is the single tenant route parser.
- Missing tenant ID returns `tenant_context.missing`.
- Invalid tenant ID returns `tenant_context.invalid`.
- Unknown non-public routes return `route.not_found`.

## Cross-Tenant Protection

- `@polyglot/authz` denies cross-tenant access by default.
- Actor tenant must match requested tenant and resource tenant.
- Super admin cross-tenant behavior requires explicit `allowCrossTenant` and justification in policy, but no API break-glass route exists yet.
- Prisma repositories require `tenantId` for tenant-owned reads when `DATABASE_URL` is configured.

## Request Lifecycle

1. API validates request size.
2. Auth provider creates actor context.
3. Tenant context resolver classifies route.
4. Public health routes bypass tenant requirement by explicit allowlist.
5. Tenant routes apply rate limit, authz, and route handler.
6. Sensitive actions append audit events for success/denied outcomes.

## Test Strategy

Required tests:

- Tenant A cannot read Tenant B.
- Actor missing tenant membership is blocked.
- Missing tenant route context is blocked.
- Public health routes do not require tenant context.
- Invalid tenant ID returns field-level validation details.
- Future DB tests must prove tenant filters are mandatory in repository methods.
