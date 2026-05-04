# Remote Smoke OIDC Tokens

Do not commit bearer tokens, refresh tokens, client secrets, passwords, or
copied Authorization headers.

## Token Requirements

Each token must be issued by the staging OIDC provider and include:

- `iss` matching `OIDC_ISSUER_URL`
- `aud` matching `OIDC_AUDIENCE`
- `sub` as an internal user UUID
- `tenant_id` as an internal tenant UUID
- `roles` as internal RBAC role names
- valid `exp`

## PowerShell Setup

Set tokens only in the current shell:

```powershell
$env:API_SMOKE_ADMIN_TOKEN="<tenant-admin-token>"
$env:API_SMOKE_AUDITOR_TOKEN="<security-auditor-token>"
$env:API_SMOKE_LEARNER_TOKEN="<learner-token>"
$env:API_SMOKE_CONTENT_EDITOR_TOKEN="<content-editor-token>"
```

Set the remote API smoke target:

```powershell
$env:API_SMOKE_BASE_URL="https://api-staging.example.com"
$env:API_SMOKE_AUTH_MODE="oidc"
$env:API_SMOKE_EXPECT_PERSISTENCE="1"
pnpm api:smoke
```

Optional rate-limit stress after normal smoke passes:

```powershell
$env:API_SMOKE_RATE_LIMIT="1"
pnpm api:smoke
```

Clear tokens from the shell after use:

```powershell
Remove-Item Env:API_SMOKE_ADMIN_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:API_SMOKE_AUDITOR_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:API_SMOKE_LEARNER_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:API_SMOKE_CONTENT_EDITOR_TOKEN -ErrorAction SilentlyContinue
```

## Expected Results

Expected pass:

- public health/live/ready
- readiness with database and Redis ok
- tenant read
- authenticated negative tenant case
- audit list
- learning smoke
- AI mock/orchestration smoke
- speaking scaffold smoke
- content workflow smoke
- local-style tenant isolation negative checks supported by the script

Expected limitation:

- Audit export success with step-up may remain skipped in OIDC mode until a real
  staging step-up flow or persisted step-up fixture exists.

## Troubleshooting

- `AUTH_INVALID_TOKEN`: check issuer, audience, JWKS URL, signature, or token
  expiry.
- `Authentication token claims are invalid`: check `sub`, `tenant_id`, and
  `roles` claim names and values.
- `auth.tenant_mismatch`: token tenant UUID does not match the route/resource
  tenant.
- `auth.missing_permission`: role claim does not include an internal role with
  the required permission.
