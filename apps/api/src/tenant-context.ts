import { z } from "zod";

import { ApiHttpError } from "./errors.js";

export type RequestScope =
  | { kind: "public"; route: "health" | "live" | "ready" }
  | { kind: "tenant"; tenantId: string; suffix: string };

const tenantIdSchema = z.string().uuid();

export function resolveRequestScope(url: URL, actor?: { tenantId: string } | null): RequestScope {
  if (url.pathname === "/health") {
    return { kind: "public", route: "health" };
  }

  if (url.pathname === "/health/live") {
    return { kind: "public", route: "live" };
  }

  if (url.pathname === "/health/ready") {
    return { kind: "public", route: "ready" };
  }

  const tenantMatch = /^\/v1\/tenants(?:\/([^/]+))?(\/.*)?$/.exec(url.pathname);

  if (!tenantMatch) {
    const learningMatch =
      /^\/v1(\/(?:courses|lessons|progress|assignments|admin|ai|speaking)(?:\/.*)?)$/.exec(
        url.pathname,
      );

    if (learningMatch) {
      if (!actor) {
        throw new ApiHttpError(401, "auth.missing_actor", "Authentication is required.", {
          authMode: "missing",
        });
      }

      return {
        kind: "tenant",
        tenantId: actor.tenantId,
        suffix: learningMatch[1]!,
      };
    }

    throw new ApiHttpError(404, "route.not_found", "Route not found.");
  }

  const rawTenantId = tenantMatch[1];

  if (!rawTenantId) {
    throw new ApiHttpError(400, "tenant_context.missing", "Tenant context is required.");
  }

  const parsedTenantId = tenantIdSchema.safeParse(decodeURIComponent(rawTenantId));

  if (!parsedTenantId.success) {
    throw new ApiHttpError(400, "tenant_context.invalid", "Tenant context is invalid.", {
      fields: [
        {
          path: "tenantId",
          message: "Expected tenantId to be a UUID.",
        },
      ],
    });
  }

  return {
    kind: "tenant",
    tenantId: parsedTenantId.data,
    suffix: tenantMatch[2] ?? "",
  };
}
