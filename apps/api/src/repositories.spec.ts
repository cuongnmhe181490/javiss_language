import { describe, expect, it } from "vitest";

import { adminUserId, tenantAlphaId, tenantBetaId } from "./fixtures.js";
import { createInMemoryRepositories } from "./repositories.js";

describe("repository tenant boundaries", () => {
  it("does not return tenant B audit rows when querying tenant A", async () => {
    const repositories = createInMemoryRepositories();
    await repositories.auditEvents.append({
      id: crypto.randomUUID(),
      tenantId: tenantBetaId,
      actorId: adminUserId,
      actorRole: "tenant_admin",
      action: "audit:export",
      resourceType: "audit_event",
      resourceId: "export_1",
      outcome: "success",
      requestId: "req_1",
      metadata: {},
      createdAt: new Date("2026-04-27T10:00:00.000Z"),
    });

    const result = await repositories.auditEvents.listByTenant(tenantAlphaId, {
      page: 1,
      pageSize: 20,
    });

    expect(result.data.every((event) => event.tenantId === tenantAlphaId)).toBe(true);
  });

  it("filters audit rows by action and outcome", async () => {
    const repositories = createInMemoryRepositories();
    await repositories.auditEvents.append({
      id: crypto.randomUUID(),
      tenantId: tenantAlphaId,
      actorId: adminUserId,
      actorRole: "security_auditor",
      action: "audit:export",
      resourceType: "audit_event",
      resourceId: "export_1",
      outcome: "denied",
      requestId: "req_1",
      metadata: {},
      createdAt: new Date("2026-04-27T10:00:00.000Z"),
    });

    await expect(
      repositories.auditEvents.listByTenant(tenantAlphaId, {
        action: "audit:export",
        outcome: "denied",
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toMatchObject({
      data: [expect.objectContaining({ action: "audit:export", outcome: "denied" })],
      total: 1,
    });
  });
});
