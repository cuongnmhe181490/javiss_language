import { AnalyticsEventType, AiProvider, type WritingTaskType } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/config/env";
import type { AiWritingFeedbackInput } from "@/features/ai/schemas";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { consumeDailyProviderQuota } from "@/lib/rate-limit/provider-quota";
import { AppError } from "@/lib/utils/app-error";
import { createAnalyticsEvent } from "@/server/repositories/analytics.repository";
import { findUserById } from "@/server/repositories/user.repository";
import { trackWritingFeedbackFirstCompletion } from "@/server/services/learner-retention-analytics.service";
import {
  aggregateWritingFeedbackByUser,
  createWritingFeedbackSubmission,
  groupWritingFeedbackByTaskType,
  listRecentWritingFeedbackSubmissionsByUser,
  type WritingFeedbackHistoryRecord,
} from "@/server/repositories/writing-feedback.repository";

const writingFeedbackOutputSchema = z.object({
  overallBand: z.string().min(1),
  taskBand: z.string().min(1),
  coherenceBand: z.string().min(1),
  lexicalBand: z.string().min(1),
  grammarBand: z.string().min(1),
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(2).max(6),
  improvements: z.array(z.string().min(1)).min(2).max(6),
  sampleRewrite: z.string().min(1),
});

type WritingProviderName = "mock" | "openai" | "gemini";

type WritingFeedbackResult = {
  overallBand: string;
  taskBand: string;
  coherenceBand: string;
  lexicalBand: string;
  grammarBand: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  sampleRewrite: string;
};

export type WritingFeedbackHistoryItem = {
  id: string;
  taskType: "task1" | "task2";
  prompt: string;
  wordCount: number;
  overallBand: string;
  taskBand: string;
  coherenceBand: string;
  lexicalBand: string;
  grammarBand: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  sampleRewrite: string;
  provider: WritingProviderName;
  modelName: string;
  fallbackReason: string | null;
  createdAt: string;
};

export type WritingFeedbackDashboardSummary = {
  totalSubmissions: number;
  latestBand: string | null;
  bestBand: string | null;
  averageBand: string | null;
  task1Count: number;
  task2Count: number;
  lastSubmittedAt: string | null;
};

function normalizeBand(value: string) {
  const numeric = Number.parseFloat(value.trim());

  if (!Number.isFinite(numeric)) {
    return "5.5";
  }

  return numeric.toFixed(1);
}

function parseBandNumber(value: string) {
  const numeric = Number.parseFloat(value.trim());
  return Number.isFinite(numeric) ? numeric : 5.5;
}

function formatBand(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value.toFixed(1);
}

function mapWritingTaskType(value: AiWritingFeedbackInput["taskType"]): WritingTaskType {
  return value;
}

function mapAiProvider(value: WritingProviderName): AiProvider {
  switch (value) {
    case "openai":
      return AiProvider.openai;
    case "gemini":
      return AiProvider.gemini;
    default:
      return AiProvider.mock;
  }
}

function mapAiProviderToName(value: AiProvider): WritingProviderName {
  switch (value) {
    case AiProvider.openai:
      return "openai";
    case AiProvider.gemini:
      return "gemini";
    default:
      return "mock";
  }
}

function extractJsonCandidate(content: string) {
  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }

  return content.trim();
}

function resolveProviderConfig() {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    return {
      provider: "openai" as const,
      modelName: env.OPENAI_MODEL,
    };
  }

  if (env.AI_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    return {
      provider: "gemini" as const,
      modelName: env.GEMINI_MODEL,
    };
  }

  return {
    provider: "mock" as const,
    modelName: "javiss-writing-demo",
  };
}

