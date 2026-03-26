import { AiConversationKind, AiMessageRole, AiProvider } from "@prisma/client";
import { env } from "@/config/env";
import type { AiCoachMessageInput, AiSpeakingSessionInput } from "@/features/ai/schemas";
import { getAiCoachProvider, getMockAiCoachProvider } from "@/lib/ai/providers";
import type {
  AiCoachContext,
  AiCoachReplyInput,
  AiConversationHistoryMessage,
  AiSpeakingAssessment,
} from "@/lib/ai/types";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { consumeDailyProviderQuota } from "@/lib/rate-limit/provider-quota";
import { AppError } from "@/lib/utils/app-error";
import {
  createAiConversation,
  createAiMessage,
  createAiSpeakingAssessmentSnapshot,
  findLatestCoachConversationForUser,
  findLatestSpeakingConversationForUser,
  findAiConversationByIdForUser,
  listAiConversationsByUser,
  updateAiConversationState,
} from "@/server/repositories/ai-coach.repository";
import { findUserById } from "@/server/repositories/user.repository";
import { trackSpeakingMockFirstStart } from "@/server/services/learner-retention-analytics.service";

function buildConversationTitle(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  return compact.length > 48 ? `${compact.slice(0, 48).trim()}...` : compact;
}

function getSpeakingPartLabel(part: AiSpeakingSessionInput["part"]) {
  switch (part) {
    case "part1":
      return "Part 1";
    case "part2":
      return "Part 2";
    case "part3":
      return "Part 3";
    default:
      return "Part 1";
  }
}

function buildSpeakingTitle(values: AiSpeakingSessionInput) {
  return `Speaking mock - ${getSpeakingPartLabel(values.part)}`;
}

function buildSpeakingScenario(values: AiSpeakingSessionInput) {
  const label = getSpeakingPartLabel(values.part);
  return values.topic
    ? `IELTS Speaking ${label} - Topic: ${values.topic}`
    : `IELTS Speaking ${label}`;
}

function buildSpeakingOpeningMessage(values: AiSpeakingSessionInput) {
  if (values.part === "part2") {
    return [
      "Now let's move to Part 2.",
      `I'd like you to describe ${values.topic ?? "a memorable experience you had recently"}.`,
      "You should say:",
      "- what it was",
      "- when it happened",
      "- who was involved",
      "- and why it was memorable",
      "Take a moment to think, and then start speaking when you are ready.",
    ].join("\n");
  }

  if (values.part === "part3") {
    return [
      "Let's begin Part 3.",
      `How important is ${values.topic ?? "this topic"} in modern society?`,
    ].join("\n");
  }

  return [
    "Good morning. This is a short IELTS Speaking practice.",
    values.topic
      ? `Let's start with Part 1 about ${values.topic}. What comes to your mind first when you think about this topic?`
      : "Let's start with Part 1. Do you work or are you a student?",
  ].join("\n");
}

function buildAiCoachContext(user: NonNullable<Awaited<ReturnType<typeof findUserById>>>): AiCoachContext {
  const goal = user.goals[0];
  const plan = user.studyPlans[0];
  const snapshot = user.snapshots[0];

  return {
    fullName: user.profile?.fullName ?? user.email,
    email: user.email,
    preferredLocale: user.profile?.preferredLocale ?? "vi",
    examName: goal?.exam.name,
    targetScore: goal?.targetScore ?? undefined,
    estimatedLevel: goal?.estimatedLevel ?? user.profile?.currentLevel ?? undefined,
    preferredLanguage: goal?.language.nativeName ?? undefined,
    strongestSkills: user.profile?.strongestSkills ?? [],
    weakestSkills: user.profile?.weakestSkills ?? [],
    preferredStudyWindow: user.profile?.preferredStudyWindow ?? undefined,
    preferredSchedule: goal?.preferredSchedule ?? undefined,
    nextAction: plan?.nextAction ?? undefined,
    latestProgress: snapshot
      ? {
          overall: snapshot.overallProgress,
          speaking: snapshot.speakingProgress,
          writing: snapshot.writingProgress,
          reading: snapshot.readingProgress,
          listening: snapshot.listeningProgress,
        }
      : null,
  };
}

