import type { AiCitation, AiSafetyFlags } from "./ai-domain.js";
import type {
  AiFinishReason,
  AiLanguage,
  AiProviderModelMetadata,
  AiSafetyResult,
  AiSchemaValidationResult,
  AiSourceScope,
  AiTaskType,
  AiUsage,
} from "./ai-orchestration-domain.js";
import type { LessonDetail } from "./learning-domain.js";

export type AiProviderMetadata = {
  dataResidency?: string[];
  displayName: string;
  models: AiProviderModelMetadata[];
  notes?: string;
};

export type AiCostEstimate = {
  costEstimate: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  unit: "token" | "turn";
};

export type AiProviderHealth = {
  checkedAt: Date;
  reason?: string;
  status: "healthy" | "unavailable";
};

export type AiProviderInvokeInput = {
  actorId: string;
  language: AiLanguage;
  modelId: string;
  payload: Record<string, unknown>;
  policyVersion: string;
  promptVersion: string;
  requestId: string;
  sourceScope: AiSourceScope[];
  taskType: AiTaskType;
  tenantId: string;
  traceId: string;
};

export type AiProviderInvokeOutput = {
  costEstimate: number;
  finishReason: AiFinishReason;
  latencyMs: number;
  modelId: string;
  output: unknown;
  providerId: string;
  safetyResult: AiSafetyResult;
  schemaValidationResult: AiSchemaValidationResult;
  usage: AiUsage;
};

export type AiProvider = {
  providerId: string;
  supportedTasks: readonly AiTaskType[];
  supportedLanguages: readonly AiLanguage[];
  timeoutMs: number;
  metadata: AiProviderMetadata;
  estimateCost(input: AiProviderInvokeInput): Promise<AiCostEstimate>;
  healthCheck(): Promise<AiProviderHealth>;
  invoke(input: AiProviderInvokeInput): Promise<AiProviderInvokeOutput>;
};

export type MockProviderMode =
  | "success"
  | "timeout"
  | "invalid_schema"
  | "safety_refusal"
  | "unavailable";

export class AiProviderTimeoutError extends Error {
  constructor(public readonly providerId: string) {
    super(`AI provider timed out: ${providerId}`);
    this.name = "AiProviderTimeoutError";
  }
}

export class AiProviderUnavailableError extends Error {
  constructor(public readonly providerId: string) {
    super(`AI provider unavailable: ${providerId}`);
    this.name = "AiProviderUnavailableError";
  }
}

const safeFallbackContent =
  "I cannot produce a reliable AI answer right now. Please try again or continue with the lesson context.";

export class MockAiProvider implements AiProvider {
  readonly providerId = "mock";
  readonly supportedTasks = [
    "tutor_chat",
    "content_qa",
    "speaking_feedback",
    "fallback_safe_response",
  ] as const;
  readonly supportedLanguages = ["en", "zh", "ja", "ko"] as const;
  readonly timeoutMs: number;
  readonly metadata: AiProviderMetadata;

  constructor(
    private readonly options: {
      costEstimate?: number;
      latencyMs?: number;
      metadata?: Partial<AiProviderMetadata>;
      mode?: MockProviderMode;
      modeByTask?: Partial<Record<AiTaskType, MockProviderMode>>;
    } = {},
  ) {
    this.timeoutMs = 1200;
    this.metadata = {
      displayName: "Deterministic Mock AI Provider",
      models: [
        {
          languages: ["en", "zh", "ja", "ko"],
          modelId: "mock-tutor-v1",
          safety: ["standard", "strict"],
          tasks: ["tutor_chat", "fallback_safe_response"],
        },
        {
          languages: ["en", "zh", "ja", "ko"],
          modelId: "mock-content-qa-v1",
          safety: ["standard", "strict"],
          tasks: ["content_qa"],
        },
        {
          languages: ["en", "zh", "ja", "ko"],
          modelId: "mock-speaking-feedback-v1",
          safety: ["standard", "strict"],
          tasks: ["speaking_feedback"],
        },
      ],
      notes: "No external network calls. No credentials.",
      ...options.metadata,
    };
    assertProviderMetadataSafe(this.metadata);
  }

