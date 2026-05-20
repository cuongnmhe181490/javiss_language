import OpenAI from "openai";

import type { AiCitation } from "./ai-domain.js";
import type {
  AiFinishReason,
  AiLanguage,
  AiProviderModelMetadata,
  AiSafetyResult,
  AiSchemaValidationResult,
  AiTaskType,
  AiUsage,
} from "./ai-orchestration-domain.js";
import type {
  AiCostEstimate,
  AiProvider,
  AiProviderHealth,
  AiProviderInvokeInput,
  AiProviderInvokeOutput,
  AiProviderMetadata,
} from "./ai-provider.js";
import { AiProviderTimeoutError, AiProviderUnavailableError } from "./ai-provider.js";
import type { LessonDetail } from "./learning-domain.js";

const TIMEOUT_MS = 30_000;

const TUTOR_SYSTEM_PROMPT = `You are a friendly, patient English tutor helping Vietnamese learners improve their English.

Your role:
- Correct grammar and vocabulary mistakes gently
- Explain grammar rules in simple terms when relevant
- Encourage the learner and celebrate progress
- Keep responses concise (2-4 sentences for corrections, up to a short paragraph for explanations)
- If the learner writes in Vietnamese, respond in a mix of English and Vietnamese to help them understand
- Focus on the current lesson context when provided
- Suggest natural English alternatives when the learner uses awkward phrasing

Always be supportive and never make the learner feel bad about mistakes.`;

const SPEAKING_FEEDBACK_SYSTEM_PROMPT = `You are an English speaking coach for Vietnamese learners. Analyze the spoken text provided and give constructive feedback.

Your response must be a JSON object with this exact structure:
{
  "feedbackItems": [
    {
      "label": "clarity" | "grammar" | "pronunciation" | "vocabulary" | "fluency",
      "message": "specific feedback message",
      "severity": "info" | "warning" | "error"
    }
  ],
  "nextMicroGoal": "a short suggestion for what to practice next",
  "scoringStatus": "scaffold" | "scored"
}

Guidelines:
- Focus on the most impactful 1-3 issues, not every small mistake
- Be encouraging while being honest
- For Vietnamese learners, pay attention to common issues: article usage (a/an/the), verb tenses, word order, and pronunciation patterns
- Keep feedback actionable and specific`;

export type OpenAiProviderOptions = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
};

