# Staging Smoke Users

No passwords, secrets, or bearer tokens belong in this file.

## Required Users

All minimum smoke users belong to tenant Alpha unless noted otherwise.

| User             | Example email                   | `sub` claim                            | `tenant_id` claim                      | `roles` claim          | Expected permissions                                                                             | Smoke usage                                                                                              |
| ---------------- | ------------------------------- | -------------------------------------- | -------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Tenant admin     | `tenant.admin@example.test`     | `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb` | `11111111-1111-4111-8111-111111111111` | `["tenant_admin"]`     | Tenant read, audit list, learning admin, content publish/sync, source approval.                  | Tenant read, audit export denied/success path when step-up fixture exists, admin learning/content paths. |
| Learner          | `learner@example.test`          | `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa` | `11111111-1111-4111-8111-111111111111` | `["learner"]`          | Learner course/lesson/progress, AI tutor chat, speaking session own access.                      | Learning, AI tutor, speaking, negative admin/content checks.                                             |
| Security auditor | `security.auditor@example.test` | `cccccccc-cccc-4ccc-8ccc-cccccccccccc` | `11111111-1111-4111-8111-111111111111` | `["security_auditor"]` | Audit list/export with step-up; no learner speaking access.                                      | Audit list/export denied without step-up, negative speaking access.                                      |
| Content editor   | `content.editor@example.test`   | Create or seed a UUID user id          | `11111111-1111-4111-8111-111111111111` | `["content_editor"]`   | Source write, content create/update, no source approve/publish.                                  | Source create, content item/version create, negative approval/publish paths.                             |
| Super admin      | `super.admin@example.test`      | `dddddddd-dddd-4ddd-8ddd-dddddddddddd` | `11111111-1111-4111-8111-111111111111` | `["super_admin"]`      | Broad permissions; cross-tenant only where route explicitly allows and justification is present. | Optional explicit cross-tenant policy smoke.                                                             |

## Secondary Tenant

Tenant Beta must exist for cross-tenant checks:

- Tenant ID: `22222222-2222-4222-8222-222222222222`
- Slug: `kansai-retail-language-lab`

Smoke should verify that tenant Alpha users cannot read or mutate tenant Beta
resources unless an explicit `super_admin` cross-tenant policy path is being
tested.

## IdP Configuration Notes

- Use internal UUIDs for `sub` and `tenant_id` unless a future PR adds lookup
  support.
- Keep role claim values identical to internal role names.
- Group or organization names in the IdP may be friendly slugs, but the emitted
  API token must contain the UUID tenant claim.
- Tokens should be acquired manually by the deployer and set as shell env vars.
