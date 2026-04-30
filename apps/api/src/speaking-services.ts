import { createHash } from "node:crypto";

import type { Actor } from "@polyglot/contracts";
import { hasPermission } from "@polyglot/authz";

import { ApiHttpError } from "./errors.js";
import type { LearningRepositories } from "./learning-repositories.js";
import type {
  CreateSpeakingSessionInput,
  EndSpeakingSessionInput,
  RealtimeJoinGrant,
  SpeakingSessionDetail,
  SpeakingSessionRecord,
  TextFallbackTurnInput,
} from "./speaking-domain.js";
import type { SpeakingRepositories } from "./speaking-repositories.js";

const SESSION_TTL_MS = 30 * 60 * 1000;
const TOKEN_TTL_MS = 10 * 60 * 1000;

export class SpeakingSessionService {
  constructor(
    private readonly speakingRepositories: SpeakingRepositories,
    private readonly learningRepositories: LearningRepositories,
    private readonly randomId: () => string,
  ) {}

  async createSession(input: {
    actor: Actor;
    tenantId: string;
    body: CreateSpeakingSessionInput;
    now: Date;
  }): Promise<{ session: SpeakingSessionRecord; realtime: RealtimeJoinGrant }> {
    if (input.body.lessonId) {
      await this.requirePublishedLesson(input.tenantId, input.body.lessonId);
    }

    const sessionId = this.randomId();
    const roomName = `tenant-${input.tenantId}:speaking-${sessionId}`;
    const expiresAt = new Date(input.now.getTime() + SESSION_TTL_MS);
    const tokenExpiresAt = new Date(input.now.getTime() + TOKEN_TTL_MS);
    const token = `dev_rt_${this.randomId()}`;
    const qos = buildQos(input.body.networkProfile);
    const session = await this.speakingRepositories.sessions.create({
      id: sessionId,
      tenantId: input.tenantId,
      userId: input.actor.userId,
      lessonId: input.body.lessonId,
      mode: input.body.mode,
      status: "connecting",
      targetLanguage: input.body.targetLanguage,
      scenario: input.body.scenario,
      roomName,
      sfuProvider: "mock-livekit",
      sttProvider: "mock-stt",
      ttsProvider: "mock-tts",
      llmProvider: "mock-tutor-v1",
      qos,
      startedAt: input.now,
      expiresAt,
      costEstimate: 0,
      now: input.now,
    });

    await this.speakingRepositories.tokens.create({
      id: this.randomId(),
      tenantId: input.tenantId,
      sessionId: session.id,
      userId: input.actor.userId,
      tokenHash: hashToken(token),
      purpose: "room_join",
      expiresAt: tokenExpiresAt,
      createdAt: input.now,
    });

    return {
      session,
      realtime: {
        provider: session.sfuProvider,
        roomName,
        token,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
        turnServerPolicy: "managed",
        qos,
      },
    };
  }

  async getSession(input: {
    actor: Actor;
    tenantId: string;
    sessionId: string;
  }): Promise<SpeakingSessionDetail> {
    const session = await this.speakingRepositories.sessions.findDetailById(
      input.tenantId,
      input.sessionId,
    );

    if (!session) {
      throw new ApiHttpError(404, "speaking_session.not_found", "Speaking session not found.");
    }

    assertCanReadSpeakingSession(input.actor, session);
    return session;
  }

  async endSession(input: {
    actor: Actor;
    tenantId: string;
    sessionId: string;
    body: EndSpeakingSessionInput;
    now: Date;
  }): Promise<SpeakingSessionRecord> {
    const existing = await this.speakingRepositories.sessions.findById(
      input.tenantId,
      input.sessionId,
    );

    if (!existing) {
      throw new ApiHttpError(404, "speaking_session.not_found", "Speaking session not found.");
    }

    assertCanReadSpeakingSession(input.actor, existing);

    const session = await this.speakingRepositories.sessions.updateStatus({
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      status: input.body.outcome === "failed" ? "failed" : "ended",
      endedAt: input.now,
      latencyMs: input.body.latencyMs,
      now: input.now,
    });

    if (!session) {
      throw new ApiHttpError(404, "speaking_session.not_found", "Speaking session not found.");
    }

    return session;
  }

