# PR-003 Backend Foundation Audit

Date: 2026-04-27
Scope: `apps/api`, `packages/contracts`, `packages/authz`, `packages/tenant-core`, root workspace scripts and API docs.

## 1. What Is Done Correctly

- `apps/api` has a runnable TypeScript API foundation with `/health`, `/health/live`, `/health/ready`, tenant read, audit list, and audit export endpoints.
- API errors use a single envelope with `code`, `message`, `details`, `requestId`, and `timestamp`.
- Tenant routes are fail-closed behind a centralized tenant context resolver in `apps/api/src/tenant-context.ts`.
- Authentication is provider-based through `AuthProvider`, with `DevHeaderAuthProvider` separated from the route layer.
- `AUTH_MODE=dev-header` is blocked when `NODE_ENV=production`.
- Permissions now use `resource:action` style in `packages/contracts` and `packages/authz`.
- `@polyglot/authz` is deny-by-default, tenant-aware, and applies step-up MFA to sensitive permissions.
- Sensitive audit export records both denied and successful attempts when an actor is present.
- Audit metadata is sanitized in `packages/tenant-core` to remove secret/token/raw-sensitive keys.
- Basic security headers, strict CORS allowlist behavior, request ID propagation, body-size guard, and in-memory rate-limit scaffold exist.
- Tests cover health, config, auth provider, tenant context, RBAC/ABAC, audit logging, error format, security headers, body size, and rate limit.

## 2. Scaffold / Dev-Only Parts

- `DevHeaderAuthProvider` is local development scaffolding only. It must never be exposed to production traffic.
- `OidcAuthProvider` is a structured stub and returns `auth.oidc_not_implemented` when an Authorization header is used.
- Repositories are in-memory fixtures, not PostgreSQL/Prisma.
- Audit logs are mutable in-memory arrays, not append-only durable storage.
- Rate limiting is process-local and is not safe for multi-instance production.
- Readiness checks are mockable and currently do not verify PostgreSQL, Redis, object storage, or provider connectivity.
- Runtime logging is not yet wired to OpenTelemetry or a redacted structured logger.

## 3. Not Yet Production-Ready

- Enterprise SSO/OIDC validation, JWKS caching, issuer/audience checks, token expiry checks, and session revocation are not implemented.
- SCIM provisioning is not implemented.
- Persistence, migrations, transaction boundaries, and database-level tenant constraints are not implemented.
- Distributed rate limits, WAF/API gateway rules, and abuse controls are not implemented.
- Immutable audit storage, export job queue, and signed export delivery are not implemented.
- Secrets management, KMS, and environment-specific deployment policies are not wired.

## 4. Issue Register

### Critical

None open for PR-003 foundation after this hardening pass. The remaining critical items below are production blockers, not PR-003 scaffold blockers.

### High

#### H-001: OIDC Provider Is A Stub

- File: `apps/api/src/auth-provider.ts`
- Cause: `OidcAuthProvider` is intentionally not implemented in PR-003.
- Risk: Enterprise production cannot authenticate users, enforce SSO policy, or validate tenant membership from trusted claims.
- Fix: Implement OIDC Authorization Code + PKCE session validation, issuer/audience checks, JWKS cache, token expiry, tenant claim mapping, and session revocation.
- Done criteria: OIDC integration tests pass for valid token, expired token, wrong issuer, wrong audience, missing tenant claim, revoked session, and cross-tenant claim mismatch.

#### H-002: Persistence Is In-Memory

- File: `apps/api/src/repositories.ts`
- Cause: Repositories use fixture arrays.
- Risk: Data disappears on restart, cannot enforce DB constraints, and cannot prove durable audit or tenant isolation.
- Fix: Introduce PostgreSQL/Prisma repositories with tenant-scoped queries and DB-level indexes/constraints.
- Done criteria: Repository integration tests run against a test database and prove tenant filters are mandatory.

#### H-003: Audit Log Is Not Immutable

- File: `apps/api/src/repositories.ts`, `packages/tenant-core/src/index.ts`
- Cause: Audit events are appended to an in-memory array.
- Risk: Events can be modified or lost; enterprise evidence requirements are not met.
- Fix: Store audit events append-only with restricted write path, stable IDs, DB retention policy, export job, and tamper-evidence strategy.
- Done criteria: Audit append succeeds, update/delete is unavailable, export is audited, and denied sensitive actions are recorded.

#### H-004: Distributed Rate Limiting Is Missing

- File: `apps/api/src/rate-limit.ts`
- Cause: Rate limiter is process-local.
- Risk: Multi-instance deployments can be bypassed by load balancing across nodes.
- Fix: Move counters to Redis or gateway-level rate limiting with tenant/user/IP keys.
- Done criteria: Integration test proves two app instances share the same rate-limit bucket.

#### H-005: Production Observability Is Not Wired

- File: `apps/api/src/server.ts`, `apps/api/src/app.ts`
- Cause: There is no OpenTelemetry instrumentation or redacted structured logger.
- Risk: Incident response, audit investigation, latency debugging, and AI cost tracing will be weak.
- Fix: Add OpenTelemetry traces, structured logs, redaction, metrics, and tenant/request correlation.
- Done criteria: Each request emits trace/span IDs, structured redacted logs, latency metric, status metric, and tenant-safe labels.

### Medium

