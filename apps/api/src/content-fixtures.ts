import { adminUserId, tenantAlphaId, tenantBetaId } from "./fixtures.js";
import {
  sampleContentItemAlphaId,
  sampleContentSourceAlphaId,
  sampleContentSourceBetaId,
  sampleContentVersionAlphaId,
  type ContentItemRecord,
  type ContentSourceRecord,
  type ContentVersionRecord,
} from "./content-domain.js";

const now = new Date("2026-04-27T09:00:00.000Z");

export const seedContentSources: ContentSourceRecord[] = [
  {
    id: sampleContentSourceAlphaId,
    tenantId: tenantAlphaId,
    sourceName: "Hospitality English Seed Pack",
    sourceType: "document",
    reference: "seed://hospitality-english-pack",
    licenseType: "tenant_owned",
    allowedUsage: ["display", "retrieval", "eval", "reference"],
    commercialAllowed: true,
    attributionRequired: false,
    status: "approved",
    createdBy: adminUserId,
    reviewedBy: adminUserId,
    approvedAt: now,
    metadata: {
      lineage: "seed",
      qualityTier: "gold",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: sampleContentSourceBetaId,
    tenantId: tenantBetaId,
    sourceName: "Kansai Retail Seed Pack",
    sourceType: "document",
    reference: "seed://kansai-retail-pack",
    licenseType: "tenant_owned",
    allowedUsage: ["display", "retrieval", "eval", "reference"],
    commercialAllowed: true,
    attributionRequired: false,
    status: "approved",
    createdBy: adminUserId,
    reviewedBy: adminUserId,
    approvedAt: now,
    metadata: {
      lineage: "seed",
      qualityTier: "gold",
    },
    createdAt: now,
    updatedAt: now,
  },
];

export const seedContentItems: ContentItemRecord[] = [
  {
    id: sampleContentItemAlphaId,
    tenantId: tenantAlphaId,
    type: "lesson",
    title: "Greeting a guest source draft",
    slug: "greeting-a-guest-source-draft",
    language: "en",
    level: "A1",
    status: "published",
    currentVersion: 1,
    createdBy: adminUserId,
    publishedAt: now,
    metadata: {
      linkedLessonSlug: "greeting-a-guest",
    },
    createdAt: now,
    updatedAt: now,
  },
];

export const seedContentVersions: ContentVersionRecord[] = [
  {
    id: sampleContentVersionAlphaId,
    tenantId: tenantAlphaId,
    contentItemId: sampleContentItemAlphaId,
    version: 1,
    status: "published",
    body: {
      objective: "Learner can greet a guest politely.",
      blocks: ["short greeting", "role introduction", "follow-up question"],
    },
    sourceIds: [sampleContentSourceAlphaId],
    validation: {
      license: "passed",
      level: "A1",
    },
    aiQa: {
      status: "passed",
      checks: ["level", "tone", "license"],
    },
    changeSummary: "Seeded first publishable lesson content.",
    createdBy: adminUserId,
    reviewedBy: adminUserId,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];
