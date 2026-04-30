# Polyglot AI Academy - Deployment and CI/CD

## 1. Environments

- Local.
- Preview.
- Staging.
- Production.

Each environment has separate:

- credentials.
- database.
- object storage.
- Redis.
- provider keys.
- tenant seed data.

## 2. Pull request pipeline

Required:

- lint.
- typecheck.
- unit test.
- integration test.
- contract test.
- design token check.
- i18n missing key check.
- accessibility smoke test.

## 3. Build pipeline

Required:

- SBOM.
- dependency scan.
- CodeQL/SAST.
- secret scan.
- license scan.
- container image scan if Docker.
- immutable build artifact.
- signed artifact with Cosign or equivalent when pipeline is ready.
- provenance following SLSA mindset.

## 4. Preview and staging

Preview:

- ephemeral review app.
- seeded tenant test data.
- E2E smoke.

Staging:

- integration E2E.
- synthetic realtime tests.
- AI eval tests.
- DAST.
- small load test.

## 5. Production release

Required:

- canary/progressive delivery.
- health check.
- auto rollback by SLO.
- feature flags.
- release notes.
- migration rollback plan.

Do not deploy production if:

- critical/high security issue unresolved.
- typecheck/build/lint fail.
- admin route lacks auth.
- cross-tenant test fails.
- serious AI eval fails.
- observability missing for new critical flow.

## 6. Rollback

Rollback plan:

- web artifact rollback.
- API artifact rollback.
- feature flag disable.
- DB migration rollback or forward-fix plan.
- prompt/model/policy rollback.
- content version rollback.

## 7. Deployment Done Criteria

- CI/CD gates are defined from PR to production.
- Security and supply-chain scans are included.
- Preview/staging/production expectations are clear.
- Canary, feature flag and rollback controls exist.
