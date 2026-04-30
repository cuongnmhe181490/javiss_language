import { redactForLog } from "./logging.js";
import type {
  AiFallbackReason,
  AiFinishReason,
  AiSchemaValidationResult,
  AiTaskType,
  AiUsage,
} from "./ai-orchestration-domain.js";

export type AiCallEventType =
  | "success"
  | "provider_error"
  | "schema_error"
  | "policy_denied"
  | "fallback_used";

export type AiCallEvent = {
  costEstimate: number;
  eventType: AiCallEventType;
  fallbackReason?: AiFallbackReason;
  finishReason: AiFinishReason;
  latencyMs: number;
  modelId: string;
  providerId: string;
  requestId: string;
  schemaValidationResult: AiSchemaValidationResult;
  taskType: AiTaskType;
  tenantId: string;
  traceId: string;
  usage: AiUsage;
};

export function createAiCallEvent(input: AiCallEvent): AiCallEvent {
  return redactForLog(input) as AiCallEvent;
}

export function redactAiLogFields(fields: Record<string, unknown>): Record<string, unknown> {
  return redactForLog(stripRawPromptFields(fields)) as Record<string, unknown>;
}

function stripRawPromptFields(fields: Record<string, unknown>): Record<string, unknown> {
  const stripped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (/promptText|systemPrompt|rawPrompt|developerMessage|message|content/i.test(key)) {
      stripped[key] = "[REDACTED]";
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      stripped[key] = stripRawPromptFields(value as Record<string, unknown>);
      continue;
    }

    stripped[key] = value;
  }

  return stripped;
}
