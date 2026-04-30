import type { Actor } from "@polyglot/contracts";

import type { AiAgentRecord, AiCitation, AiSafetyFlags, PromptVersionRecord } from "./ai-domain.js";
import type { LessonDetail } from "./learning-domain.js";

export const tutorOutputSchemaVersion = "tutor_reply_v1";
export const contentQaOutputSchemaVersion = "content_qa_v1";
export const speakingFeedbackOutputSchemaVersion = "speaking_feedback_v1";
export const safeFallbackOutputSchemaVersion = "safe_fallback_v1";

export type AiTaskType =
  | "tutor_chat"
  | "content_qa"
  | "speaking_feedback"
  | "fallback_safe_response";

export type AiLanguage = "en" | "zh" | "ja" | "ko";
export type AiLatencyPreference = "low" | "balanced" | "quality";
export type AiSafetyRequirement = "standard" | "strict";

export type AiSourceScope = {
  tenantId: string;
  sourceId: string;
  sourceType:
    | "course"
    | "lesson"
    | "lesson_block"
    | "content_source"
    | "content_item"
    | "speaking_session";
  allowedUsage?: string[];
};

export type AiTenantPolicy = {
  allowedModels: string[];
  allowedProviders: string[];
  allowedTasks: AiTaskType[];
  costLimit: number;
  enabled: boolean;
  latencyPreference: AiLatencyPreference;
  maxEstimatedCost: number;
  maxInputChars: number;
  maxOutputChars: number;
  remainingBudget: number;
  safetyRequirement: AiSafetyRequirement;
  tenantId: string;
};

export type AiUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AiSafetyResult = {
  policyVersion: string;
  reason?: AiPolicyDenyReason | AiFallbackReason | "provider_safety_refusal";
  refused?: boolean;
  status: "passed" | "refused" | "blocked";
};

export type AiSchemaValidationResult = {
  details?: string[];
  schemaVersion: string;
  status: "passed" | "failed";
};

export type AiFinishReason =
  | "stop"
  | "safety_refusal"
  | "provider_unavailable"
  | "timeout"
  | "schema_error"
  | "policy_denied"
  | "quota_exceeded"
  | "fallback";

export type AiProviderModelMetadata = {
  languages: AiLanguage[];
  modelId: string;
  safety: AiSafetyRequirement[];
  tasks: AiTaskType[];
};

export type AiRouteDecision = {
  estimatedCost: number;
  fallbackReason?: AiFallbackReason;
  modelId: string;
  provider: string;
  providerId: string;
  reason:
    | "tenant_policy"
    | "policy_refusal"
    | "fallback"
    | "quota_exceeded"
    | "provider_unavailable";
  requestedCapability: AiTaskType;
  safetyRequirement: AiSafetyRequirement;
};

export type AiEvalGateDecision = {
  status: "passed" | "blocked";
  checks: string[];
  reason?: string;
};

export type AiPolicyDenyReason =
  | "actor_permission_denied"
  | "cost_quota_exceeded"
  | "cross_tenant_source_scope"
  | "disabled_tenant_feature"
  | "input_too_large"
  | "jailbreak_marker"
  | "max_output_size_exceeded"
  | "prompt_injection"
  | "source_scope_not_allowed"
  | "system_prompt_exposure"
  | "tool_not_allowed"
  | "unsupported_agent_scope";

export type AiPolicyDecision =
  | {
      allowed: true;
      flags: AiSafetyFlags;
    }
  | {
      allowed: false;
      reason: AiPolicyDenyReason;
      content: string;
      citations: AiCitation[];
      flags: AiSafetyFlags;
    };

export type AiFallbackReason =
  | "cost_quota_exceeded"
  | "policy_denied"
  | "provider_error"
  | "provider_safety_refusal"
  | "provider_timeout"
  | "provider_unavailable"
  | "schema_validation_failed";

export type AiOrchestratorInput = {
  actor: Actor;
  agent: AiAgentRecord;
  lesson?: LessonDetail;
  message: string;
  prompt: PromptVersionRecord;
  requestId?: string;
  tenantId: string;
  traceId?: string;
};

export type AiTaskRequest = {
  actor: Actor;
  actorId: string;
  agent?: AiAgentRecord;
  costLimit?: number;
  language: AiLanguage;
  lesson?: LessonDetail;
  payload: Record<string, unknown>;
  policyVersion: string;
  promptVersion: string;
  requestId: string;
  safetyRequirement?: AiSafetyRequirement;
  sourceScope: AiSourceScope[];
  taskType: AiTaskType;
  tenantId: string;
  tenantPolicy: AiTenantPolicy;
  traceId: string;
};

export type AiValidatedTaskOutput = {
  output: unknown;
  usage: AiUsage;
  costEstimate: number;
  latencyMs: number;
  providerId: string;
  modelId: string;
  requestId: string;
  routingDecision: AiRouteDecision;
  safetyResult: AiSafetyResult;
  schemaValidationResult: AiSchemaValidationResult;
  finishReason: AiFinishReason;
  traceId: string;
};

export type AiOrchestratorOutput = {
  citations: AiCitation[];
  content: string;
  costEstimate: number;
  evalGate: AiEvalGateDecision;
  finishReason: AiFinishReason;
  inputTokens: number;
  latencyMs: number;
  modelId: string;
  outputTokens: number;
  outputSchemaVersion: typeof tutorOutputSchemaVersion;
  provider: string;
  requestId: string;
  routingDecision: AiRouteDecision;
  schemaValidationResult: AiSchemaValidationResult;
  safetyFlags: AiSafetyFlags;
  traceId: string;
};

export type AiOrchestrator = {
  invoke(input: AiTaskRequest): Promise<AiValidatedTaskOutput>;
  generateTutorReply(input: AiOrchestratorInput): Promise<AiOrchestratorOutput>;
};

export function createDefaultTenantAiPolicy(input: {
  tenantId: string;
  enabled?: boolean;
}): AiTenantPolicy {
  return {
    allowedModels: ["mock-tutor-v1", "mock-content-qa-v1", "mock-speaking-feedback-v1"],
    allowedProviders: ["mock"],
    allowedTasks: ["tutor_chat", "content_qa", "speaking_feedback", "fallback_safe_response"],
    costLimit: 0.05,
    enabled: input.enabled ?? true,
    latencyPreference: "balanced",
    maxEstimatedCost: 0.05,
    maxInputChars: 4000,
    maxOutputChars: 4000,
    remainingBudget: 1,
    safetyRequirement: "standard",
    tenantId: input.tenantId,
  };
}
