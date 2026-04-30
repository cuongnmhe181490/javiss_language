import type { AuditEvent, Tenant } from "@polyglot/contracts";

export const tenantAlphaId = "11111111-1111-4111-8111-111111111111";
export const tenantBetaId = "22222222-2222-4222-8222-222222222222";
export const learnerUserId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const adminUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const auditorUserId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
export const superAdminUserId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

export const seedTenants: Tenant[] = [
  {
    id: tenantAlphaId,
    name: "Javiss Global Hospitality Academy",
    region: "apac",
    plan: "enterprise",
    dataResidency: "apac",
    featureFlags: {
      speakingRealtime: true,
      tenantAgents: true,
      scimProvisioning: true,
    },
    brandingConfig: {
      primaryColor: "#2563eb",
      accentColor: "#14b8a6",
    },
    retentionPolicy: {
      audioDays: 30,
      transcriptDays: 730,
    },
  },
  {
    id: tenantBetaId,
    name: "Kansai Retail Language Lab",
    region: "jp",
    plan: "business",
    dataResidency: "jp",
    featureFlags: {
      speakingRealtime: true,
      tenantAgents: false,
      scimProvisioning: false,
    },
    brandingConfig: {
      primaryColor: "#7c3aed",
      accentColor: "#f97316",
    },
    retentionPolicy: {
      audioDays: 14,
      transcriptDays: 365,
    },
  },
];

export const seedAuditEvents: AuditEvent[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    tenantId: tenantAlphaId,
    actorId: adminUserId,
    actorRole: "tenant_admin",
    action: "tenant.created",
    resourceType: "tenant",
    resourceId: tenantAlphaId,
    outcome: "success",
    after: {
      plan: "enterprise",
      dataResidency: "apac",
    },
    requestId: "seed-request",
    metadata: {
      source: "seed",
    },
    createdAt: new Date("2026-04-27T09:00:00.000Z"),
  },
];
