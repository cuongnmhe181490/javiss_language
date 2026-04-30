import { z } from "zod";

import { learningLanguageSchema, paginationSchema, slugSchema } from "./learning-domain.js";

export const sourceAllowedUsageSchema = z.enum([
  "display",
  "retrieval",
  "train",
  "eval",
  "reference",
]);
export const sourceLicenseTypeSchema = z.enum([
  "public_domain",
  "creative_commons",
  "commercial_license",
  "tenant_owned",
  "open_content",
  "unknown",
]);
export const sourceStatusSchema = z.enum([
  "draft",
  "pending_review",
  "approved",
  "blocked",
  "expired",
]);
export const contentItemTypeSchema = z.enum([
  "lesson",
  "vocabulary",
  "grammar",
  "assessment",
  "rubric",
  "prompt",
  "source_note",
]);
export const contentItemStatusSchema = z.enum(["draft", "review", "published", "archived"]);
export const contentVersionStatusSchema = z.enum([
  "draft",
  "review",
  "approved",
  "published",
  "rejected",
  "rolled_back",
]);
export const contentReviewActionSchema = z.enum([
  "ai_qa",
  "submit_review",
  "approve",
  "reject",
  "publish",
  "rollback",
  "sync_learning",
]);

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const sourceListQuerySchema = paginationSchema.extend({
  licenseType: sourceLicenseTypeSchema.optional(),
  status: sourceStatusSchema.optional(),
});

export const createContentSourceSchema = z.object({
  sourceName: z.string().min(2).max(180),
  sourceType: z.string().min(2).max(80).default("document"),
  reference: z.string().min(3).max(500),
  licenseType: sourceLicenseTypeSchema,
  allowedUsage: z.array(sourceAllowedUsageSchema).min(1).max(5),
  commercialAllowed: z.boolean().default(false),
  attributionRequired: z.boolean().default(false),
  attributionText: z.string().min(1).max(1000).optional(),
  expirationDate: z.coerce.date().optional(),
  dataResidencyConstraint: z.string().min(2).max(40).optional(),
  metadata: jsonObjectSchema.default({}),
});

export const updateContentSourceSchema = createContentSourceSchema.partial();

export const contentListQuerySchema = paginationSchema.extend({
  status: contentItemStatusSchema.optional(),
  type: contentItemTypeSchema.optional(),
});

export const createContentItemSchema = z.object({
  type: contentItemTypeSchema,
  title: z.string().min(2).max(180),
  slug: slugSchema,
  language: learningLanguageSchema.optional(),
  level: z.string().min(1).max(40).optional(),
  metadata: jsonObjectSchema.default({}),
});

export const createContentVersionSchema = z.object({
  body: jsonObjectSchema,
  sourceIds: z.array(z.string().uuid()).max(25).default([]),
  changeSummary: z.string().min(1).max(1000).optional(),
});

export const submitContentReviewSchema = z.object({
  versionId: z.string().uuid(),
  comments: z.string().max(2000).optional(),
});

export const contentReviewDecisionSchema = z.object({
  comments: z.string().max(2000).optional(),
});

export const syncPublishedContentSchema = z.object({
  lessonId: z.string().uuid().optional(),
  publishLesson: z.boolean().default(false),
});

export type SourceAllowedUsage = z.infer<typeof sourceAllowedUsageSchema>;
export type SourceLicenseType = z.infer<typeof sourceLicenseTypeSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type ContentItemType = z.infer<typeof contentItemTypeSchema>;
export type ContentItemStatus = z.infer<typeof contentItemStatusSchema>;
export type ContentVersionStatus = z.infer<typeof contentVersionStatusSchema>;
export type ContentReviewAction = z.infer<typeof contentReviewActionSchema>;
export type SourceListQuery = z.infer<typeof sourceListQuerySchema>;
export type CreateContentSourceInput = z.infer<typeof createContentSourceSchema>;
export type UpdateContentSourceInput = z.infer<typeof updateContentSourceSchema>;
export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
export type CreateContentItemInput = z.infer<typeof createContentItemSchema>;
export type CreateContentVersionInput = z.infer<typeof createContentVersionSchema>;
export type SyncPublishedContentInput = z.infer<typeof syncPublishedContentSchema>;

export type ContentSourceRecord = {
  id: string;
  tenantId: string;
  sourceName: string;
  sourceType: string;
  reference: string;
  licenseType: SourceLicenseType;
  allowedUsage: SourceAllowedUsage[];
  commercialAllowed: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  expirationDate?: Date;
  dataResidencyConstraint?: string;
  status: SourceStatus;
  createdBy?: string;
  reviewedBy?: string;
  approvedAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentItemRecord = {
  id: string;
  tenantId: string;
  type: ContentItemType;
  title: string;
  slug: string;
  language?: string;
  level?: string;
  status: ContentItemStatus;
  currentVersion: number;
  createdBy?: string;
  publishedAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentVersionRecord = {
  id: string;
  tenantId: string;
  contentItemId: string;
  version: number;
  status: ContentVersionStatus;
  body: Record<string, unknown>;
  sourceIds: string[];
  validation: Record<string, unknown>;
  aiQa: Record<string, unknown>;
  changeSummary?: string;
  createdBy?: string;
  reviewedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentReviewEventRecord = {
  id: string;
  tenantId: string;
  contentItemId: string;
  versionId?: string;
  actorId: string;
  action: ContentReviewAction;
  outcome: "success" | "denied" | "failure";
  comments?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export type ContentItemDetail = ContentItemRecord & {
  versions: ContentVersionRecord[];
};

export type ContentReviewQueueItem = ContentVersionRecord & {
  item: ContentItemRecord;
};

export type PaginatedContentResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export const sampleContentSourceAlphaId = "20202020-2020-4202-8202-202020202011";
export const sampleContentSourceBetaId = "20202020-2020-4202-8202-202020202012";
export const sampleContentItemAlphaId = "21212121-2121-4212-8212-212121212111";
export const sampleContentVersionAlphaId = "22222222-2222-4222-8222-222222222211";
