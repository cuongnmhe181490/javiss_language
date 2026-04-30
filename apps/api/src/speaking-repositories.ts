import { learnerUserId, tenantAlphaId } from "./fixtures.js";
import { sampleLessonAlphaOneId } from "./learning-domain.js";
import {
  sampleSpeakingSessionAlphaId,
  type SpeakingRealtimeTokenRecord,
  type SpeakingSessionDetail,
  type SpeakingSessionRecord,
  type SpeakingTranscriptSegmentRecord,
} from "./speaking-domain.js";

export type SpeakingRepositories = {
  sessions: SpeakingSessionRepository;
  tokens: SpeakingRealtimeTokenRepository;
  transcriptSegments: SpeakingTranscriptSegmentRepository;
};

export type SpeakingSessionRepository = {
  create(
    input: Omit<SpeakingSessionRecord, "createdAt" | "updatedAt"> & { now: Date },
  ): Promise<SpeakingSessionRecord>;
  findById(tenantId: string, sessionId: string): Promise<SpeakingSessionRecord | null>;
  findDetailById(tenantId: string, sessionId: string): Promise<SpeakingSessionDetail | null>;
  updateStatus(input: {
    tenantId: string;
    sessionId: string;
    status: SpeakingSessionRecord["status"];
    endedAt?: Date;
    latencyMs?: number;
    now: Date;
  }): Promise<SpeakingSessionRecord | null>;
};

export type SpeakingRealtimeTokenRepository = {
  create(input: SpeakingRealtimeTokenRecord): Promise<SpeakingRealtimeTokenRecord>;
};

export type SpeakingTranscriptSegmentRepository = {
  append(
    input: Omit<SpeakingTranscriptSegmentRecord, "id" | "sequence"> & { id?: string },
  ): Promise<SpeakingTranscriptSegmentRecord>;
  listBySession(tenantId: string, sessionId: string): Promise<SpeakingTranscriptSegmentRecord[]>;
  nextSequence(tenantId: string, sessionId: string): Promise<number>;
};

export function createInMemorySpeakingRepositories(): SpeakingRepositories {
  const now = new Date("2026-04-27T09:00:00.000Z");
  const sessions: SpeakingSessionRecord[] = [
    {
      id: sampleSpeakingSessionAlphaId,
      tenantId: tenantAlphaId,
      userId: learnerUserId,
      lessonId: sampleLessonAlphaOneId,
      mode: "role_play",
      status: "ended",
      targetLanguage: "en",
      scenario: {
        scenario: "Greeting a hotel guest",
        role: "front desk staff",
        goal: "Use a polite welcome and one follow-up question.",
        usefulPhrases: ["Good morning", "Welcome to the hotel", "Can I help you?"],
      },
      roomName: `tenant-${tenantAlphaId}:speaking-${sampleSpeakingSessionAlphaId}`,
      sfuProvider: "mock-livekit",
      sttProvider: "mock-stt",
      ttsProvider: "mock-tts",
      llmProvider: "mock-tutor-v1",
      qos: {
        bitratePolicy: "adaptive",
        textFallbackEnabled: true,
      },
      startedAt: now,
      endedAt: new Date("2026-04-27T09:08:00.000Z"),
      expiresAt: new Date("2026-04-27T09:30:00.000Z"),
      latencyMs: 180,
      costEstimate: 0,
      createdAt: now,
      updatedAt: new Date("2026-04-27T09:08:00.000Z"),
    },
  ];
  const tokens: SpeakingRealtimeTokenRecord[] = [];
  const transcriptSegments: SpeakingTranscriptSegmentRecord[] = [];
  const nextSequence = (tenantId: string, sessionId: string) => {
    const last = transcriptSegments
      .filter((segment) => segment.tenantId === tenantId && segment.sessionId === sessionId)
      .reduce((max, segment) => Math.max(max, segment.sequence), -1);

    return last + 1;
  };

  return {
    sessions: {
      async create(input) {
        const session: SpeakingSessionRecord = {
          ...input,
          createdAt: input.now,
          updatedAt: input.now,
        };
        sessions.push(session);
        return session;
      },
      async findById(tenantId, sessionId) {
        return (
          sessions.find((session) => session.tenantId === tenantId && session.id === sessionId) ??
          null
        );
      },
      async findDetailById(tenantId, sessionId) {
        const session =
          sessions.find((item) => item.tenantId === tenantId && item.id === sessionId) ?? null;

        if (!session) {
          return null;
        }

        return {
          ...session,
          transcript: transcriptSegments
            .filter((segment) => segment.tenantId === tenantId && segment.sessionId === sessionId)
            .sort((left, right) => left.sequence - right.sequence),
        };
      },
      async updateStatus(input) {
        const session = sessions.find(
          (item) => item.tenantId === input.tenantId && item.id === input.sessionId,
        );

        if (!session) {
          return null;
        }

        session.status = input.status;
        session.endedAt = input.endedAt;
        session.latencyMs = input.latencyMs;
        session.updatedAt = input.now;
        return session;
      },
    },
    tokens: {
      async create(input) {
        tokens.push(input);
        return input;
      },
    },
    transcriptSegments: {
      async append(input) {
        const segment: SpeakingTranscriptSegmentRecord = {
          ...input,
          id: input.id ?? crypto.randomUUID(),
          sequence: nextSequence(input.tenantId, input.sessionId),
        };
        transcriptSegments.push(segment);
        return segment;
      },
      async listBySession(tenantId, sessionId) {
        return transcriptSegments
          .filter((segment) => segment.tenantId === tenantId && segment.sessionId === sessionId)
          .sort((left, right) => left.sequence - right.sequence);
      },
      async nextSequence(tenantId, sessionId) {
        return nextSequence(tenantId, sessionId);
      },
    },
  };
}
