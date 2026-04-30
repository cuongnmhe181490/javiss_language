import { z } from "zod";
import type { Actor, AuditOutcome, Permission, Role } from "@polyglot/contracts";
import { auditOutcomeSchema } from "@polyglot/contracts";
import { createAuditEvent } from "@polyglot/tenant-core";

import { createAiConversationSchema, createAiMessageSchema } from "./ai-domain.js";
import { createDefaultAiOrchestrator } from "./ai-orchestrator.js";
import type { AiOrchestrator } from "./ai-orchestration-domain.js";
import { createAiServices } from "./ai-services.js";
import { createAuthProvider, type AuthProvider } from "./auth-provider.js";
import { createApiConfig, type ApiConfig } from "./config.js";
import { createRequestContext, requirePermission, type RequestContext } from "./context.js";
import {
  contentListQuerySchema,
  contentReviewDecisionSchema,
  createContentItemSchema,
  createContentSourceSchema,
  createContentVersionSchema,
  sourceListQuerySchema,
  syncPublishedContentSchema,
  submitContentReviewSchema,
  updateContentSourceSchema,
} from "./content-domain.js";
import { createContentServices } from "./content-services.js";
import { ApiHttpError, jsonResponse, toApiErrorResponse, type ResponseContext } from "./errors.js";
import {
  completeLessonSchema,
  courseListQuerySchema,
  createAssignmentSchema,
  createCourseSchema,
  createLessonBlockSchema,
  createLessonSchema,
  createModuleSchema,
  updateCourseSchema,
  updateLessonSchema,
} from "./learning-domain.js";
import { createLearningServices } from "./learning-services.js";
import { createJsonLogger, type Logger, requestLogFields } from "./logging.js";
import type { RateLimiter } from "./rate-limit.js";
import { createRateLimiterForConfig } from "./rate-limiter-factory.js";
import { createReadinessChecks, summarizeReadiness, type ReadinessChecks } from "./readiness.js";
import { createRepositories } from "./repository-factory.js";
import type { ApiRepositories } from "./repositories.js";
import {
  createSpeakingSessionSchema,
  endSpeakingSessionSchema,
  textFallbackTurnSchema,
} from "./speaking-domain.js";
import { createSpeakingServices } from "./speaking-services.js";
import { resolveRequestScope, type RequestScope } from "./tenant-context.js";
import { buildRequestSpanAttributes, withRequestSpan } from "./tracing.js";

export type ApiDependencies = {
  authProvider: AuthProvider;
  aiOrchestrator: AiOrchestrator;
  config: ApiConfig;
  logger: Logger;
  rateLimiter: RateLimiter;
  readinessChecks?: () => Promise<ReadinessChecks>;
  repositories: ApiRepositories;
  now: () => Date;
  randomId: () => string;
};

const auditListQuerySchema = z.object({
  action: z.string().min(1).max(160).optional(),
  actorId: z.string().uuid().optional(),
  outcome: auditOutcomeSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const auditExportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
});

export async function handleApiRequest(
  request: Request,
  dependencies?: ApiDependencies,
): Promise<Response> {
  const deps = dependencies ?? createDefaultDependencies();
  const startedAt = Date.now();
  const preliminaryContext = createPreliminaryResponseContext(request, deps);
  let context: RequestContext | null = null;
  let scope: RequestScope | null = null;

  try {
    return await withRequestSpan(
      deps.config,
      "api.request",
      buildRequestSpanAttributes({
        actor: null,
        method: request.method,
        requestId: preliminaryContext.requestId,
        route: new URL(request.url).pathname,
      }),
      async () => {
        enforceBodySize(request, deps.config);

        context = await createRequestContext(request, deps.authProvider);
        const responseContext = createResponseContext(context, deps);
        const url = new URL(request.url);
        scope = resolveRequestScope(url, context.actor);

        if (scope.kind === "public") {
          return logAndReturn(
            deps,
            request,
            await handleHealth(scope, deps, responseContext),
            context,
            scope,
            startedAt,
          );
        }

        await enforceRateLimit(scope, context, deps);

        if (request.method === "GET" && scope.suffix === "") {
          return logAndReturn(
            deps,
            request,
            await handleTenantRead(scope, context, deps, responseContext),
            context,
            scope,
            startedAt,
          );
        }

        const learningResponse = await handleLearningRoute(
          request,
          scope,
          context,
          deps,
          responseContext,
          url,
        );

        if (learningResponse) {
          return logAndReturn(deps, request, learningResponse, context, scope, startedAt);
        }

        if (request.method === "GET" && scope.suffix === "/audit-events") {
          return logAndReturn(
            deps,
            request,
            await handleAuditList(scope, context, deps, responseContext, url),
            context,
            scope,
            startedAt,
          );
        }

        if (request.method === "POST" && scope.suffix === "/audit-events/export") {
          return logAndReturn(
            deps,
            request,
            await handleAuditExport(scope, context, deps, responseContext, url),
            context,
            scope,
            startedAt,
          );
        }

        throw new ApiHttpError(405, "route.method_not_allowed", "Method not allowed.");
      },
    );
  } catch (error) {
    const response = toApiErrorResponse(
      error,
      context ? createResponseContext(context, deps) : preliminaryContext,
    );

    return logAndReturn(deps, request, response, context, scope, startedAt, error);
  }
}

