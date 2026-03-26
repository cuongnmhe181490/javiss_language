import { type AiProvider, type Prisma, type WritingTaskType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const writingFeedbackHistorySelect = {
  id: true,
  taskType: true,
  prompt: true,
  wordCount: true,
  overallBand: true,
  taskBand: true,
  coherenceBand: true,
  lexicalBand: true,
  grammarBand: true,
  summary: true,
  strengths: true,
  improvements: true,
  sampleRewrite: true,
  provider: true,
  modelName: true,
  fallbackReason: true,
  createdAt: true,
} as const;

export type WritingFeedbackHistoryRecord = Prisma.WritingFeedbackSubmissionGetPayload<{
  select: typeof writingFeedbackHistorySelect;
}>;

export async function createWritingFeedbackSubmission(input: {
  tenantId?: string | null;
  userId: string;
  taskType: WritingTaskType;
  prompt: string;
  essay: string;
  wordCount: number;
  overallBand: number;
  taskBand: number;
  coherenceBand: number;
  lexicalBand: number;
  grammarBand: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  sampleRewrite: string;
  provider: AiProvider;
  modelName: string;
  fallbackReason?: string | null;
}) {
  return prisma.writingFeedbackSubmission.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      taskType: input.taskType,
      prompt: input.prompt,
      essay: input.essay,
      wordCount: input.wordCount,
      overallBand: input.overallBand,
      taskBand: input.taskBand,
      coherenceBand: input.coherenceBand,
      lexicalBand: input.lexicalBand,
      grammarBand: input.grammarBand,
      summary: input.summary,
      strengths: input.strengths,
      improvements: input.improvements,
      sampleRewrite: input.sampleRewrite,
      provider: input.provider,
      modelName: input.modelName,
      fallbackReason: input.fallbackReason,
    },
    select: writingFeedbackHistorySelect,
  });
}

export async function listRecentWritingFeedbackSubmissionsByUser(userId: string, take = 8) {
  return prisma.writingFeedbackSubmission.findMany({
    where: { userId },
    select: writingFeedbackHistorySelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function countWritingFeedbackSubmissionsByUser(userId: string) {
  return prisma.writingFeedbackSubmission.count({
    where: { userId },
  });
}

export async function aggregateWritingFeedbackByUser(userId: string) {
  return prisma.writingFeedbackSubmission.aggregate({
    where: { userId },
    _count: {
      _all: true,
    },
    _avg: {
      overallBand: true,
    },
    _max: {
      overallBand: true,
    },
  });
}

export async function groupWritingFeedbackByTaskType(userId: string) {
  return prisma.writingFeedbackSubmission.groupBy({
    by: ["taskType"],
    where: { userId },
    _count: {
      _all: true,
    },
  });
}