#### M-001: Body Size Guard Is Header-Based In Handler

- File: `apps/api/src/app.ts`, `apps/api/src/server.ts`
- Cause: Handler checks `content-length`; adapter has a streaming guard but returns generic adapter error on stream overflow.
- Risk: Chunked oversized requests may not return the standard API envelope.
- Fix: Add a typed adapter error and map it to `request.body_too_large`.
- Done criteria: Chunked oversized request returns HTTP 413 with standard error envelope.

#### M-002: Super Admin Cross-Tenant Flow Is Not Exposed In API Routes

- File: `packages/authz/src/index.ts`, `apps/api/src/app.ts`
- Cause: Authz supports explicit cross-tenant override, but API routes do not expose a reviewed break-glass path.
- Risk: Future support flows may add ad hoc cross-tenant access.
- Fix: Add a break-glass route/policy requiring justification, step-up MFA, and audit.
- Done criteria: Super admin cross-tenant access fails without reason and step-up, succeeds only with reason, and records audit.

#### M-003: Audit Filtering Is Minimal

- File: `apps/api/src/repositories.ts`
- Cause: Filters support actor, action, outcome, and date only.
- Risk: Enterprise admin investigations need resource type, request ID, and actor role filters.
- Fix: Extend filter schema before real audit UI.
- Done criteria: Filters include resourceType, resourceId, requestId, actorRole, and pagination metadata.

#### M-004: Readiness Checks Are Shallow

- File: `apps/api/src/app.ts`
- Cause: `/health/ready` returns mock checks.
- Risk: Orchestrators may send traffic to an instance without database/cache/provider readiness.
- Fix: Add dependency probes for DB, Redis, object storage, and configured auth provider.
- Done criteria: Readiness fails if required dependency is down and never exposes secret/config values.

### Low

#### L-001: No Dedicated API ESLint Config

- File: `apps/api/package.json`
- Cause: API relies on TypeScript and root lint flow; no API-specific lint command yet.
- Risk: Backend-specific rules such as no-console/no-floating-promises are not enforced.
- Fix: Add ESLint config for Node/API code.
- Done criteria: `pnpm --filter @polyglot/api lint` runs and passes.

#### L-002: Health Cache Policy Is Conservative

- File: `apps/api/src/errors.ts`
- Cause: All JSON responses use `cache-control: no-store`.
- Risk: No production issue; health endpoints may be less cache-friendly for synthetic probes.
- Fix: Keep no-store for now or explicitly set separate cache policy for public non-sensitive probes.
- Done criteria: Cache policy is documented per endpoint class.

### Nice-to-have

#### N-001: Add API Contract Snapshots

- File: `apps/api/src/app.spec.ts`
- Cause: Tests assert key fields but not full contract snapshots.
- Risk: Small accidental response shape changes may be missed.
- Fix: Add stable contract tests or OpenAPI generation.
- Done criteria: Public response schemas are generated and validated in CI.

## 5. Security Risks Current State

- Dev-header auth is safe for local development only because production config blocks it, but any non-production shared environment must still be protected at network level.
- OIDC is not implemented, so no real identity trust chain exists yet.
- In-memory audit and rate limit are not durable/distributed.
- No database means no row-level or query-level tenant enforcement yet.
- No structured log redaction pipeline exists beyond audit metadata sanitization.

## 6. Tenant Isolation Risks

- Tenant isolation is enforced in route logic and tests, but not yet backed by DB constraints.
- Super admin break-glass behavior exists in `@polyglot/authz` but has no API workflow.
- Repository methods can still be misused by future code if developers bypass tenant-scoped API methods.

## 7. RBAC/ABAC Gaps

- ABAC currently checks tenant, actor role, resource tenant, and step-up sensitivity.
- Group, department, assignment, data residency, document access scope, and purpose-based access are not implemented.
- Permission naming is standardized, but policy ownership and approval workflow are not yet automated.

## 8. Audit Log Gaps

- Audit event schema now includes `actorRole`, `outcome`, `requestId`, and sanitized `metadata`.
- Denied and success events exist for audit export.
- Failure events for unexpected handler errors are not yet automatically audited.
- Export is queued as a scaffold response; no actual file generation or signed delivery exists.

## 9. Error Handling Gaps

- Error envelope is standardized and stack traces are not leaked.
- Validation errors provide field-level details.
- Adapter-level streaming body overflow still needs typed 413 mapping.
- No localization of API error messages yet.

## 10. Test Coverage Gaps

- Current API test suite covers the security-critical foundation paths.
- Missing integration tests against real PostgreSQL, Redis-backed rate limit, OIDC provider, and real reverse-proxy CORS behavior.
- Missing contract tests/OpenAPI schema validation.
- Missing load/synthetic tests for readiness and rate limit under concurrency.

## 11. Required Before PR-004

- Keep `DevHeaderAuthProvider` explicitly local-only in docs and config.
- Do not add new tenant routes without using `resolveRequestScope` and `requirePermission`.
- Do not add course/lesson persistence until tenant-scoped repository conventions are defined.
- Preserve current API quality gates: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm format:check`, `pnpm api:smoke`.
- Workspace is currently not a git repository. Suggested local workflow only:

```bash
git init
git add .
git commit -m "PR-003 backend foundation hardening"
```

No remote is configured or assumed.
