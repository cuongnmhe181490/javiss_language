# Polyglot AI Academy - Proposed Folder Structure

## PR-004 Backend Learning Core Additions

- `apps/api/src/learning-domain.ts`: learning enums, validation schemas, and shared records.
- `apps/api/src/learning-fixtures.ts`: in-memory seed data for unit and smoke tests.
- `apps/api/src/learning-repositories.ts`: repository interfaces and in-memory implementation.
- `apps/api/src/prisma-learning-repositories.ts`: Prisma implementation.
- `apps/api/src/learning-services.ts`: course, lesson, progress, assignment, and dashboard services.
- `apps/api/src/learning.spec.ts`: API and security tests for learning core.
- `prisma/migrations/20260427210000_add_learning_core/migration.sql`: learning schema migration.

## PR-009 Content QA and Publish Sync Additions

- `apps/api/src/content-qa-agent.ts`: deterministic Content QA Agent scaffold and output schema.
- `apps/api/src/content-services.ts`: QA gate and explicit sync from published content versions into runtime lessons.
- `apps/api/src/content.spec.ts`: QA, publish gate, sync, and denied audit tests.
- `apps/api/scripts/smoke-api.mjs`: local smoke coverage for QA and sync-learning.
- `CONTENT_QA_AGENT.md`: agent checks, output shape, guardrails, and remaining work.
- `PR009_CONTENT_QA_PUBLISH_SYNC.md`: PR scope, API changes, tests, and known limitations.

## PR-005 Backend AI Tutor Chat Additions

- `apps/api/src/ai-domain.ts`: AI agent, prompt, conversation, message records and validation schemas.
- `apps/api/src/ai-fixtures.ts`: in-memory tutor agent and prompt seed data.
- `apps/api/src/ai-provider.ts`: provider-neutral AI model interface and deterministic mock tutor provider.
- `apps/api/src/ai-repositories.ts`: AI repository interfaces and in-memory implementation.
- `apps/api/src/prisma-ai-repositories.ts`: Prisma implementation for AI records.
- `apps/api/src/ai-services.ts`: tutor conversation, ownership, grounding, and message orchestration.
- `apps/api/src/ai.spec.ts`: API/security/safety tests for tutor chat.
- `prisma/migrations/20260427223000_add_ai_tutor_chat_foundation/migration.sql`: AI tutor schema migration.

## PR-006 Backend Speaking Realtime Additions

- `apps/api/src/speaking-domain.ts`: speaking session, token, transcript records and validation schemas.
- `apps/api/src/speaking-repositories.ts`: speaking repository interfaces and in-memory implementation.
- `apps/api/src/prisma-speaking-repositories.ts`: Prisma implementation for speaking records.
- `apps/api/src/speaking-services.ts`: session lifecycle, token hash, text fallback, and report scaffold logic.
- `apps/api/src/speaking.spec.ts`: API/security tests for speaking foundation.
- `prisma/migrations/20260427233000_add_speaking_realtime_foundation/migration.sql`: speaking schema migration.

## 1. Repository strategy

Use a TypeScript monorepo. The product has several independently scalable surfaces:

- Public and learner/admin web app.
- Backend API.
- Background workers for data/AI/content jobs.
- Realtime gateway for speaking.
- Shared contracts, UI, design tokens, AI abstractions, data pipeline helpers.

Recommended tool:

- `pnpm` workspaces for package management.
- Turborepo or Nx optional for task orchestration.

## 2. Proposed tree

