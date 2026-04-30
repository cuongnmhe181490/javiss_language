import { ApiHttpError } from "./errors.js";
import {
  AiProviderTimeoutError,
  AiProviderUnavailableError,
  createDefaultAiProvider,
  type AiProvider,
  type AiProviderInvokeOutput,
} from "./ai-provider.js";
import {
  createDefaultModelRouter,
  createDefaultProviderRegistry,
  fallbackRoute,
  policyRefusalRoute,
  ProviderRegistry,
  type ModelRouter,
} from "./ai-model-router.js";
import type {
  AiEvalGateDecision,
  AiFallbackReason,
  AiFinishReason,
  AiOrchestrator,
  AiOrchestratorInput,
  AiOrchestratorOutput,
  AiRouteDecision,
  AiSchemaValidationResult,
  AiTaskRequest,
  AiTenantPolicy,
  AiUsage,
  AiValidatedTaskOutput,
} from "./ai-orchestration-domain.js";
import {
  createDefaultTenantAiPolicy,
  safeFallbackOutputSchemaVersion,
  tutorOutputSchemaVersion,
} from "./ai-orchestration-domain.js";
import {
  buildSafeFallbackOutput,
  tutorChatResponseSchema,
  validateAiTaskOutput,
  type TutorChatResponse,
} from "./ai-output-validation.js";
import { evaluateAiPolicy } from "./ai-policy.js";
import { createAiCallEvent, type AiCallEvent } from "./ai-observability.js";
import type { AiPolicyDecision } from "./ai-orchestration-domain.js";

export type AiOrchestratorOptions = {
  eventSink?: (event: AiCallEvent) => void;
  nowMs?: () => number;
  provider?: AiProvider;
  providerRegistry?: ProviderRegistry;
  router?: ModelRouter;
  tenantPolicy?: Partial<AiTenantPolicy> | ((tenantId: string) => Partial<AiTenantPolicy>);
};

export class DefaultAiOrchestrator implements AiOrchestrator {
  private readonly registry: ProviderRegistry;
  private readonly router: ModelRouter;

  constructor(private readonly options: AiOrchestratorOptions = {}) {
    this.registry =
      options.providerRegistry ??
      new ProviderRegistry([options.provider ?? createDefaultAiProvider()]);
    this.router = options.router ?? createDefaultModelRouter(this.registry);
  }

  async generateTutorReply(input: AiOrchestratorInput): Promise<AiOrchestratorOutput> {
    const evalGate = evaluatePromptReleaseGate(input);

    if (evalGate.status === "blocked") {
      throw new ApiHttpError(500, "ai_eval_gate.blocked", "AI prompt is not approved.", {
        reason: evalGate.reason,
      });
    }

    const requestId = input.requestId ?? crypto.randomUUID();
    const traceId = input.traceId ?? requestId;
    const taskRequest: AiTaskRequest = {
      actor: input.actor,
      actorId: input.actor.userId,
      agent: input.agent,
      language: input.lesson?.language ?? "en",
      lesson: input.lesson,
      payload: {
        lesson: input.lesson,
        message: input.message,
      },
      policyVersion: input.agent.policyVersion,
      promptVersion: input.prompt.version,
      requestId,
      sourceScope: input.lesson
        ? [
            {
              allowedUsage: ["retrieval", "display", "reference"],
              sourceId: input.lesson.id,
              sourceType: "lesson",
              tenantId: input.lesson.tenantId,
            },
          ]
        : [],
      taskType: "tutor_chat",
      tenantId: input.tenantId,
      tenantPolicy: this.resolveTenantPolicy(input.tenantId),
      traceId,
    };
    const result = await this.invoke(taskRequest);

    return this.toTutorOutput({
      evalGate,
      result,
    });
  }

