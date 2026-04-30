import type { Actor, Permission, Role } from "@polyglot/contracts";

export type AuthorizationReason =
  | "allowed"
  | "missing_actor"
  | "tenant_mismatch"
  | "missing_permission"
  | "step_up_required"
  | "missing_cross_tenant_justification";

export type AuthorizationDecision = {
  allowed: boolean;
  reason: AuthorizationReason;
  requiredStepUp?: boolean;
};

export type AuthorizeInput = {
  actor: Actor | null | undefined;
  permission: Permission;
  tenantId: string;
  resourceTenantId?: string;
  allowCrossTenant?: boolean;
  crossTenantJustification?: string;
  now?: Date;
  stepUpTtlMs?: number;
};

const TEN_MINUTES_MS = 10 * 60 * 1000;

export const rolePermissions: Readonly<Record<Role, readonly Permission[]>> = {
  super_admin: [
    "tenant:read",
    "tenant_branding:update",
    "tenant_policy:update",
    "sso_config:update",
    "scim_config:update",
    "user:read_basic",
    "user:manage",
    "group:list",
    "group:manage",
    "assignment:list",
    "assignment:read",
    "assignment:create",
    "assignment:update",
    "assignment:manage",
    "analytics:read",
    "audit:list",
    "audit:export",
    "data:export",
    "content:read",
    "content:create",
    "content:update",
    "content:review",
    "content:publish",
    "content:rollback",
    "content:sync_learning",
    "course:list",
    "course:read",
    "course:create",
    "course:update",
    "course:publish",
    "course:archive",
    "lesson:read",
    "lesson:create",
    "lesson:update",
    "lesson:publish",
    "lesson:start",
    "lesson:complete",
    "progress:read_own",
    "progress:read_team",
    "progress:update_own",
    "source:read",
    "source:write",
    "source:approve",
    "agent:read",
    "agent:write",
    "agent:eval",
    "ai_tutor:chat",
    "ai_conversation:read_own",
    "ai_conversation:manage",
    "prompt:read",
    "prompt:write",
    "prompt:approve",
    "glossary:read",
    "glossary:write",
    "document:read",
    "document:write",
    "speaking_session:create",
    "speaking_session:read_own",
    "speaking_session:end_own",
    "speaking_session:text_fallback",
    "speaking_session:manage",
    "speaking_report:read",
    "learner_profile:read",
    "learner_profile:write",
    "transcript:read_sensitive",
    "audio:download",
  ],
  tenant_admin: [
    "tenant:read",
    "tenant_branding:update",
    "tenant_policy:update",
    "sso_config:update",
    "scim_config:update",
    "user:read_basic",
    "user:manage",
    "group:list",
    "group:manage",
    "assignment:list",
    "assignment:read",
    "assignment:create",
    "assignment:update",
    "assignment:manage",
    "analytics:read",
    "audit:list",
    "content:read",
    "content:create",
    "content:update",
    "content:review",
    "content:publish",
    "content:rollback",
    "content:sync_learning",
    "course:list",
    "course:read",
    "course:create",
    "course:update",
    "course:publish",
    "course:archive",
    "lesson:read",
    "lesson:create",
    "lesson:update",
    "lesson:publish",
    "progress:read_team",
    "source:read",
    "source:write",
    "source:approve",
    "agent:read",
    "agent:write",
    "agent:eval",
    "ai_tutor:chat",
    "ai_conversation:read_own",
    "ai_conversation:manage",
    "prompt:read",
    "prompt:write",
    "prompt:approve",
    "glossary:read",
    "glossary:write",
    "document:read",
    "document:write",
    "speaking_session:create",
    "speaking_session:read_own",
    "speaking_session:end_own",
    "speaking_session:text_fallback",
    "speaking_session:manage",
    "speaking_report:read",
  ],
  lnd_manager: [
    "tenant:read",
    "user:read_basic",
    "group:list",
    "assignment:list",
    "assignment:read",
    "assignment:create",
    "assignment:update",
    "assignment:manage",
    "analytics:read",
    "content:read",
    "course:list",
    "course:read",
    "progress:read_team",
    "agent:read",
    "ai_conversation:manage",
    "glossary:read",
    "speaking_session:manage",
    "speaking_report:read",
  ],
  content_editor: [
    "tenant:read",
    "content:read",
    "content:create",
    "content:update",
    "course:list",
    "course:read",
    "course:create",
    "course:update",
    "lesson:read",
    "lesson:create",
    "lesson:update",
    "agent:read",
    "prompt:read",
    "source:read",
    "source:write",
    "glossary:read",
    "glossary:write",
  ],
  linguist_reviewer: [
    "tenant:read",
    "content:read",
    "content:review",
    "course:list",
    "course:read",
    "lesson:read",
    "agent:read",
    "prompt:read",
    "source:read",
  ],
  teacher: [
    "tenant:read",
    "content:read",
    "assignment:list",
    "assignment:read",
    "analytics:read",
    "course:list",
    "course:read",
    "lesson:read",
    "progress:read_team",
    "agent:read",
    "ai_conversation:manage",
    "speaking_session:manage",
    "speaking_report:read",
  ],
  learner: [
    "tenant:read",
    "content:read",
    "assignment:read",
    "course:list",
    "course:read",
    "lesson:read",
    "lesson:start",
    "lesson:complete",
    "progress:read_own",
    "progress:update_own",
    "agent:read",
    "ai_tutor:chat",
    "ai_conversation:read_own",
    "speaking_session:create",
    "speaking_session:read_own",
    "speaking_session:end_own",
    "speaking_session:text_fallback",
    "speaking_report:read",
    "learner_profile:read",
    "learner_profile:write",
  ],
  support: ["tenant:read", "user:read_basic", "audit:list"],
  security_auditor: ["tenant:read", "audit:list", "audit:export"],
  data_protection_officer: [
    "tenant:read",
    "tenant_policy:update",
    "audit:list",
    "audit:export",
    "data:export",
    "document:read",
    "transcript:read_sensitive",
    "audio:download",
  ],
};

