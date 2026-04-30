import type { Actor, Permission } from "@polyglot/contracts";
import { authorize } from "@polyglot/authz";

import type { AuthProvider } from "./auth-provider.js";
import type { ApiConfig } from "./config.js";
import { ApiHttpError } from "./errors.js";

export type RequestContext = {
  actor: Actor | null;
  authMode: "dev-header" | "oidc" | "missing";
  crossTenantJustification?: string;
  ip?: string;
  origin?: string;
  requestId: string;
  userAgent?: string;
};

export async function createRequestContext(
  request: Request,
  authProvider: AuthProvider,
): Promise<RequestContext> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const actor = await authProvider.authenticate(request);

  return {
    actor,
    authMode: actor ? authProvider.name : "missing",
    crossTenantJustification:
      request.headers.get("x-cross-tenant-justification")?.trim() || undefined,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    origin: request.headers.get("origin") ?? undefined,
    requestId,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}

export function requirePermission(
  context: RequestContext,
  input: {
    permission: Permission;
    tenantId: string;
    resourceTenantId?: string;
    allowCrossTenant?: boolean;
    crossTenantJustification?: string;
    config: Pick<ApiConfig, "auditExportStepUpTtlSeconds">;
    now?: Date;
  },
): Actor {
  const decision = authorize({
    actor: context.actor,
    permission: input.permission,
    tenantId: input.tenantId,
    resourceTenantId: input.resourceTenantId,
    allowCrossTenant: input.allowCrossTenant,
    crossTenantJustification: input.crossTenantJustification,
    now: input.now,
    stepUpTtlMs: input.config.auditExportStepUpTtlSeconds * 1000,
  });

  if (decision.allowed && context.actor) {
    return context.actor;
  }

  if (decision.reason === "missing_actor") {
    throw new ApiHttpError(401, "auth.missing_actor", "Authentication is required.", {
      authMode: context.authMode,
    });
  }

  if (decision.reason === "step_up_required") {
    throw new ApiHttpError(403, "auth.step_up_required", "Step-up MFA is required.", {
      requiredStepUp: true,
      permission: input.permission,
    });
  }

  throw new ApiHttpError(403, `auth.${decision.reason}`, "Access denied.", {
    reason: decision.reason,
    permission: input.permission,
  });
}