function resolveProviderConfig() {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    return {
      provider: AiProvider.openai,
      modelName: env.OPENAI_MODEL,
      mode: "openai" as const,
    };
  }

  if (env.AI_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    return {
      provider: AiProvider.gemini,
      modelName: env.GEMINI_MODEL,
      mode: "gemini" as const,
    };
  }

  return {
    provider: AiProvider.mock,
    modelName: "javiss-coach-demo",
    mode: "mock" as const,
  };
}

function mapProviderNameToEnum(provider: "mock" | "openai" | "gemini") {
  switch (provider) {
    case "openai":
      return AiProvider.openai;
    case "gemini":
      return AiProvider.gemini;
    default:
      return AiProvider.mock;
  }
}

function buildHistory(
  existingMessages: { role: AiMessageRole; content: string }[],
  latestUserMessage: string,
): AiConversationHistoryMessage[] {
  return [
    ...existingMessages.map<AiConversationHistoryMessage>((message) => ({
      role: message.role === AiMessageRole.user ? "user" : "assistant",
      content: message.content,
    })),
    {
      role: "user",
      content: latestUserMessage,
    },
  ];
}

function getProviderFallbackMessage(reason: string) {
  switch (reason) {
    case "daily_quota_reached":
      return "Gemini đã chạm giới hạn lượt dùng trong ngày. Hệ thống đã tự chuyển sang chế độ dự phòng.";
    case "provider_request_failed":
      return "Gemini đang lỗi tạm thời. Hệ thống đã tự chuyển sang chế độ dự phòng.";
    default:
      return "AI thật đang tạm thời chưa sẵn sàng. Hệ thống đã chuyển sang chế độ dự phòng.";
  }
}

async function resolveSpeakingAssessmentWithFallback(input: {
  providerInput: AiCoachReplyInput;
  providerMode: "mock" | "openai" | "gemini";
  conversationId: string;
  userId: string;
}) {
  if (input.providerMode === "gemini") {
    const quota = await consumeDailyProviderQuota({
      provider: "gemini",
      userId: input.userId,
      limit: env.GEMINI_DAILY_REQUEST_LIMIT,
    });

    if (!quota.allowed) {
      logger.warn("gemini_daily_quota_reached_for_assessment", {
        conversationId: input.conversationId,
        userId: input.userId,
        limit: env.GEMINI_DAILY_REQUEST_LIMIT,
        count: quota.count,
      });

      const fallbackProvider = getMockAiCoachProvider();
      return {
        assessment: await fallbackProvider.generateSpeakingAssessment(input.providerInput),
        provider: AiProvider.mock,
        modelName: "javiss-coach-demo",
      };
    }
  }

  const providerConfig = resolveProviderConfig();
  const provider = getAiCoachProvider();

  try {
    return {
      assessment: await provider.generateSpeakingAssessment(input.providerInput),
      provider: providerConfig.provider,
      modelName: providerConfig.modelName,
    };
  } catch (error) {
    logger.warn("speaking_assessment_failed", {
      conversationId: input.conversationId,
      providerMode: input.providerMode,
      error: error instanceof Error ? error.message : "unknown",
    });

    const fallbackProvider = getMockAiCoachProvider();
    return {
      assessment: await fallbackProvider.generateSpeakingAssessment(input.providerInput),
      provider: AiProvider.mock,
      modelName: "javiss-coach-demo",
    };
  }
}

