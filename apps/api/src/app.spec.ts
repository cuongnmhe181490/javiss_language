import { describe, expect, it } from "vitest";

import { createDefaultAiOrchestrator } from "./ai-orchestrator.js";
import { DevHeaderAuthProvider } from "./auth-provider.js";
import { handleApiRequest, type ApiDependencies } from "./app.js";
import { createTestApiConfig, type ApiConfig } from "./config.js";
import {
  adminUserId,
  learnerUserId,
  superAdminUserId,
  tenantAlphaId,
  tenantBetaId,
} from "./fixtures.js";
import { createJsonLogger } from "./logging.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";
import { createInMemoryRepositories } from "./repositories.js";

const missingTenantId = "99999999-9999-4999-8999-999999999999";

describe("health endpoints", () => {
  it("returns live health without requiring tenant context", async () => {
    const response = await handleApiRequest(new Request("http://api.test/health/live"), deps());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      checks: {
        process: "ok",
      },
      service: "polyglot-api",
      status: "ok",
      version: "test",
    });
  });

  it("returns readiness checks without exposing secret config", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/health/ready"),
      deps({
        config: createTestApiConfig({
          databaseUrl: "postgres://user:secret-password@example.com:5432/polyglot",
        }),
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("repositories");
    expect(body).not.toContain("secret-password");
  });

  it("returns degraded/error readiness when a dependency reports failure", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/health/ready"),
      deps({
        readinessChecks: async () => ({
          database: { status: "error" },
          redis: { status: "ok" },
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      checks: {
        database: { status: "error" },
      },
      status: "error",
    });
  });

  it("keeps /health as a compatibility alias", async () => {
    const response = await handleApiRequest(new Request("http://api.test/health"), deps());

    expect(response.status).toBe(200);
  });
});

