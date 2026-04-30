import { z } from "zod";

import type { AiCitation, AiSafetyFlags } from "./ai-domain.js";
import {
  contentQaOutputSchemaVersion,
  safeFallbackOutputSchemaVersion,
  speakingFeedbackOutputSchemaVersion,
  tutorOutputSchemaVersion,
  type AiFallbackReason,
  type AiSchemaValidationResult,
  type AiTaskType,
} from "./ai-orchestration-domain.js";
import type { LessonDetail } from "./learning-domain.js";

const citationSchema = z
  .object({
    label: z.string().min(1).max(240),
    sourceId: z.string().uuid(),
    sourceType: z.enum(["course", "lesson", "lesson_block"]),
  })
  .strict();

const safetyFlagsSchema = z
  .object({
    policyVersion: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
    refused: z.boolean().optional(),
  })
  .strict();

export const tutorChatResponseSchema = z
  .object({
    citations: z.array(citationSchema).max(10),
    content: z.string().min(1).max(4000),
    safetyFlags: safetyFlagsSchema,
  })
  .strict();

export const safeFallbackResponseSchema = z
  .object({
    citations: z.array(citationSchema).max(3),
    content: z.string().min(1).max(1000),
    safetyFlags: safetyFlagsSchema.extend({
      refused: z.literal(true),
    }),
  })
  .strict();

export const contentQaResponseSchema = z
  .object({
    agentId: z.string().min(1).max(120),
    checks: z
      .array(
        z
          .object({
            name: z.string().min(1).max(120),
            reason: z.string().min(1).max(240).optional(),
            status: z.enum(["passed", "failed"]),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    findings: z.array(z.string().min(1).max(400)).max(20),
    policyVersion: z.string().min(1).max(80),
    riskLevel: z.enum(["low", "medium", "high"]),
    rubricVersion: z.string().min(1).max(80),
    status: z.enum(["passed", "failed"]),
  })
  .strict();

export const speakingFeedbackResponseSchema = z
  .object({
    feedbackItems: z
      .array(
        z
          .object({
            label: z.string().min(1).max(80),
            message: z.string().min(1).max(400),
            severity: z.enum(["info", "warning"]),
          })
          .strict(),
      )
      .max(10),
    nextMicroGoal: z.string().min(1).max(240),
    scoringStatus: z.enum(["scaffold", "not_implemented"]),
  })
  .strict();

export type TutorChatResponse = z.infer<typeof tutorChatResponseSchema>;
export type SafeFallbackResponse = z.infer<typeof safeFallbackResponseSchema>;
export type ContentQaResponse = z.infer<typeof contentQaResponseSchema>;
export type SpeakingFeedbackResponse = z.infer<typeof speakingFeedbackResponseSchema>;

export type AiOutputValidation =
  | {
      success: true;
      output: unknown;
      schemaValidationResult: AiSchemaValidationResult;
    }
  | {
      success: false;
      schemaValidationResult: AiSchemaValidationResult;
    };

export function validateAiTaskOutput(input: {
  lesson?: LessonDetail;
  maxOutputChars: number;
  output: unknown;
  taskType: AiTaskType;
}): AiOutputValidation {
  const schema = schemaForTask(input.taskType);
  const parsed = schema.safeParse(input.output);
  const schemaVersion = schemaVersionForTask(input.taskType);

  if (!parsed.success) {
    return {
      success: false,
      schemaValidationResult: {
        details: parsed.error.issues.map((issue) => {
          if (issue.code === "unrecognized_keys") {
            return "unrecognized output fields";
          }

          return `${issue.path.join(".") || "root"}: ${issue.message.replace(/"[^"]+"/g, '"field"')}`;
        }),
        schemaVersion,
        status: "failed",
      },
    };
  }

  const serialized = JSON.stringify(parsed.data);

  if (serialized.length > input.maxOutputChars) {
    return {
      success: false,
      schemaValidationResult: {
        details: ["output exceeds tenant maxOutputChars"],
        schemaVersion,
        status: "failed",
      },
    };
  }

  if (input.taskType === "tutor_chat") {
    const tutorOutput = parsed.data as TutorChatResponse;

    if (
      input.lesson &&
      tutorOutput.safetyFlags.refused !== true &&
      !tutorOutput.citations.some((citation) => citation.sourceId === input.lesson?.id)
    ) {
      return {
        success: false,
        schemaValidationResult: {
          details: ["lesson citation is required for non-refusal tutor output"],
          schemaVersion,
          status: "failed",
        },
      };
    }
  }

  return {
    success: true,
    output: parsed.data,
    schemaValidationResult: {
      schemaVersion,
      status: "passed",
    },
  };
}

export function buildSafeFallbackOutput(input: {
  citations?: AiCitation[];
  policyVersion: string;
  reason: AiFallbackReason | string;
}): SafeFallbackResponse {
  return {
    citations: input.citations ?? [],
    content:
      "I cannot produce a reliable AI answer right now. Please try again or continue with the lesson context.",
    safetyFlags: {
      policyVersion: input.policyVersion,
      reason: input.reason,
      refused: true,
    },
  };
}

export function safetyFlagsFromFallback(input: {
  fallbackReason?: string;
  policyVersion: string;
  schemaValidationResult?: AiSchemaValidationResult;
}): AiSafetyFlags {
  return {
    policyVersion: input.policyVersion,
    reason: input.fallbackReason,
    refused: true,
    schemaValidationResult: input.schemaValidationResult as unknown as Record<string, unknown>,
  };
}

function schemaForTask(taskType: AiTaskType) {
  if (taskType === "content_qa") {
    return contentQaResponseSchema;
  }

  if (taskType === "speaking_feedback") {
    return speakingFeedbackResponseSchema;
  }

  if (taskType === "fallback_safe_response") {
    return safeFallbackResponseSchema;
  }

  return tutorChatResponseSchema;
}

function schemaVersionForTask(taskType: AiTaskType): string {
  if (taskType === "content_qa") {
    return contentQaOutputSchemaVersion;
  }

  if (taskType === "speaking_feedback") {
    return speakingFeedbackOutputSchemaVersion;
  }

  if (taskType === "fallback_safe_response") {
    return safeFallbackOutputSchemaVersion;
  }

  return tutorOutputSchemaVersion;
}