function createDefaultDependencies(): ApiDependencies {
  const config = createApiConfig(process.env);

  return {
    authProvider: createAuthProvider(config),
    aiOrchestrator: createDefaultAiOrchestrator(),
    config,
    logger: createJsonLogger(config),
    rateLimiter: createRateLimiterForConfig(config),
    repositories: createRepositories(config),
    now: () => new Date(),
    randomId: () => crypto.randomUUID(),
  };
}

function logAndReturn(
  deps: ApiDependencies,
  request: Request,
  response: Response,
  context: RequestContext | null,
  scope: RequestScope | null,
  startedAt: number,
  error?: unknown,
): Response {
  const route =
    scope?.kind === "tenant"
      ? `/v1/tenants/:tenantId${scope.suffix}`
      : new URL(request.url).pathname;
  const fields = requestLogFields({
    actor: context?.actor ?? null,
    durationMs: Date.now() - startedAt,
    method: request.method,
    requestId: context?.requestId ?? response.headers.get("x-request-id") ?? "unknown",
    route,
    status: response.status,
    tenantId: scope?.kind === "tenant" ? scope.tenantId : undefined,
  });

  if (error) {
    deps.logger.error("api.request", fields);
  } else {
    deps.logger.info("api.request", fields);
  }

  return response;
}