describe("error format and security headers", () => {
  it("returns a standardized error when actor context is missing", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        headers: {
          "x-request-id": "req_missing_actor",
        },
      }),
      deps(),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("req_missing_actor");
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.missing_actor",
        details: {
          authMode: "missing",
        },
        message: "Authentication is required.",
        requestId: "req_missing_actor",
      },
    });
  });

  it("returns field-level validation details for invalid tenant context", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/tenants/not-a-uuid", {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "tenant_context.invalid",
        details: {
          fields: [
            {
              path: "tenantId",
            },
          ],
        },
      },
    });
  });

  it("fails closed when the tenant context is missing", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/tenants", {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "tenant_context.missing",
      },
    });
  });

  it("returns not found errors using the same envelope", async () => {
    const response = await handleApiRequest(new Request("http://api.test/v1/unknown"), deps());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "route.not_found",
        details: {},
      },
    });
  });

  it("returns method errors using the same envelope", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "route.method_not_allowed",
      },
    });
  });

  it("does not leak internal stack traces on unhandled failures", async () => {
    const brokenDeps = deps();
    brokenDeps.repositories.tenants.findById = () => {
      throw new Error("database password leaked in stack");
    };

    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      brokenDeps,
    );
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain("internal.unhandled");
    expect(body).not.toContain("database password");
    expect(body).not.toContain("stack");
  });

  it("applies security headers and a strict CORS allowlist", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/health/live", {
        headers: {
          origin: "http://localhost:3000",
        },
      }),
      deps(),
    );

    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-security-policy")).toContain("default-src 'none'");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("does not reflect disallowed CORS origins", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/health/live", {
        headers: {
          origin: "https://evil.example",
        },
      }),
      deps(),
    );

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("rejects oversized requests before route handling", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export`, {
        method: "POST",
        headers: {
          ...actorHeaderObject({
            tenantId: tenantAlphaId,
            userId: adminUserId,
            roles: "security_auditor",
          }),
          "content-length": "2048",
        },
      }),
      deps({
        config: createTestApiConfig({
          maxBodyBytes: 1024,
        }),
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "request.body_too_large",
      },
    });
  });

  it("returns a standardized rate-limit error", async () => {
    const dependencies = deps({
      config: createTestApiConfig({
        rateLimitMax: 1,
      }),
    });
    const request = () =>
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      });

    expect((await handleApiRequest(request(), dependencies)).status).toBe(200);
    const response = await handleApiRequest(request(), dependencies);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "RATE_LIMITED",
      },
    });
  });
});

describe("tenant context and RBAC/ABAC", () => {
  it("allows a tenant admin to read their own tenant", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        id: tenantAlphaId,
        plan: "enterprise",
      },
    });
  });

  it("denies cross-tenant access by default", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.tenant_mismatch",
      },
    });
  });

  it("allows audited super admin cross-tenant tenant reads only with justification", async () => {
    const dependencies = deps();
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}`, {
        headers: actorHeaders({
          crossTenantJustification: "Break-glass tenant support ticket PA-1001",
          tenantId: tenantAlphaId,
          userId: superAdminUserId,
          roles: "super_admin",
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        id: tenantBetaId,
        name: "Kansai Retail Language Lab",
      },
    });
    await expect(
      dependencies.repositories.auditEvents.listByTenant(tenantBetaId, {
        action: "tenant:read",
        outcome: "success",
        page: 1,
        pageSize: 20,
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "tenant:read",
          actorId: superAdminUserId,
          outcome: "success",
          tenantId: tenantBetaId,
        }),
      ],
      total: 1,
    });
  });

  it("blocks and audits super admin cross-tenant access without justification", async () => {
    const dependencies = deps();
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: superAdminUserId,
          roles: "super_admin",
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.missing_cross_tenant_justification",
      },
    });
    await expect(
      dependencies.repositories.auditEvents.listByTenant(tenantBetaId, {
        action: "tenant:read",
        outcome: "denied",
        page: 1,
        pageSize: 20,
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "tenant:read",
          actorId: superAdminUserId,
          outcome: "denied",
          tenantId: tenantBetaId,
        }),
      ],
      total: 1,
    });
  });

  it("blocks super admin cross-tenant routes without explicit allow and keeps security auditor scoped", async () => {
    const dependencies = deps();
    const superAdminDenied = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          crossTenantJustification: "Break-glass tenant support ticket PA-1002",
          tenantId: tenantAlphaId,
          userId: superAdminUserId,
          roles: "super_admin",
        }),
      }),
      dependencies,
    );
    const auditorDenied = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}`, {
        headers: actorHeaders({
          crossTenantJustification: "Auditor is not super admin",
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
        }),
      }),
      dependencies,
    );

    expect(superAdminDenied.status).toBe(403);
    await expect(superAdminDenied.json()).resolves.toMatchObject({
      error: {
        code: "auth.tenant_mismatch",
      },
    });
    expect(auditorDenied.status).toBe(403);
    await expect(auditorDenied.json()).resolves.toMatchObject({
      error: {
        code: "auth.tenant_mismatch",
      },
    });
    await expect(
      dependencies.repositories.auditEvents.listByTenant(tenantBetaId, {
        action: "audit:export",
        outcome: "denied",
        page: 1,
        pageSize: 20,
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "audit:export",
          actorId: superAdminUserId,
          outcome: "denied",
          tenantId: tenantBetaId,
        }),
      ],
      total: 1,
    });
  });

  it("blocks actors with partial or invalid tenant membership headers", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        headers: {
          "x-dev-user-id": adminUserId,
          "x-dev-roles": "tenant_admin",
        },
      }),
      deps(),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.invalid_dev_actor",
      },
    });
  });

  it("returns tenant-not-found only after tenant authorization passes", async () => {
    const dependencies = deps();
    dependencies.repositories.tenants.findById = async () => null;

    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "tenant.not_found",
      },
    });
  });

  it("blocks actors without tenant membership", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${missingTenantId}`, {
        headers: actorHeaders({
          tenantId: missingTenantId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.tenant_membership_required",
      },
    });
  });

  it("keeps learners away from audit reports inside the same tenant", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.missing_permission",
      },
    });
  });

  it("allows a security auditor to list audit events within the same tenant", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      page: 1,
      pageSize: 20,
      total: 1,
    });
  });
});

