# Web/API Integration Readiness

## Current State

Web production is deployed at:

- `https://web-delta-azure-40.vercel.app`

The current web app is a marketing/beta placeholder surface. Login, registration, and speaking demo routes are beta placeholders and do not call the backend API.

## API URL Configuration

No `NEXT_PUBLIC_API_BASE_URL` or equivalent API base URL is currently wired in `apps/web`.

PR-013 status: no backend staging API URL exists yet. Do not wire the production
web app to an API origin until the API has a managed Postgres URL, managed Redis
URL, OIDC configuration, and passing remote smoke results.

When API staging is available, add a public web env such as:

```text
NEXT_PUBLIC_API_BASE_URL=https://api-staging.example.com
```

Do not hard-code the API URL in React components.

## CORS Requirement

API staging must include the web production origin in:

```text
CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app
```

If a separate staging web deployment is used, include that origin as well.

PR-013 CORS target:

- Required current web origin: `https://web-delta-azure-40.vercel.app`
- Backend env: `CORS_ALLOWED_ORIGINS=https://web-delta-azure-40.vercel.app`
- Do not use wildcard CORS for authenticated staging.

## Future API Consumers

Likely future web-to-API integrations:

- `/login`: OIDC redirect/start flow after auth is implemented.
- `/register`: tenant pilot request or invite flow.
- `/demo-speaking`: speaking session creation or demo token flow if it becomes interactive.
- authenticated course/progress surfaces after product UI exists.

## Readiness Verdict

Ready for manual backend provisioning. Do not connect UI to API until:

- staging API URL exists
- OIDC flow is selected
- CORS includes web origins
- browser smoke tests cover API error states
- no backend staging secrets are exposed to the client