async function handleLearningRoute(
  request: Request,
  scope: Extract<RequestScope, { kind: "tenant" }>,
  context: RequestContext,
  deps: ApiDependencies,
  responseContext: ResponseContext,
  url: URL,
): Promise<Response | null> {
  const services = createLearningServices(deps.repositories.learning);
  const contentServices = createContentServices(
    deps.repositories.content,
    deps.repositories.learning,
  );
  const aiServices = createAiServices({
    aiRepositories: deps.repositories.ai,
    learningRepositories: deps.repositories.learning,
    orchestrator: deps.aiOrchestrator,
  });
  const speakingServices = createSpeakingServices({
    speakingRepositories: deps.repositories.speaking,
    learningRepositories: deps.repositories.learning,
    randomId: deps.randomId,
  });

  if (request.method === "GET" && scope.suffix === "/ai/agents") {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "agent:read",
      tenantId: scope.tenantId,
    });
    void actor;
    return jsonResponse(
      {
        data: await aiServices.tutor.listAgents(scope.tenantId),
      },
      200,
      responseContext,
    );
  }

  if (request.method === "POST" && scope.suffix === "/ai/conversations") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "ai_tutor:chat",
      tenantId: scope.tenantId,
    });
    const conversation = await aiServices.tutor.createConversation({
      actor,
      tenantId: scope.tenantId,
      body: createAiConversationSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "ai_conversation:create",
      resourceId: conversation.id,
      resourceType: "ai_conversation",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        agentId: conversation.agentId,
        lessonId: conversation.lessonId,
      },
    });

    return jsonResponse({ data: conversation }, 201, responseContext);
  }

  const aiConversationMatch = /^\/ai\/conversations\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "GET" && aiConversationMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "ai_conversation:read_own",
      tenantId: scope.tenantId,
    });
    return jsonResponse(
      {
        data: await aiServices.tutor.getConversation({
          actor,
          tenantId: scope.tenantId,
          conversationId: decodeURIComponent(aiConversationMatch[1]!),
        }),
      },
      200,
      responseContext,
    );
  }

  const aiMessageMatch = /^\/ai\/conversations\/([^/]+)\/messages$/.exec(scope.suffix);

  if (request.method === "POST" && aiMessageMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "ai_tutor:chat",
      tenantId: scope.tenantId,
    });
    const conversationId = decodeURIComponent(aiMessageMatch[1]!);
    const result = await auditMutationFailure(
      deps,
      context,
      actor,
      {
        action: "ai_tutor:chat",
        resourceId: conversationId,
        resourceType: "ai_conversation",
        tenantId: scope.tenantId,
      },
      async () =>
        aiServices.tutor.sendMessage({
          actor,
          tenantId: scope.tenantId,
          conversationId,
          body: createAiMessageSchema.parse(await parseJsonBody(request)),
          now: deps.now(),
          requestId: context.requestId,
          traceId: context.requestId,
        }),
    );
    await appendAuditEvent(deps, context, actor, {
      action: result.assistantMessage.safetyFlags.refused
        ? "ai_message:refused"
        : "ai_message:create",
      resourceId: result.assistantMessage.id,
      resourceType: "ai_message",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        conversationId: result.assistantMessage.conversationId,
        costEstimate: result.assistantMessage.costEstimate,
        latencyMs: result.assistantMessage.safetyFlags.latencyMs,
        modelId: result.assistantMessage.modelId,
        outputSchemaVersion: result.assistantMessage.safetyFlags.outputSchemaVersion,
        provider: result.assistantMessage.provider,
        refused: result.assistantMessage.safetyFlags.refused === true,
        routingDecision: result.assistantMessage.safetyFlags.routingDecision,
      },
    });

    return jsonResponse({ data: result }, 201, responseContext);
  }

  if (request.method === "POST" && scope.suffix === "/speaking/sessions") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "speaking_session:create",
      tenantId: scope.tenantId,
    });
    const result = await speakingServices.sessions.createSession({
      actor,
      tenantId: scope.tenantId,
      body: createSpeakingSessionSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "speaking_session:create",
      resourceId: result.session.id,
      resourceType: "speaking_session",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        lessonId: result.session.lessonId,
        mode: result.session.mode,
        provider: result.realtime.provider,
      },
    });

    return jsonResponse({ data: result }, 201, responseContext);
  }

  const speakingSessionMatch = /^\/speaking\/sessions\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "GET" && speakingSessionMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "speaking_session:read_own",
      tenantId: scope.tenantId,
    });

    return jsonResponse(
      {
        data: await speakingServices.sessions.getSession({
          actor,
          tenantId: scope.tenantId,
          sessionId: decodeURIComponent(speakingSessionMatch[1]!),
        }),
      },
      200,
      responseContext,
    );
  }

  const speakingSessionEndMatch = /^\/speaking\/sessions\/([^/]+)\/end$/.exec(scope.suffix);

  if (request.method === "POST" && speakingSessionEndMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "speaking_session:end_own",
      tenantId: scope.tenantId,
    });
    const sessionId = decodeURIComponent(speakingSessionEndMatch[1]!);
    const session = await auditMutationFailure(
      deps,
      context,
      actor,
      {
        action: "speaking_session:end_own",
        resourceId: sessionId,
        resourceType: "speaking_session",
        tenantId: scope.tenantId,
      },
      async () =>
        speakingServices.sessions.endSession({
          actor,
          tenantId: scope.tenantId,
          sessionId,
          body: endSpeakingSessionSchema.parse(await parseJsonBody(request)),
          now: deps.now(),
        }),
    );
    await appendAuditEvent(deps, context, actor, {
      action: "speaking_session:end",
      resourceId: session.id,
      resourceType: "speaking_session",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        latencyMs: session.latencyMs,
        status: session.status,
      },
    });

    return jsonResponse({ data: session }, 200, responseContext);
  }

  const speakingTextFallbackMatch = /^\/speaking\/sessions\/([^/]+)\/text-fallback$/.exec(
    scope.suffix,
  );

  if (request.method === "POST" && speakingTextFallbackMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "speaking_session:text_fallback",
      tenantId: scope.tenantId,
    });
    const sessionId = decodeURIComponent(speakingTextFallbackMatch[1]!);
    const result = await auditMutationFailure(
      deps,
      context,
      actor,
      {
        action: "speaking_session:text_fallback",
        resourceId: sessionId,
        resourceType: "speaking_session",
        tenantId: scope.tenantId,
      },
      async () =>
        speakingServices.sessions.addTextFallback({
          actor,
          tenantId: scope.tenantId,
          sessionId,
          body: textFallbackTurnSchema.parse(await parseJsonBody(request)),
          now: deps.now(),
        }),
    );
    await appendAuditEvent(deps, context, actor, {
      action: "speaking_text_fallback:create",
      resourceId: result.learnerSegment.id,
      resourceType: "speaking_transcript_segment",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        sessionId: result.learnerSegment.sessionId,
      },
    });

    return jsonResponse({ data: result }, 201, responseContext);
  }

  const speakingReportMatch = /^\/speaking\/sessions\/([^/]+)\/report$/.exec(scope.suffix);

  if (request.method === "GET" && speakingReportMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "speaking_report:read",
      tenantId: scope.tenantId,
    });

    return jsonResponse(
      {
        data: await speakingServices.sessions.getReport({
          actor,
          tenantId: scope.tenantId,
          sessionId: decodeURIComponent(speakingReportMatch[1]!),
        }),
      },
      200,
      responseContext,
    );
  }

  if (request.method === "GET" && scope.suffix === "/admin/sources") {
    await authorizeTenantAction(context, deps, {
      permission: "source:read",
      tenantId: scope.tenantId,
    });
    const query = sourceListQuerySchema.parse(Object.fromEntries(url.searchParams));

    return jsonResponse(
      await contentServices.sources.listSources({
        tenantId: scope.tenantId,
        query,
      }),
      200,
      responseContext,
    );
  }

  if (request.method === "POST" && scope.suffix === "/admin/sources") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "source:write",
      tenantId: scope.tenantId,
    });
    const source = await contentServices.sources.createSource({
      actor,
      tenantId: scope.tenantId,
      body: createContentSourceSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "source:create",
      resourceId: source.id,
      resourceType: "content_source",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        licenseType: source.licenseType,
        reference: source.reference,
        status: source.status,
      },
    });

    return jsonResponse({ data: source }, 201, responseContext);
  }

  const adminSourceMatch = /^\/admin\/sources\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "PATCH" && adminSourceMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "source:write",
      tenantId: scope.tenantId,
    });
    const source = await contentServices.sources.updateSource({
      tenantId: scope.tenantId,
      sourceId: decodeURIComponent(adminSourceMatch[1]!),
      body: updateContentSourceSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "source:update",
      resourceId: source.id,
      resourceType: "content_source",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        status: source.status,
      },
    });

    return jsonResponse({ data: source }, 200, responseContext);
  }

  const adminSourceApproveMatch = /^\/admin\/sources\/([^/]+)\/approve$/.exec(scope.suffix);

  if (request.method === "POST" && adminSourceApproveMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "source:approve",
      tenantId: scope.tenantId,
    });
    const source = await contentServices.sources.approveSource({
      actor,
      tenantId: scope.tenantId,
      sourceId: decodeURIComponent(adminSourceApproveMatch[1]!),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "source:approve",
      resourceId: source.id,
      resourceType: "content_source",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        licenseType: source.licenseType,
        commercialAllowed: source.commercialAllowed,
      },
    });

    return jsonResponse({ data: source }, 200, responseContext);
  }

  if (request.method === "GET" && scope.suffix === "/admin/content") {
    await authorizeTenantAction(context, deps, {
      permission: "content:read",
      tenantId: scope.tenantId,
    });
    const query = contentListQuerySchema.parse(Object.fromEntries(url.searchParams));

    return jsonResponse(
      await contentServices.content.listContent({
        tenantId: scope.tenantId,
        query,
      }),
      200,
      responseContext,
    );
  }

  if (request.method === "GET" && scope.suffix === "/admin/review-queue") {
    await authorizeTenantAction(context, deps, {
      permission: "content:review",
      tenantId: scope.tenantId,
    });
    const query = contentListQuerySchema
      .pick({
        page: true,
        pageSize: true,
      })
      .parse(Object.fromEntries(url.searchParams));

    return jsonResponse(
      await contentServices.content.listReviewQueue({
        tenantId: scope.tenantId,
        query,
      }),
      200,
      responseContext,
    );
  }

  if (request.method === "POST" && scope.suffix === "/admin/content/items") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:create",
      tenantId: scope.tenantId,
    });
    const item = await contentServices.content.createItem({
      actor,
      tenantId: scope.tenantId,
      body: createContentItemSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "content_item:create",
      resourceId: item.id,
      resourceType: "content_item",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        status: item.status,
        type: item.type,
      },
    });

    return jsonResponse({ data: item }, 201, responseContext);
  }

  const adminContentItemMatch = /^\/admin\/content\/items\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "GET" && adminContentItemMatch) {
    await authorizeTenantAction(context, deps, {
      permission: "content:read",
      tenantId: scope.tenantId,
    });

    return jsonResponse(
      {
        data: await contentServices.content.getContentItem({
          tenantId: scope.tenantId,
          itemId: decodeURIComponent(adminContentItemMatch[1]!),
        }),
      },
      200,
      responseContext,
    );
  }

  const adminContentVersionCreateMatch = /^\/admin\/content\/items\/([^/]+)\/versions$/.exec(
    scope.suffix,
  );

  if (request.method === "POST" && adminContentVersionCreateMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:update",
      tenantId: scope.tenantId,
    });
    const version = await contentServices.content.createVersion({
      actor,
      tenantId: scope.tenantId,
      itemId: decodeURIComponent(adminContentVersionCreateMatch[1]!),
      body: createContentVersionSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "content_version:create",
      resourceId: version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        contentItemId: version.contentItemId,
        sourceIds: version.sourceIds,
        version: version.version,
      },
    });

    return jsonResponse({ data: version }, 201, responseContext);
  }

  const adminContentSubmitReviewMatch = /^\/admin\/content\/items\/([^/]+)\/submit-review$/.exec(
    scope.suffix,
  );

  if (request.method === "POST" && adminContentSubmitReviewMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:update",
      tenantId: scope.tenantId,
    });
    const body = submitContentReviewSchema.parse(await parseJsonBody(request));
    const version = await contentServices.content.submitReview({
      actor,
      tenantId: scope.tenantId,
      itemId: decodeURIComponent(adminContentSubmitReviewMatch[1]!),
      versionId: body.versionId,
      comments: body.comments,
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "content:submit_review",
      resourceId: version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        contentItemId: version.contentItemId,
        version: version.version,
      },
    });

    return jsonResponse({ data: version }, 200, responseContext);
  }

  const adminContentApproveMatch =
    /^\/admin\/content\/items\/([^/]+)\/versions\/([^/]+)\/approve$/.exec(scope.suffix);

  if (request.method === "POST" && adminContentApproveMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:review",
      tenantId: scope.tenantId,
    });
    const body = contentReviewDecisionSchema.parse(await parseJsonBody(request));
    const version = await contentServices.content.approveVersion({
      actor,
      tenantId: scope.tenantId,
      itemId: decodeURIComponent(adminContentApproveMatch[1]!),
      versionId: decodeURIComponent(adminContentApproveMatch[2]!),
      comments: body.comments,
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "content:approve",
      resourceId: version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        contentItemId: version.contentItemId,
        version: version.version,
      },
    });

    return jsonResponse({ data: version }, 200, responseContext);
  }

  const adminContentQaMatch = /^\/admin\/content\/items\/([^/]+)\/versions\/([^/]+)\/qa$/.exec(
    scope.suffix,
  );

  if (request.method === "POST" && adminContentQaMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:review",
      tenantId: scope.tenantId,
    });
    const version = await contentServices.content.runQa({
      actor,
      tenantId: scope.tenantId,
      itemId: decodeURIComponent(adminContentQaMatch[1]!),
      versionId: decodeURIComponent(adminContentQaMatch[2]!),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "content:ai_qa",
      resourceId: version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        aiQa: version.aiQa,
        contentItemId: version.contentItemId,
        version: version.version,
      },
    });

    return jsonResponse({ data: version }, 200, responseContext);
  }

  const adminContentPublishMatch =
    /^\/admin\/content\/items\/([^/]+)\/versions\/([^/]+)\/publish$/.exec(scope.suffix);

  if (request.method === "POST" && adminContentPublishMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:publish",
      tenantId: scope.tenantId,
    });
    const body = contentReviewDecisionSchema.parse(await parseJsonBody(request));
    const itemId = decodeURIComponent(adminContentPublishMatch[1]!);
    const versionId = decodeURIComponent(adminContentPublishMatch[2]!);
    const result = await auditMutationFailure(
      deps,
      context,
      actor,
      {
        action: "content:publish",
        resourceId: versionId,
        resourceType: "content_version",
        tenantId: scope.tenantId,
      },
      () =>
        contentServices.content.publishVersion({
          actor,
          tenantId: scope.tenantId,
          itemId,
          versionId,
          comments: body.comments,
          now: deps.now(),
        }),
    );
    await appendAuditEvent(deps, context, actor, {
      action: "content:publish",
      resourceId: result.version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        contentItemId: result.item.id,
        sourceIds: result.version.sourceIds,
        version: result.version.version,
      },
    });

    return jsonResponse({ data: result }, 200, responseContext);
  }

  const adminContentSyncLearningMatch =
    /^\/admin\/content\/items\/([^/]+)\/versions\/([^/]+)\/sync-learning$/.exec(scope.suffix);

  if (request.method === "POST" && adminContentSyncLearningMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:sync_learning",
      tenantId: scope.tenantId,
    });
    const itemId = decodeURIComponent(adminContentSyncLearningMatch[1]!);
    const versionId = decodeURIComponent(adminContentSyncLearningMatch[2]!);
    const result = await auditMutationFailure(
      deps,
      context,
      actor,
      {
        action: "content:sync_learning",
        resourceId: versionId,
        resourceType: "content_version",
        tenantId: scope.tenantId,
      },
      async () =>
        contentServices.content.syncPublishedVersionToLearning({
          actor,
          tenantId: scope.tenantId,
          itemId,
          versionId,
          body: syncPublishedContentSchema.parse(await parseJsonBody(request)),
          now: deps.now(),
        }),
    );
    await appendAuditEvent(deps, context, actor, {
      action: "content:sync_learning",
      resourceId: result.version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        contentItemId: result.version.contentItemId,
        lessonId: result.lesson.id,
        lessonVersion: result.lesson.version,
        version: result.version.version,
      },
    });

    return jsonResponse({ data: result }, 200, responseContext);
  }

  const adminContentRollbackMatch =
    /^\/admin\/content\/items\/([^/]+)\/versions\/([^/]+)\/rollback$/.exec(scope.suffix);

  if (request.method === "POST" && adminContentRollbackMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "content:rollback",
      tenantId: scope.tenantId,
    });
    const body = contentReviewDecisionSchema.parse(await parseJsonBody(request));
    const itemId = decodeURIComponent(adminContentRollbackMatch[1]!);
    const versionId = decodeURIComponent(adminContentRollbackMatch[2]!);
    const result = await auditMutationFailure(
      deps,
      context,
      actor,
      {
        action: "content:rollback",
        resourceId: versionId,
        resourceType: "content_version",
        tenantId: scope.tenantId,
      },
      () =>
        contentServices.content.rollbackVersion({
          actor,
          tenantId: scope.tenantId,
          itemId,
          versionId,
          comments: body.comments,
          now: deps.now(),
        }),
    );
    await appendAuditEvent(deps, context, actor, {
      action: "content:rollback",
      resourceId: result.version.id,
      resourceType: "content_version",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        contentItemId: result.item.id,
        version: result.version.version,
      },
    });

    return jsonResponse({ data: result }, 200, responseContext);
  }

  if (request.method === "GET" && scope.suffix === "/courses") {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "course:list",
      tenantId: scope.tenantId,
    });
    const query = courseListQuerySchema.parse(Object.fromEntries(url.searchParams));
    return jsonResponse(
      await services.courses.listCourses({
        actor,
        tenantId: scope.tenantId,
        filters: query,
      }),
      200,
      responseContext,
    );
  }

  const courseDetailMatch = /^\/courses\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "GET" && courseDetailMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "course:read",
      tenantId: scope.tenantId,
    });
    return jsonResponse(
      {
        data: await services.courses.getCourseDetail({
          actor,
          tenantId: scope.tenantId,
          courseId: decodeURIComponent(courseDetailMatch[1]!),
        }),
      },
      200,
      responseContext,
    );
  }

  const lessonDetailMatch = /^\/lessons\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "GET" && lessonDetailMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "lesson:read",
      tenantId: scope.tenantId,
    });
    return jsonResponse(
      {
        data: await services.lessons.getLessonDetail({
          actor,
          tenantId: scope.tenantId,
          lessonId: decodeURIComponent(lessonDetailMatch[1]!),
        }),
      },
      200,
      responseContext,
    );
  }

  const lessonStartMatch = /^\/lessons\/([^/]+)\/start$/.exec(scope.suffix);

  if (request.method === "POST" && lessonStartMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "lesson:start",
      tenantId: scope.tenantId,
    });
    const lessonId = decodeURIComponent(lessonStartMatch[1]!);
    const progress = await services.progress.startLesson({
      actor,
      tenantId: scope.tenantId,
      lessonId,
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "lesson:start",
      resourceId: lessonId,
      resourceType: "lesson",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        progressId: progress.id,
      },
    });

    return jsonResponse({ data: progress }, 200, responseContext);
  }

  const lessonCompleteMatch = /^\/lessons\/([^/]+)\/complete$/.exec(scope.suffix);

  if (request.method === "POST" && lessonCompleteMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "lesson:complete",
      tenantId: scope.tenantId,
    });
    const body = completeLessonSchema.parse(await parseJsonBody(request));
    const lessonId = decodeURIComponent(lessonCompleteMatch[1]!);
    const result = await services.progress.completeLesson({
      actor,
      tenantId: scope.tenantId,
      lessonId,
      score: body.score,
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "lesson:complete",
      resourceId: lessonId,
      resourceType: "lesson",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        courseProgressId: result.courseProgress.id,
        lessonProgressId: result.lessonProgress.id,
        score: body.score,
      },
    });

    return jsonResponse({ data: result }, 200, responseContext);
  }

  if (request.method === "GET" && scope.suffix === "/progress/me") {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "progress:read_own",
      tenantId: scope.tenantId,
    });
    return jsonResponse(
      {
        data: await services.dashboard.getDashboard({
          actor,
          tenantId: scope.tenantId,
        }),
      },
      200,
      responseContext,
    );
  }

  if (request.method === "GET" && scope.suffix === "/assignments/me") {
    const actor = await authorizeTenantAction(context, deps, {
      permission: "assignment:read",
      tenantId: scope.tenantId,
    });
    return jsonResponse(
      {
        data: await services.assignments.listMine({
          actor,
          tenantId: scope.tenantId,
        }),
      },
      200,
      responseContext,
    );
  }

  if (request.method === "POST" && scope.suffix === "/admin/courses") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "course:create",
      tenantId: scope.tenantId,
    });
    const course = await services.courses.createCourse({
      actor,
      tenantId: scope.tenantId,
      body: createCourseSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "course:create",
      resourceId: course.id,
      resourceType: "course",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        language: course.language,
        status: course.status,
        title: course.title,
      },
    });

    return jsonResponse({ data: course }, 201, responseContext);
  }

  const adminCourseMatch = /^\/admin\/courses\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "PATCH" && adminCourseMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "course:update",
      tenantId: scope.tenantId,
    });
    const course = await services.courses.updateCourse({
      actor,
      tenantId: scope.tenantId,
      courseId: decodeURIComponent(adminCourseMatch[1]!),
      body: updateCourseSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "course:update",
      resourceId: course.id,
      resourceType: "course",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        status: course.status,
        version: course.version,
      },
    });

    return jsonResponse({ data: course }, 200, responseContext);
  }

  const adminCoursePublishMatch = /^\/admin\/courses\/([^/]+)\/publish$/.exec(scope.suffix);

  if (request.method === "POST" && adminCoursePublishMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "course:publish",
      tenantId: scope.tenantId,
    });
    const course = await services.courses.publishCourse({
      tenantId: scope.tenantId,
      courseId: decodeURIComponent(adminCoursePublishMatch[1]!),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "course:publish",
      resourceId: course.id,
      resourceType: "course",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        version: course.version,
      },
    });

    return jsonResponse({ data: course }, 200, responseContext);
  }

  if (request.method === "POST" && scope.suffix === "/admin/modules") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "course:update",
      tenantId: scope.tenantId,
    });
    const module = await services.lessons.createModule({
      tenantId: scope.tenantId,
      body: createModuleSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "module:create",
      resourceId: module.id,
      resourceType: "module",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        courseId: module.courseId,
      },
    });

    return jsonResponse({ data: module }, 201, responseContext);
  }

  if (request.method === "POST" && scope.suffix === "/admin/lessons") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "lesson:create",
      tenantId: scope.tenantId,
    });
    const lesson = await services.lessons.createLesson({
      actor,
      tenantId: scope.tenantId,
      body: createLessonSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "lesson:create",
      resourceId: lesson.id,
      resourceType: "lesson",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        courseId: lesson.courseId,
        status: lesson.status,
      },
    });

    return jsonResponse({ data: lesson }, 201, responseContext);
  }

  const adminLessonMatch = /^\/admin\/lessons\/([^/]+)$/.exec(scope.suffix);

  if (request.method === "PATCH" && adminLessonMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "lesson:update",
      tenantId: scope.tenantId,
    });
    const lesson = await services.lessons.updateLesson({
      actor,
      tenantId: scope.tenantId,
      lessonId: decodeURIComponent(adminLessonMatch[1]!),
      body: updateLessonSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "lesson:update",
      resourceId: lesson.id,
      resourceType: "lesson",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        status: lesson.status,
        version: lesson.version,
      },
    });

    return jsonResponse({ data: lesson }, 200, responseContext);
  }

  const adminLessonPublishMatch = /^\/admin\/lessons\/([^/]+)\/publish$/.exec(scope.suffix);

  if (request.method === "POST" && adminLessonPublishMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "lesson:publish",
      tenantId: scope.tenantId,
    });
    const lesson = await services.lessons.publishLesson({
      tenantId: scope.tenantId,
      lessonId: decodeURIComponent(adminLessonPublishMatch[1]!),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "lesson:publish",
      resourceId: lesson.id,
      resourceType: "lesson",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        version: lesson.version,
      },
    });

    return jsonResponse({ data: lesson }, 200, responseContext);
  }

  const adminLessonBlockMatch = /^\/admin\/lessons\/([^/]+)\/blocks$/.exec(scope.suffix);

  if (request.method === "POST" && adminLessonBlockMatch) {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "lesson:update",
      tenantId: scope.tenantId,
    });
    const block = await services.lessons.createBlock({
      tenantId: scope.tenantId,
      lessonId: decodeURIComponent(adminLessonBlockMatch[1]!),
      body: createLessonBlockSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "lesson_block:create",
      resourceId: block.id,
      resourceType: "lesson_block",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        lessonId: block.lessonId,
        type: block.type,
      },
    });

    return jsonResponse({ data: block }, 201, responseContext);
  }

  if (request.method === "POST" && scope.suffix === "/admin/assignments") {
    const actor = await authorizeTenantAction(context, deps, {
      auditDenied: true,
      permission: "assignment:create",
      tenantId: scope.tenantId,
    });
    const assignment = await services.assignments.createAssignment({
      actor,
      tenantId: scope.tenantId,
      body: createAssignmentSchema.parse(await parseJsonBody(request)),
      now: deps.now(),
    });
    await appendAuditEvent(deps, context, actor, {
      action: "assignment:create",
      resourceId: assignment.id,
      resourceType: "assignment",
      outcome: "success",
      tenantId: scope.tenantId,
      metadata: {
        assigneeType: assignment.assigneeType,
        courseId: assignment.courseId,
      },
    });

    return jsonResponse({ data: assignment }, 201, responseContext);
  }

  return null;
}

