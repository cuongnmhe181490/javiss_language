import { z } from "zod";

export const supportedLanguageSchema = z.enum(["english", "chinese", "japanese", "korean"]);

export const learningGoalSchema = z.enum([
  "communication",
  "exam",
  "study_abroad",
  "work",
  "travel",
]);

export const cefrLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
export const hskLevelSchema = z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6", "HSK7-9"]);
export const jlptLevelSchema = z.enum(["N5", "N4", "N3", "N2", "N1"]);
export const topikLevelSchema = z.enum([
  "TOPIK_I_1",
  "TOPIK_I_2",
  "TOPIK_II_3",
  "TOPIK_II_4",
  "TOPIK_II_5",
  "TOPIK_II_6",
]);

export const onboardingProfileSchema = z.object({
  targetLanguage: supportedLanguageSchema,
  goals: z.array(learningGoalSchema).min(1).max(3),
  initialLevel: z.string().min(1),
  weeklyMinutes: z.number().int().min(30).max(1200),
  interests: z.array(z.string().min(1).max(40)).max(8),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    details: z.array(z.unknown()).default([]),
  }),
});

export const tenantPlanSchema = z.enum(["starter", "business", "enterprise", "regulated"]);
export const tenantRegionSchema = z.enum(["us", "eu", "apac", "jp", "kr", "global"]);
export const tenantDataResidencySchema = z.enum(["us", "eu", "apac", "jp", "kr", "global"]);

export const roleSchema = z.enum([
  "super_admin",
  "tenant_admin",
  "lnd_manager",
  "content_editor",
  "linguist_reviewer",
  "teacher",
  "learner",
  "support",
  "security_auditor",
  "data_protection_officer",
]);

export const permissionSchema = z.enum([
  "tenant:read",
  "tenant_branding:update",
  "tenant_policy:update",
  "sso_config:update",
  "scim_config:update",
  "user:read_basic",
  "user:manage",
  "group:list",
  "group:manage",
  "assignment:list",
  "assignment:read",
  "assignment:create",
  "assignment:update",
  "assignment:manage",
  "analytics:read",
  "audit:list",
  "audit:export",
  "data:export",
  "content:read",
  "content:create",
  "content:review",
  "content:publish",
  "content:rollback",
  "content:sync_learning",
  "content:update",
  "course:list",
  "course:read",
  "course:create",
  "course:update",
  "course:publish",
  "course:archive",
  "lesson:read",
  "lesson:create",
  "lesson:update",
  "lesson:publish",
  "lesson:start",
  "lesson:complete",
  "progress:read_own",
  "progress:read_team",
  "progress:update_own",
  "source:read",
  "source:write",
  "source:approve",
  "agent:read",
  "agent:write",
  "agent:eval",
  "ai_tutor:chat",
  "ai_conversation:read_own",
  "ai_conversation:manage",
  "prompt:read",
  "prompt:write",
  "prompt:approve",
  "glossary:read",
  "glossary:write",
  "document:read",
  "document:write",
  "speaking_session:create",
  "speaking_session:read_own",
  "speaking_session:end_own",
  "speaking_session:text_fallback",
  "speaking_session:manage",
  "speaking_report:read",
  "learner_profile:read",
  "learner_profile:write",
  "transcript:read_sensitive",
  "audio:download",
]);

export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(160),
  region: tenantRegionSchema,
  plan: tenantPlanSchema,
  dataResidency: tenantDataResidencySchema,
  featureFlags: z.record(z.string(), z.boolean()).default({}),
  brandingConfig: z
    .object({
      logoUrl: z.string().url().optional(),
      primaryColor: z.string().optional(),
      accentColor: z.string().optional(),
    })
    .default({}),
  retentionPolicy: z
    .object({
      audioDays: z.number().int().min(1).max(365).default(30),
      transcriptDays: z.number().int().min(1).max(3650).default(730),
    })
    .default({ audioDays: 30, transcriptDays: 730 }),
});

export const actorSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  roles: z.array(roleSchema).min(1),
  groupIds: z.array(z.string().uuid()).default([]),
  mfaVerifiedAt: z.coerce.date().optional(),
});

export const groupSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(140),
  managerId: z.string().uuid().optional(),
  externalId: z.string().min(1).max(180).optional(),
});

export const assignmentStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);

export const assignmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  groupId: z.string().uuid(),
  courseId: z.string().uuid(),
  dueDate: z.coerce.date().optional(),
  status: assignmentStatusSchema,
});

export const agentScopeSchema = z.enum([
  "tutor_coach",
  "pronunciation_coach",
  "tenant_knowledge",
  "exam_prep",
  "content_qa",
]);

export const agentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  scope: agentScopeSchema,
  allowedTools: z.array(z.string().min(1)).default([]),
  promptVersion: z.string().min(1),
  policyVersion: z.string().min(1),
  status: z.enum(["draft", "active", "paused", "archived"]),
});

export const auditOutcomeSchema = z.enum(["success", "denied", "failure"]);

export const auditEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  actorId: z.string().uuid(),
  actorRole: roleSchema,
  action: z.string().min(1).max(160),
  resourceType: z.string().min(1).max(120),
  resourceId: z.string().min(1).max(180),
  outcome: auditOutcomeSchema,
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  requestId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.coerce.date(),
});

export const oidcConfigSchema = z.object({
  tenantId: z.string().uuid(),
  issuer: z.string().url(),
  clientId: z.string().min(1),
  redirectUri: z.string().url(),
  scopes: z.array(z.string().min(1)).default(["openid", "email", "profile"]),
});

export const scimUserSchema = z.object({
  tenantId: z.string().uuid(),
  externalId: z.string().min(1),
  userName: z.string().email(),
  active: z.boolean(),
  displayName: z.string().min(1).max(160).optional(),
  groupExternalIds: z.array(z.string()).default([]),
});

export const speakingSessionStatusSchema = z.enum([
  "created",
  "connecting",
  "active",
  "ended",
  "failed",
]);

export const speakingSessionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  sttProvider: z.string().min(1),
  ttsProvider: z.string().min(1),
  llmProvider: z.string().min(1),
  status: speakingSessionStatusSchema,
  latencyMs: z.number().int().nonnegative().optional(),
  costEstimate: z.number().nonnegative().optional(),
});

export type SupportedLanguage = z.infer<typeof supportedLanguageSchema>;
export type LearningGoal = z.infer<typeof learningGoalSchema>;
export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type Actor = z.infer<typeof actorSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type AgentScope = z.infer<typeof agentScopeSchema>;
export type AuditOutcome = z.infer<typeof auditOutcomeSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type OidcConfig = z.infer<typeof oidcConfigSchema>;
export type ScimUser = z.infer<typeof scimUserSchema>;
export type SpeakingSession = z.infer<typeof speakingSessionSchema>;
