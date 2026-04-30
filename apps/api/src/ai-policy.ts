import type { Permission } from "@polyglot/contracts";
import { hasPermission } from "@polyglot/authz";

import type { AiAgentRecord, AiCitation } from "./ai-domain.js";
import type {
  AiPolicyDecision,
  AiPolicyDenyReason,
  AiSourceScope,
  AiTaskRequest,
  AiTaskType,
} from "./ai-orchestration-domain.js";
import type { LessonDetail } from "./learning-domain.js";

const promptInjectionPattern =
  /ignore (all )?(previous|prior) instructions|system prompt|developer message|reveal.+prompt|jailbreak|bypass.+policy|show.+hidden|print.+instructions/i;

const systemPromptExposurePattern =
  /system prompt|developer message|hidden prompt|promptText|show.+instructions|reveal.+instructions/i;

const requiredTutorTools = new Set(["lesson_lookup", "hint_generator"]);

export function evaluateAiPolicy(input: {
  agent?: AiAgentRecord;
  lesson?: LessonDetail;
  request: AiTaskRequest;
}): AiPolicyDecision {
  const payloadText = JSON.stringify(input.request.payload);
  const policyVersion = input.request.policyVersion;

  if (!input.request.tenantPolicy.enabled) {
    return refusal({
      citations: [],
      policyVersion,
      reason: "disabled_tenant_feature",
      userReason: "This AI task is not enabled for this tenant.",
    });
  }

  if (!input.request.tenantPolicy.allowedTasks.includes(input.request.taskType)) {
    return refusal({
      citations: [],
      policyVersion,
      reason: "disabled_tenant_feature",
      userReason: "This AI task is not enabled for this tenant.",
    });
  }

  const permission = permissionForTask(input.request.taskType);

  if (permission && !hasPermission(input.request.actor, permission)) {
    return refusal({
      citations: [],
      policyVersion,
      reason: "actor_permission_denied",
      userReason: "You are not allowed to use this AI task.",
    });
  }

  const sourceDecision = evaluateSourceScope({
    sourceScope: input.request.sourceScope,
    taskType: input.request.taskType,
    tenantId: input.request.tenantId,
  });

  if (!sourceDecision.allowed) {
    return refusal({
      citations: [],
      policyVersion,
      reason: sourceDecision.reason,
      userReason: "The requested AI context is outside the allowed source scope.",
    });
  }

  if (payloadText.length > input.request.tenantPolicy.maxInputChars) {
    return refusal({
      citations: [],
      policyVersion,
      reason: "input_too_large",
      userReason: "The AI request is too large to process safely.",
    });
  }

  if (input.request.tenantPolicy.maxOutputChars < 1) {
    return refusal({
      citations: [],
      policyVersion,
      reason: "max_output_size_exceeded",
      userReason: "The tenant AI output policy is not configured safely.",
    });
  }

  if (
    input.request.tenantPolicy.remainingBudget <= 0 ||
    input.request.tenantPolicy.costLimit <= 0
  ) {
    return refusal({
      citations: [],
      policyVersion,
      reason: "cost_quota_exceeded",
      userReason: "The tenant AI quota has been exceeded.",
    });
  }

  if (systemPromptExposurePattern.test(payloadText)) {
    return refusal({
      citations: input.lesson ? lessonCitations(input.lesson).slice(0, 1) : [],
      policyVersion,
      reason: "system_prompt_exposure",
      userReason:
        "I cannot help with hidden prompts or policy bypasses. I can still help you practice the current lesson.",
    });
  }

  if (promptInjectionPattern.test(payloadText)) {
    return refusal({
      citations: input.lesson ? lessonCitations(input.lesson).slice(0, 1) : [],
      policyVersion,
      reason: "prompt_injection",
      userReason:
        "I cannot help with hidden prompts or policy bypasses. I can still help you practice the current lesson.",
    });
  }

  if (input.request.taskType === "tutor_chat") {
    const tutorDecision = evaluateTutorAgentPolicy({
      agent: input.agent,
      lesson: input.lesson,
      policyVersion,
    });

    if (!tutorDecision.allowed) {
      return tutorDecision;
    }
  }

  return {
    allowed: true,
    flags: {
      policyVersion,
    },
  };
}

function evaluateTutorAgentPolicy(input: {
  agent?: AiAgentRecord;
  lesson?: LessonDetail;
  policyVersion: string;
}): AiPolicyDecision {
  if (!input.agent || input.agent.scope !== "tutor_coach") {
    return refusal({
      citations: [],
      policyVersion: input.policyVersion,
      reason: "unsupported_agent_scope",
      userReason: "This agent is not available for tutor chat.",
    });
  }

  const missingTools = [...requiredTutorTools].filter(
    (tool) => !input.agent?.allowedTools.includes(tool),
  );

  if (missingTools.length > 0) {
    return refusal({
      citations: [],
      policyVersion: input.policyVersion,
      reason: "tool_not_allowed",
      userReason: "This tutor is not configured with the required lesson tools.",
    });
  }

  return {
    allowed: true,
    flags: {
      policyVersion: input.policyVersion,
    },
  };
}

function evaluateSourceScope(input: {
  sourceScope: AiSourceScope[];
  taskType: AiTaskType;
  tenantId: string;
}):
  | { allowed: true }
  | { allowed: false; reason: "cross_tenant_source_scope" | "source_scope_not_allowed" } {
  if (input.taskType === "content_qa" && input.sourceScope.length === 0) {
    return {
      allowed: false,
      reason: "source_scope_not_allowed",
    };
  }

  for (const source of input.sourceScope) {
    if (source.tenantId !== input.tenantId) {
      return {
        allowed: false,
        reason: "cross_tenant_source_scope",
      };
    }

    if (
      source.allowedUsage &&
      !source.allowedUsage.some((usage) => usageAllowed(input.taskType, usage))
    ) {
      return {
        allowed: false,
        reason: "source_scope_not_allowed",
      };
    }
  }

  return {
    allowed: true,
  };
}

function permissionForTask(taskType: AiTaskType): Permission | null {
  if (taskType === "tutor_chat") {
    return "ai_tutor:chat";
  }

  if (taskType === "content_qa") {
    return "content:review";
  }

  if (taskType === "speaking_feedback") {
    return "speaking_report:read";
  }

  if (taskType === "fallback_safe_response") {
    return "ai_tutor:chat";
  }

  return null;
}

function usageAllowed(taskType: AiTaskType, usage: string): boolean {
  if (taskType === "content_qa") {
    return usage === "eval" || usage === "reference";
  }

  if (taskType === "tutor_chat") {
    return usage === "retrieval" || usage === "display" || usage === "reference";
  }

  return usage === "reference" || usage === "display";
}

function refusal(input: {
  citations: AiCitation[];
  policyVersion: string;
  reason: AiPolicyDenyReason;
  userReason: string;
}): AiPolicyDecision {
  return {
    allowed: false,
    content: input.userReason,
    citations: input.citations,
    flags: {
      policyVersion: input.policyVersion,
      reason: input.reason,
      refused: true,
    },
    reason: input.reason,
  };
}

function lessonCitations(lesson: LessonDetail): AiCitation[] {
  return [
    {
      sourceType: "lesson",
      sourceId: lesson.id,
      label: lesson.title,
    },
    ...lesson.blocks.map((block) => ({
      sourceType: "lesson_block" as const,
      sourceId: block.id,
      label: `${lesson.title} block ${block.orderIndex + 1}`,
    })),
  ];
}
