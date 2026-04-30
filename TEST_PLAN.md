# Polyglot AI Academy - Test Plan

## 1. Quality gates

Required for every PR:

- format check.
- lint.
- typecheck.
- unit tests.
- integration tests where touched.
- build.
- no hard-coded secret.

Enterprise release blockers:

- admin route missing auth.
- cross-tenant test failure.
- AI severe eval failure.
- critical/high security issue unresolved.
- source/license gate bypass.
- observability missing for new critical flow.

## 2. Test layers

Unit:

- utility functions.
- domain policies.
- RBAC/ABAC decisions.
- SRS scheduling.
- content quality scoring.

Integration:

- auth flows.
- OIDC callback.
- SCIM provisioning.
- tenant/group/assignment APIs.
- lesson progress.
- speaking session creation.
- content publish workflow.

E2E:

- tenant learner onboarding.
- placement test.
- first lesson.
- speaking session with fallback.
- manager assignment analytics.
- Content Studio publish/rollback.
- Source Registry review.

Security:

- rate limit auth/AI/speaking.
- CSRF/origin where cookie auth.
- object-level authorization.
- cross-tenant denial.
- admin permission matrix.
- upload restrictions.
- secret scan.
- SAST/SCA/DAST.

AI eval:

- prompt injection.
- system prompt leakage.
- fake citation.
- tenant RAG scope.
- unsafe content.
- schema validation.
- model/prompt regression.

Accessibility:

- keyboard navigation.
- focus states.
- axe smoke tests.
- contrast check.
- screen reader labels.
- reduced motion.

Realtime:

- session token scope.
- reconnect.
- weak network.
- provider outage fallback.
- transcript sync.
- latency metrics.

Data:

- license gate.
- lineage required.
- validation required.
- rollback.
- duplicate/contamination checks.

## 3. Cross-tenant test matrix

Must fail:

- learner A reads tenant B dashboard.
- learner A reads tenant B lesson assignment.
- manager A reads tenant B cohort analytics.
- tenant agent A retrieves tenant B document.
- SCIM token A changes tenant B user.
- signed URL A accesses tenant B audio.
- prompt manager A edits tenant B agent.

Expected:

- `403` or `404`.
- no resource existence leak unless policy allows.
- audit/security event emitted for suspicious attempts.

## 4. Test Plan Done Criteria

- Every enterprise blocker has a test category.
- Cross-tenant tests are explicit.
- AI eval and realtime synthetic tests are release gates.
- Accessibility and CJK/i18n checks are included.
