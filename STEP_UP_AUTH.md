# Step-Up Authentication

## Sensitive Actions

Step-up is required for:

- `audit:export`
- `data:export`
- `tenant_policy:update`
- `sso_config:update`
- `scim_config:update`
- `transcript:read_sensitive`
- `audio:download`

## TTL

`AUDIT_EXPORT_STEP_UP_TTL_SECONDS` controls freshness. Default: 600 seconds.

## Current Implementation

Development supports:

- `x-dev-mfa-verified-at` header.
- persisted `StepUpSession` repository path.

Audit export checks step-up before queuing export. Missing or expired step-up is denied and audited when an actor exists.

## Production MFA Path

Production should:

- create `StepUpSession` after IdP/MFA provider verification.
- never log raw MFA tokens.
- expire sessions quickly.
- audit success and denied sensitive actions.
- require step-up for export, SSO changes, policy changes, transcript/audio sensitive reads.