async function handleHealth(
  scope: Extract<RequestScope, { kind: "public" }>,
  deps: ApiDependencies,
  responseContext: ResponseContext,
): Promise<Response> {
  const base = {
    service: "polyglot-api",
    status: "ok",
    timestamp: responseContext.timestamp,
    version: deps.config.version,
  };

  if (scope.route === "ready") {
    const checks =
      deps.readinessChecks?.() ??
      createReadinessChecks({
        config: deps.config,
        rateLimiter: deps.rateLimiter,
        repositories: deps.repositories,
      });
    const resolvedChecks = await checks;

    return jsonResponse(
      {
        ...base,
        checks: resolvedChecks,
        status: summarizeReadiness(resolvedChecks),
      },
      200,
      responseContext,
    );
  }

  return jsonResponse(
    {
      ...base,
      checks: {
        process: "ok",
      },
    },
    200,
    responseContext,
  );
}

async function handleTenantRead(
  scope: Extract<RequestScope, { kind: "tenant" }>,
  context: RequestContext,
  deps: ApiDependencies,
  responseContext: ResponseContext,
): Promise<Response> {
  const actor = await authorizeTenantAction(context, deps, {
    allowCrossTenant: true,
    auditDenied: true,
    permission: "tenant:read",
    tenantId: scope.tenantId,
  });

  const tenant = await deps.repositories.tenants.findById(scope.tenantId);

  if (!tenant) {
    throw new ApiHttpError(404, "tenant.not_found", "Tenant not found.");
  }

  const isCrossTenantSuperAdmin =
    tenant.id !== actor.tenantId && actor.roles.includes("super_admin");

  if (tenant.id !== actor.tenantId && !isCrossTenantSuperAdmin) {
    throw new ApiHttpError(403, "auth.tenant_mismatch", "Access denied.", {
      reason: "tenant_mismatch",
      permission: "tenant:read",
    });
  }

  if (isCrossTenantSuperAdmin) {
    await appendAuditEvent(deps, context, actor, {
      action: "tenant:read",
      resourceId: tenant.id,
      resourceType: "tenant",
      outcome: "success",
      tenantId: tenant.id,
      metadata: {
        crossTenant: true,
        justification: context.crossTenantJustification,
      },
    });
  }

  return jsonResponse(
    {
      data: {
        id: tenant.id,
        name: tenant.name,
        region: tenant.region,
        plan: tenant.plan,
        dataResidency: tenant.dataResidency,
        featureFlags: tenant.featureFlags,
        brandingConfig: tenant.brandingConfig,
        retentionPolicy: tenant.retentionPolicy,
      },
    },
    200,
    responseContext,
  );
}