  async invoke(input: AiTaskRequest): Promise<AiValidatedTaskOutput> {
    const startedAt = this.options.nowMs?.() ?? Date.now();
    const policy = evaluateAiPolicy({
      agent: input.agent,
      lesson: input.lesson,
      request: input,
    });

    if (!policy.allowed) {
      return this.policyDeniedOutput({
        input,
        policy,
        route: policyRefusalRoute({
          reason: "policy_denied",
          taskType: input.taskType,
        }),
        startedAt,
      });
    }

    const routeResult = await this.router.select(input);

    if (!routeResult.allowed) {
      return this.fallbackOutput({
        fallbackReason: routeResult.reason,
        input,
        route: routeResult.route,
        schemaValidationResult: failedSchemaResult({
          reason: routeResult.reason,
          taskType: input.taskType,
        }),
        startedAt,
      });
    }

    try {
      const providerOutput = await this.invokeProviderWithTimeout({
        input,
        provider: routeResult.provider,
        route: routeResult.route,
      });
      const validation = validateAiTaskOutput({
        lesson: input.lesson,
        maxOutputChars: input.tenantPolicy.maxOutputChars,
        output: providerOutput.output,
        taskType: input.taskType,
      });

      if (!validation.success) {
        return this.fallbackOutput({
          costEstimate: providerOutput.costEstimate,
          fallbackReason: "schema_validation_failed",
          input,
          route: fallbackRoute({
            estimatedCost: providerOutput.costEstimate,
            reason: "schema_validation_failed",
            taskType: input.taskType,
          }),
          schemaValidationResult: validation.schemaValidationResult,
          startedAt,
          usage: providerOutput.usage,
        });
      }

      const finishReason =
        providerOutput.safetyResult.status === "refused"
          ? "safety_refusal"
          : providerOutput.finishReason;
      const result: AiValidatedTaskOutput = {
        costEstimate: providerOutput.costEstimate,
        finishReason,
        latencyMs: providerOutput.latencyMs,
        modelId: providerOutput.modelId,
        output: validation.output,
        providerId: providerOutput.providerId,
        requestId: input.requestId,
        routingDecision: routeResult.route,
        safetyResult: providerOutput.safetyResult,
        schemaValidationResult: validation.schemaValidationResult,
        traceId: input.traceId,
        usage: providerOutput.usage,
      };

      this.emitEvent({
        eventType: finishReason === "safety_refusal" ? "fallback_used" : "success",
        fallbackReason: finishReason === "safety_refusal" ? "provider_safety_refusal" : undefined,
        input,
        result,
      });

      return result;
    } catch (error) {
      const fallbackReason = fallbackReasonForProviderError(error);

      return this.fallbackOutput({
        fallbackReason,
        input,
        route: fallbackRoute({
          reason: fallbackReason,
          taskType: input.taskType,
        }),
        schemaValidationResult: failedSchemaResult({
          reason: fallbackReason,
          taskType: input.taskType,
        }),
        startedAt,
      });
    }
  }

  private async invokeProviderWithTimeout(input: {
    input: AiTaskRequest;
    provider: AiProvider;
    route: AiRouteDecision;
  }): Promise<AiProviderInvokeOutput> {
    const providerInput = {
      actorId: input.input.actorId,
      language: input.input.language,
      modelId: input.route.modelId,
      payload: input.input.payload,
      policyVersion: input.input.policyVersion,
      promptVersion: input.input.promptVersion,
      requestId: input.input.requestId,
      sourceScope: input.input.sourceScope,
      taskType: input.input.taskType,
      tenantId: input.input.tenantId,
      traceId: input.input.traceId,
    };

    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        input.provider.invoke(providerInput),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new AiProviderTimeoutError(input.provider.providerId)),
            input.provider.timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  private policyDeniedOutput(input: {
    input: AiTaskRequest;
    policy: Exclude<AiPolicyDecision, { allowed: true }>;
    route: AiRouteDecision;
    startedAt: number;
  }): AiValidatedTaskOutput {
    const output = {
      citations: input.policy.citations,
      content: input.policy.content,
      safetyFlags: input.policy.flags,
    };
    const validation = validateAiTaskOutput({
      lesson: input.input.lesson,
      maxOutputChars: input.input.tenantPolicy.maxOutputChars,
      output,
      taskType: input.input.taskType === "tutor_chat" ? "tutor_chat" : "fallback_safe_response",
    });
    const result: AiValidatedTaskOutput = {
      costEstimate: 0,
      finishReason: "policy_denied",
      latencyMs: this.elapsed(input.startedAt),
      modelId: input.route.modelId,
      output: validation.success
        ? validation.output
        : buildSafeFallbackOutput({
            citations: input.policy.citations,
            policyVersion: input.input.policyVersion,
            reason: "policy_denied",
          }),
      providerId: input.route.providerId,
      requestId: input.input.requestId,
      routingDecision: input.route,
      safetyResult: {
        policyVersion: input.input.policyVersion,
        reason: input.policy.reason,
        refused: true,
        status: "blocked",
      },
      schemaValidationResult: validation.schemaValidationResult,
      traceId: input.input.traceId,
      usage: usageFromText(input.policy.content),
    };

    this.emitEvent({
      eventType: "policy_denied",
      fallbackReason: "policy_denied",
      input: input.input,
      result,
    });

    return result;
  }