  async addTextFallback(input: {
    actor: Actor;
    tenantId: string;
    sessionId: string;
    body: TextFallbackTurnInput;
    now: Date;
  }) {
    const session = await this.speakingRepositories.sessions.findById(
      input.tenantId,
      input.sessionId,
    );

    if (!session) {
      throw new ApiHttpError(404, "speaking_session.not_found", "Speaking session not found.");
    }

    assertCanReadSpeakingSession(input.actor, session);

    if (session.status === "ended" || session.status === "failed") {
      throw new ApiHttpError(409, "speaking_session.closed", "Speaking session is already closed.");
    }

    const learnerSegment = await this.speakingRepositories.transcriptSegments.append({
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      speaker: "learner",
      text: input.body.text,
      language: input.body.language ?? session.targetLanguage,
      romanization: input.body.romanization,
      isFinal: true,
      confidence: 1,
      createdAt: input.now,
    });
    const assistantSegment = await this.speakingRepositories.transcriptSegments.append({
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      speaker: "assistant",
      text: "Text fallback received. Try one shorter sentence, then continue when voice reconnects.",
      language: session.targetLanguage,
      isFinal: true,
      confidence: 1,
      createdAt: new Date(input.now.getTime() + 1),
    });

    return {
      fallbackMode: true,
      learnerSegment,
      assistantSegment,
    };
  }

  async getReport(input: { actor: Actor; tenantId: string; sessionId: string }) {
    const session = await this.getSession(input);
    const learnerTurns = session.transcript.filter((segment) => segment.speaker === "learner");
    const durationSeconds =
      session.startedAt && session.endedAt
        ? Math.max(0, Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000))
        : null;

    return {
      sessionId: session.id,
      status: session.status,
      durationSeconds,
      latencyMs: session.latencyMs,
      costEstimate: session.costEstimate,
      provider: {
        sfu: session.sfuProvider,
        stt: session.sttProvider,
        tts: session.ttsProvider,
        llm: session.llmProvider,
      },
      metrics: {
        learnerTurns: learnerTurns.length,
        transcriptSegments: session.transcript.length,
        textFallbackUsed: session.transcript.length > 0,
      },
      transcript: session.transcript,
      nextMicroGoal:
        learnerTurns.length === 0
          ? "Start with one short spoken sentence."
          : "Repeat your last answer with one clearer target phrase.",
      scoringStatus: "not_implemented",
    };
  }

  private async requirePublishedLesson(tenantId: string, lessonId: string): Promise<void> {
    const lesson = await this.learningRepositories.lessons.findById(tenantId, lessonId);

    if (!lesson || lesson.status !== "published") {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const course = await this.learningRepositories.courses.findById(tenantId, lesson.courseId);

    if (!course || course.status !== "published") {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }
  }
}

export function createSpeakingServices(input: {
  speakingRepositories: SpeakingRepositories;
  learningRepositories: LearningRepositories;
  randomId: () => string;
}) {
  return {
    sessions: new SpeakingSessionService(
      input.speakingRepositories,
      input.learningRepositories,
      input.randomId,
    ),
  };
}

function assertCanReadSpeakingSession(
  actor: Actor,
  session: Pick<SpeakingSessionRecord, "userId">,
): void {
  if (session.userId === actor.userId) {
    return;
  }

  if (hasPermission(actor, "speaking_session:manage")) {
    return;
  }

  throw new ApiHttpError(403, "speaking_session.not_owner", "Access denied.", {
    reason: "speaking_session_not_owned_by_actor",
  });
}

function buildQos(networkProfile: "standard" | "weak"): Record<string, unknown> {
  return {
    bitratePolicy: networkProfile === "weak" ? "low_adaptive" : "adaptive",
    reconnect: true,
    textFallbackEnabled: true,
    maxReconnectSeconds: 30,
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