async function handleAuditList(
  scope: Extract<RequestScope, { kind: "tenant" }>,
  context: RequestContext,
  deps: ApiDependencies,
  responseContext: ResponseContext,
  url: URL,
): Promise<Response> {
  await authorizeTenantAction(context, deps, {
    permission: "audit:list",
    tenantId: scope.tenantId,
  });

  const query = auditListQuerySchema.parse(Object.fromEntries(url.searchParams));

  return jsonResponse(
    await deps.repositories.auditEvents.listByTenant(scope.tenantId, query),
    200,
    responseContext,
  );
}

async function handleAuditExport(
  scope: Extract<RequestScope, { kind: "tenant" }>,
  context: RequestContext,
  deps: ApiDependencies,
  responseContext: ResponseContext,
  url: URL,
): Promise<Response> {
  const query = auditExportQuerySchema.parse(Object.fromEntries(url.searchParams));
  const actor = await authorizeTenantAction(context, deps, {
    auditDenied: true,
    permission: "audit:export",
    tenantId: scope.tenantId,
  });
  const exportRequestId = deps.randomId();

  await appendAuditEvent(deps, context, actor, {
    action: "audit:export",
    resourceId: exportRequestId,
    resourceType: "audit_event",
    outcome: "success",
    tenantId: scope.tenantId,
    metadata: {
      exportRequestId,
      format: query.format,
    },
  });

  return jsonResponse(
    {
      data: {
        exportRequestId,
        format: query.format,
        status: "queued",
      },
    },
    202,
    responseContext,
  );
}

