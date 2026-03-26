import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/config/env";
import type { AiWritingFeedbackInput } from "@/features/ai/schemas";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { consumeDailyProviderQuota } from "@/lib/rate-limit/provider-quota";
import { AppError } from "@/lib/utils/app-error";
import { findUserById } from "@/server/repositories/user.repository";

const writingFeedbackOutputSchema = z.object({
  overallBand: z.string().min(1),
  taskBand: z.string().min(1),
  coherenceBand: z.string().min(1),
  lexicalBand: z.string().min(1),
  grammarBand: z.string().min(1),
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(2).max(4),
  improvements: z.array(z.string().min(1)).min(2).max(4),
  sampleRewrite: z.string().min(1),
});

type WritingProviderName = "mock" | "openai" | "gemini";

function normalizeBand(value: string) {
  const numeric = Number.parseFloat(value.trim());

  if (!Number.isFinite(numeric)) {
    return "5.5";
  }

  return numeric.toFixed(1);
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
    "Bạn là giám khảo IELTS Writing và là trợ lý chữa bài viết ngắn gọn, thực tế.",
    "Hãy chấm sơ bộ bài viết theo tư duy IELTS Writing.",
    "Luôn trả về đúng định dạng JSON, không thêm markdown, không thêm giải thích ngoài JSON.",
    "Giữ giọng điệu đánh giá nghiêm túc nhưng dễ hiểu với người học.",
    "Các trường summary, strengths, improvements, sampleRewrite phải viết bằng tiếng Việt tự nhiên.",
    "sampleRewrite chỉ cần viết lại một đoạn ngắn tốt hơn, không viết lại toàn bài.",
    "Bands dùng các mức như 4.5, 5.0, 5.5, 6.0, 6.5, 7.0.",
    "Nếu taskType là task1 thì taskBand hiểu là Task Achievement.",
    "Nếu taskType là task2 thì taskBand hiểu là Task Response.",
    "JSON bắt buộc có đúng shape sau:",
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

function parseWritingFeedback(content: string) {
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

function buildMockWritingFeedback(values: AiWritingFeedbackInput) {
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
      "Đây là nhận xét sơ bộ dựa trên độ dài và mức độ phát triển ý của bài viết hiện tại. Khi bài có luận điểm rõ hơn và câu văn chính xác hơn, band sẽ ổn định hơn.",
    strengths: [
      "Bài viết đã bám vào đề và có ý chính ban đầu.",
      "Người học đã cố gắng phát triển ý thay vì chỉ liệt kê ngắn.",
    ],
    improvements: [
      "Cần làm rõ cấu trúc từng đoạn để lập luận mạch lạc hơn.",
      "Nên dùng từ nối và ví dụ cụ thể để bài thuyết phục hơn.",
      "Cần rà lại ngữ pháp và biến thể câu để band ổn định hơn.",
    ],
    sampleRewrite:
      values.taskType === "task2"
        ? "One important reason is that technology helps learners access lessons more flexibly, so they can study at a pace that suits their own schedule."
        : "Overall, the chart shows a clear upward trend in the final period, while the remaining categories changed more gradually.",
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

  const goal = user.goals[0];
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
      messages: [
        {
          role: "system",
          content: buildWritingInstructions({
            values: input.values,
            context: {
              examName: goal?.exam.name,
              targetScore: goal?.targetScore ?? undefined,
              estimatedLevel: goal?.estimatedLevel ?? user.profile?.currentLevel ?? undefined,
              weakestSkills: user.profile?.weakestSkills ?? [],
              strongestSkills: user.profile?.strongestSkills ?? [],
            },
          }),
        },
        {
          role: "user",
          content: input.values.essay,
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
