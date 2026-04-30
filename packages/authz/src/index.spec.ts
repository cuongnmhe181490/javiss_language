import { describe, expect, it } from "vitest";

import type { Actor } from "@polyglot/contracts";
import { authorize } from "./index";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";

function actor(overrides: Partial<Actor> = {}): Actor {
  return {
    userId,
    tenantId: tenantA,
    roles: ["tenant_admin"],
    groupIds: [],
    ...overrides,
  };
}

describe("authorize", () => {
  it("allows a tenant admin to update branding inside the same tenant", () => {
    expect(
      authorize({
        actor: actor(),
        tenantId: tenantA,
        permission: "tenant_branding:update",
      }),
    ).toEqual({ allowed: true, reason: "allowed" });
  });

  it("denies cross-tenant access even when the role has the permission", () => {
    expect(
      authorize({
        actor: actor(),
        tenantId: tenantB,
        resourceTenantId: tenantB,
        permission: "tenant_branding:update",
      }),
    ).toMatchObject({ allowed: false, reason: "tenant_mismatch" });
  });

  it("denies super admin cross-tenant access without explicit justification", () => {
    expect(
      authorize({
        actor: actor({ roles: ["super_admin"] }),
        tenantId: tenantB,
        resourceTenantId: tenantB,
        permission: "audit:list",
        allowCrossTenant: true,
      }),
    ).toMatchObject({ allowed: false, reason: "missing_cross_tenant_justification" });
  });

  it("allows super admin cross-tenant access only with explicit override and justification", () => {
    expect(
      authorize({
        actor: actor({ roles: ["super_admin"] }),
        tenantId: tenantB,
        resourceTenantId: tenantB,
        permission: "audit:list",
        allowCrossTenant: true,
        crossTenantJustification: "Customer support ticket SEC-123",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("denies permissions not granted by the actor role", () => {
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "audit:list",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows learners to read courses and update only their own progress permission surface", () => {
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "course:list",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "progress:update_own",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("denies learner course creation", () => {
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "course:create",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows tenant admins to publish learning content", () => {
    expect(
      authorize({
        actor: actor({ roles: ["tenant_admin"] }),
        tenantId: tenantA,
        permission: "course:publish",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("allows only tenant admins or super admins to sync published content into runtime lessons", () => {
    expect(
      authorize({
        actor: actor({ roles: ["tenant_admin"] }),
        tenantId: tenantA,
        permission: "content:sync_learning",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
    expect(
      authorize({
        actor: actor({ roles: ["content_editor"] }),
        tenantId: tenantA,
        permission: "content:sync_learning",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("keeps content editors from publishing", () => {
    expect(
      authorize({
        actor: actor({ roles: ["content_editor"] }),
        tenantId: tenantA,
        permission: "content:publish",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows content editors to write source registry records but not approve them", () => {
    expect(
      authorize({
        actor: actor({ roles: ["content_editor"] }),
        tenantId: tenantA,
        permission: "source:write",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
    expect(
      authorize({
        actor: actor({ roles: ["content_editor"] }),
        tenantId: tenantA,
        permission: "source:approve",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows tenant admins to approve sources for publishing workflows", () => {
    expect(
      authorize({
        actor: actor({ roles: ["tenant_admin"] }),
        tenantId: tenantA,
        permission: "source:approve",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("keeps security auditors away from content management", () => {
    expect(
      authorize({
        actor: actor({ roles: ["security_auditor"] }),
        tenantId: tenantA,
        permission: "lesson:update",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows learners to chat with the AI tutor", () => {
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "ai_tutor:chat",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("keeps security auditors away from AI tutor chat", () => {
    expect(
      authorize({
        actor: actor({ roles: ["security_auditor"] }),
        tenantId: tenantA,
        permission: "ai_tutor:chat",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows tenant admins to manage AI conversations and prompts", () => {
    expect(
      authorize({
        actor: actor({ roles: ["tenant_admin"] }),
        tenantId: tenantA,
        permission: "ai_conversation:manage",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
    expect(
      authorize({
        actor: actor({ roles: ["tenant_admin"] }),
        tenantId: tenantA,
        permission: "prompt:approve",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("allows learners to create and use their own speaking sessions", () => {
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "speaking_session:create",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
    expect(
      authorize({
        actor: actor({ roles: ["learner"] }),
        tenantId: tenantA,
        permission: "speaking_session:text_fallback",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("keeps security auditors away from speaking session control", () => {
    expect(
      authorize({
        actor: actor({ roles: ["security_auditor"] }),
        tenantId: tenantA,
        permission: "speaking_session:create",
      }),
    ).toMatchObject({ allowed: false, reason: "missing_permission" });
  });

  it("allows tenant admins to manage speaking sessions", () => {
    expect(
      authorize({
        actor: actor({ roles: ["tenant_admin"] }),
        tenantId: tenantA,
        permission: "speaking_session:manage",
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });

  it("requires fresh MFA for tenant policy changes", () => {
    expect(
      authorize({
        actor: actor(),
        tenantId: tenantA,
        permission: "tenant_policy:update",
      }),
    ).toMatchObject({ allowed: false, reason: "step_up_required", requiredStepUp: true });
  });

  it("accepts fresh MFA for step-up protected actions", () => {
    const now = new Date("2026-04-27T10:00:00.000Z");

    expect(
      authorize({
        actor: actor({ mfaVerifiedAt: new Date("2026-04-27T09:55:00.000Z") }),
        tenantId: tenantA,
        permission: "tenant_policy:update",
        now,
      }),
    ).toMatchObject({ allowed: true, reason: "allowed" });
  });
});
