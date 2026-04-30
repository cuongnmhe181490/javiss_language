import { describe, expect, it } from "vitest";

import { createDefaultAiOrchestrator } from "./ai-orchestrator.js";
import { DevHeaderAuthProvider } from "./auth-provider.js";
import { handleApiRequest, type ApiDependencies } from "./app.js";
import { createTestApiConfig, type ApiConfig } from "./config.js";
import {
  adminUserId,
  auditorUserId,
  learnerUserId,
  tenantAlphaId,
  tenantBetaId,
} from "./fixtures.js";
import {
  sampleCourseAlphaId,
  sampleDraftCourseAlphaId,
  sampleLessonAlphaOneId,
} from "./learning-domain.js";
import { createJsonLogger } from "./logging.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";
import { createInMemoryRepositories } from "./repositories.js";

describe("learning core API", () => {
  it("lists only published courses for learners", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/courses", {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
      }),
      deps(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: sampleCourseAlphaId,
        status: "published",
      }),
    ]);
    expect(JSON.stringify(body)).not.toContain(sampleDraftCourseAlphaId);
  });

  it("allows content editors to see draft courses when explicitly filtered", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/courses?status=draft", {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "content_editor",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          id: sampleDraftCourseAlphaId,
          status: "draft",
        }),
      ],
    });
  });

  it("returns course detail with modules and lesson summaries", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/courses/${sampleCourseAlphaId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        id: sampleCourseAlphaId,
        modules: [
          expect.objectContaining({
            lessons: expect.arrayContaining([
              expect.objectContaining({
                id: sampleLessonAlphaOneId,
              }),
            ]),
          }),
        ],
      },
    });
  });

  it("does not return answerKey fields to learner lesson detail", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/lessons/${sampleLessonAlphaOneId}`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
      }),
      deps(),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("exercises");
    expect(body).not.toContain("answerKey");
    expect(body).not.toContain("correctOptionIndex");
  });

  it("starts and completes lesson progress, then surfaces dashboard recommendation data", async () => {
    const dependencies = deps();
    const headers = actorHeaders({
      tenantId: tenantAlphaId,
      userId: learnerUserId,
      roles: "learner",
    });

    const start = await handleApiRequest(
      new Request(`http://api.test/v1/lessons/${sampleLessonAlphaOneId}/start`, {
        method: "POST",
        headers,
      }),
      dependencies,
    );
    expect(start.status).toBe(200);
    await expect(start.json()).resolves.toMatchObject({
      data: {
        lessonId: sampleLessonAlphaOneId,
        status: "in_progress",
      },
    });

    const complete = await handleApiRequest(
      new Request(`http://api.test/v1/lessons/${sampleLessonAlphaOneId}/complete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ score: 88 }),
      }),
      dependencies,
    );
    expect(complete.status).toBe(200);
    await expect(complete.json()).resolves.toMatchObject({
      data: {
        courseProgress: {
          completedLessons: 1,
          progressPercent: 33,
        },
        lessonProgress: {
          score: 88,
          status: "completed",
        },
      },
    });

    const dashboard = await handleApiRequest(
      new Request("http://api.test/v1/progress/me", {
        headers,
      }),
      dependencies,
    );
    expect(dashboard.status).toBe(200);
    await expect(dashboard.json()).resolves.toMatchObject({
      data: {
        stats: {
          completedLessons: 1,
        },
        continueLearning: [
          expect.objectContaining({
            title: "Asking for basic information",
          }),
        ],
      },
    });
  });

  it("lists learner assignments", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/assignments/me", {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          assigneeType: "user",
          courseId: sampleCourseAlphaId,
        }),
      ],
    });
  });

  it("allows tenant admins to create and publish courses", async () => {
    const dependencies = deps();
    const headers = actorHeaders({
      tenantId: tenantAlphaId,
      userId: adminUserId,
      roles: "tenant_admin",
    });
    const create = await handleApiRequest(
      new Request("http://api.test/v1/admin/courses", {
        method: "POST",
        headers,
        body: JSON.stringify({
          language: "ko",
          trackType: "business",
          targetLevel: "TOPIK_I_1",
          title: "Korean Service Starter",
          slug: "korean-service-starter",
          description: "Basic Korean service phrases.",
        }),
      }),
      dependencies,
    );
    const created = await create.json();

    expect(create.status).toBe(201);
    expect(created.data.status).toBe("draft");

    const publish = await handleApiRequest(
      new Request(`http://api.test/v1/admin/courses/${created.data.id}/publish`, {
        method: "POST",
        headers,
      }),
      dependencies,
    );

    expect(publish.status).toBe(200);
    await expect(publish.json()).resolves.toMatchObject({
      data: {
        status: "published",
        version: 2,
      },
    });
  });

  it("denies learner admin writes and persists a denied audit event", async () => {
    const dependencies = deps();
    const learnerHeaders = actorHeaders({
      tenantId: tenantAlphaId,
      userId: learnerUserId,
      roles: "learner",
    });
    const denied = await handleApiRequest(
      new Request("http://api.test/v1/admin/courses", {
        method: "POST",
        headers: learnerHeaders,
        body: JSON.stringify({
          language: "en",
          trackType: "general",
          targetLevel: "A1",
          title: "Learner Should Not Create",
          slug: "learner-should-not-create",
          description: "Denied.",
        }),
      }),
      dependencies,
    );

    expect(denied.status).toBe(403);

    const audit = await handleApiRequest(
      new Request(
        `http://api.test/v1/tenants/${tenantAlphaId}/audit-events?action=course:create&outcome=denied`,
        {
          headers: actorHeaders({
            tenantId: tenantAlphaId,
            userId: auditorUserId,
            roles: "security_auditor",
          }),
        },
      ),
      dependencies,
    );

    expect(audit.status).toBe(200);
    await expect(audit.json()).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          action: "course:create",
          outcome: "denied",
        }),
      ],
      total: 1,
    });
  });

  it("denies content editor course publish without content publish permission", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/admin/courses/${sampleDraftCourseAlphaId}/publish`, {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "content_editor",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.missing_permission",
      },
    });
  });

  it("blocks cross-tenant course reads", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}/courses`, {
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "auth.tenant_mismatch",
      },
    });
  });

  it("keeps security auditors away from content edits", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/admin/courses", {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: auditorUserId,
          roles: "security_auditor",
        }),
        body: JSON.stringify({
          language: "en",
          trackType: "general",
          targetLevel: "A1",
          title: "Auditor Should Not Create",
          slug: "auditor-should-not-create",
          description: "Denied.",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(403);
  });

  it("returns validation errors in the standard envelope", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/admin/courses", {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: adminUserId,
          roles: "tenant_admin",
        }),
        body: JSON.stringify({
          language: "fr",
          trackType: "business",
          targetLevel: "A1",
          title: "No",
          slug: "Invalid Slug",
          description: "Invalid.",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "request.validation_failed",
        requestId: expect.any(String),
      },
    });
  });
});

function deps(input: { config?: ApiConfig } = {}): ApiDependencies {
  const config = input.config ?? createTestApiConfig();

  return {
    aiOrchestrator: createDefaultAiOrchestrator(),
    authProvider: new DevHeaderAuthProvider(),
    config,
    logger: createJsonLogger({ logLevel: "error" }, () => undefined),
    rateLimiter: createInMemoryRateLimiter(config),
    readinessChecks: async () => ({
      api: { status: "ok" },
      repositories: { status: "ok" },
    }),
    repositories: createInMemoryRepositories(),
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
    "content-type": "application/json",
    "x-dev-tenant-id": input.tenantId,
    "x-dev-user-id": input.userId,
    "x-dev-roles": input.roles,
  });

  if (input.mfaVerifiedAt) {
    headers.set("x-dev-mfa-verified-at", input.mfaVerifiedAt);
  }

  return headers;
}