describe("audit logging foundation", () => {
  it("requires fresh step-up MFA before exporting audit events", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.step_up_required",
        details: {
          permission: "audit:export",
          requiredStepUp: true,
        },
      },
    });
  });

  it("audits denied sensitive actions", async () => {
    const dependencies = deps();

    await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
        }),
      }),
      dependencies,
    );

    const response = await handleApiRequest(
      new Request(
        `http://api.test/v1/tenants/${tenantAlphaId}/audit-events?action=audit:export&outcome=denied`,
        {
          headers: actorHeaders({
            tenantId: tenantAlphaId,
            userId: adminUserId,
            roles: "security_auditor",
          }),
        },
      ),
      dependencies,
    );

    await expect(response.json()).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "audit:export",
          outcome: "denied",
        }),
      ],
      total: 1,
    });
  });

  it("queues an audit export and writes a success audit event after step-up MFA", async () => {
    const dependencies = deps();
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export?format=csv`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
          mfaVerifiedAt: new Date("2026-04-27T10:00:00.000Z").toISOString(),
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        format: "csv",
        status: "queued",
      },
    });

    const auditResponse = await handleApiRequest(
      new Request(
        `http://api.test/v1/tenants/${tenantAlphaId}/audit-events?action=audit:export&outcome=success`,
        {
          headers: actorHeaders({
            tenantId: tenantAlphaId,
            userId: adminUserId,
            roles: "security_auditor",
          }),
        },
      ),
      dependencies,
    );

    await expect(auditResponse.json()).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "audit:export",
          actorId: adminUserId,
          actorRole: "security_auditor",
          metadata: expect.objectContaining({
            format: "csv",
          }),
          outcome: "success",
          requestId: expect.any(String),
          tenantId: tenantAlphaId,
        }),
      ],
      total: 1,
    });
  });

  it("accepts a persisted valid step-up session for audit export", async () => {
    const dependencies = deps();
    await dependencies.repositories.stepUps.create({
      id: crypto.randomUUID(),
      tenantId: tenantAlphaId,
      userId: adminUserId,
      method: "totp",
      createdAt: new Date("2026-04-27T09:59:00.000Z"),
      expiresAt: new Date("2026-04-27T10:05:00.000Z"),
    });

    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(202);
  });

  it("rejects an expired persisted step-up session for audit export", async () => {
    const dependencies = deps();
    await dependencies.repositories.stepUps.create({
      id: crypto.randomUUID(),
      tenantId: tenantAlphaId,
      userId: adminUserId,
      method: "totp",
      createdAt: new Date("2026-04-27T09:00:00.000Z"),
      expiresAt: new Date("2026-04-27T09:30:00.000Z"),
    });

    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.step_up_required",
      },
    });
  });

  it("supports audit pagination and action/outcome filters", async () => {
    const dependencies = deps();

    await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantAlphaId}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "security_auditor",
          mfaVerifiedAt: new Date("2026-04-27T10:00:00.000Z").toISOString(),
        }),
      }),
      dependencies,
    );

    const response = await handleApiRequest(
      new Request(
        `http://api.test/v1/tenants/${tenantAlphaId}/audit-events?action=audit:export&outcome=success&page=1&pageSize=1`,
        {
          headers: actorHeaders({
            tenantId: tenantAlphaId,
            userId: adminUserId,
            roles: "security_auditor",
          }),
        },
      ),
      dependencies,
    );

    await expect(response.json()).resolves.toMatchObject({
      data: [expect.objectContaining({ action: "audit:export", outcome: "success" })],
      page: 1,
      pageSize: 1,
      total: 1,
    });
  });
});

function deps(
  input: { config?: ApiConfig; readinessChecks?: ApiDependencies["readinessChecks"] } = {},
): ApiDependencies {
  const config = input.config ?? createTestApiConfig();

  return {
    aiOrchestrator: createDefaultAiOrchestrator(),
    authProvider: new DevHeaderAuthProvider(),
    config,
    logger: createJsonLogger({ logLevel: "error" }, () => undefined),
    rateLimiter: createInMemoryRateLimiter(config),
    readinessChecks:
      input.readinessChecks ??
      (async () => ({
        api: { status: "ok" },
        repositories: { status: "ok" },
      })),
    repositories: createInMemoryRepositories(),
    now: () => new Date("2026-04-27T10:00:00.000Z"),
    randomId: () => crypto.randomUUID(),
  };
}

function actorHeaders(input: {
  crossTenantJustification?: string;
  tenantId: string;
  userId: string;
  roles: string;
  mfaVerifiedAt?: string;
}): Headers {
  return new Headers(actorHeaderObject(input));
}

function actorHeaderObject(input: {
  crossTenantJustification?: string;
  tenantId: string;
  userId: string;
  roles: string;
  mfaVerifiedAt?: string;
}): Record<string, string> {
  const headers: Record<string, string> = {
    "x-dev-tenant-id": input.tenantId,
    "x-dev-user-id": input.userId,
    "x-dev-roles": input.roles,
  };

  if (input.mfaVerifiedAt) {
    headers["x-dev-mfa-verified-at"] = input.mfaVerifiedAt;
  }

  if (input.crossTenantJustification) {
    headers["x-cross-tenant-justification"] = input.crossTenantJustification;
  }

  return headers;
}