```text
polyglot-ai-academy/
  apps/
    web/
      src/
        app/
          (public)/
          (auth)/
          (learner)/
          (admin)/
          api/
        components/
          layout/
          marketing/
          learner/
          admin/
          ai/
          speaking/
        features/
          auth/
          onboarding/
          dashboard/
          courses/
          lesson-player/
          flashcards/
          ai-tutor/
          speaking-room/
          pronunciation-report/
          writing-correction/
          admin-cms/
          billing/
        lib/
          api/
          auth/
          i18n/
          seo/
          analytics/
          safe-url/
        styles/
        tests/
      public/
      next.config.ts
      package.json

    api/
      src/
        main.ts
        app.ts
        server.ts
        auth-provider.ts
        config.ts
        context.ts
        errors.ts
        fixtures.ts
        logging.ts
        prisma-client.ts
        prisma-repositories.ts
        rate-limit.ts
        rate-limiter-factory.ts
        readiness.ts
        repository-factory.ts
        repositories.ts
        tenant-context.ts
        tracing.ts
        common/
          auth/
          errors/
          filters/
          guards/
          interceptors/
          logging/
          pagination/
          security/
          validation/
        modules/
          auth/
          users/
          profiles/
          languages/
          placement/
          courses/
          lessons/
          exercises/
          progress/
          flashcards/
          ai-chat/
          ai-safety/
          speaking/
          pronunciation/
          writing/
          content-sources/
          content-validation/
          admin/
          moderation/
          billing/
          analytics/
          audit/
          notifications/
          blog/
        prisma/
        tests/
      scripts/
        smoke-api.mjs
      package.json

    worker/
      src/
        main.ts
        queues/
          content-ingest/
          content-validation/
          ai-evals/
          email/
          analytics-rollups/
        jobs/
        processors/
        tests/
      package.json

    realtime/
      src/
        main.ts
        gateways/
          speaking.gateway.ts
          transcript.gateway.ts
        sessions/
        providers/
          livekit/
          websocket/
        tests/
      package.json

  packages/
    contracts/
      src/
        auth/
        users/
        courses/
        lessons/
        ai/
        speaking/
        admin/
        billing/
        errors/
      package.json

    ui/
      src/
        primitives/
        components/
          button/
          input/
          select/
          modal/
          toast/
          card/
          lesson-card/
          course-card/
          chat-bubble/
          voice-waveform/
          progress-ring/
          skill-badge/
          ai-tutor-avatar/
          admin-table/
          data-quality-badge/
        hooks/
        utils/
      package.json

    design-tokens/
      src/
        colors.ts
        typography.ts
        spacing.ts
        radius.ts
        shadow.ts
        glass.ts
      package.json

    ai-core/
      src/
        providers/
          llm/
          stt/
          tts/
          pronunciation/
          moderation/
          embeddings/
        prompts/
        safety/
        rag/
        cost/
        schemas/
      package.json

    data-pipeline/
      src/
        ingest/
        normalize/
        dedupe/
        license/
        language-detection/
        tokenization/
        level-estimation/
        grammar-tagging/
        validation/
        publishing/
      package.json

    authz/
      src/
        roles.ts
        permissions.ts
        policies.ts
        rbac-matrix.ts
      package.json

    config/
      src/
        env.ts
        feature-flags.ts
        origins.ts
      package.json

    logger/
      src/
        logger.ts
        redaction.ts
      package.json

    test-utils/
      src/
        factories/
        fixtures/
        mocks/
      package.json

  prisma/
    schema.prisma
    seed.ts
    migrations/
      20260427190000_init_enterprise_foundation/
        migration.sql
    seed/
      legal-sample-content/
      dev-users/

  docs/
    decisions/
    diagrams/
    runbooks/
    qa-reports/

  infra/
    docker/
      api.Dockerfile
      worker.Dockerfile
      realtime.Dockerfile
    compose/
      docker-compose.local.yml
    terraform/
    scripts/

  .github/
    workflows/
      ci.yml
      security.yml
      deploy-preview.yml
      deploy-production.yml

  scripts/
    db/
    security/
    content/
    ai-evals/

  tests/
    e2e/
    performance/
    security/
    accessibility/

  PROJECT_MASTER_PLAN.md
  PRD.md
  UX_SPEC.md
  DESIGN_SYSTEM.md
  ARCHITECTURE.md
  SECURITY.md
  DATA_STRATEGY.md
  API_SPEC.md
  DATABASE_SCHEMA.md
  TEST_PLAN.md
  SEO_PLAN.md
  DEPLOYMENT.md
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  eslint.config.mjs
  prettier.config.mjs
  .env.example
  .gitignore
```

## 3. Boundary rules

### `apps/web`

Allowed:

- UI rendering.
- Browser interactions.
- Calls to API/realtime.
- SEO metadata.

Not allowed:

- Database access.
- Secret access.
- Server-only AI provider calls from Client Components.
- Authorization as the only security boundary.

### `apps/api`

Allowed:

- Auth/session management.
- Domain logic.
- Database access.
- AI orchestration request handling.
- RBAC and audit.

Not allowed:

- Long-running ingestion jobs.
- Realtime audio media processing that should live in realtime service.
- Direct use of raw provider SDKs outside provider abstractions when avoidable.

### `apps/worker`

Allowed:

- Ingestion.
- Validation jobs.
- AI eval jobs.
- Email jobs.
- Analytics rollups.

Not allowed:

- Public HTTP request handling except health checks if needed.
- UI concerns.

### `apps/realtime`

Allowed:

- WebRTC/WebSocket session orchestration.
- Transcript events.
- Speaking turn state.
- Low-latency STT/TTS streaming integration.

Not allowed:

- Full CMS/business CRUD.
- Direct admin management.

### `packages/contracts`

Purpose:

- Shared request/response schemas.
- Error schema.
- Event schema.
- API contract types.

Rules:

- No runtime secrets.
- No DB clients.
- Must be safe to import by frontend and backend.

### `packages/ai-core`

Purpose:

- Provider-neutral interfaces.
- Prompt helpers.
- RAG helpers.
- Output schema validation.
- Safety utilities.
- Cost tracking types.

Rules:

- Provider keys injected by server/runtime only.
- No client import from browser bundles.

## 4. Naming conventions

Files:

- React components: `PascalCase.tsx`.
- Hooks: `use-name.ts`.
- API services: `name.service.ts`.
- Controllers: `name.controller.ts`.
- DTO/schema files: `name.schema.ts` or `name.dto.ts`.
- Tests: `*.spec.ts`, E2E `*.e2e-spec.ts`.

Domain IDs:

- Use UUID/CUID for public resource IDs.
- Do not expose sequential IDs.