export const stepUpPermissions = new Set<Permission>([
  "audit:export",
  "data:export",
  "tenant_policy:update",
  "sso_config:update",
  "scim_config:update",
  "transcript:read_sensitive",
  "audio:download",
]);

export function hasPermission(actor: Actor, permission: Permission): boolean {
  return actor.roles.some((role) => rolePermissions[role].includes(permission));
}

export function hasFreshStepUp(actor: Actor, now = new Date(), ttlMs = TEN_MINUTES_MS): boolean {
  if (!actor.mfaVerifiedAt) {
    return false;
  }

  return now.getTime() - actor.mfaVerifiedAt.getTime() <= ttlMs;
}

export function authorize(input: AuthorizeInput): AuthorizationDecision {
  const { actor, permission, tenantId, resourceTenantId = tenantId } = input;

  if (!actor) {
    return { allowed: false, reason: "missing_actor" };
  }

  const sameTenant = actor.tenantId === tenantId && tenantId === resourceTenantId;
  const isSuperAdmin = actor.roles.includes("super_admin");
  const crossTenantAllowed =
    isSuperAdmin && input.allowCrossTenant === true && Boolean(input.crossTenantJustification);

  if (!sameTenant && !crossTenantAllowed) {
    return {
      allowed: false,
      reason:
        isSuperAdmin && input.allowCrossTenant
          ? "missing_cross_tenant_justification"
          : "tenant_mismatch",
    };
  }

  if (!hasPermission(actor, permission)) {
    return { allowed: false, reason: "missing_permission" };
  }

  if (stepUpPermissions.has(permission) && !hasFreshStepUp(actor, input.now, input.stepUpTtlMs)) {
    return { allowed: false, reason: "step_up_required", requiredStepUp: true };
  }

  return { allowed: true, reason: "allowed" };
}

export function requireAuthorization(input: AuthorizeInput): void {
  const decision = authorize(input);

  if (!decision.allowed) {
    throw new AuthorizationError(decision.reason, decision.requiredStepUp);
  }
}

export class AuthorizationError extends Error {
  constructor(
    public readonly reason: AuthorizationReason,
    public readonly requiredStepUp = false,
  ) {
    super(`Authorization denied: ${reason}`);
    this.name = "AuthorizationError";
  }
}
