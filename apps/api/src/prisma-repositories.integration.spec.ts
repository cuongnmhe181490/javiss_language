import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

import { createDefaultAiOrchestrator } from "./ai-orchestrator.js";
import { DevHeaderAuthProvider } from "./auth-provider.js";
import { handleApiRequest, type ApiDependencies } from "./app.js";
import { createTestApiConfig, type ApiConfig } from "./config.js";
import { createJsonLogger } from "./logging.js";
import { createPrismaClient } from "./prisma-client.js";
import { createPrismaRepositories } from "./prisma-repositories.js";
import { createRedisRateLimiter } from "./rate-limit.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";
import { createReadinessChecks, summarizeReadiness } from "./readiness.js";

const runIntegration = process.env.TEST_DATABASE_URL ? describe : describe.skip;
const runRedisIntegration = process.env.TEST_REDIS_URL ? describe : describe.skip;

const tenantA = {
  id: "44444444-4444-4444-8444-444444444444",
  slug: "integration-alpha",
};
const tenantB = {
  id: "55555555-5555-4555-8555-555555555555",
  slug: "integration-beta",
};
const actorA = {
  email: "integration.admin@example.test",
  id: "66666666-6666-4666-8666-666666666666",
};
const actorB = {
  email: "integration.beta@example.test",
  id: "77777777-7777-4777-8777-777777777777",
};
const learningIds = {
  course: "78787878-7878-4787-8787-787878787878",
  module: "79797979-7979-4797-8797-797979797979",
  lesson: "80808080-8080-4808-8808-808080808080",
};
const aiIds = {
  agent: "81818181-8181-4818-8818-818181818181",
  prompt: "82828282-8282-4828-8828-828282828282",
};
const contentIds = {
  item: "84848484-8484-4848-8848-848484848484",
  source: "85858585-8585-4858-8858-858585858585",
  version: "86868686-8686-4868-8868-868686868686",
};
const speakingIds = {
  session: "83838383-8383-4838-8838-838383838383",
};

