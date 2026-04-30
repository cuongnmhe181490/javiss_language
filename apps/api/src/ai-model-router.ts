import type {
  AiFallbackReason,
  AiLanguage,
  AiRouteDecision,
  AiSafetyRequirement,
  AiTaskRequest,
  AiTaskType,
  AiTenantPolicy,
} from "./ai-orchestration-domain.js";
import {
  createDefaultTenantAiPolicy,
  safeFallbackOutputSchemaVersion,
} from "./ai-orchestration-domain.js";
import {
  assertProviderMetadataSafe,
  createDefaultAiProvider,
  type AiProvider,
} from "./ai-provider.js";

export type AiRouteDenied = {
  allowed: false;
  estimatedCost: number;
  reason: AiFallbackReason;
  route: AiRouteDecision;
};

export type AiRouteAllowed = {
  allowed: true;
  provider: AiProvider;
  route: AiRouteDecision;
};

export type AiRouteResult = AiRouteAllowed | AiRouteDenied;

export class ProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  constructor(providers: AiProvider[] = []) {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  register(provider: AiProvider): void {
    assertProviderMetadataSafe(provider.metadata);
    this.providers.set(provider.providerId, provider);
  }

  find(providerId: string): AiProvider | null {
    return this.providers.get(providerId) ?? null;
  }

  list(): AiProvider[] {
    return [...this.providers.values()];
  }

  listCandidates(input: {
    language: AiLanguage;
    taskType: AiTaskType;
    tenantPolicy: AiTenantPolicy;
  }): AiProvider[] {
    return this.list().filter((provider) => {
      if (!input.tenantPolicy.allowedProviders.includes(provider.providerId)) {
        return false;
      }

      if (!provider.supportedTasks.includes(input.taskType)) {
        return false;
      }

      if (!provider.supportedLanguages.includes(input.language)) {
        return false;
      }

      return provider.metadata.models.some(
        (model) =>
          model.tasks.includes(input.taskType) &&
          model.languages.includes(input.language) &&
          model.safety.includes(input.tenantPolicy.safetyRequirement) &&
          input.tenantPolicy.allowedModels.includes(model.modelId),
      );
    });
  }
}

export class ModelRouter {
  constructor(private readonly registry: ProviderRegistry) {}

  async select(input: AiTaskRequest): Promise<AiRouteResult> {
    if (!input.tenantPolicy.enabled || !input.tenantPolicy.allowedTasks.includes(input.taskType)) {
      return deniedRoute({
        reason: "policy_denied",
        requestedCapability: input.taskType,
        safetyRequirement: input.tenantPolicy.safetyRequirement,
      });
    }

    const candidates = this.registry.listCandidates({
      language: input.language,
      taskType: input.taskType,
      tenantPolicy: input.tenantPolicy,
    });

    for (const provider of candidates) {
      const modelId = selectModel({
        language: input.language,
        provider,
        safetyRequirement: input.tenantPolicy.safetyRequirement,
        taskType: input.taskType,
        tenantPolicy: input.tenantPolicy,
      });

      if (!modelId) {
        continue;
      }

      const estimate = await provider.estimateCost({
        actorId: input.actorId,
        language: input.language,
        modelId,
        payload: input.payload,
        policyVersion: input.policyVersion,
        promptVersion: input.promptVersion,
        requestId: input.requestId,
        sourceScope: input.sourceScope,
        taskType: input.taskType,
        tenantId: input.tenantId,
        traceId: input.traceId,
      });
      const costLimit = Math.min(
        input.costLimit ?? input.tenantPolicy.costLimit,
        input.tenantPolicy.costLimit,
        input.tenantPolicy.maxEstimatedCost,
        input.tenantPolicy.remainingBudget,
      );

      if (estimate.costEstimate > costLimit) {
        return deniedRoute({
          estimatedCost: estimate.costEstimate,
          reason: "cost_quota_exceeded",
          requestedCapability: input.taskType,
          safetyRequirement: input.tenantPolicy.safetyRequirement,
        });
      }

      const health = await provider.healthCheck();

      if (health.status !== "healthy") {
        continue;
      }

      return {
        allowed: true,
        provider,
        route: {
          estimatedCost: estimate.costEstimate,
          modelId,
          provider: provider.providerId,
          providerId: provider.providerId,
          reason: "tenant_policy",
          requestedCapability: input.taskType,
          safetyRequirement: input.tenantPolicy.safetyRequirement,
        },
      };
    }

    return deniedRoute({
      reason: "provider_unavailable",
      requestedCapability: input.taskType,
      safetyRequirement: input.tenantPolicy.safetyRequirement,
    });
  }
}

export function createDefaultProviderRegistry(): ProviderRegistry {
  return new ProviderRegistry([createDefaultAiProvider()]);
}

export function createDefaultModelRouter(registry = createDefaultProviderRegistry()): ModelRouter {
  return new ModelRouter(registry);
}

export function policyRefusalRoute(
  input: {
    reason?: AiFallbackReason;
    taskType?: AiTaskType;
  } = {},
): AiRouteDecision {
  return {
    estimatedCost: 0,
    fallbackReason: input.reason ?? "policy_denied",
    modelId: "policy-refusal",
    provider: "policy",
    providerId: "policy",
    reason: "policy_refusal",
    requestedCapability: input.taskType ?? "tutor_chat",
    safetyRequirement: "strict",
  };
}

export function fallbackRoute(input: {
  estimatedCost?: number;
  reason: AiFallbackReason;
  taskType: AiTaskType;
}): AiRouteDecision {
  return {
    estimatedCost: input.estimatedCost ?? 0,
    fallbackReason: input.reason,
    modelId: "safe-fallback-v1",
    provider: "fallback",
    providerId: "fallback",
    reason: input.reason === "cost_quota_exceeded" ? "quota_exceeded" : "fallback",
    requestedCapability: input.taskType,
    safetyRequirement: "strict",
  };
}

function selectModel(input: {
  language: AiLanguage;
  provider: AiProvider;
  safetyRequirement: AiSafetyRequirement;
  taskType: AiTaskType;
  tenantPolicy: AiTenantPolicy;
}): string | null {
  const model = input.provider.metadata.models.find(
    (candidate) =>
      candidate.tasks.includes(input.taskType) &&
      candidate.languages.includes(input.language) &&
      candidate.safety.includes(input.safetyRequirement) &&
      input.tenantPolicy.allowedModels.includes(candidate.modelId),
  );

  return model?.modelId ?? null;
}

function deniedRoute(input: {
  estimatedCost?: number;
  reason: AiFallbackReason;
  requestedCapability: AiTaskType;
  safetyRequirement: AiSafetyRequirement;
}): AiRouteDenied {
  return {
    allowed: false,
    estimatedCost: input.estimatedCost ?? 0,
    reason: input.reason,
    route: {
      estimatedCost: input.estimatedCost ?? 0,
      fallbackReason: input.reason,
      modelId:
        input.reason === "provider_unavailable"
          ? "provider-unavailable"
          : safeFallbackOutputSchemaVersion,
      provider: "router",
      providerId: "router",
      reason: input.reason === "provider_unavailable" ? "provider_unavailable" : "fallback",
      requestedCapability: input.requestedCapability,
      safetyRequirement: input.safetyRequirement,
    },
  };
}

export function defaultTenantPolicy(tenantId: string): AiTenantPolicy {
  return createDefaultTenantAiPolicy({ tenantId });
}
