import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  SpeakingRealtimeTokenRecord,
  SpeakingSessionDetail,
  SpeakingSessionRecord,
  SpeakingTranscriptSegmentRecord,
} from "./speaking-domain.js";
import type { SpeakingRepositories } from "./speaking-repositories.js";

export function createPrismaSpeakingRepositories(prisma: PrismaClient): SpeakingRepositories {
  const nextSequence = async (tenantId: string, sessionId: string) => {
    const latest = await prisma.speakingTranscriptSegment.findFirst({
      orderBy: { sequence: "desc" },
      select: { sequence: true },
      where: {
        sessionId,
        tenantId,
      },
    });

    return (latest?.sequence ?? -1) + 1;
  };

  return {
    sessions: {
      async create(input) {
        const session = await prisma.speakingSession.create({
          data: {
            id: input.id,
            tenantId: input.tenantId,
            userId: input.userId,
            lessonId: input.lessonId,
            mode: input.mode,
            status: input.status,
            targetLanguage: input.targetLanguage,
            scenario: input.scenario as Prisma.InputJsonValue,
            roomName: input.roomName,
            sfuProvider: input.sfuProvider,
            sttProvider: input.sttProvider,
            ttsProvider: input.ttsProvider,
            llmProvider: input.llmProvider,
            qos: input.qos as Prisma.InputJsonValue,
            startedAt: input.startedAt,
            endedAt: input.endedAt,
            expiresAt: input.expiresAt,
            latencyMs: input.latencyMs,
            costEstimate: input.costEstimate,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapSession(session);
      },
      async findById(tenantId, sessionId) {
        const session = await prisma.speakingSession.findFirst({
          where: {
            id: sessionId,
            tenantId,
          },
        });

        return session ? mapSession(session) : null;
      },
      async findDetailById(tenantId, sessionId) {
        const session = await prisma.speakingSession.findFirst({
          include: {
            transcriptSegments: {
              orderBy: { sequence: "asc" },
            },
          },
          where: {
            id: sessionId,
            tenantId,
          },
        });

        return session
          ? ({
              ...mapSession(session),
              transcript: session.transcriptSegments.map(mapTranscriptSegment),
            } satisfies SpeakingSessionDetail)
          : null;
      },
      async updateStatus(input) {
        const existing = await prisma.speakingSession.findFirst({
          where: {
            id: input.sessionId,
            tenantId: input.tenantId,
          },
        });

        if (!existing) {
          return null;
        }

        const session = await prisma.speakingSession.update({
          where: {
            id: existing.id,
          },
          data: {
            status: input.status,
            endedAt: input.endedAt,
            latencyMs: input.latencyMs,
            updatedAt: input.now,
          },
        });

        return mapSession(session);
      },
    },
    tokens: {
      async create(input) {
        const token = await prisma.speakingRealtimeToken.create({
          data: {
            id: input.id,
            tenantId: input.tenantId,
            sessionId: input.sessionId,
            userId: input.userId,
            tokenHash: input.tokenHash,
            purpose: input.purpose,
            expiresAt: input.expiresAt,
            createdAt: input.createdAt,
            revokedAt: input.revokedAt,
          },
        });

        return mapRealtimeToken(token);
      },
    },
    transcriptSegments: {
      async append(input) {
        const sequence = await nextSequence(input.tenantId, input.sessionId);
        const segment = await prisma.speakingTranscriptSegment.create({
          data: {
            id: input.id,
            tenantId: input.tenantId,
            sessionId: input.sessionId,
            sequence,
            speaker: input.speaker,
            text: input.text,
            language: input.language,
            romanization: input.romanization,
            isFinal: input.isFinal,
            confidence: input.confidence,
            startedAtMs: input.startedAtMs,
            endedAtMs: input.endedAtMs,
            createdAt: input.createdAt,
          },
        });

        return mapTranscriptSegment(segment);
      },
      async listBySession(tenantId, sessionId) {
        const segments = await prisma.speakingTranscriptSegment.findMany({
          orderBy: { sequence: "asc" },
          where: {
            sessionId,
            tenantId,
          },
        });

        return segments.map(mapTranscriptSegment);
      },
      async nextSequence(tenantId, sessionId) {
        return nextSequence(tenantId, sessionId);
      },
    },
  };
}

function mapSession(session: Prisma.SpeakingSessionGetPayload<object>): SpeakingSessionRecord {
  return {
    id: session.id,
    tenantId: session.tenantId,
    userId: session.userId,
    lessonId: session.lessonId ?? undefined,
    mode: session.mode as SpeakingSessionRecord["mode"],
    status: session.status as SpeakingSessionRecord["status"],
    targetLanguage: session.targetLanguage as SpeakingSessionRecord["targetLanguage"],
    scenario: jsonObject(session.scenario),
    roomName: session.roomName,
    sfuProvider: session.sfuProvider,
    sttProvider: session.sttProvider,
    ttsProvider: session.ttsProvider,
    llmProvider: session.llmProvider,
    qos: jsonObject(session.qos),
    startedAt: session.startedAt ?? undefined,
    endedAt: session.endedAt ?? undefined,
    expiresAt: session.expiresAt,
    latencyMs: session.latencyMs ?? undefined,
    costEstimate: session.costEstimate,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

function mapRealtimeToken(
  token: Prisma.SpeakingRealtimeTokenGetPayload<object>,
): SpeakingRealtimeTokenRecord {
  return {
    id: token.id,
    tenantId: token.tenantId,
    sessionId: token.sessionId,
    userId: token.userId,
    tokenHash: token.tokenHash,
    purpose: token.purpose as SpeakingRealtimeTokenRecord["purpose"],
    expiresAt: token.expiresAt,
    createdAt: token.createdAt,
    revokedAt: token.revokedAt ?? undefined,
  };
}

function mapTranscriptSegment(
  segment: Prisma.SpeakingTranscriptSegmentGetPayload<object>,
): SpeakingTranscriptSegmentRecord {
  return {
    id: segment.id,
    tenantId: segment.tenantId,
    sessionId: segment.sessionId,
    sequence: segment.sequence,
    speaker: segment.speaker as SpeakingTranscriptSegmentRecord["speaker"],
    text: segment.text,
    language: segment.language as SpeakingTranscriptSegmentRecord["language"],
    romanization: segment.romanization ?? undefined,
    isFinal: segment.isFinal,
    confidence: segment.confidence ?? undefined,
    startedAtMs: segment.startedAtMs ?? undefined,
    endedAtMs: segment.endedAtMs ?? undefined,
    createdAt: segment.createdAt,
  };
}

function jsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