async function resolveReplyWithFallback(input: {
  userId: string;
  conversationId: string;
  conversationKind: AiConversationKind;
  scenario?: string | null;
  previousResponseId?: string | null;
  message: string;
  context: AiCoachContext;
  existingMessages: { role: AiMessageRole; content: string }[];
}) {
  const providerConfig = resolveProviderConfig();
  const provider = getAiCoachProvider();
  const providerInput: AiCoachReplyInput = {
    message: input.message,
    previousResponseId: input.previousResponseId,
    context: input.context,
    mode: input.conversationKind === AiConversationKind.speaking_mock ? "speaking_mock" : "coach",
    scenario: input.scenario,
    history: buildHistory(input.existingMessages, input.message),
  };

  let fallbackReason: string | null = null;

  if (providerConfig.provider === AiProvider.gemini) {
    const quota = await consumeDailyProviderQuota({
      provider: "gemini",
      userId: input.userId,
      limit: env.GEMINI_DAILY_REQUEST_LIMIT,
    });

    if (!quota.allowed) {
      logger.warn("gemini_daily_quota_reached", {
        conversationId: input.conversationId,
        userId: input.userId,
        limit: env.GEMINI_DAILY_REQUEST_LIMIT,
        count: quota.count,
      });

      fallbackReason = "daily_quota_reached";
    }
  }

  if (!fallbackReason) {
    try {
      return await provider.generateReply(providerInput);
    } catch (error) {
      logger.warn("ai_coach_provider_failed", {
        conversationId: input.conversationId,
        error: error instanceof Error ? error.message : "unknown",
      });

      fallbackReason = "provider_request_failed";
    }
  }

  if (!env.AI_FALLBACK_TO_MOCK) {
    throw new AppError(getProviderFallbackMessage(fallbackReason ?? "provider_request_failed"), 503, "AI_PROVIDER_UNAVAILABLE");
  }

  const fallbackProvider = getMockAiCoachProvider();
  const fallbackReply = await fallbackProvider.generateReply(providerInput);

  return {
    ...fallbackReply,
    fallbackReason,
  };
}

export async function getAiCoachDashboardData(userId: string) {
  const [user, conversations] = await Promise.all([
    findUserById(userId),
    listAiConversationsByUser(userId),
  ]);

  if (!user) {
    throw new AppError("Không tìm thấy hồ sơ học viên.", 404, "USER_NOT_FOUND");
  }

  return {
    user,
    conversations,
    providerMode: resolveProviderConfig().mode,
  };
}

export async function getAiConversationDetail(input: { userId: string; conversationId: string }) {
  const conversation = await findAiConversationByIdForUser({
    id: input.conversationId,
    userId: input.userId,
  });

  if (!conversation) {
    throw new AppError("Không tìm thấy cuộc trò chuyện này.", 404, "CONVERSATION_NOT_FOUND");
  }

  return conversation;
}

export async function getStudentAiWidgetData(userId: string) {
  const [conversation, speakingConversation] = await Promise.all([
    findLatestCoachConversationForUser(userId),
    findLatestSpeakingConversationForUser(userId),
  ]);

  if (!conversation) {
    return speakingConversation
      ? {
          conversationId: null,
          title: "AI Coach nhanh",
          messages: [],
          latestSpeaking: {
            conversationId: speakingConversation.id,
          title: speakingConversation.title,
          scenario: speakingConversation.scenario,
          updatedAt: speakingConversation.updatedAt.toISOString(),
          band:
              speakingConversation.speakingFinalBand ??
              speakingConversation.speakingEstimatedBand ??
              null,
            isCompleted: speakingConversation.speakingIsCompleted,
          },
        }
      : null;
  }

  return {
    conversationId: conversation.id,
    title: conversation.title,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: (message.role === AiMessageRole.user ? "user" : "assistant") as "user" | "assistant",
      content: message.content,
    })),
    latestSpeaking: speakingConversation
      ? {
          conversationId: speakingConversation.id,
          title: speakingConversation.title,
          scenario: speakingConversation.scenario,
          updatedAt: speakingConversation.updatedAt.toISOString(),
          band:
            speakingConversation.speakingFinalBand ??
            speakingConversation.speakingEstimatedBand ??
            null,
          isCompleted: speakingConversation.speakingIsCompleted,
        }
      : null,
  };
}