  private fallbackOutput(input: {
    costEstimate?: number;
    fallbackReason: AiFallbackReason;
    input: AiTaskRequest;
    route: AiRouteDecision;
    schemaValidationResult: AiSchemaValidationResult;
    startedAt: number;
    usage?: AiUsage;
  }): AiValidatedTaskOutput {
    const output = buildSafeFallbackOutput({
      policyVersion: input.input.policyVersion,
      reason: input.fallbackReason,
    });
    const result: AiValidatedTaskOutput = {
      costEstimate: input.costEstimate ?? input.route.estimatedCost,
      finishReason: finishReasonForFallback(input.fallbackReason),
      latencyMs: this.elapsed(input.startedAt),
      modelId: input.route.modelId,
      output,
      providerId: input.route.providerId,
      requestId: input.input.requestId,
      routingDecision: input.route,
      safetyResult: {
        policyVersion: input.input.policyVersion,
        reason: input.fallbackReason,
        refused: true,
        status: "refused",
      },
      schemaValidationResult: input.schemaValidationResult,
      traceId: input.input.traceId,
      usage: input.usage ?? {
        inputTokens: estimateTokens(JSON.stringify(input.input.payload)),
        outputTokens: estimateTokens(output.content),
        totalTokens:
          estimateTokens(JSON.stringify(input.input.payload)) + estimateTokens(output.content),
      },
    };

    this.emitEvent({
      eventType:
        input.fallbackReason === "schema_validation_failed" ? "schema_error" : "fallback_used",
      fallbackReason: input.fallbackReason,
      input: input.input,
      result,
    });

    return result;
  }

  private toTutorOutput(input: {
    evalGate: AiEvalGateDecision;
    result: AiValidatedTaskOutput;
  }): AiOrchestratorOutput {
    const parsed = tutorChatResponseSchema.safeParse(input.result.output);

    if (!parsed.success) {
      throw new ApiHttpError(502, "ai_output.schema_invalid", "AI provider output was invalid.", {
        outputSchemaVersion: tutorOutputSchemaVersion,
      });
    }

    const output: TutorChatResponse = parsed.data;
    const fallbackReason = input.result.routingDecision.fallbackReason;

    return {
      citations: output.citations,
      content: output.content,
      costEstimate: input.result.costEstimate,
      evalGate: input.evalGate,
      finishReason: input.result.finishReason,
      inputTokens: input.result.usage.inputTokens,
      latencyMs: input.result.latencyMs,
      modelId: input.result.modelId,
      outputSchemaVersion: tutorOutputSchemaVersion,
      outputTokens: input.result.usage.outputTokens,
      provider: input.result.providerId,
      requestId: input.result.requestId,
      routingDecision: input.result.routingDecision,
      safetyFlags: {
        ...output.safetyFlags,
        evalGate: input.evalGate,
        eventType: eventTypeForResult(input.result),
        fallbackReason,
        latencyMs: input.result.latencyMs,
        outputSchemaVersion: tutorOutputSchemaVersion,
        requestId: input.result.requestId,
        routingDecision: input.result.routingDecision,
        schemaValidationResult: input.result.schemaValidationResult,
        traceId: input.result.traceId,
      },
      schemaValidationResult: input.result.schemaValidationResult,
      traceId: input.result.traceId,
    };
  }