async function authorizeTenantAction(
  context: RequestContext,
  deps: ApiDependencies,
  input: {
    allowCrossTenant?: boolean;
    auditDenied?: boolean;
    permission: Permission;
    tenantId: string;
  },
): Promise<Actor> {
  const effectiveContext = await contextWithPersistedStepUp(context, deps, input.permission);

  try {
    const actor = requirePermission(effectiveContext, {
      config: deps.config,
      allowCrossTenant: input.allowCrossTenant,
      crossTenantJustification: context.crossTenantJustification,
      permission: input.permission,
      tenantId: input.tenantId,
      now: deps.now(),
    });

    const crossTenantSuperAdmin =
      actor.roles.includes("super_admin") &&
      actor.tenantId !== input.tenantId &&
      input.allowCrossTenant === true &&
      Boolean(context.crossTenantJustification);

    const hasTenantMembership =
      crossTenantSuperAdmin ||
      (await deps.repositories.memberships.actorHasTenantMembership({
        tenantId: input.tenantId,
        userId: actor.userId,
      }));

    if (!hasTenantMembership) {
      throw new ApiHttpError(403, "auth.tenant_membership_required", "Access denied.", {
        permission: input.permission,
        reason: "missing_tenant_membership",
      });
    }

    return actor;
  } catch (error) {
    if (input.auditDenied && context.actor) {
      await appendAuditEvent(deps, context, context.actor, {
        action: input.permission,
        resourceId: input.tenantId,
        resourceType: "tenant",
        outcome: "denied",
        tenantId: input.tenantId,
        metadata: {
          reason: error instanceof ApiHttpError ? error.code : "unknown",
        },
      });
    }

    throw error;
  }
}