export async function startAiSpeakingSession(input: {
  userId: string;
  values: AiSpeakingSessionInput;
}) {
  await enforceRateLimit(
    `ai-speaking-session:${input.userId}`,
    env.AI_SPEAKING_SESSION_WINDOW_LIMIT,
    env.AI_SPEAKING_SESSION_WINDOW_MINUTES * 60 * 1000,
  );

  const user = await findUserById(input.userId);

  if (!user) {
    throw new AppError("Không tìm thấy hồ sơ học viên.", 404, "USER_NOT_FOUND");
  }

  const providerConfig = resolveProviderConfig();
  const conversation = await createAiConversation({
    userId: input.userId,
    title: buildSpeakingTitle(input.values),
    kind: AiConversationKind.speaking_mock,
    scenario: buildSpeakingScenario(input.values),
    provider: providerConfig.provider,
    modelName: providerConfig.modelName,
  });

  const openingMessage = await createAiMessage({
    conversationId: conversation.id,
    role: AiMessageRole.assistant,
    content: buildSpeakingOpeningMessage(input.values),
    provider: providerConfig.provider,
    modelName: providerConfig.modelName,
  });

  await trackSpeakingMockFirstStart({
    tenantId: user.tenantId,
    userId: input.userId,
    conversationId: conversation.id,
    scenario: conversation.scenario,
  });

  return {
    conversationId: conversation.id,
    message: openingMessage,
    scenario: conversation.scenario,
    kind: conversation.kind,
  };
}

export async function sendAiCoachMessage(input: {
  userId: string;
  conversationId?: string;
  values: AiCoachMessageInput;
}) {
  await enforceRateLimit(
    `ai-coach:${input.userId}`,
    env.AI_MESSAGE_WINDOW_LIMIT,
    env.AI_MESSAGE_WINDOW_MINUTES * 60 * 1000,
  );

  const user = await findUserById(input.userId);

  if (!user) {
    throw new AppError("Không tìm thấy hồ sơ học viên.", 404, "USER_NOT_FOUND");
  }

  const providerConfig = resolveProviderConfig();

  let conversation =
    input.conversationId
      ? await findAiConversationByIdForUser({
          id: input.conversationId,
          userId: input.userId,
        })
      : null;

  if (input.conversationId && !conversation) {
    throw new AppError("Không tìm thấy cuộc trò chuyện này.", 404, "CONVERSATION_NOT_FOUND");
  }

  if (!conversation) {
    const createdConversation = await createAiConversation({
      userId: input.userId,
      title: buildConversationTitle(input.values.message),
      kind: AiConversationKind.coach,
      provider: providerConfig.provider,
      modelName: providerConfig.modelName,
    });
    conversation = {
      ...createdConversation,
      messages: [],
      assessments: [],
    };
  }

  if (
    conversation.kind === AiConversationKind.speaking_mock &&
    conversation.speakingIsCompleted
  ) {
    throw new AppError(
      "Phiên speaking này đã kết thúc. Hãy mở phiên mới nếu bạn muốn luyện tiếp.",
      409,
      "SPEAKING_SESSION_COMPLETED",
    );
  }

  await createAiMessage({
    conversationId: conversation.id,
    role: AiMessageRole.user,
    content: input.values.message,
  });

  const context = buildAiCoachContext(user);
  const reply = await resolveReplyWithFallback({
    userId: input.userId,
    conversationId: conversation.id,
    conversationKind: conversation.kind,
    scenario: conversation.scenario,
    previousResponseId: conversation.lastProviderResponseId,
    message: input.values.message,
    context,
    existingMessages: conversation.messages,
  });

  const replyProviderEnum = mapProviderNameToEnum(reply.provider);

  const assistantMessage = await createAiMessage({
    conversationId: conversation.id,
    role: AiMessageRole.assistant,
    content: reply.text,
    provider: replyProviderEnum,
    modelName: reply.modelName,
    providerResponseId: reply.providerResponseId,
  });

  let speakingAssessment: AiSpeakingAssessment | null = null;
  let speakingAssessmentProvider: AiProvider | null = null;
  let speakingAssessmentModelName: string | null = null;

  if (conversation.kind === AiConversationKind.speaking_mock) {
    const speakingAssessmentInput: AiCoachReplyInput = {
      message: input.values.message,
      previousResponseId: conversation.lastProviderResponseId,
      context,
      mode: "speaking_mock",
      scenario: conversation.scenario,
      history: [
        ...buildHistory(conversation.messages, input.values.message),
        {
          role: "assistant",
          content: reply.text,
        },
      ],
    };

    const speakingAssessmentResult = await resolveSpeakingAssessmentWithFallback({
      providerInput: speakingAssessmentInput,
      providerMode: resolveProviderConfig().mode,
      conversationId: conversation.id,
      userId: input.userId,
    });

    speakingAssessment = speakingAssessmentResult.assessment;
    speakingAssessmentProvider = speakingAssessmentResult.provider;
    speakingAssessmentModelName = speakingAssessmentResult.modelName;
  }

  await updateAiConversationState({
    id: conversation.id,
    provider: replyProviderEnum,
    modelName: reply.modelName,
    lastProviderResponseId: reply.providerResponseId ?? conversation.lastProviderResponseId,
    speakingEstimatedBand: speakingAssessment?.estimatedBand,
    speakingFluencyBand: speakingAssessment?.fluencyBand,
    speakingLexicalBand: speakingAssessment?.lexicalBand,
    speakingGrammarBand: speakingAssessment?.grammarBand,
    speakingPronunciationBand: speakingAssessment?.pronunciationBand,
    speakingAssessmentSummary: speakingAssessment?.summary,
    speakingStrengths: speakingAssessment?.strengths,
    speakingImprovements: speakingAssessment?.improvements,
    speakingLastAssessedAt: speakingAssessment ? new Date() : undefined,
  });

  if (
    conversation.kind === AiConversationKind.speaking_mock &&
    speakingAssessment &&
    speakingAssessmentProvider &&
    speakingAssessmentModelName
  ) {
    await createAiSpeakingAssessmentSnapshot({
      conversationId: conversation.id,
      tenantId: conversation.tenantId,
      estimatedBand: speakingAssessment.estimatedBand,
      fluencyBand: speakingAssessment.fluencyBand,
      lexicalBand: speakingAssessment.lexicalBand,
      grammarBand: speakingAssessment.grammarBand,
      pronunciationBand: speakingAssessment.pronunciationBand,
      summary: speakingAssessment.summary,
      strengths: speakingAssessment.strengths,
      improvements: speakingAssessment.improvements,
      provider: speakingAssessmentProvider,
      modelName: speakingAssessmentModelName,
    });
  }

  return {
    conversationId: conversation.id,
    kind: conversation.kind,
    scenario: conversation.scenario,
    message: assistantMessage,
    provider: reply.provider,
    modelName: reply.modelName,
    fallbackReason: reply.fallbackReason ?? null,
    speakingAssessment,
  };
}

