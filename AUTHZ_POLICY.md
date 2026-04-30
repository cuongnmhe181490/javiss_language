# Authorization Policy

## PR-004 Learning Permissions

Course:

- `course:list`
- `course:read`
- `course:create`
- `course:update`
- `course:publish`
- `course:archive`

Lesson:

- `lesson:read`
- `lesson:create`
- `lesson:update`
- `lesson:publish`
- `lesson:start`
- `lesson:complete`

Assignment:

- `assignment:read`
- `assignment:create`
- `assignment:update`

Progress:

- `progress:read_own`
- `progress:read_team`
- `progress:update_own`

Content:

- `content:update`
- `content:review`
- `content:publish`
- `content:rollback`
- `content:sync_learning`

Role mapping:

- `learner`: published course/lesson read, own lesson start/complete, own progress, own assignments.
- `content_editor`: draft/review content create/update, no publish.
- `tenant_admin`: learning content create/update/publish/archive, Content Studio publish/sync, and assignments.
- `lnd_manager`: course read, assignments, and team progress surface.
- `security_auditor`: audit only, no content edits.

ABAC:

- `tenantId` match is mandatory.
- learner progress writes are own-user only.
- content editor cannot publish.
- content editor cannot sync published Content Studio versions into runtime lessons.
- published content update requires publish-level permission.

## PR-005 AI Tutor Permissions

AI tutor:

- `ai_tutor:chat`
- `ai_conversation:read_own`
- `ai_conversation:manage`

Prompt governance:

- `prompt:read`
- `prompt:write`
- `prompt:approve`

Role mapping:

- `learner`: `agent:read`, `ai_tutor:chat`, `ai_conversation:read_own`.
- `tenant_admin`: AI chat, conversation management, agent management, and prompt approval.
- `lnd_manager` and `teacher`: conversation management for future team coaching review.
- `content_editor` and `linguist_reviewer`: prompt read only.
- `security_auditor`: no AI chat or AI content management.

ABAC:

- Agent reads are same-tenant only.
- Conversations are same-tenant only.
- Learners can read only conversations where `conversation.userId === actor.userId`.
- `ai_conversation:manage` allows tenant admin/manager/teacher review workflows inside the same tenant.
- Prompt text must not be returned through learner APIs.

## PR-006 Speaking Permissions

Speaking session:

- `speaking_session:create`
- `speaking_session:read_own`
- `speaking_session:end_own`
- `speaking_session:text_fallback`
- `speaking_session:manage`
- `speaking_report:read`

Role mapping:

- `learner`: create/read/end own speaking sessions, submit text fallback, read own report.
- `tenant_admin`: create and manage speaking sessions in tenant.
- `lnd_manager` and `teacher`: manage/report surface for future team coaching workflows.
- `security_auditor`: no speaking session control.

ABAC:

- `tenantId` match is mandatory.
- Learners can access only sessions where `session.userId === actor.userId`.
- Tenant staff need `speaking_session:manage` for non-owned sessions.
- Raw realtime token hashes are never returned to clients.

## Model

Authorization uses RBAC for role grants and ABAC for request/resource context.

Decision inputs:

- actor identity.
- actor tenant membership.
- actor roles.
- requested permission.
- route tenant ID.
- resource tenant ID.
- action sensitivity.
- step-up MFA freshness.

Default: deny.

## Roles

- `super_admin`
- `tenant_admin`
- `lnd_manager`
- `content_editor`
- `linguist_reviewer`
- `teacher`
- `learner`
- `support`
- `security_auditor`
- `data_protection_officer`

## Permission Naming

Permissions use `resource:action`.

Examples:

- `tenant:read`
- `audit:list`
- `audit:export`
- `data:export`
- `tenant_policy:update`
- `sso_config:update`
- `transcript:read_sensitive`
- `audio:download`

## Sensitive Actions

Step-up MFA is required for:

- `audit:export`
- `data:export`
- `tenant_policy:update`
- `sso_config:update`
- `scim_config:update`
- `transcript:read_sensitive`
- `audio:download`

Default TTL: `AUDIT_EXPORT_STEP_UP_TTL_SECONDS=600`.

## ABAC Rules

- Missing actor: deny.
- Actor tenant mismatch: deny.
- Missing tenant membership: deny.
- Resource tenant mismatch: deny.
- Missing permission: deny.
- Sensitive action without fresh step-up: deny.
- Super admin cross-tenant: deny unless the route explicitly opts into cross-tenant access and the request includes a reviewed break-glass justification.

## Super Admin Cross-Tenant Override

Default: `super_admin` is not a magic tenant bypass.

Current API policy:

- Cross-tenant access is allowed only for routes that explicitly pass `allowCrossTenant`.
- The only current API route with that opt-in is `GET /v1/tenants/:tenantId`.
- The request must include `x-cross-tenant-justification`.
- The actor must still have the requested permission.
- Success and denied cross-tenant tenant reads are audited against the target tenant.
- Routes without explicit opt-in still return the standard error envelope and deny cross-tenant access, even for `super_admin`.
- `tenant_admin` never has cross-tenant access.
- `security_auditor` is audit-scoped only and does not inherit `super_admin` behavior.
- Privacy-sensitive/data export routes remain independently guarded by their route policy and step-up rules.

## Current Role Examples

| Role                      | Key permissions                                         |
| ------------------------- | ------------------------------------------------------- |
| `tenant_admin`            | `tenant:read`, user/group/assignment manage, audit list |
| `security_auditor`        | `tenant:read`, `audit:list`, `audit:export`             |
| `data_protection_officer` | `tenant_policy:update`, `audit:export`, `data:export`   |
| `learner`                 | content read, speaking session, learner profile         |

AI tutor chat uses `agent:read`, `ai_tutor:chat`, and `ai_conversation:read_own`. PR-007 keeps model routing and provider execution behind the service layer after RBAC/ABAC has passed; orchestration policy can still refuse a request before provider execution.

Content operations use `content:*` and `source:*`. Content editors can create/update content and source records, but source approval, publish, rollback, and runtime learning sync stay with tenant admins/super admins. Learners have no admin content permissions.

## Test Matrix

| Case                                     | Expected                    |
| ---------------------------------------- | --------------------------- |
| tenant admin reads own tenant            | allow                       |
| tenant admin reads another tenant        | deny                        |
| learner lists audit                      | deny                        |
| content editor syncs published content   | deny                        |
| tenant admin syncs published content     | allow                       |
| security auditor lists same-tenant audit | allow                       |
| security auditor exports without step-up | deny                        |
| security auditor exports with step-up    | allow                       |
| super admin cross-tenant without reason  | deny                        |
| super admin tenant read with reason      | allow and audit             |
| super admin cross-tenant route no opt-in | deny and audit if sensitive |
| security auditor cross-tenant read       | deny                        |

PR-003B also enforces tenant membership through repository lookup after RBAC/ABAC policy passes.

## Implementation Files

- `packages/contracts/src/index.ts`
- `packages/authz/src/index.ts`
- `apps/api/src/context.ts`
- `apps/api/src/app.ts`
