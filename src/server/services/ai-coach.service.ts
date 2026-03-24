import { AiMessageRole, AiProvider } from "@prisma/client";
import { env } from "@/config/env";
import type { AiCoachMessageInput } from "@/features/ai/schemas";
import { getAiCoachProvider, getMockAiCoachProvider } from "@/lib/ai/providers";
import type { AiCoachContext } from "@/lib/ai/types";
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
    providerMode:
      env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY ? ("openai" as const) : ("mock" as const),
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

  const provider = getAiCoachProvider();
  const providerMode =
    env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY ? AiProvider.openai : AiProvider.mock;

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
      provider: providerMode,
      modelName:
        providerMode === AiProvider.openai ? env.OPENAI_MODEL : "javiss-coach-demo",
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
  let reply;

  try {
    reply = await provider.generateReply({
      message: input.values.message,
      previousResponseId: conversation.lastProviderResponseId,
      context,
    });
  } catch (error) {
    logger.warn("ai_coach_provider_failed", {
      conversationId: conversation.id,
      error: error instanceof Error ? error.message : "unknown",
    });

    const fallbackProvider = getMockAiCoachProvider();
    reply = await fallbackProvider.generateReply({
      message: input.values.message,
      previousResponseId: null,
      context,
    });
  }

  const assistantMessage = await createAiMessage({
    conversationId: conversation.id,
    role: AiMessageRole.assistant,
    content: reply.text,
    provider: reply.provider === "openai" ? AiProvider.openai : AiProvider.mock,
    modelName: reply.modelName,
    providerResponseId: reply.providerResponseId,
  });

  await updateAiConversationState({
    id: conversation.id,
    provider: reply.provider === "openai" ? AiProvider.openai : AiProvider.mock,
    modelName: reply.modelName,
    lastProviderResponseId: reply.providerResponseId ?? conversation.lastProviderResponseId,
  });

  return {
    conversationId: conversation.id,
    message: assistantMessage,
    provider: reply.provider,
    modelName: reply.modelName,
  };
}