  async estimateCost(input: AiProviderInvokeInput): Promise<AiCostEstimate> {
    const serialized = JSON.stringify(input.payload);
    const estimatedInputTokens = estimateTokens(serialized);
    const estimatedOutputTokens = outputTokenEstimate(input.taskType);

    return {
      costEstimate:
        this.options.costEstimate ?? estimateCost(estimatedInputTokens, estimatedOutputTokens),
      estimatedInputTokens,
      estimatedOutputTokens,
      unit: "token",
    };
  }

  async healthCheck(): Promise<AiProviderHealth> {
    if (this.modeFor("tutor_chat") === "unavailable" || this.options.mode === "unavailable") {
      return {
        checkedAt: new Date(),
        reason: "mock_unavailable",
        status: "unavailable",
      };
    }

    return {
      checkedAt: new Date(),
      status: "healthy",
    };
  }

  async invoke(input: AiProviderInvokeInput): Promise<AiProviderInvokeOutput> {
    const mode = this.modeFor(input.taskType);

    if (mode === "unavailable") {
      throw new AiProviderUnavailableError(this.providerId);
    }

    if (mode === "timeout") {
      throw new AiProviderTimeoutError(this.providerId);
    }

    const cost = await this.estimateCost(input);
    const usage: AiUsage = {
      inputTokens: cost.estimatedInputTokens,
      outputTokens: cost.estimatedOutputTokens,
      totalTokens: cost.estimatedInputTokens + cost.estimatedOutputTokens,
    };
    const base = {
      costEstimate: cost.costEstimate,
      latencyMs: this.options.latencyMs ?? 12,
      modelId: input.modelId,
      providerId: this.providerId,
      usage,
    };

    if (mode === "invalid_schema") {
      return {
        ...base,
        finishReason: "stop",
        output: invalidOutputForTask(input.taskType),
        safetyResult: safetyResult(input.policyVersion, "passed"),
        schemaValidationResult: {
          schemaVersion: "provider_unvalidated",
          status: "passed",
        },
      };
    }

    if (mode === "safety_refusal") {
      return {
        ...base,
        finishReason: "safety_refusal",
        output: safeFallbackOutput({
          citations: citationsFromPayload(input.payload).slice(0, 1),
          policyVersion: input.policyVersion,
          reason: "provider_safety_refusal",
        }),
        safetyResult: safetyResult(input.policyVersion, "refused", "provider_safety_refusal"),
        schemaValidationResult: {
          schemaVersion: schemaVersionForTask(input.taskType),
          status: "passed",
        },
      };
    }

    return {
      ...base,
      finishReason: "stop",
      output: outputForTask(input),
      safetyResult: safetyResult(input.policyVersion, "passed"),
      schemaValidationResult: {
        schemaVersion: schemaVersionForTask(input.taskType),
        status: "passed",
      },
    };
  }

  private modeFor(taskType: AiTaskType): MockProviderMode {
    return this.options.modeByTask?.[taskType] ?? this.options.mode ?? "success";
  }
}

export function createDefaultAiProvider(): AiProvider {
  return new MockAiProvider();
}

export function assertProviderMetadataSafe(metadata: AiProviderMetadata): void {
  const unsafeKey = findUnsafeMetadataKey(metadata);

  if (unsafeKey) {
    throw new Error(`Provider metadata contains secret-like key: ${unsafeKey}`);
  }
}

