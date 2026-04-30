import { describe, expect, it } from "vitest";

import type { Actor } from "@polyglot/contracts";
import {
  assertTenantScoped,
  canAccessTenant,
  createAuditEvent,
  createTenantPartitionKey,
  filterTenantResources,
  sanitizeAuditMetadata,
  TenantIsolationError,
} from "./index";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";

const actor: Actor = {
  userId,
  tenantId: tenantA,
  roles: ["learner"],
  groupIds: [],
};

describe("tenant core", () => {
  it("allows access to the actor tenant", () => {
    expect(canAccessTenant(actor, tenantA)).toEqual({ allowed: true, tenantId: tenantA });
  });

  it("denies access to a different tenant", () => {
    expect(canAccessTenant(actor, tenantB)).toEqual({
      allowed: false,
      reason: "tenant_mismatch",
    });
  });

  it("throws a typed isolation error when resource tenant does not match", () => {
    expect(() => assertTenantScoped({ id: "lesson_1", tenantId: tenantB }, tenantA)).toThrow(
      TenantIsolationError,
    );
  });

  it("filters resources by tenant before returning data", () => {
    expect(
      filterTenantResources(
        [
          { id: "one", tenantId: tenantA },
          { id: "two", tenantId: tenantB },
        ],
        tenantA,
      ),
    ).toEqual([{ id: "one", tenantId: tenantA }]);
  });

  it("creates tenant partition keys for object storage and retrieval indexes", () => {
    expect(createTenantPartitionKey(tenantA, "audio", "utterance_1")).toBe(
      `tenant/${tenantA}/audio/utterance_1`,
    );
  });

  it("creates audit events with tenant and actor context", () => {
    expect(
      createAuditEvent({
        id: "44444444-4444-4444-8444-444444444444",
        tenantId: tenantA,
        actorId: userId,
        actorRole: "tenant_admin",
        action: "tenant_branding:update",
        resourceType: "tenant",
        resourceId: tenantA,
        outcome: "success",
        requestId: "req_123",
        metadata: {
          changed: "primaryColor",
        },
        createdAt: new Date("2026-04-27T10:00:00.000Z"),
      }),
    ).toMatchObject({
      tenantId: tenantA,
      actorId: userId,
      actorRole: "tenant_admin",
      action: "tenant_branding:update",
      resourceType: "tenant",
      resourceId: tenantA,
      outcome: "success",
      requestId: "req_123",
      metadata: {
        changed: "primaryColor",
      },
    });
  });

  it("sanitizes sensitive audit metadata keys", () => {
    expect(
      sanitizeAuditMetadata({
        safe: "kept",
        accessToken: "removed",
        nested: {
          api_key: "removed",
          reason: "kept",
        },
        raw_audio_uri: "removed",
      }),
    ).toEqual({
      safe: "kept",
      nested: {
        reason: "kept",
      },
    });
  });
});