async function auditMutationFailure<T>(
  deps: ApiDependencies,
  context: RequestContext,
  actor: Actor,
  input: {
    action: string;
    resourceId: string;
    resourceType: string;
    tenantId: string;
  },
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    await appendAuditEvent(deps, context, actor, {
      action: input.action,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      outcome: "denied",
      tenantId: input.tenantId,
      metadata: {
        reason: error instanceof ApiHttpError ? error.code : "unknown",
      },
    });

    throw error;
  }
}

async function appendAuditEvent(
  deps: ApiDependencies,
  context: RequestContext,
  actor: Actor,
  input: {
    action: string;
    metadata?: Record<string, unknown>;
    outcome: AuditOutcome;
    resourceId: string;
    resourceType: string;
    tenantId: string;
  },
): Promise<void> {
  await deps.repositories.auditEvents.append(
    createAuditEvent({
      id: deps.randomId(),
      tenantId: input.tenantId,
      actorId: actor.userId,
      actorRole: primaryRole(actor),
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      outcome: input.outcome,
      ip: context.ip,
      userAgent: context.userAgent,
      requestId: context.requestId,
      metadata: input.metadata,
      createdAt: deps.now(),
    }),
  );
}

function enforceBodySize(request: Request, config: ApiConfig): void {
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > config.maxBodyBytes) {
    throw new ApiHttpError(413, "request.body_too_large", "Request body is too large.", {
      maxBodyBytes: config.maxBodyBytes,
    });
  }
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiHttpError(400, "request.invalid_json", "Request body must be valid JSON.");
  }
}

