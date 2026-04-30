import { describe, expect, it } from "vitest";

import { adminUserId, tenantAlphaId } from "./fixtures.js";
import { buildRequestSpanAttributes } from "./tracing.js";

describe("OpenTelemetry span attributes", () => {
  it("includes request and tenant attributes without email or token data", () => {
    const attributes = buildRequestSpanAttributes({
      actor: {
        groupIds: [],
        roles: ["tenant_admin"],
        tenantId: tenantAlphaId,
        userId: adminUserId,
      },
      method: "GET",
      requestId: "req_123",
      route: "/v1/tenants/:tenantId",
      status: 200,
    });

    expect(attributes).toMatchObject({
      "actor.id": adminUserId,
      "request.id": "req_123",
      "tenant.id": tenantAlphaId,
    });
    expect(JSON.stringify(attributes)).not.toContain("email");
    expect(JSON.stringify(attributes)).not.toContain("token");
  });
});