  private emitEvent(input: {
    eventType: AiCallEvent["eventType"];
    fallbackReason?: AiFallbackReason;
    input: AiTaskRequest;
    result: AiValidatedTaskOutput;
  }): void {
    this.options.eventSink?.(
      createAiCallEvent({
        costEstimate: input.result.costEstimate,
        eventType: input.eventType,
        fallbackReason: input.fallbackReason,
        finishReason: input.result.finishReason,
        latencyMs: input.result.latencyMs,
        modelId: input.result.modelId,
        providerId: input.result.providerId,
        requestId: input.input.requestId,
        schemaValidationResult: input.result.schemaValidationResult,
        taskType: input.input.taskType,
        tenantId: input.input.tenantId,
        traceId: input.input.traceId,
        usage: input.result.usage,
      }),
    );
  }

  private resolveTenantPolicy(tenantId: string): AiTenantPolicy {
    const base = createDefaultTenantAiPolicy({ tenantId });
    const override =
      typeof this.options.tenantPolicy === "function"
        ? this.options.tenantPolicy(tenantId)
        : this.options.tenantPolicy;

    return {
      ...base,
      ...override,
      tenantId,
    };
  }

  private elapsed(startedAt: number): number {
    return Math.max(0, Math.round((this.options.nowMs?.() ?? Date.now()) - startedAt));
  }
}

export function createDefaultAiOrchestrator(
  input: Partial<AiOrchestratorOptions> = {},
): AiOrchestrator {
  const registry =
    input.providerRegistry ??
    (input.provider ? new ProviderRegistry([input.provider]) : createDefaultProviderRegistry());

  return new DefaultAiOrchestrator({
    ...input,
    providerRegistry: registry,
    router: input.router ?? createDefaultModelRouter(registry),
  });
}

function evaluatePromptReleaseGate(input: AiOrchestratorInput): AiEvalGateDecision {
  const checks = ["prompt_approved", "output_schema_present", "agent_active", "tool_allow_list"];

  if (input.prompt.evalStatus !== "approved") {
    return {
      checks,
      reason: "prompt_not_approved",
      status: "blocked",
    };
  }

  if (input.agent.status !== "active") {
    return {
      checks,
      reason: "agent_not_active",
      status: "blocked",
    };
  }

  if (!input.prompt.outputSchema || Object.keys(input.prompt.outputSchema).length === 0) {
    return {
      checks,
      reason: "missing_output_schema",
      status: "blocked",
    };
  }

  return {
    checks,
    status: "passed",
  };
}

function fallbackReasonForProviderError(error: unknown): AiFallbackReason {
  if (error instanceof AiProviderTimeoutError) {
    return "provider_timeout";
  }

  if (error instanceof AiProviderUnavailableError) {
    return "provider_unavailable";
  }

  return "provider_error";
}

function finishReasonForFallback(reason: AiFallbackReason): AiFinishReason {
  if (reason === "cost_quota_exceeded") {
    return "quota_exceeded";
  }

  if (reason === "provider_timeout") {
    return "timeout";
  }

  if (reason === "provider_unavailable") {
    return "provider_unavailable";
  }

  if (reason === "schema_validation_failed") {
    return "schema_error";
  }

  if (reason === "policy_denied") {
    return "policy_denied";
  }

  return "fallback";
}

function failedSchemaResult(input: {
  reason: AiFallbackReason;
  taskType: AiTaskRequest["taskType"];
}): AiSchemaValidationResult {
  return {
    details: [input.reason],
    schemaVersion:
      input.taskType === "fallback_safe_response"
        ? safeFallbackOutputSchemaVersion
        : "not_validated",
    status: "failed",
  };
}

function usageFromText(value: string): AiUsage {
  const tokens = estimateTokens(value);

  return {
    inputTokens: 0,
    outputTokens: tokens,
    totalTokens: tokens,
  };
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.trim().split(/\s+/).length * 1.3));
}

function eventTypeForResult(result: AiValidatedTaskOutput): string {
  if (result.routingDecision.fallbackReason) {
    return "fallback_used";
  }

  if (result.finishReason === "policy_denied") {
    return "policy_denied";
  }

  return "success";
}