function getOpenAiClient(provider: WritingProviderName) {
  if (provider === "openai") {
    return new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  if (provider === "gemini") {
    return new OpenAI({
      apiKey: env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  return null;
}

function buildWritingInstructions(input: {
  values: AiWritingFeedbackInput;
  context: {
    examName?: string;
    targetScore?: string;
    estimatedLevel?: string;
    weakestSkills: string[];
    strongestSkills: string[];
  };
}) {
  return [
    "Bạn là giám khảo IELTS Writing và là trợ lý chữa bài thực tế, ngắn gọn, dễ hiểu.",
    "Hãy chấm sơ bộ bài viết theo tư duy IELTS Writing, tập trung vào những gì người học cần sửa ngay.",
    "Luôn trả về đúng định dạng JSON, không thêm markdown, không thêm lời giải thích ngoài JSON.",
    "Các trường summary, strengths, improvements và sampleRewrite bắt buộc phải viết bằng tiếng Việt tự nhiên.",
    "Nếu taskType là task1 thì taskBand hiểu là Task Achievement.",
    "Nếu taskType là task2 thì taskBand hiểu là Task Response.",
    "Bands dùng dạng 4.5, 5.0, 5.5, 6.0, 6.5, 7.0.",
    "sampleRewrite chỉ viết lại một đoạn ngắn tốt hơn, không viết lại toàn bộ bài.",
    "JSON phải có đúng shape sau:",
    '{"overallBand":"6.0","taskBand":"6.0","coherenceBand":"6.0","lexicalBand":"5.5","grammarBand":"5.5","summary":"...","strengths":["..."],"improvements":["..."],"sampleRewrite":"..."}',
    "",
    "Ngữ cảnh học viên:",
    `- Kỳ thi mục tiêu: ${input.context.examName ?? "IELTS Academic"}`,
    `- Điểm mục tiêu: ${input.context.targetScore ?? "Chưa đặt"}`,
    `- Trình độ hiện tại: ${input.context.estimatedLevel ?? "Chưa có"}`,
    `- Kỹ năng mạnh: ${input.context.strongestSkills.join(", ") || "Chưa có"}`,
    `- Kỹ năng yếu: ${input.context.weakestSkills.join(", ") || "Chưa có"}`,
    "",
    `Loại bài: ${input.values.taskType === "task1" ? "IELTS Writing Task 1" : "IELTS Writing Task 2"}`,
    `Đề bài: ${input.values.prompt}`,
  ].join("\n");
}

function parseWritingFeedback(content: string): WritingFeedbackResult {
  const candidate = extractJsonCandidate(content);
  const parsed = writingFeedbackOutputSchema.parse(JSON.parse(candidate));

  return {
    overallBand: normalizeBand(parsed.overallBand),
    taskBand: normalizeBand(parsed.taskBand),
    coherenceBand: normalizeBand(parsed.coherenceBand),
    lexicalBand: normalizeBand(parsed.lexicalBand),
    grammarBand: normalizeBand(parsed.grammarBand),
    summary: parsed.summary.trim(),
    strengths: parsed.strengths.map((item) => item.trim()),
    improvements: parsed.improvements.map((item) => item.trim()),
    sampleRewrite: parsed.sampleRewrite.trim(),
  };
}

function buildMockWritingFeedback(values: AiWritingFeedbackInput): WritingFeedbackResult {
  const wordCount = values.essay.split(/\s+/).filter(Boolean).length;
  const baseBand = wordCount >= 260 ? 6.0 : wordCount >= 180 ? 5.5 : 5.0;
  const overallBand = baseBand.toFixed(1);

  return {
    overallBand,
    taskBand: overallBand,
    coherenceBand: overallBand,
    lexicalBand: Math.max(4.5, baseBand - 0.5).toFixed(1),
    grammarBand: overallBand,
    summary:
      "Đây là nhận xét sơ bộ dựa trên độ dài, mức độ phát triển ý và độ rõ của lập luận trong bài viết hiện tại. Nếu bạn làm rõ luận điểm hơn và kiểm soát ngữ pháp tốt hơn, band sẽ ổn định hơn.",
    strengths: [
      "Bài viết đã bám đúng chủ đề và có hướng phát triển ý ban đầu.",
      "Bạn đã cố gắng đưa ra lập luận thay vì chỉ liệt kê ý ngắn.",
    ],
    improvements: [
      "Cần làm rõ cấu trúc từng đoạn để lập luận mạch lạc hơn.",
      "Nên dùng ví dụ cụ thể hoặc từ nối chính xác hơn để tăng sức thuyết phục.",
      "Cần rà lại ngữ pháp và biến thể câu để band ổn định hơn.",
    ],
    sampleRewrite:
      values.taskType === "task2"
        ? "Một lý do quan trọng là công nghệ giúp người học tiếp cận bài học linh hoạt hơn, nên họ có thể học theo nhịp phù hợp với lịch trình của mình."
        : "Nhìn chung, biểu đồ cho thấy xu hướng tăng rõ rệt ở giai đoạn cuối, trong khi các hạng mục còn lại thay đổi chậm và ổn định hơn.",
  };
}

function serializeWritingFeedbackSubmission(
  submission: WritingFeedbackHistoryRecord,
): WritingFeedbackHistoryItem {
  return {
    id: submission.id,
    taskType: submission.taskType,
    prompt: submission.prompt,
    wordCount: submission.wordCount,
    overallBand: submission.overallBand.toFixed(1),
    taskBand: submission.taskBand.toFixed(1),
    coherenceBand: submission.coherenceBand.toFixed(1),
    lexicalBand: submission.lexicalBand.toFixed(1),
    grammarBand: submission.grammarBand.toFixed(1),
    summary: submission.summary,
    strengths: submission.strengths,
    improvements: submission.improvements,
    sampleRewrite: submission.sampleRewrite,
    provider: mapAiProviderToName(submission.provider),
    modelName: submission.modelName,
    fallbackReason: submission.fallbackReason ?? null,
    createdAt: submission.createdAt.toISOString(),
  };
}

function buildWritingDashboardSummary(input: {
  history: WritingFeedbackHistoryItem[];
  totalSubmissions: number;
  averageBand: number | null | undefined;
  bestBand: number | null | undefined;
  task1Count: number;
  task2Count: number;
}): WritingFeedbackDashboardSummary {
  return {
    totalSubmissions: input.totalSubmissions,
    latestBand: input.history[0]?.overallBand ?? null,
    bestBand: formatBand(input.bestBand),
    averageBand: formatBand(input.averageBand),
    task1Count: input.task1Count,
    task2Count: input.task2Count,
    lastSubmittedAt: input.history[0]?.createdAt ?? null,
  };
}

async function resolveWritingResult(input: {
  userId: string;
  values: AiWritingFeedbackInput;
  context: {
    examName?: string;
    targetScore?: string;
    estimatedLevel?: string;
    weakestSkills: string[];
    strongestSkills: string[];
  };
}) {
  const providerConfig = resolveProviderConfig();

  if (providerConfig.provider === "gemini") {
    const quota = await consumeDailyProviderQuota({
      provider: "gemini-writing-feedback",
      userId: input.userId,
      limit: Math.max(20, Math.floor(env.GEMINI_DAILY_REQUEST_LIMIT / 2)),
    });

    if (!quota.allowed) {
      return {
        feedback: buildMockWritingFeedback(input.values),
        provider: "mock" as const,
        modelName: "javiss-writing-demo",
        fallbackReason: "daily_quota_reached" as const,
      };
    }
  }

  if (providerConfig.provider === "mock") {
    return {
      feedback: buildMockWritingFeedback(input.values),
      provider: "mock" as const,
      modelName: "javiss-writing-demo",
      fallbackReason: null,
    };
  }

  const client = getOpenAiClient(providerConfig.provider);

  if (!client) {
    return {
      feedback: buildMockWritingFeedback(input.values),
      provider: "mock" as const,
      modelName: "javiss-writing-demo",
      fallbackReason: "provider_request_failed" as const,
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: providerConfig.modelName,
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: buildWritingInstructions({
            values: input.values,
            context: input.context,
          }),
        },
        {
          role: "user",
          content: [
            `Task type: ${input.values.taskType}`,
            `Prompt: ${input.values.prompt}`,
            "Essay:",
            input.values.essay,
          ].join("\n"),
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("EMPTY_WRITING_FEEDBACK");
    }

    return {
      feedback: parseWritingFeedback(content),
      provider: providerConfig.provider,
      modelName: providerConfig.modelName,
      fallbackReason: null,
    };
  } catch (error) {
    logger.warn("writing_feedback_provider_failed", {
      provider: providerConfig.provider,
      error: error instanceof Error ? error.message : "unknown",
    });

    if (!env.AI_FALLBACK_TO_MOCK) {
      throw new AppError(
        "AI chữa writing đang tạm quá tải. Vui lòng thử lại sau ít phút.",
        503,
        "WRITING_FEEDBACK_UNAVAILABLE",
      );
    }

    return {
      feedback: buildMockWritingFeedback(input.values),
      provider: "mock" as const,
      modelName: "javiss-writing-demo",
      fallbackReason: "provider_request_failed" as const,
    };
  }
}

export async function getWritingFeedbackDashboardData(userId: string) {
  const [historyRecords, aggregate, taskBreakdown] = await Promise.all([
    listRecentWritingFeedbackSubmissionsByUser(userId, 8),
    aggregateWritingFeedbackByUser(userId),
    groupWritingFeedbackByTaskType(userId),
  ]);

  const history = historyRecords.map(serializeWritingFeedbackSubmission);
  const task1Count =
    taskBreakdown.find((item) => item.taskType === "task1")?._count._all ?? 0;
  const task2Count =
    taskBreakdown.find((item) => item.taskType === "task2")?._count._all ?? 0;

  return {
    history,
    summary: buildWritingDashboardSummary({
      history,
      totalSubmissions: aggregate._count._all,
      averageBand: aggregate._avg.overallBand,
      bestBand: aggregate._max.overallBand,
      task1Count,
      task2Count,
    }),
  };
}

export async function generateWritingFeedback(input: {
  userId: string;
  values: AiWritingFeedbackInput;
}) {
  await enforceRateLimit(
    `ai-writing:${input.userId}`,
    env.AI_MESSAGE_WINDOW_LIMIT,
    env.AI_MESSAGE_WINDOW_MINUTES * 60 * 1000,
  );

  const user = await findUserById(input.userId);

  if (!user) {
    throw new AppError("Không tìm thấy hồ sơ học viên.", 404, "USER_NOT_FOUND");
  }

  const prompt = input.values.prompt.trim();
  const essay = input.values.essay.trim();
  const wordCount = essay.split(/\s+/).filter(Boolean).length;
  const goal = user.goals[0];

  await createAnalyticsEvent({
    tenantId: user.tenantId,
    userId: user.id,
    eventType: AnalyticsEventType.writing_feedback_requested,
    entityType: "writing_feedback",
    metadata: {
      taskType: input.values.taskType,
      wordCount,
    },
  });

  const result = await resolveWritingResult({
    userId: input.userId,
    values: {
      ...input.values,
      prompt,
      essay,
    },
    context: {
      examName: goal?.exam.name,
      targetScore: goal?.targetScore ?? undefined,
      estimatedLevel: goal?.estimatedLevel ?? user.profile?.currentLevel ?? undefined,
      weakestSkills: user.profile?.weakestSkills ?? [],
      strongestSkills: user.profile?.strongestSkills ?? [],
    },
  });

  const submission = await createWritingFeedbackSubmission({
    tenantId: user.tenantId,
    userId: user.id,
    taskType: mapWritingTaskType(input.values.taskType),
    prompt,
    essay,
    wordCount,
    overallBand: parseBandNumber(result.feedback.overallBand),
    taskBand: parseBandNumber(result.feedback.taskBand),
    coherenceBand: parseBandNumber(result.feedback.coherenceBand),
    lexicalBand: parseBandNumber(result.feedback.lexicalBand),
    grammarBand: parseBandNumber(result.feedback.grammarBand),
    summary: result.feedback.summary,
    strengths: result.feedback.strengths,
    improvements: result.feedback.improvements,
    sampleRewrite: result.feedback.sampleRewrite,
    provider: mapAiProvider(result.provider),
    modelName: result.modelName,
    fallbackReason: result.fallbackReason,
  });

  await trackWritingFeedbackFirstCompletion({
    tenantId: user.tenantId,
    userId: user.id,
    submissionId: submission.id,
    taskType: input.values.taskType,
  });

  await Promise.all([
    createAnalyticsEvent({
      tenantId: user.tenantId,
      userId: user.id,
      eventType: AnalyticsEventType.writing_feedback_completed,
      entityType: "writing_feedback_submission",
      entityId: submission.id,
      metadata: {
        taskType: input.values.taskType,
        provider: result.provider,
        modelName: result.modelName,
        overallBand: submission.overallBand,
        wordCount,
      },
    }),
    result.fallbackReason
      ? createAnalyticsEvent({
          tenantId: user.tenantId,
          userId: user.id,
          eventType: AnalyticsEventType.writing_feedback_fallback_used,
          entityType: "writing_feedback_submission",
          entityId: submission.id,
          metadata: {
            provider: result.provider,
            modelName: result.modelName,
            fallbackReason: result.fallbackReason,
          },
        })
      : Promise.resolve(null),
  ]);

  const dashboardData = await getWritingFeedbackDashboardData(input.userId);

  return {
    feedback: result.feedback,
    provider: result.provider,
    modelName: result.modelName,
    fallbackReason: result.fallbackReason,
    submission: serializeWritingFeedbackSubmission(submission),
    summary: dashboardData.summary,
  };
}
