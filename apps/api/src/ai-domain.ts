import { z } from "zod";

export const aiAgentScopeSchema = z.enum([
  "tutor_coach",
  "pronunciation_coach",
  "tenant_knowledge",
  "exam_prep",
  "content_qa",
]);
export const aiAgentStatusSchema = z.enum(["draft", "active", "paused", "archived"]);
export const aiConversationStatusSchema = z.enum(["active", "archived"]);
export const aiMessageRoleSchema = z.enum(["user", "assistant", "system"]);

export const createAiConversationSchema = z.object({
  agentId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  title: z.string().min(1).max(180).optional(),
});

export const createAiMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export type AiAgentScope = z.infer<typeof aiAgentScopeSchema>;
export type AiAgentStatus = z.infer<typeof aiAgentStatusSchema>;
export type AiConversationStatus = z.infer<typeof aiConversationStatusSchema>;
export type AiMessageRole = z.infer<typeof aiMessageRoleSchema>;
export type CreateAiConversationInput = z.infer<typeof createAiConversationSchema>;
export type CreateAiMessageInput = z.infer<typeof createAiMessageSchema>;

export type AiCitation = {
  sourceType: "course" | "lesson" | "lesson_block";
  sourceId: string;
  label: string;
};

export type AiSafetyFlags = {
  evalGate?: Record<string, unknown>;
  eventType?: string;
  fallbackReason?: string;
  latencyMs?: number;
  outputSchemaVersion?: string;
  requestId?: string;
  refused?: boolean;
  reason?: string;
  routingDecision?: Record<string, unknown>;
  schemaValidationResult?: Record<string, unknown>;
  policyVersion?: string;
  traceId?: string;
};

export type AiAgentRecord = {
  id: string;
  tenantId: string;
  name: string;
  scope: AiAgentScope;
  allowedTools: string[];
  promptVersion: string;
  policyVersion: string;
  status: AiAgentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PromptVersionRecord = {
  id: string;
  tenantId: string;
  agentId: string;
  version: string;
  purpose: string;
  promptText: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  safetyRules: Record<string, unknown>;
  evalStatus: "draft" | "approved" | "failed";
  createdBy?: string;
  approvedBy?: string;
  createdAt: Date;
};

export type AiConversationRecord = {
  id: string;
  tenantId: string;
  userId: string;
  agentId: string;
  lessonId?: string;
  courseId?: string;
  title: string;
  status: AiConversationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AiMessageRecord = {
  id: string;
  tenantId: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  citations: AiCitation[];
  safetyFlags: AiSafetyFlags;
  provider: string;
  modelId: string;
  promptVersion?: string;
  policyVersion?: string;
  inputTokens: number;
  outputTokens: number;
  costEstimate: number;
  createdAt: Date;
};

export type AiConversationDetail = AiConversationRecord & {
  agent: AiAgentRecord;
  messages: AiMessageRecord[];
};

export const sampleTutorAgentAlphaId = "17171717-1717-4171-8171-171717171711";
export const sampleTutorAgentBetaId = "17171717-1717-4171-8171-171717171712";
export const samplePromptAlphaId = "18181818-1818-4181-8181-181818181811";

export function redactedPromptPlaceholder(): string {
  return "[system prompt redacted]";
}
