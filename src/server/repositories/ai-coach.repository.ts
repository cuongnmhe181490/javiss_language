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

export async function findLatestCoachConversationForUser(userId: string) {
  return prisma.aiConversation.findFirst({
    where: {
      userId,
      kind: AiConversationKind.coach,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 8,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findLatestSpeakingConversationForUser(userId: string) {
  return prisma.aiConversation.findFirst({
    where: {
      userId,
      kind: AiConversationKind.speaking_mock,
    },
    select: {
      id: true,
      title: true,
      scenario: true,
      updatedAt: true,
      speakingFinalBand: true,
      speakingEstimatedBand: true,
      speakingIsCompleted: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listRecentSpeakingAssessmentsByUser(userId: string, take = 6) {
  return prisma.aiSpeakingAssessmentSnapshot.findMany({
    where: {
      conversation: {
        userId,
      },
    },
    select: {
      id: true,
      estimatedBand: true,
      fluencyBand: true,
      lexicalBand: true,
      grammarBand: true,
      pronunciationBand: true,
      createdAt: true,
      conversation: {
        select: {
          id: true,
          title: true,
          scenario: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
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
      assessments: {
        orderBy: { createdAt: "desc" },
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
  speakingIsCompleted?: boolean;
  speakingCompletedAt?: Date | null;
  speakingFinalBand?: string | null;
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
      speakingIsCompleted: input.speakingIsCompleted,
      speakingCompletedAt: input.speakingCompletedAt,
      speakingFinalBand: input.speakingFinalBand,
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

export async function createAiSpeakingAssessmentSnapshot(input: {
  conversationId: string;
  tenantId?: string | null;
  estimatedBand: string;
  fluencyBand: string;
  lexicalBand: string;
  grammarBand: string;
  pronunciationBand: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  provider: AiProvider;
  modelName: string;
}) {
  const latestSnapshot = await prisma.aiSpeakingAssessmentSnapshot.findFirst({
    where: {
      conversationId: input.conversationId,
    },
    orderBy: {
      sequenceNumber: "desc",
    },
    select: {
      sequenceNumber: true,
    },
  });

  return prisma.aiSpeakingAssessmentSnapshot.create({
    data: {
      conversationId: input.conversationId,
      tenantId: input.tenantId,
      sequenceNumber: (latestSnapshot?.sequenceNumber ?? 0) + 1,
      estimatedBand: input.estimatedBand,
      fluencyBand: input.fluencyBand,
      lexicalBand: input.lexicalBand,
      grammarBand: input.grammarBand,
      pronunciationBand: input.pronunciationBand,
      summary: input.summary,
      strengths: input.strengths,
      improvements: input.improvements,
      provider: input.provider,
      modelName: input.modelName,
    },
  });
}
