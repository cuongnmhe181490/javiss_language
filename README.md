# Polyglot AI Academy

Polyglot AI Academy is a TypeScript monorepo for an AI language-learning platform covering English, Chinese, Japanese, and Korean.

## Current milestone

PR-003 foundation is focused on:

- pnpm workspace setup.
- Next.js App Router web app.
- Tailwind CSS and shadcn/ui.
- Design tokens and shared contracts packages.
- Tenant-aware API scaffold.
- PostgreSQL/Prisma persistence foundation.
- Redis-backed rate-limit implementation.
- OIDC/JWKS validation scaffold.
- RBAC/ABAC authorization checks.
- Audit event foundation.
- Course, lesson, progress, and assignment learning core.
- Tenant-scoped AI tutor chat foundation with mock provider, prompt versioning, citations, and safety scaffold.
- Speaking realtime foundation with session lifecycle, token hash persistence, text fallback, and report scaffold.
- Content Studio QA gate and explicit publish sync into learning runtime lessons.
- Strict TypeScript, lint, format, test scripts.
- Premium landing/app shell foundation.

## Local development

```bash
pnpm install
docker compose up -d
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm db:verify

# Web app
pnpm dev:web

# API, PowerShell example
$env:NODE_ENV="development"
$env:AUTH_MODE="dev-header"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
$env:DATABASE_URL="postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_dev?schema=public"
$env:REDIS_URL="redis://localhost:6379"
pnpm dev:api
```

The web app runs at `http://localhost:3000` by default. The API runs at `http://localhost:4000`.

`AUTH_MODE=dev-header` is local scaffold only. API config rejects `AUTH_MODE=dev-header` when `NODE_ENV=production`. Production auth must use the future OIDC provider with validated issuer, audience, expiry, tenant claims, and session revocation.

## Quality commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
pnpm test:api
pnpm test:integration
pnpm api:smoke
pnpm ai:eval
```

`pnpm api:smoke` expects a local API server running at `http://127.0.0.1:4000` unless `API_SMOKE_BASE_URL` is set.
When the API is started with live Postgres and Redis, set `API_SMOKE_EXPECT_PERSISTENCE=1`
to require `/health/ready` to report `database=ok` and `redis=ok`.
Set `API_SMOKE_RATE_LIMIT=1` to run the opt-in Redis-backed rate-limit stress smoke.

`pnpm ai:eval` runs deterministic AI router/policy/schema/fallback fixtures without API keys or
external provider calls.

Integration tests skip live database checks unless `TEST_DATABASE_URL` is set. For local validation,
use a separate database such as `polyglot_test`:

```bash
$env:TEST_DATABASE_URL="postgresql://polyglot:polyglot_local_password@localhost:5432/polyglot_test?schema=public"
$env:TEST_REDIS_URL="redis://localhost:6379"
pnpm test:integration
```

## Workspace layout

- `apps/web`: Next.js public, learner, and admin web app.
- `apps/api`: tenant-aware BFF/API foundation with development-header auth scaffolding.
- `prisma`: PostgreSQL schema, migration, and seed data.
- `packages/contracts`: shared Zod schemas and API contract types.
- `packages/design-tokens`: product design tokens.
- `packages/ui`: shared UI utilities.
- `packages/config`: environment parsing helpers.
- `packages/authz`: tenant-aware RBAC/ABAC policy decisions.
- `packages/tenant-core`: tenant isolation helpers, partition keys, and audit event factory.

See `FOLDER_STRUCTURE.md` for the full target architecture.

## Git note

This workspace is currently not a git repository. To create a local commit after review:

```bash
git init
git add .
git commit -m "PR-009 content QA and publish sync foundation"
```

Do not add or push a remote until the real repository URL is known.

## Enterprise docs

- `API_SPEC.md`
- `DATABASE_SCHEMA.md`
- `DEPLOYMENT.md`
- `DESIGN_SYSTEM.md`
- `ENTERPRISE_REQUIREMENTS.md`
- `TENANT_ARCHITECTURE.md`
- `REALTIME_ARCHITECTURE.md`
- `AI_EVAL_PLAN.md`
- `OBSERVABILITY_RUNBOOK.md`
- `COMPLIANCE_MATRIX.md`
- `CONTENT_OPERATIONS.md`
- `VENDOR_DECISION_MATRIX.md`
- `SEO_PLAN.md`
- `TEST_PLAN.md`
- `UX_SPEC.md`
- `PR003_BACKEND_FOUNDATION_AUDIT.md`
- `TENANT_CONTEXT.md`
- `AUTHZ_POLICY.md`
- `AUDIT_LOGGING.md`
- `SECURITY_BASELINE.md`
- `PR003B_PERSISTENCE_AUTH_READINESS.md`
- `DATABASE.md`
- `OIDC_INTEGRATION.md`
- `LOGGING.md`
- `OBSERVABILITY.md`
- `STEP_UP_AUTH.md`
- `PR003C_LOCAL_INFRA_VALIDATION.md`
- `PR004_LEARNING_CORE.md`
- `LEARNING_DOMAIN_MODEL.md`
- `LEARNING_API.md`
- `CONTENT_STATUS_VERSIONING.md`
- `PR005_AI_TUTOR_CHAT_FOUNDATION.md`
- `AI_TUTOR_ARCHITECTURE.md`
- `AI_CHAT_API.md`
- `PROMPT_SAFETY.md`
- `PR006_SPEAKING_REALTIME_FOUNDATION.md`
- `SPEAKING_REALTIME_API.md`
- `SPEAKING_SESSION_MODEL.md`
- `PR007_AI_ORCHESTRATION_PROVIDER_PILOT.md`
- `AI_ORCHESTRATION.md`
- `MODEL_ROUTING.md`
- `AI_OUTPUT_SCHEMA.md`
- `PR008_CONTENT_STUDIO_SOURCE_REGISTRY.md`
- `CONTENT_STUDIO_API.md`
- `SOURCE_REGISTRY.md`
- `CONTENT_QUALITY_WORKFLOW.md`
- `PR009_CONTENT_QA_PUBLISH_SYNC.md`
- `CONTENT_QA_AGENT.md`