Routes:

- Public: `/`, `/languages/english`, `/pricing`, `/blog/[slug]`.
- Learner: `/app`, `/app/courses`, `/app/lessons/[lessonId]`, `/app/tutor`, `/app/speaking`.
- Admin: `/admin`, `/admin/content`, `/admin/prompts`, `/admin/data-sources`, `/admin/moderation`.
- API: `/v1/...`.

## 5. Environment files

Required:

- `.env.example`: safe placeholders only.
- `.env.local`: ignored.
- `.env.test`: ignored or generated in CI.

Rules:

- Never commit real secrets.
- `NEXT_PUBLIC_*` means public and browser-visible.
- Use `APP_ORIGIN` or configured allowed origins instead of trusting Host headers for sensitive links.

## 6. Test organization

Unit tests:

- Near module files.

Integration tests:

- `apps/api/src/modules/*/*.spec.ts`.
- Use test DB or transaction rollback.

E2E tests:

- `tests/e2e`.
- Core flows: public signup, onboarding, dashboard, lesson, AI chat shell, admin RBAC.

Security tests:

- `tests/security`.
- Auth, RBAC, object access, rate limits, validation, CSRF/origin, upload restrictions.

Accessibility tests:

- `tests/accessibility`.
- Axe/Playwright scans for public and core app screens.

Performance tests:

- `tests/performance`.
- Lighthouse and API smoke latency.

AI evals:

- `scripts/ai-evals` or `apps/worker/src/queues/ai-evals`.
- Prompt leak, fake citation, unsafe content, off-scope, level appropriateness.

## 7. Documentation ownership

Root docs:

- `PROJECT_MASTER_PLAN.md`: product/leadership.
- `PRD.md`: product.
- `UX_SPEC.md`: design/product.
- `DESIGN_SYSTEM.md`: design/frontend.
- `ARCHITECTURE.md`: architecture/engineering.
- `SECURITY.md`: security/engineering.
- `DATA_STRATEGY.md`: data/legal/content.
- `API_SPEC.md`: backend/frontend.
- `DATABASE_SCHEMA.md`: backend/data.
- `TEST_PLAN.md`: QA/engineering.
- `SEO_PLAN.md`: SEO/product.
- `DEPLOYMENT.md`: DevSecOps.

Decision records:

- Use `docs/decisions/ADR-0001-title.md`.
- Each ADR includes context, decision, alternatives, consequences.

## 8. Scaffold order

Recommended implementation order after PR-001:

1. Root package manager and TypeScript config.
2. `apps/web` Next.js app.
3. `packages/design-tokens` and `packages/ui`.
4. `packages/contracts`.
5. `apps/api` TypeScript API foundation, then NestJS/Fastify BFF modules as the backend grows.
6. Prisma schema and migrations.
7. `apps/worker`.
8. `packages/ai-core`.
9. `apps/realtime`.
10. CI workflows.

## 9. Folder Structure Done Criteria

- Boundaries are clear enough to prevent secret/client leakage.
- Apps can scale independently.
- Shared packages have explicit import safety rules.
- Test and docs locations are defined.
- Scaffold order supports "docs first, code after".

## 10. Enterprise folder structure upgrade

Additional apps/services to add as scope grows:

```text
apps/
  bff/
    src/
      tenant-routing/
      anti-abuse/
      feature-flags/
      session/
  api/
    src/modules/
      tenants/
      groups/
      assignments/
      sso/
      scim/
      tenant-agents/
      tenant-glossary/
      tenant-documents/
      data-policy/
  realtime/
    src/
      sfu/
      stun-turn/
      qos/
      reconnect/
      session-tokens/
  ai-orchestrator/
    src/
      agents/
      model-router/
      policy/
      grounding/
      evals/
      cost/
  content-service/
    src/
      studio/
      source-registry/
      review-queue/
      versioning/
      publish/
      rollback/

packages/
  tenant-core/
  rbac-abac/
  agent-contracts/
  realtime-contracts/
  observability/
  compliance/
```

Enterprise test additions:

```text
tests/
  cross-tenant/
  sso/
  scim/
  realtime-synthetic/
  ai-red-team/
  content-quality/
  compliance/
```

Boundary additions:

- Tenant routing and feature flags are enforced server-side.
- Agent tools live behind `agent-contracts` and must be allow-listed.
- Realtime contracts include tenant/session token scope.
- Cross-tenant tests are top-level release gates, not module-only tests.
- PR-007 AI orchestration code lives under `apps/api/src/ai-orchestrator.ts`, `ai-model-router.ts`, `ai-policy.ts`, and `ai-output-validation.ts`.
- Provider implementations stay behind `AiModelProvider`; services consume `AiOrchestrator` instead of calling providers directly.
- PR-008 content operations live under `apps/api/src/content-domain.ts`, `content-repositories.ts`, `content-services.ts`, and `prisma-content-repositories.ts`.
- PR-009 content QA lives in `apps/api/src/content-qa-agent.ts`; runtime lesson sync remains explicit and permission-gated through `content:sync_learning`.