async function enforceRateLimit(
  scope: Extract<RequestScope, { kind: "tenant" }>,
  context: RequestContext,
  deps: ApiDependencies,
): Promise<void> {
  const actorKey = context.actor
    ? `${context.actor.tenantId}:${context.actor.userId}`
    : `anonymous:${context.ip ?? "unknown"}`;
  const routeGroup = scope.suffix.startsWith("/audit-events/export")
    ? "audit_export"
    : scope.suffix.startsWith("/audit-events")
      ? "audit"
      : scope.suffix.startsWith("/speaking")
        ? "speaking"
        : "tenant";
  const decision = await deps.rateLimiter.check(
    `${scope.tenantId}:${actorKey}:${routeGroup}`,
    deps.now(),
  );

  if (!decision.allowed) {
    throw new ApiHttpError(429, "RATE_LIMITED", "Too many requests.", {
      resetAt: decision.resetAt.toISOString(),
      retryAfter: decision.retryAfterSeconds,
    });
  }
}

async function contextWithPersistedStepUp(
  context: RequestContext,
  deps: ApiDependencies,
  permission: Permission,
): Promise<RequestContext> {
  if (permission !== "audit:export" || !context.actor || context.actor.mfaVerifiedAt) {
    return context;
  }

  const hasPersistedStepUp = await deps.repositories.stepUps.hasValidStepUp({
    tenantId: context.actor.tenantId,
    userId: context.actor.userId,
    now: deps.now(),
  });

  if (!hasPersistedStepUp) {
    return context;
  }

  return {
    ...context,
    actor: {
      ...context.actor,
      mfaVerifiedAt: deps.now(),
    },
  };
}

function createPreliminaryResponseContext(
  request: Request,
  deps: ApiDependencies,
): ResponseContext {
  return {
    config: deps.config,
    origin: request.headers.get("origin") ?? undefined,
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
    timestamp: deps.now().toISOString(),
  };
}

function createResponseContext(context: RequestContext, deps: ApiDependencies): ResponseContext {
  return {
    config: deps.config,
    origin: context.origin,
    requestId: context.requestId,
    timestamp: deps.now().toISOString(),
  };
}

function primaryRole(actor: Actor): Role {
  return actor.roles[0] ?? "learner";
}