function outputForTask(input: AiProviderInvokeInput): unknown {
  if (input.taskType === "content_qa") {
    return {
      agentId: "content-qa-agent-v1",
      checks: [
        { name: "content_shape", status: "passed" },
        { name: "lineage_present", status: "passed" },
        { name: "policy_lint", status: "passed" },
      ],
      findings: [],
      policyVersion: input.policyVersion,
      riskLevel: "low",
      rubricVersion: "content-rubric-v1",
      status: "passed",
    };
  }

  if (input.taskType === "speaking_feedback") {
    return {
      feedbackItems: [
        {
          label: "clarity",
          message: "Use one shorter sentence, then repeat the target phrase.",
          severity: "info",
        },
      ],
      nextMicroGoal: "Repeat the answer with one clearer target phrase.",
      scoringStatus: "scaffold",
    };
  }

  if (input.taskType === "fallback_safe_response") {
    return safeFallbackOutput({
      citations: [],
      policyVersion: input.policyVersion,
      reason: "provider_error",
    });
  }

  const lesson = lessonFromPayload(input.payload);
  const lessonTitle = lesson?.title ?? "your current lesson";
  const objective = lesson?.objectives[0] ?? "practice one clear sentence";

  return {
    citations: citationsFromPayload(input.payload).slice(0, 3),
    content: `Let's focus on ${lessonTitle}. Try one short answer using this goal: ${objective}. I will give a hint first, then you can try again.`,
    safetyFlags: {
      policyVersion: input.policyVersion,
    },
  };
}

function invalidOutputForTask(taskType: AiTaskType): unknown {
  if (taskType === "content_qa") {
    return {
      findings: ["missing required status"],
      leakedSystemPrompt: "do not expose this",
    };
  }

  if (taskType === "speaking_feedback") {
    return {
      nextMicroGoal: "",
      rawSecretToken: "secret",
    };
  }

  return {
    citations: [],
    leakedSystemPrompt: "do not expose this",
    safetyFlags: {},
  };
}

function safeFallbackOutput(input: {
  citations: AiCitation[];
  policyVersion: string;
  reason: string;
}): {
  citations: AiCitation[];
  content: string;
  safetyFlags: AiSafetyFlags;
} {
  return {
    citations: input.citations,
    content: safeFallbackContent,
    safetyFlags: {
      policyVersion: input.policyVersion,
      reason: input.reason,
      refused: true,
    },
  };
}

function safetyResult(
  policyVersion: string,
  status: AiSafetyResult["status"],
  reason?: AiSafetyResult["reason"],
): AiSafetyResult {
  return {
    policyVersion,
    reason,
    refused: status !== "passed" ? true : undefined,
    status,
  };
}

function citationsFromPayload(payload: Record<string, unknown>): AiCitation[] {
  const lesson = lessonFromPayload(payload);

  if (!lesson) {
    return [];
  }

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

function lessonFromPayload(payload: Record<string, unknown>): LessonDetail | undefined {
  const lesson = payload.lesson;

  return lesson && typeof lesson === "object" && !Array.isArray(lesson)
    ? (lesson as LessonDetail)
    : undefined;
}

function schemaVersionForTask(taskType: AiTaskType): string {
  if (taskType === "content_qa") {
    return "content_qa_v1";
  }

  if (taskType === "speaking_feedback") {
    return "speaking_feedback_v1";
  }

  if (taskType === "fallback_safe_response") {
    return "safe_fallback_v1";
  }

  return "tutor_reply_v1";
}

function outputTokenEstimate(taskType: AiTaskType): number {
  if (taskType === "content_qa") {
    return 80;
  }

  if (taskType === "speaking_feedback") {
    return 60;
  }

  return 40;
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  return Number(((inputTokens + outputTokens) * 0.000001).toFixed(6));
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.trim().split(/\s+/).length * 1.3));
}

function findUnsafeMetadataKey(value: unknown, path: string[] = []): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  for (const [key, item] of Object.entries(value)) {
    const nextPath = [...path, key];

    if (/authorization|credential|secret|token|password|api[_-]?key/i.test(key)) {
      return nextPath.join(".");
    }

    const nested = findUnsafeMetadataKey(item, nextPath);

    if (nested) {
      return nested;
    }
  }

  return null;
}