runIntegration("Prisma repositories integration", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL);
    await prisma.$connect();
    await cleanup(prisma);
    await seedIntegrationData(prisma);
  });

  afterAll(async () => {
    await cleanup(prisma);
    await prisma.$disconnect();
  });

  it("connects and reads tenant-scoped records", async () => {
    const repositories = createPrismaRepositories(prisma);

    await expect(repositories.tenants.findById(tenantA.id)).resolves.toMatchObject({
      id: tenantA.id,
      name: "Integration Alpha",
      plan: "enterprise",
    });
  });

  it("does not resolve an identity across tenant boundaries", async () => {
    const repositories = createPrismaRepositories(prisma);

    await expect(
      repositories.users.findActorByIdentity({
        provider: "integration",
        subject: actorB.id,
        tenantId: tenantA.id,
      }),
    ).resolves.toBeNull();
  });

  it("persists audit events with tenant filters and pagination", async () => {
    const repositories = createPrismaRepositories(prisma);

    await repositories.auditEvents.append({
      id: crypto.randomUUID(),
      tenantId: tenantA.id,
      actorId: actorA.id,
      actorRole: "security_auditor",
      action: "audit:export",
      resourceType: "audit_event",
      resourceId: "integration-export-denied",
      outcome: "denied",
      requestId: "integration-denied",
      metadata: { source: "integration-test" },
      createdAt: new Date("2026-04-27T10:00:00.000Z"),
    });
    await repositories.auditEvents.append({
      id: crypto.randomUUID(),
      tenantId: tenantB.id,
      actorId: actorB.id,
      actorRole: "tenant_admin",
      action: "audit:export",
      resourceType: "audit_event",
      resourceId: "integration-export-cross-tenant",
      outcome: "success",
      requestId: "integration-cross-tenant",
      metadata: { source: "integration-test" },
      createdAt: new Date("2026-04-27T10:01:00.000Z"),
    });

    await expect(
      repositories.auditEvents.listByTenant(tenantA.id, {
        action: "audit:export",
        outcome: "denied",
        page: 1,
        pageSize: 1,
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "audit:export",
          outcome: "denied",
          tenantId: tenantA.id,
        }),
      ],
      page: 1,
      pageSize: 1,
      total: 1,
    });
  });

  it("persists step-up sessions and rejects expired sessions", async () => {
    const repositories = createPrismaRepositories(prisma);

    await repositories.stepUps.create({
      id: crypto.randomUUID(),
      tenantId: tenantA.id,
      userId: actorA.id,
      method: "totp",
      createdAt: new Date("2026-04-27T10:00:00.000Z"),
      expiresAt: new Date("2026-04-27T10:05:00.000Z"),
    });
    await repositories.stepUps.create({
      id: crypto.randomUUID(),
      tenantId: tenantA.id,
      userId: actorA.id,
      method: "totp",
      createdAt: new Date("2026-04-27T09:00:00.000Z"),
      expiresAt: new Date("2026-04-27T09:05:00.000Z"),
    });

    await expect(
      repositories.stepUps.hasValidStepUp({
        tenantId: tenantA.id,
        userId: actorA.id,
        now: new Date("2026-04-27T10:01:00.000Z"),
      }),
    ).resolves.toBe(true);
    await expect(
      repositories.stepUps.hasValidStepUp({
        tenantId: tenantA.id,
        userId: actorA.id,
        now: new Date("2026-04-27T10:10:00.000Z"),
      }),
    ).resolves.toBe(false);
  });

  it("persists learning progress and assignment data through Prisma repositories", async () => {
    const repositories = createPrismaRepositories(prisma);

    await repositories.learning.progress.startLesson({
      tenantId: tenantA.id,
      userId: actorA.id,
      lessonId: learningIds.lesson,
      now: new Date("2026-04-27T10:00:00.000Z"),
    });
    const completed = await repositories.learning.progress.completeLesson({
      tenantId: tenantA.id,
      userId: actorA.id,
      lessonId: learningIds.lesson,
      score: 92,
      now: new Date("2026-04-27T10:05:00.000Z"),
    });
    const assignment = await repositories.learning.assignments.create(tenantA.id, {
      courseId: learningIds.course,
      assigneeType: "user",
      assigneeId: actorA.id,
      assignedBy: actorA.id,
      status: "active",
      now: new Date("2026-04-27T10:06:00.000Z"),
    });

    expect(completed).toMatchObject({
      lessonId: learningIds.lesson,
      score: 92,
      status: "completed",
    });
    await expect(
      repositories.learning.assignments.listForAssignee({
        tenantId: tenantA.id,
        userId: actorA.id,
        groupIds: [],
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: assignment.id,
        courseId: learningIds.course,
      }),
    ]);
  });

  it("persists tenant-scoped AI conversations and messages through Prisma repositories", async () => {
    const repositories = createPrismaRepositories(prisma);

    await expect(
      repositories.ai.prompts.findByAgentVersion({
        tenantId: tenantA.id,
        agentId: aiIds.agent,
        version: "integration-tutor-v1",
      }),
    ).resolves.toMatchObject({
      evalStatus: "approved",
      tenantId: tenantA.id,
    });

    const conversation = await repositories.ai.conversations.create({
      tenantId: tenantA.id,
      userId: actorA.id,
      agentId: aiIds.agent,
      courseId: learningIds.course,
      lessonId: learningIds.lesson,
      title: "Integration tutor chat",
      now: new Date("2026-04-27T10:00:00.000Z"),
    });
    await repositories.ai.messages.append({
      tenantId: tenantA.id,
      conversationId: conversation.id,
      role: "assistant",
      content: "Try one short greeting and cite the lesson.",
      citations: [
        {
          sourceType: "lesson",
          sourceId: learningIds.lesson,
          label: "Integration Lesson",
        },
      ],
      safetyFlags: {
        policyVersion: "integration-policy-v1",
      },
      provider: "mock",
      modelId: "mock-tutor-v1",
      promptVersion: "integration-tutor-v1",
      policyVersion: "integration-policy-v1",
      inputTokens: 4,
      outputTokens: 8,
      costEstimate: 0,
      createdAt: new Date("2026-04-27T10:00:01.000Z"),
    });

    await expect(
      repositories.ai.conversations.findDetailById(tenantA.id, conversation.id),
    ).resolves.toMatchObject({
      agent: {
        id: aiIds.agent,
      },
      id: conversation.id,
      messages: [
        expect.objectContaining({
          citations: [
            expect.objectContaining({
              sourceId: learningIds.lesson,
              sourceType: "lesson",
            }),
          ],
          role: "assistant",
        }),
      ],
      tenantId: tenantA.id,
    });
    await expect(
      repositories.ai.conversations.findDetailById(tenantB.id, conversation.id),
    ).resolves.toBeNull();
  });

  it("persists content source registry and review queue through Prisma repositories", async () => {
    const repositories = createPrismaRepositories(prisma);

    await expect(
      repositories.content.sources.listByTenant(tenantA.id, {
        page: 1,
        pageSize: 10,
        status: "approved",
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          id: contentIds.source,
          tenantId: tenantA.id,
        }),
      ],
    });

    const draft = await repositories.content.versions.create(tenantA.id, contentIds.item, {
      body: {
        prompt: "Integration content draft.",
      },
      sourceIds: [contentIds.source],
      changeSummary: "Integration draft.",
      createdBy: actorA.id,
      now: new Date("2026-04-27T10:00:00.000Z"),
    });
    await repositories.content.versions.updateStatus({
      tenantId: tenantA.id,
      versionId: draft.id,
      status: "review",
      validation: { license: "pending_publish_check" },
      aiQa: { status: "passed" },
      now: new Date("2026-04-27T10:01:00.000Z"),
    });

    await expect(
      repositories.content.versions.listReviewQueue(tenantA.id, {
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          contentItemId: contentIds.item,
          item: expect.objectContaining({
            id: contentIds.item,
          }),
          status: "review",
        }),
      ],
    });
    await expect(
      repositories.content.items.findDetailById(tenantB.id, contentIds.item),
    ).resolves.toBeNull();
  });

  it("persists speaking sessions, hashed tokens, and transcript fallback", async () => {
    const repositories = createPrismaRepositories(prisma);
    const now = new Date("2026-04-27T10:00:00.000Z");
    const session = await repositories.speaking.sessions.create({
      id: speakingIds.session,
      tenantId: tenantA.id,
      userId: actorA.id,
      lessonId: learningIds.lesson,
      mode: "role_play",
      status: "connecting",
      targetLanguage: "en",
      scenario: {
        scenario: "Integration greeting",
      },
      roomName: "integration-room",
      sfuProvider: "mock-livekit",
      sttProvider: "mock-stt",
      ttsProvider: "mock-tts",
      llmProvider: "mock-tutor-v1",
      qos: {
        textFallbackEnabled: true,
      },
      startedAt: now,
      expiresAt: new Date("2026-04-27T10:30:00.000Z"),
      costEstimate: 0,
      now,
    });

    await repositories.speaking.tokens.create({
      id: crypto.randomUUID(),
      tenantId: tenantA.id,
      sessionId: session.id,
      userId: actorA.id,
      tokenHash: "integration-token-hash",
      purpose: "room_join",
      expiresAt: new Date("2026-04-27T10:10:00.000Z"),
      createdAt: now,
    });
    await repositories.speaking.transcriptSegments.append({
      tenantId: tenantA.id,
      sessionId: session.id,
      speaker: "learner",
      text: "Good morning.",
      language: "en",
      isFinal: true,
      confidence: 1,
      createdAt: now,
    });

    await expect(
      repositories.speaking.sessions.findDetailById(tenantA.id, session.id),
    ).resolves.toMatchObject({
      id: session.id,
      tenantId: tenantA.id,
      transcript: [
        expect.objectContaining({
          sequence: 0,
          speaker: "learner",
          text: "Good morning.",
        }),
      ],
    });
    await expect(
      repositories.speaking.sessions.findDetailById(tenantB.id, session.id),
    ).resolves.toBeNull();
  });

  it("persists audit export events through the API path", async () => {
    const dependencies = deps(prisma);
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantA.id}/audit-events/export`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantA.id,
          userId: actorA.id,
          roles: "security_auditor",
          mfaVerifiedAt: new Date("2026-04-27T10:00:00.000Z").toISOString(),
        }),
      }),
      dependencies,
    );

    expect(response.status).toBe(202);

    const repositories = createPrismaRepositories(prisma);
    await expect(
      repositories.auditEvents.listByTenant(tenantA.id, {
        action: "audit:export",
        outcome: "success",
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "audit:export",
          outcome: "success",
          tenantId: tenantA.id,
        }),
      ],
      total: expect.any(Number),
    });
  });

  it("reports database readiness without exposing connection strings", async () => {
    const config = createTestApiConfig({
      databaseUrl: process.env.TEST_DATABASE_URL,
    });
    const checks = await createReadinessChecks({
      config,
      rateLimiter: createInMemoryRateLimiter(config),
      repositories: createPrismaRepositories(prisma),
    });

    expect(checks.database).toEqual({ status: "ok" });
    expect(summarizeReadiness(checks)).toBe("degraded");
    expect(JSON.stringify(checks)).not.toContain("postgresql://");
  });
});

runRedisIntegration("Redis rate limiter integration", () => {
  it("uses Redis as a backing store when TEST_REDIS_URL is provided", async () => {
    const limiter = createRedisRateLimiter(
      createTestApiConfig({
        redisUrl: process.env.TEST_REDIS_URL,
        rateLimitMax: 1,
        rateLimitWindowSeconds: 30,
      }),
    );
    const key = `integration:${crypto.randomUUID()}`;
    const now = new Date("2026-04-27T10:00:00.000Z");

    await expect(limiter.healthCheck()).resolves.toBe(true);
    await expect(limiter.check(key, now)).resolves.toMatchObject({
      allowed: true,
    });
    await expect(limiter.check(key, now)).resolves.toMatchObject({
      allowed: false,
      retryAfterSeconds: expect.any(Number),
    });
  });
});

if (!process.env.TEST_DATABASE_URL) {
  describe("Prisma repositories integration", () => {
    it("is skipped unless TEST_DATABASE_URL is provided", () => {
      expect(process.env.TEST_DATABASE_URL).toBeUndefined();
    });
  });
}

if (!process.env.TEST_REDIS_URL) {
  describe("Redis rate limiter integration", () => {
    it("is skipped unless TEST_REDIS_URL is provided", () => {
      expect(process.env.TEST_REDIS_URL).toBeUndefined();
    });
  });
}

async function seedIntegrationData(prisma: PrismaClient): Promise<void> {
  await prisma.tenant.createMany({
    data: [
      {
        id: tenantA.id,
        slug: tenantA.slug,
        name: "Integration Alpha",
        region: "apac",
        plan: "enterprise",
        dataResidency: "apac",
        featureFlags: { speakingRealtime: true },
        brandingConfig: { primaryColor: "#2563eb" },
        retentionPolicy: { audioDays: 30, transcriptDays: 730 },
      },
      {
        id: tenantB.id,
        slug: tenantB.slug,
        name: "Integration Beta",
        region: "jp",
        plan: "business",
        dataResidency: "jp",
        featureFlags: { speakingRealtime: true },
        brandingConfig: { primaryColor: "#7c3aed" },
        retentionPolicy: { audioDays: 14, transcriptDays: 365 },
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: actorA.id,
        tenantId: tenantA.id,
        email: actorA.email,
        displayName: "Integration Admin",
        locale: "en",
        status: "active",
      },
      {
        id: actorB.id,
        tenantId: tenantB.id,
        email: actorB.email,
        displayName: "Integration Beta Admin",
        locale: "en",
        status: "active",
      },
    ],
  });

  await prisma.userTenantMembership.createMany({
    data: [
      {
        tenantId: tenantA.id,
        userId: actorA.id,
        roles: ["security_auditor", "tenant_admin"],
      },
      {
        tenantId: tenantB.id,
        userId: actorB.id,
        roles: ["tenant_admin"],
      },
    ],
  });

  await prisma.authIdentity.createMany({
    data: [
      {
        tenantId: tenantA.id,
        userId: actorA.id,
        provider: "integration",
        subject: actorA.id,
        email: actorA.email,
      },
      {
        tenantId: tenantB.id,
        userId: actorB.id,
        provider: "integration",
        subject: actorB.id,
        email: actorB.email,
      },
    ],
  });

  await prisma.course.create({
    data: {
      id: learningIds.course,
      tenantId: tenantA.id,
      language: "en",
      trackType: "business",
      targetLevel: "A1",
      title: "Integration Course",
      slug: "integration-course",
      description: "Integration course.",
      status: "published",
      version: 1,
      createdBy: actorA.id,
      publishedAt: new Date("2026-04-27T09:00:00.000Z"),
    },
  });
  await prisma.module.create({
    data: {
      id: learningIds.module,
      tenantId: tenantA.id,
      courseId: learningIds.course,
      title: "Integration Module",
      orderIndex: 0,
      status: "published",
    },
  });
  await prisma.lesson.create({
    data: {
      id: learningIds.lesson,
      tenantId: tenantA.id,
      courseId: learningIds.course,
      moduleId: learningIds.module,
      title: "Integration Lesson",
      slug: "integration-lesson",
      language: "en",
      targetLevel: "A1",
      estimatedMinutes: 5,
      objectives: ["Validate persistence"],
      status: "published",
      version: 1,
      createdBy: actorA.id,
      publishedAt: new Date("2026-04-27T09:00:00.000Z"),
    },
  });

  await prisma.aIAgent.create({
    data: {
      id: aiIds.agent,
      tenantId: tenantA.id,
      name: "Integration Tutor Coach",
      scope: "tutor_coach",
      allowedTools: ["lesson_lookup", "hint_generator"],
      promptVersion: "integration-tutor-v1",
      policyVersion: "integration-policy-v1",
      status: "active",
    },
  });
  await prisma.promptVersion.create({
    data: {
      id: aiIds.prompt,
      tenantId: tenantA.id,
      agentId: aiIds.agent,
      version: "integration-tutor-v1",
      purpose: "Integration tutor prompt",
      promptText: "Use only integration lesson context.",
      inputSchema: { type: "object" },
      outputSchema: { type: "object" },
      safetyRules: { citeLessonContext: true },
      evalStatus: "approved",
      createdBy: actorA.id,
      approvedBy: actorA.id,
    },
  });

  await prisma.contentSource.create({
    data: {
      id: contentIds.source,
      tenantId: tenantA.id,
      sourceName: "Integration Source",
      sourceType: "document",
      reference: "integration://source",
      licenseType: "tenant_owned",
      allowedUsage: ["display", "retrieval", "reference"],
      commercialAllowed: true,
      attributionRequired: false,
      status: "approved",
      createdBy: actorA.id,
      reviewedBy: actorA.id,
      approvedAt: new Date("2026-04-27T09:00:00.000Z"),
      metadata: {
        source: "integration-test",
      },
    },
  });
  await prisma.contentItem.create({
    data: {
      id: contentIds.item,
      tenantId: tenantA.id,
      type: "lesson",
      title: "Integration Content Item",
      slug: "integration-content-item",
      language: "en",
      level: "A1",
      status: "draft",
      currentVersion: 1,
      createdBy: actorA.id,
      metadata: {
        source: "integration-test",
      },
    },
  });
  await prisma.contentVersion.create({
    data: {
      id: contentIds.version,
      tenantId: tenantA.id,
      contentItemId: contentIds.item,
      version: 1,
      status: "draft",
      body: {
        prompt: "Integration seed content.",
      },
      sourceIds: [contentIds.source],
      validation: {
        license: "pending",
      },
      aiQa: {
        status: "not_run",
      },
      createdBy: actorA.id,
    },
  });
}

async function cleanup(prisma: PrismaClient): Promise<void> {
  await prisma.speakingTranscriptSegment.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.speakingRealtimeToken.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.speakingSession.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.contentReviewEvent.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.contentVersion.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.contentItem.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.contentSource.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.aIMessage.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.aIConversation.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.promptVersion.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.aIAgent.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.assignment.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.courseProgress.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.lessonProgress.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.exercise.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.lessonBlock.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.lesson.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.module.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.course.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.auditEvent.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.stepUpSession.deleteMany({
    where: { tenantId: { in: [tenantA.id, tenantB.id] } },
  });
  await prisma.authIdentity.deleteMany({
    where: { userId: { in: [actorA.id, actorB.id] } },
  });
  await prisma.userTenantMembership.deleteMany({
    where: { userId: { in: [actorA.id, actorB.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [actorA.id, actorB.id] } },
  });
  await prisma.tenant.deleteMany({
    where: { id: { in: [tenantA.id, tenantB.id] } },
  });
}

function deps(prisma: PrismaClient, input: { config?: ApiConfig } = {}): ApiDependencies {
  const config = input.config ?? createTestApiConfig();

  return {
    aiOrchestrator: createDefaultAiOrchestrator(),
    authProvider: new DevHeaderAuthProvider(),
    config,
    logger: createJsonLogger({ logLevel: "error" }, () => undefined),
    rateLimiter: createInMemoryRateLimiter(config),
    readinessChecks: async () => ({
      api: { status: "ok" },
      database: { status: "ok" },
      repositories: { status: "ok" },
    }),
    repositories: createPrismaRepositories(prisma),
    now: () => new Date("2026-04-27T10:00:00.000Z"),
    randomId: () => crypto.randomUUID(),
  };
}

function actorHeaders(input: {
  tenantId: string;
  userId: string;
  roles: string;
  mfaVerifiedAt?: string;
}): Headers {
  const headers = new Headers({
    "x-dev-tenant-id": input.tenantId,
    "x-dev-user-id": input.userId,
    "x-dev-roles": input.roles,
  });

  if (input.mfaVerifiedAt) {
    headers.set("x-dev-mfa-verified-at", input.mfaVerifiedAt);
  }

  return headers;
}
