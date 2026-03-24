import { AiConversationKind, AiMessageRole, AiProvider } from "@prisma/client";
import { env } from "@/config/env";
import type { AiCoachMessageInput, AiSpeakingSessionInput } from "@/features/ai/schemas";
import { getAiCoachProvider, getMockAiCoachProvider } from "@/lib/ai/providers";
import type {
  AiCoachContext,
  AiCoachReplyInput,
  AiConversationHistoryMessage,
} from "@/lib/ai/types";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { AppError } from "@/lib/utils/app-error";
import {
  createAiConversation,
  createAiMessage,
  findAiConversationByIdForUser,
  listAiConversationsByUser,
  updateAiConversationState,
} from "@/server/repositories/ai-coach.repository";
import { findUserById } from "@/server/repositories/user.repository";

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

export async function startAiSpeakingSession(input: {
  userId: string;
  values: AiSpeakingSessionInput;
}) {
  await enforceRateLimit(`ai-speaking-session:${input.userId}`, 5, 10 * 60 * 1000);

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
  await enforceRateLimit(`ai-coach:${input.userId}`, 20, 10 * 60 * 1000);

  const user = await findUserById(input.userId);

  if (!user) {
    throw new AppError("Không tìm thấy hồ sơ học viên.", 404, "USER_NOT_FOUND");
  }

  const providerConfig = resolveProviderConfig();
  const provider = getAiCoachProvider();

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
    };
  }

  await createAiMessage({
    conversationId: conversation.id,
    role: AiMessageRole.user,
    content: input.values.message,
  });

  const context = buildAiCoachContext(user);
  const providerInput: AiCoachReplyInput = {
    message: input.values.message,
    previousResponseId: conversation.lastProviderResponseId,
    context,
    mode: conversation.kind === AiConversationKind.speaking_mock ? "speaking_mock" : "coach",
    scenario: conversation.scenario,
    history: buildHistory(conversation.messages, input.values.message),
  };

  let reply;

  try {
    reply = await provider.generateReply(providerInput);
  } catch (error) {
    logger.warn("ai_coach_provider_failed", {
      conversationId: conversation.id,
      error: error instanceof Error ? error.message : "unknown",
    });

    const fallbackProvider = getMockAiCoachProvider();
    reply = await fallbackProvider.generateReply(providerInput);
  }

  const assistantMessage = await createAiMessage({
    conversationId: conversation.id,
    role: AiMessageRole.assistant,
    content: reply.text,
    provider: mapProviderNameToEnum(reply.provider),
    modelName: reply.modelName,
    providerResponseId: reply.providerResponseId,
  });

  await updateAiConversationState({
    id: conversation.id,
    provider: mapProviderNameToEnum(reply.provider),
    modelName: reply.modelName,
    lastProviderResponseId: reply.providerResponseId ?? conversation.lastProviderResponseId,
  });

  return {
    conversationId: conversation.id,
    kind: conversation.kind,
    scenario: conversation.scenario,
    message: assistantMessage,
    provider: reply.provider,
    modelName: reply.modelName,
  };
}
