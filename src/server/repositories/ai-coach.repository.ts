import { AiConversationKind, AiMessageRole, AiProvider } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function listAiConversationsByUser(userId: string) {
  return prisma.aiConversation.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

export async function findAiConversationByIdForUser(input: {
  id: string;
  userId: string;
}) {
  return prisma.aiConversation.findFirst({
    where: {
      id: input.id,
      userId: input.userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createAiConversation(input: {
  userId: string;
  title: string;
  kind?: AiConversationKind;
  scenario?: string | null;
  provider: AiProvider;
  modelName: string;
}) {
  return prisma.aiConversation.create({
    data: {
      userId: input.userId,
      title: input.title,
      kind: input.kind,
      scenario: input.scenario,
      provider: input.provider,
      modelName: input.modelName,
    },
  });
}

export async function createAiMessage(input: {
  conversationId: string;
  role: AiMessageRole;
  content: string;
  provider?: AiProvider;
  modelName?: string;
  providerResponseId?: string | null;
}) {
  return prisma.aiMessage.create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      provider: input.provider,
      modelName: input.modelName,
      providerResponseId: input.providerResponseId,
    },
  });
}

export async function updateAiConversationState(input: {
  id: string;
  title?: string;
  kind?: AiConversationKind;
  scenario?: string | null;
  speakingEstimatedBand?: string | null;
  speakingFluencyBand?: string | null;
  speakingLexicalBand?: string | null;
  speakingGrammarBand?: string | null;
  speakingPronunciationBand?: string | null;
  speakingAssessmentSummary?: string | null;
  speakingStrengths?: string[];
  speakingImprovements?: string[];
  speakingLastAssessedAt?: Date | null;
  provider?: AiProvider;
  modelName?: string;
  lastProviderResponseId?: string | null;
}) {
  return prisma.aiConversation.update({
    where: { id: input.id },
    data: {
      title: input.title,
      kind: input.kind,
      scenario: input.scenario,
      speakingEstimatedBand: input.speakingEstimatedBand,
      speakingFluencyBand: input.speakingFluencyBand,
      speakingLexicalBand: input.speakingLexicalBand,
      speakingGrammarBand: input.speakingGrammarBand,
      speakingPronunciationBand: input.speakingPronunciationBand,
      speakingAssessmentSummary: input.speakingAssessmentSummary,
      speakingStrengths: input.speakingStrengths,
      speakingImprovements: input.speakingImprovements,
      speakingLastAssessedAt: input.speakingLastAssessedAt,
      provider: input.provider,
      modelName: input.modelName,
      lastProviderResponseId: input.lastProviderResponseId,
    },
  });
}
