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
import { sampleLessonAlphaOneId, sampleLessonBetaOneId } from "./learning-domain.js";
import { createJsonLogger } from "./logging.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";
import { createInMemoryRepositories } from "./repositories.js";

describe("speaking realtime foundation API", () => {
  it("creates a speaking session with a one-time realtime token and no token hash leak", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/speaking/sessions", {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
        body: JSON.stringify({
          lessonId: sampleLessonAlphaOneId,
          mode: "role_play",
          targetLanguage: "en",
          scenario: {
            scenario: "Greeting a hotel guest",
            role: "front desk staff",
            goal: "Use a polite welcome.",
            usefulPhrases: ["Good morning", "Welcome to the hotel"],
          },
        }),
      }),
      deps(),
    );
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(201);
    expect(body.data.session).toMatchObject({
      lessonId: sampleLessonAlphaOneId,
      mode: "role_play",
      status: "connecting",
      targetLanguage: "en",
      userId: learnerUserId,
    });
    expect(body.data.realtime).toMatchObject({
      provider: "mock-livekit",
      roomName: expect.stringContaining("speaking-"),
      token: expect.stringMatching(/^dev_rt_/),
      turnServerPolicy: "managed",
    });
    expect(serialized).not.toContain("tokenHash");
  });

  it("supports own session read, text fallback, report, and end flow", async () => {
    const dependencies = deps();
    const headers = actorHeaders({
      tenantId: tenantAlphaId,
      userId: learnerUserId,
      roles: "learner",
    });
    const created = await handleApiRequest(
      new Request("http://api.test/v1/speaking/sessions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          lessonId: sampleLessonAlphaOneId,
          mode: "drill",
          targetLanguage: "en",
          networkProfile: "weak",
        }),
      }),
      dependencies,
    );
    const createdBody = await created.json();
    const sessionId = createdBody.data.session.id;

    const detail = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}`, {
        headers,
      }),
      dependencies,
    );
    expect(detail.status).toBe(200);
    await expect(detail.json()).resolves.toMatchObject({
      data: {
        id: sessionId,
        qos: {
          bitratePolicy: "low_adaptive",
          textFallbackEnabled: true,
        },
      },
    });

    const fallback = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}/text-fallback`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: "Good morning. Welcome to the hotel.",
          language: "en",
        }),
      }),
      dependencies,
    );
    expect(fallback.status).toBe(201);
    await expect(fallback.json()).resolves.toMatchObject({
      data: {
        assistantSegment: {
          speaker: "assistant",
        },
        fallbackMode: true,
        learnerSegment: {
          sequence: 0,
          speaker: "learner",
          text: "Good morning. Welcome to the hotel.",
        },
      },
    });

    const report = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}/report`, {
        headers,
      }),
      dependencies,
    );
    expect(report.status).toBe(200);
    await expect(report.json()).resolves.toMatchObject({
      data: {
        metrics: {
          learnerTurns: 1,
          textFallbackUsed: true,
          transcriptSegments: 2,
        },
        scoringStatus: "not_implemented",
      },
    });

    const ended = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}/end`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          latencyMs: 240,
          outcome: "completed",
        }),
      }),
      dependencies,
    );
    expect(ended.status).toBe(200);
    await expect(ended.json()).resolves.toMatchObject({
      data: {
        latencyMs: 240,
        status: "ended",
      },
    });
  });

  it("denies security auditor session creation and audits the denial", async () => {
    const dependencies = deps();
    const denied = await handleApiRequest(
      new Request("http://api.test/v1/speaking/sessions", {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: auditorUserId,
          roles: "security_auditor",
        }),
        body: JSON.stringify({
          lessonId: sampleLessonAlphaOneId,
        }),
      }),
      dependencies,
    );

    expect(denied.status).toBe(403);

    const audit = await handleApiRequest(
      new Request(
        `http://api.test/v1/tenants/${tenantAlphaId}/audit-events?action=speaking_session:create&outcome=denied`,
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
          action: "speaking_session:create",
          outcome: "denied",
        }),
      ],
      total: 1,
    });
  });

  it("blocks another learner from reading a session owned by a tenant admin", async () => {
    const dependencies = deps();
    const adminHeaders = actorHeaders({
      tenantId: tenantAlphaId,
      userId: adminUserId,
      roles: "tenant_admin",
    });
    const learnerHeaders = actorHeaders({
      tenantId: tenantAlphaId,
      userId: learnerUserId,
      roles: "learner",
    });
    const created = await handleApiRequest(
      new Request("http://api.test/v1/speaking/sessions", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          lessonId: sampleLessonAlphaOneId,
        }),
      }),
      dependencies,
    );
    const createdBody = await created.json();
    const denied = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${createdBody.data.session.id}`, {
        headers: learnerHeaders,
      }),
      dependencies,
    );

    expect(denied.status).toBe(403);
    await expect(denied.json()).resolves.toMatchObject({
      error: {
        code: "speaking_session.not_owner",
      },
    });
  });

  it("blocks cross-tenant speaking access before data lookup", async () => {
    const response = await handleApiRequest(
      new Request(`http://api.test/v1/tenants/${tenantBetaId}/speaking/sessions/ignored`, {
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

  it("blocks tenant A users from reading reports, adding fallback, or ending tenant B sessions", async () => {
    const dependencies = deps();
    allowLearnerMembershipInBeta(dependencies);
    const betaLearnerHeaders = actorHeaders({
      tenantId: tenantBetaId,
      userId: learnerUserId,
      roles: "learner",
    });
    const alphaLearnerHeaders = actorHeaders({
      tenantId: tenantAlphaId,
      userId: learnerUserId,
      roles: "learner",
    });
    const created = await handleApiRequest(
      new Request("http://api.test/v1/speaking/sessions", {
        method: "POST",
        headers: betaLearnerHeaders,
        body: JSON.stringify({
          lessonId: sampleLessonBetaOneId,
          mode: "role_play",
          targetLanguage: "ja",
          scenario: {
            scenario: "Tenant B private transcript",
            role: "store associate",
            goal: "Keep tenant B transcript isolated.",
          },
        }),
      }),
      dependencies,
    );
    const createdBody = await created.json();
    const sessionId = createdBody.data.session.id as string;

    const readDenied = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}`, {
        headers: alphaLearnerHeaders,
      }),
      dependencies,
    );
    const reportDenied = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}/report`, {
        headers: alphaLearnerHeaders,
      }),
      dependencies,
    );
    const fallbackDenied = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}/text-fallback`, {
        method: "POST",
        headers: alphaLearnerHeaders,
        body: JSON.stringify({
          text: "Tenant A must not append this transcript.",
          language: "ja",
        }),
      }),
      dependencies,
    );
    const endDenied = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}/end`, {
        method: "POST",
        headers: alphaLearnerHeaders,
        body: JSON.stringify({
          outcome: "completed",
        }),
      }),
      dependencies,
    );

    for (const response of [readDenied, reportDenied, fallbackDenied, endDenied]) {
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toMatchObject({
        error: {
          code: "speaking_session.not_found",
        },
      });
      expect(JSON.stringify(body)).not.toContain("Tenant B private transcript");
      expect(JSON.stringify(body)).not.toContain("Tenant A must not append");
    }

    const betaDetail = await handleApiRequest(
      new Request(`http://api.test/v1/speaking/sessions/${sessionId}`, {
        headers: betaLearnerHeaders,
      }),
      dependencies,
    );
    expect(betaDetail.status).toBe(200);
    await expect(betaDetail.json()).resolves.toMatchObject({
      data: {
        id: sessionId,
        status: "connecting",
        transcript: [],
      },
    });

    for (const action of ["speaking_session:text_fallback", "speaking_session:end_own"]) {
      const audit = await handleApiRequest(
        new Request(
          `http://api.test/v1/tenants/${tenantAlphaId}/audit-events?action=${encodeURIComponent(
            action,
          )}&outcome=denied`,
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
        data: [expect.objectContaining({ action, outcome: "denied" })],
        total: 1,
      });
    }
  });

  it("returns validation errors for invalid speaking session input", async () => {
    const response = await handleApiRequest(
      new Request("http://api.test/v1/speaking/sessions", {
        method: "POST",
        headers: actorHeaders({
          tenantId: tenantAlphaId,
          userId: learnerUserId,
          roles: "learner",
        }),
        body: JSON.stringify({
          mode: "classroom",
        }),
      }),
      deps(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "request.validation_failed",
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

function allowLearnerMembershipInBeta(dependencies: ApiDependencies): void {
  const original = dependencies.repositories.memberships.actorHasTenantMembership;
  dependencies.repositories.memberships.actorHasTenantMembership = async (input) => {
    if (input.tenantId === tenantBetaId && input.userId === learnerUserId) {
      return true;
    }

    return original(input);
  };
}
