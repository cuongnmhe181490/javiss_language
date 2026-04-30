# OIDC Integration

## Auth Modes

- `AUTH_MODE=dev-header`: local development only. Blocked in production.
- `AUTH_MODE=oidc`: validates Bearer JWTs through OIDC/JWKS settings.

## Required OIDC Config

- `OIDC_ISSUER_URL`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URL`
- `OIDC_TENANT_CLAIM`
- `OIDC_ROLES_CLAIM`
- `OIDC_SUB_CLAIM`
- `OIDC_EMAIL_CLAIM`

## Current Validation

`OidcAuthProvider` validates:

- Bearer token format.
- JWKS signature.
- issuer.
- audience.
- expiration.
- configured claim mapping.

Invalid tokens return `AUTH_INVALID_TOKEN`. Expired tokens return `AUTH_EXPIRED_TOKEN`. Raw tokens are never returned in API errors.

## Tenant Mapping

Default claim mapping:

| Claim       | Internal field          |
| ----------- | ----------------------- |
| `sub`       | `actor.userId`          |
| `tenant_id` | `actor.tenantId`        |
| `roles`     | `actor.roles`           |
| `email`     | future lookup / display |

The current actor schema expects UUID-style internal user IDs. Real enterprise rollout should map external `sub` through `AuthIdentity` to internal `User.id`.

## Local Dev Limitation

Local development can still use dev headers. OIDC tests use mocked JWKS and signed test tokens, not a live IdP.

## Production Checklist

- Validate issuer, audience, signature, expiry, and tenant claims.
- Cache JWKS with sane timeout.
- Handle key rotation.
- Map provider `sub` to `AuthIdentity`.
- Enforce tenant membership after token validation.
- Support session revocation and device logout.
- Never log raw token or claims containing sensitive data.