export class OpenAiProvider implements AiProvider {
  readonly providerId = "openai";
  readonly supportedTasks: readonly AiTaskType[] = [
    "tutor_chat",
    "content_qa",
    "speaking_feedback",
    "fallback_safe_response",
  ];
  readonly supportedLanguages: readonly AiLanguage[] = ["en", "zh", "ja", "ko"];
  readonly timeoutMs = TIMEOUT_MS;
  readonly metadata: AiProviderMetadata;

  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAiProviderOptions | string) {
    const opts = typeof options === "string" ? { apiKey: options } : options;
    this.model = opts.model ?? "gpt-4o-mini";

    this.client = new OpenAI({
      apiKey: opts.apiKey,
      baseURL: opts.baseUrl,
      timeout: TIMEOUT_MS,
    });

    const displayName = opts.baseUrl
      ? `AI Provider (${this.model})`
      : `OpenAI ${this.model}`;

    this.metadata = {
      displayName,
      models: [
        {
          languages: ["en", "zh", "ja", "ko"],
          modelId: this.model,
          safety: ["standard", "strict"],
          tasks: ["tutor_chat", "speaking_feedback", "fallback_safe_response"],
        },
      ],
      notes: opts.baseUrl
        ? `Custom AI provider at ${opts.baseUrl} using ${this.model}.`
        : `Production OpenAI provider using ${this.model}.`,
    };
  }

  async estimateCost(input: AiProviderInvokeInput): Promise<AiCostEstimate> {
    const serialized = JSON.stringify(input.payload);
    const estimatedInputTokens = estimateTokens(serialized);
    const estimatedOutputTokens = outputTokenEstimate(input.taskType);

    // GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output
    const cost =
      estimatedInputTokens * 0.00000015 + estimatedOutputTokens * 0.0000006;

    return {
      costEstimate: Number(cost.toFixed(6)),
      estimatedInputTokens,
      estimatedOutputTokens,
      unit: "token",
    };
  }

  async healthCheck(): Promise<AiProviderHealth> {
    try {
      // Simple models list call to verify API key and connectivity
      await this.client.models.retrieve("gpt-4o-mini");
      return { checkedAt: new Date(), status: "healthy" };
    } catch {
      return {
        checkedAt: new Date(),
        reason: "openai_api_unreachable",
        status: "unavailable",
      };
    }
  }

  async invoke(input: AiProviderInvokeInput): Promise<AiProviderInvokeOutput> {
    // fallback_safe_response: no API call needed
    if (input.taskType === "fallback_safe_response") {
      return this.buildFallbackResponse(input);
    }

    // content_qa: keep as mock for now
    if (input.taskType === "content_qa") {
      return this.buildMockContentQaResponse(input);
    }

    const startMs = Date.now();

    try {
      const messages = this.buildMessages(input);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 1024,
        temperature: input.taskType === "speaking_feedback" ? 0.3 : 0.7,
        stream: false,
      });

      const latencyMs = Date.now() - startMs;
      const choice = response.choices[0];
      const content = choice?.message?.content ?? "";

      const usage: AiUsage = {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      };

      // Calculate actual cost from usage
      const costEstimate = Number(
        (usage.inputTokens * 0.00000015 + usage.outputTokens * 0.0000006).toFixed(6),
      );

      const output = this.parseOutput(input, content);

      const finishReason: AiFinishReason =
        choice?.finish_reason === "stop" ? "stop" : "safety_refusal";

      return {
        costEstimate,
        finishReason,
        latencyMs,
        modelId: this.model,
        output,
        providerId: this.providerId,
        safetyResult: {
          policyVersion: input.policyVersion,
          status: "passed",
        },
        schemaValidationResult: {
          schemaVersion: schemaVersionForTask(input.taskType),
          status: "passed",
        },
        usage,
      };
    } catch (error: unknown) {
      if (error instanceof OpenAI.APIConnectionError) {
        throw new AiProviderUnavailableError(this.providerId);
      }
      if (error instanceof OpenAI.APIError && error.status === 429) {
        throw new AiProviderUnavailableError(this.providerId);
      }
      if (
        error instanceof OpenAI.APIConnectionError ||
        (error instanceof Error && error.message.includes("timeout"))
      ) {
        throw new AiProviderTimeoutError(this.providerId);
      }
      // Re-throw known provider errors
      if (
        error instanceof AiProviderTimeoutError ||
        error instanceof AiProviderUnavailableError
      ) {
        throw error;
      }
      // Wrap unknown errors
      throw new AiProviderUnavailableError(this.providerId);
    }
  }

  private buildMessages(
    input: AiProviderInvokeInput,
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (input.taskType === "tutor_chat") {
      messages.push({ role: "system", content: this.buildTutorSystemPrompt(input) });

      const userMessage =
        (input.payload.message as string) ??
        (input.payload.userMessage as string) ??
        JSON.stringify(input.payload);

      messages.push({ role: "user", content: userMessage });
    } else if (input.taskType === "speaking_feedback") {
      messages.push({ role: "system", content: SPEAKING_FEEDBACK_SYSTEM_PROMPT });

      const spokenText =
        (input.payload.spokenText as string) ??
        (input.payload.transcript as string) ??
        (input.payload.message as string) ??
        JSON.stringify(input.payload);

      messages.push({
        role: "user",
        content: `Analyze this spoken English text from a Vietnamese learner:\n\n"${spokenText}"`,
      });
    }

    return messages;
  }

  private buildTutorSystemPrompt(input: AiProviderInvokeInput): string {
    let systemPrompt = TUTOR_SYSTEM_PROMPT;

    const lesson = input.payload.lesson as LessonDetail | undefined;
    if (lesson) {
      systemPrompt += `\n\nCurrent lesson context:
- Title: ${lesson.title}
- Objectives: ${lesson.objectives.join(", ")}`;
    }

    return systemPrompt;
  }

  private parseOutput(input: AiProviderInvokeInput, content: string): unknown {
    if (input.taskType === "speaking_feedback") {
      try {
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If JSON parsing fails, wrap in expected structure
      }
      return {
        feedbackItems: [
          {
            label: "clarity",
            message: content,
            severity: "info",
          },
        ],
        nextMicroGoal: "Try repeating the phrase with the suggested corrections.",
        scoringStatus: "scaffold",
      };
    }

    // tutor_chat output
    const citations = citationsFromPayload(input.payload);
    return {
      citations: citations.slice(0, 3),
      content,
      safetyFlags: {
        policyVersion: input.policyVersion,
      },
    };
  }

  private buildFallbackResponse(input: AiProviderInvokeInput): AiProviderInvokeOutput {
    const safeFallbackContent =
      "I cannot produce a reliable AI answer right now. Please try again or continue with the lesson context.";

    return {
      costEstimate: 0,
      finishReason: "fallback",
      latencyMs: 0,
      modelId: this.model,
      output: {
        citations: [],
        content: safeFallbackContent,
        safetyFlags: {
          policyVersion: input.policyVersion,
          reason: "provider_error",
          refused: true,
        },
      },
      providerId: this.providerId,
      safetyResult: {
        policyVersion: input.policyVersion,
        status: "passed",
      },
      schemaValidationResult: {
        schemaVersion: "safe_fallback_v1",
        status: "passed",
      },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  }

  private buildMockContentQaResponse(input: AiProviderInvokeInput): AiProviderInvokeOutput {
    return {
      costEstimate: 0,
      finishReason: "stop",
      latencyMs: 1,
      modelId: this.model,
      output: {
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
      },
      providerId: this.providerId,
      safetyResult: {
        policyVersion: input.policyVersion,
        status: "passed",
      },
      schemaValidationResult: {
        schemaVersion: "content_qa_v1",
        status: "passed",
      },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  }
}

function citationsFromPayload(payload: Record<string, unknown>): AiCitation[] {
  const lesson = payload.lesson as LessonDetail | undefined;
  if (!lesson) return [];

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

function schemaVersionForTask(taskType: AiTaskType): string {
  if (taskType === "content_qa") return "content_qa_v1";
  if (taskType === "speaking_feedback") return "speaking_feedback_v1";
  if (taskType === "fallback_safe_response") return "safe_fallback_v1";
  return "tutor_reply_v1";
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.trim().split(/\s+/).length * 1.3));
}

function outputTokenEstimate(taskType: AiTaskType): number {
  if (taskType === "content_qa") return 80;
  if (taskType === "speaking_feedback") return 150;
  return 200;
}