export async function completeAiSpeakingSession(input: {
  userId: string;
  conversationId: string;
}) {
  const conversation = await findAiConversationByIdForUser({
    id: input.conversationId,
    userId: input.userId,
  });

  if (!conversation) {
    throw new AppError("Không tìm thấy phiên speaking này.", 404, "CONVERSATION_NOT_FOUND");
  }

  if (conversation.kind !== AiConversationKind.speaking_mock) {
    throw new AppError(
      "Chỉ phiên speaking mock mới có thể kết thúc.",
      400,
      "INVALID_CONVERSATION_KIND",
    );
  }

  if (conversation.speakingIsCompleted) {
    return {
      conversationId: conversation.id,
      speakingIsCompleted: true,
      speakingCompletedAt: conversation.speakingCompletedAt,
      speakingFinalBand:
        conversation.speakingFinalBand ?? conversation.speakingEstimatedBand ?? null,
    };
  }

  const completedAt = new Date();
  const updatedConversation = await updateAiConversationState({
    id: conversation.id,
    speakingIsCompleted: true,
    speakingCompletedAt: completedAt,
    speakingFinalBand: conversation.speakingEstimatedBand ?? null,
  });

  return {
    conversationId: updatedConversation.id,
    speakingIsCompleted: updatedConversation.speakingIsCompleted,
    speakingCompletedAt: updatedConversation.speakingCompletedAt,
    speakingFinalBand: updatedConversation.speakingFinalBand,
  };
}
