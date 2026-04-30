import { z } from "zod";

export const speakingLanguageSchema = z.enum(["en", "zh", "ja", "ko"]);
export const speakingModeSchema = z.enum(["drill", "role_play", "pronunciation_lab"]);
export const speakingSessionStatusSchema = z.enum([
  "created",
  "connecting",
  "active",
  "ended",
  "failed",
]);
export const transcriptSpeakerSchema = z.enum(["learner", "assistant", "system"]);
export const realtimeTokenPurposeSchema = z.enum(["room_join", "reconnect"]);

const scenarioSchema = z
  .object({
    scenario: z.string().min(1).max(240).optional(),
    role: z.string().min(1).max(120).optional(),
    goal: z.string().min(1).max(240).optional(),
    usefulPhrases: z.array(z.string().min(1).max(120)).max(12).optional(),
    targetGrammar: z.array(z.string().min(1).max(120)).max(8).optional(),
    targetVocabulary: z.array(z.string().min(1).max(120)).max(16).optional(),
  })
  .default({});

export const createSpeakingSessionSchema = z.object({
  lessonId: z.string().uuid().optional(),
  mode: speakingModeSchema.default("role_play"),
  targetLanguage: speakingLanguageSchema.default("en"),
  scenario: scenarioSchema,
  networkProfile: z.enum(["standard", "weak"]).default("standard"),
});

export const endSpeakingSessionSchema = z.object({
  outcome: z.enum(["completed", "abandoned", "failed"]).default("completed"),
  latencyMs: z.number().int().min(0).max(120000).optional(),
});

export const textFallbackTurnSchema = z.object({
  text: z.string().min(1).max(2000),
  language: speakingLanguageSchema.optional(),
  romanization: z.string().min(1).max(2000).optional(),
});

export type SpeakingLanguage = z.infer<typeof speakingLanguageSchema>;
export type SpeakingMode = z.infer<typeof speakingModeSchema>;
export type SpeakingSessionStatus = z.infer<typeof speakingSessionStatusSchema>;
export type TranscriptSpeaker = z.infer<typeof transcriptSpeakerSchema>;
export type RealtimeTokenPurpose = z.infer<typeof realtimeTokenPurposeSchema>;
export type CreateSpeakingSessionInput = z.infer<typeof createSpeakingSessionSchema>;
export type EndSpeakingSessionInput = z.infer<typeof endSpeakingSessionSchema>;
export type TextFallbackTurnInput = z.infer<typeof textFallbackTurnSchema>;

export type SpeakingScenario = z.infer<typeof scenarioSchema>;

export type SpeakingSessionRecord = {
  id: string;
  tenantId: string;
  userId: string;
  lessonId?: string;
  mode: SpeakingMode;
  status: SpeakingSessionStatus;
  targetLanguage: SpeakingLanguage;
  scenario: SpeakingScenario;
  roomName: string;
  sfuProvider: string;
  sttProvider: string;
  ttsProvider: string;
  llmProvider: string;
  qos: Record<string, unknown>;
  startedAt?: Date;
  endedAt?: Date;
  expiresAt: Date;
  latencyMs?: number;
  costEstimate: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SpeakingRealtimeTokenRecord = {
  id: string;
  tenantId: string;
  sessionId: string;
  userId: string;
  tokenHash: string;
  purpose: RealtimeTokenPurpose;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
};

export type SpeakingTranscriptSegmentRecord = {
  id: string;
  tenantId: string;
  sessionId: string;
  sequence: number;
  speaker: TranscriptSpeaker;
  text: string;
  language: SpeakingLanguage;
  romanization?: string;
  isFinal: boolean;
  confidence?: number;
  startedAtMs?: number;
  endedAtMs?: number;
  createdAt: Date;
};

export type SpeakingSessionDetail = SpeakingSessionRecord & {
  transcript: SpeakingTranscriptSegmentRecord[];
};

export type RealtimeJoinGrant = {
  provider: string;
  roomName: string;
  token: string;
  tokenExpiresAt: string;
  turnServerPolicy: "managed" | "self_hosted";
  qos: Record<string, unknown>;
};

export const sampleSpeakingSessionAlphaId = "19191919-1919-4191-8191-191919191911";
