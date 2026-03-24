import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import type {
  AiCoachContext,
  AiCoachProvider,
  AiCoachReplyInput,
  AiCoachReplyOutput,
  AiSpeakingAssessment,
} from "@/lib/ai/types";

const speakingAssessmentSchema = z.object({
  estimatedBand: z.string().min(1),
  fluencyBand: z.string().min(1),
  lexicalBand: z.string().min(1),
  grammarBand: z.string().min(1),
  pronunciationBand: z.string().min(1),
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1).max(3),
  improvements: z.array(z.string().min(1)).min(1).max(3),
});

function joinOrDefault(values: string[], fallback: string) {
  return values.length > 0 ? values.join(", ") : fallback;
}

function buildCoachInstructions(context: AiCoachContext) {
  return [
    "Bạn là Javiss AI Coach, một trợ lý luyện thi ngôn ngữ 1:1 cho học viên.",
    "Luôn trả lời bằng tiếng Việt tự nhiên, rõ ràng, thực tế, không lan man.",
    "Ưu tiên các bước hành động cụ thể, ngắn gọn, dễ làm ngay.",
    "Không bịa dữ liệu học tập ngoài ngữ cảnh đã có.",
    "Nếu học viên hỏi về chiến lược học, hãy cá nhân hóa theo hồ sơ.",
    "",
    "Hồ sơ học viên:",
    `- Họ tên: ${context.fullName}`,
    `- Email: ${context.email}`,
    `- Locale: ${context.preferredLocale}`,
    `- Kỳ thi mục tiêu: ${context.examName ?? "Chưa đặt"}`,
    `- Điểm mục tiêu: ${context.targetScore ?? "Chưa đặt"}`,
    `- Trình độ ước lượng: ${context.estimatedLevel ?? "Chưa có"}`,
    `- Ngôn ngữ muốn học: ${context.preferredLanguage ?? "Chưa có"}`,
    `- Kỹ năng mạnh: ${joinOrDefault(context.strongestSkills, "Chưa có")}`,
    `- Kỹ năng yếu: ${joinOrDefault(context.weakestSkills, "Chưa có")}`,
    `- Khung giờ học mong muốn: ${context.preferredStudyWindow ?? "Chưa có"}`,
    `- Lịch học mong muốn: ${context.preferredSchedule ?? "Chưa có"}`,
    `- Bước tiếp theo hệ thống gợi ý: ${context.nextAction ?? "Chưa có"}`,
    `- Tiến độ tổng quan: ${context.latestProgress?.overall ?? 0}%`,
    `- Speaking: ${context.latestProgress?.speaking ?? 0}%`,
    `- Writing: ${context.latestProgress?.writing ?? 0}%`,
    `- Reading: ${context.latestProgress?.reading ?? 0}%`,
    `- Listening: ${context.latestProgress?.listening ?? 0}%`,
  ].join("\n");
}

function buildSpeakingInstructions(context: AiCoachContext, scenario?: string | null) {
  return [
    "You are a strict but natural IELTS Speaking examiner running a one-to-one mock test.",
    "Stay in examiner role during the interview.",
    "Speak in English during the interview unless the learner explicitly asks for feedback.",
    "Ask exactly one question at a time.",
    "Each examiner turn should be short, natural, and similar to a real IELTS examiner.",
    "Do not answer for the candidate.",
    "Do not explain the test format unless the learner asks.",
    "If the candidate answer is too short, ask one concise follow-up question.",
    "If the candidate asks for feedback, switch briefly to Vietnamese and give exactly 3 sections: điểm tốt, điểm cần sửa, việc nên làm ở lượt tiếp theo.",
    "Part 1 should focus on short personal questions.",
    "Part 2 should keep the candidate talking longer about the cue card topic.",
    "Part 3 should move to broader, abstract, or social questions.",
    "Avoid giving multiple questions in one turn.",
    "",
    `Scenario: ${scenario ?? "IELTS Speaking mock interview"}`,
    `Candidate name: ${context.fullName}`,
    `Target exam: ${context.examName ?? "IELTS Academic"}`,
    `Target score: ${context.targetScore ?? "Chưa đặt"}`,
    `Estimated level: ${context.estimatedLevel ?? "Chưa có"}`,
    `Weak skills: ${joinOrDefault(context.weakestSkills, "Unknown")}`,
    `Strong skills: ${joinOrDefault(context.strongestSkills, "Unknown")}`,
  ].join("\n");
}

function buildSpeakingAssessmentInstructions(context: AiCoachContext, scenario?: string | null) {
  return [
    "You are an IELTS Speaking band estimator.",
    "Your job is to give a preliminary speaking band estimate based on the conversation so far.",
    "Be realistic, moderately strict, and avoid inflated scores.",
    "Use IELTS style criteria: fluency/coherence, lexical resource, grammatical range/accuracy, pronunciation.",
    "Return ONLY valid JSON with this exact shape:",
    '{"estimatedBand":"5.5","fluencyBand":"5.5","lexicalBand":"5.0","grammarBand":"5.5","pronunciationBand":"6.0","summary":"...","strengths":["..."],"improvements":["..."]}',
    "The summary, strengths, and improvements must be in natural Vietnamese.",
    "Each strengths/improvements array must contain 2 to 3 short items.",
    "Bands should be strings like 4.5, 5.0, 5.5, 6.0, 6.5, 7.0.",
    "",
    `Scenario: ${scenario ?? "IELTS Speaking mock interview"}`,
    `Target score: ${context.targetScore ?? "Chưa đặt"}`,
    `Estimated level before practice: ${context.estimatedLevel ?? "Chưa có"}`,
  ].join("\n");
}

function normalizeBand(value: string) {
  const trimmed = value.trim();
  const numeric = Number.parseFloat(trimmed);

  if (!Number.isFinite(numeric)) {
    return "5.0";
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

function parseSpeakingAssessment(content: string): AiSpeakingAssessment {
  const candidate = extractJsonCandidate(content);
  const parsed = speakingAssessmentSchema.parse(JSON.parse(candidate));

  return {
    estimatedBand: normalizeBand(parsed.estimatedBand),
    fluencyBand: normalizeBand(parsed.fluencyBand),
    lexicalBand: normalizeBand(parsed.lexicalBand),
    grammarBand: normalizeBand(parsed.grammarBand),
    pronunciationBand: normalizeBand(parsed.pronunciationBand),
    summary: parsed.summary.trim(),
    strengths: parsed.strengths.map((item) => item.trim()),
    improvements: parsed.improvements.map((item) => item.trim()),
  };
}

function getSpeakingUserAnswers(input: AiCoachReplyInput) {
  return input.history
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
}

function buildMockCoachReply(input: AiCoachReplyInput): string {
  const message = input.message.toLowerCase();
  const weakSkill = input.context.weakestSkills[0];
  const strongSkill = input.context.strongestSkills[0];
  const exam = input.context.examName ?? "kỳ thi hiện tại";
  const targetScore = input.context.targetScore ?? "mục tiêu hiện tại";

  if (message.includes("speaking")) {
    return [
      `Mình thấy bạn đang hướng tới ${exam} với mục tiêu ${targetScore}. Nếu muốn cải thiện Speaking nhanh, hãy ưu tiên 3 việc trong 7 ngày tới.`,
      "1. Mỗi ngày nói 10 đến 15 phút về một chủ đề quen thuộc rồi tự nghe lại.",
      "2. Ghi sẵn 5 cấu trúc câu mở rộng ý để tránh trả lời quá ngắn.",
      "3. Sau mỗi lần luyện, tự chấm theo tiêu chí độ trôi chảy, từ vựng và phát âm.",
      weakSkill
        ? `Vì kỹ năng yếu hiện tại của bạn là ${weakSkill}, mình khuyên bạn dồn thêm thời lượng cho phần này trước.`
        : "Bạn nên bắt đầu từ các chủ đề quen thuộc để tạo sự tự tin trước.",
    ].join("\n\n");
  }

  if (message.includes("writing")) {
    return [
      `Với mục tiêu ${targetScore}, phần Writing cần một quy trình rất đều.`,
      "Bạn nên viết theo vòng lặp: lập dàn ý 5 phút, viết 20 đến 25 phút, tự sửa 10 phút.",
      "Nếu đang bí ý, hãy tập trung vào bố cục và độ rõ ràng trước, chưa cần dùng từ quá khó.",
      strongSkill
        ? `Bạn đang có điểm mạnh ở ${strongSkill}, hãy tận dụng điều đó để giữ chất lượng lập luận hoặc vốn từ.`
        : "Mỗi bài nên có một checklist tự soát lỗi trước khi nộp.",
    ].join("\n\n");
  }

  if (message.includes("reading") || message.includes("đọc")) {
    return [
      `Để tăng Reading cho ${exam}, bạn nên tách buổi học thành 2 phần: kỹ thuật làm bài và kiểm lỗi.`,
      "Phần 1: luyện skim, scan và xác định từ khóa trong 20 phút.",
      "Phần 2: xem lại từng câu sai và ghi rõ vì sao sai, không chỉ xem đáp án.",
      "Nếu bạn muốn, mình có thể lập luôn một mini-plan 7 ngày riêng cho Reading.",
    ].join("\n\n");
  }

  if (message.includes("listening") || message.includes("nghe")) {
    return [
      "Listening tăng nhanh nhất khi bạn luyện đúng loại lỗi.",
      "Hãy tách lỗi thành 3 nhóm: không nghe ra âm, nghe ra nhưng không bắt được ý, và mất tập trung khi chuyển câu.",
      "Mỗi ngày chọn một đoạn ngắn, nghe 2 lượt, chép chính tả phần khó rồi nghe lại.",
      "Nếu bạn muốn, mình có thể gợi ý ngay một quy trình luyện nghe 30 phút mỗi ngày.",
    ].join("\n\n");
  }

  if (message.includes("kế hoạch") || message.includes("plan") || message.includes("lộ trình")) {
    return [
      `Mình đề xuất bạn giữ lộ trình gọn, đều và bám mục tiêu ${targetScore}.`,
      `Khung học phù hợp hiện tại: ${input.context.preferredStudyWindow ?? "chưa thiết lập rõ"}.`,
      `Bước tiếp theo nên làm ngay: ${input.context.nextAction ?? "mở một bài luyện đầu tiên và hoàn thiện hồ sơ học tập"}.`,
      "Nếu muốn, mình có thể chia tiếp thành lịch 7 ngày hoặc 14 ngày cho bạn.",
    ].join("\n\n");
  }

  return [
    `Mình đã đọc câu hỏi của bạn và sẽ bám theo hồ sơ hiện tại cho ${exam}.`,
    weakSkill
      ? `Hiện bạn nên ưu tiên cải thiện ${weakSkill} trước để kéo tiến độ tổng thể lên nhanh hơn.`
      : "Hiện bạn nên bắt đầu bằng một kỹ năng chính để tập trung hơn.",
    `Bước gần nhất mình khuyên làm là: ${input.context.nextAction ?? "chọn một bài luyện ngắn và làm xong trong hôm nay"}.`,
    "Nếu bạn muốn, hãy nói rõ bạn cần mình hỗ trợ theo kiểu nào: lên kế hoạch, chữa bài, luyện nói, luyện viết hay giải thích chiến lược làm bài.",
  ].join("\n\n");
}

function buildMockSpeakingReply(input: AiCoachReplyInput): string {
  const message = input.message.trim().toLowerCase();
  const scenario = input.scenario ?? "IELTS Speaking mock";

  if (message.includes("feedback") || message.includes("nhận xét") || message.includes("đánh giá")) {
    return [
      "Nhận xét nhanh:",
      "- Bạn đã có ý chính rõ ràng và trả lời đúng hướng câu hỏi.",
      "- Hãy kéo dài câu trả lời thêm bằng lý do hoặc ví dụ cụ thể để tự nhiên hơn.",
      "- Ở lượt tiếp theo, hãy dùng một câu nối như “The main reason is...” hoặc “For example...”.",
      "",
      "One more question: what would you improve first in your speaking today?",
    ].join("\n");
  }

  if (scenario.includes("Part 1")) {
    return "Why is that important to you personally?";
  }

  if (scenario.includes("Part 2")) {
    return "Could you continue and explain why this experience stayed in your memory?";
  }

  return "Why do you think people have different opinions about this issue?";
}

function buildMockSpeakingAssessment(input: AiCoachReplyInput): AiSpeakingAssessment {
  const answers = getSpeakingUserAnswers(input);
  const combined = answers.join(" ");
  const wordCount = combined.split(/\s+/).filter(Boolean).length;
  const longAnswerBonus = wordCount >= 60 ? 0.5 : wordCount >= 30 ? 0 : -0.5;
  const bandBase = Math.max(4.5, Math.min(6.5, 5.5 + longAnswerBonus));
  const normalized = bandBase.toFixed(1);

  return {
    estimatedBand: normalized,
    fluencyBand: normalized,
    lexicalBand: Math.max(4.5, bandBase - 0.5).toFixed(1),
    grammarBand: normalized,
    pronunciationBand: Math.min(6.5, bandBase + 0.5).toFixed(1),
    summary:
      "Đây là band speaking sơ bộ dựa trên độ dài và mức độ phát triển ý trong phần trả lời hiện tại. Khi có thêm nhiều lượt nói hơn, kết quả sẽ ổn định hơn.",
    strengths: [
      "Bạn đã bám đúng câu hỏi và có ý chính rõ.",
      "Câu trả lời có thể hiểu được và đủ nền để phát triển tiếp.",
    ],
    improvements: [
      "Mở rộng câu trả lời bằng lý do hoặc ví dụ cụ thể.",
      "Dùng thêm câu nối để phần nói mượt hơn.",
      "Giữ nhịp nói đều và tránh trả lời quá ngắn.",
    ],
  };
}

abstract class BaseOpenAiCompatibleProvider implements AiCoachProvider {
  protected client: OpenAI;
  protected replyModel: string;
  protected assessmentModel: string;
  protected providerName: "openai" | "gemini";

  constructor(input: {
    client: OpenAI;
    replyModel: string;
    assessmentModel?: string;
    providerName: "openai" | "gemini";
  }) {
    this.client = input.client;
    this.replyModel = input.replyModel;
    this.assessmentModel = input.assessmentModel ?? input.replyModel;
    this.providerName = input.providerName;
  }

  async generateReply(input: AiCoachReplyInput): Promise<AiCoachReplyOutput> {
    const response = await this.client.chat.completions.create({
      model: this.replyModel,
      messages: [
        {
          role: "system",
          content:
            input.mode === "speaking_mock"
              ? buildSpeakingInstructions(input.context, input.scenario)
              : buildCoachInstructions(input.context),
        },
        ...input.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();

    return {
      text:
        text && text.length > 0
          ? text
          : "Mình chưa tạo được phản hồi phù hợp ở lượt này. Bạn hãy thử lại sau ít phút.",
      provider: this.providerName,
      modelName: this.replyModel,
      providerResponseId: response.id ?? null,
      fallbackReason: null,
    };
  }

  async generateSpeakingAssessment(input: AiCoachReplyInput): Promise<AiSpeakingAssessment> {
    const answers = getSpeakingUserAnswers(input);

    const response = await this.client.chat.completions.create({
      model: this.assessmentModel,
      messages: [
        {
          role: "system",
          content: buildSpeakingAssessmentInstructions(input.context, input.scenario),
        },
        {
          role: "user",
          content: [
            "Examiner and candidate speaking transcript so far:",
            input.history
              .map((message) => `${message.role === "user" ? "Candidate" : "Examiner"}: ${message.content}`)
              .join("\n"),
            "",
            "Candidate answers only:",
            answers.join("\n"),
          ].join("\n"),
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("EMPTY_SPEAKING_ASSESSMENT");
    }

    return parseSpeakingAssessment(text);
  }
}

class MockAiCoachProvider implements AiCoachProvider {
  async generateReply(input: AiCoachReplyInput): Promise<AiCoachReplyOutput> {
    return {
      text:
        input.mode === "speaking_mock"
          ? buildMockSpeakingReply(input)
          : buildMockCoachReply(input),
      provider: "mock",
      modelName: "javiss-coach-demo",
      providerResponseId: null,
      fallbackReason: null,
    };
  }

  async generateSpeakingAssessment(input: AiCoachReplyInput): Promise<AiSpeakingAssessment> {
    return buildMockSpeakingAssessment(input);
  }
}

class OpenAiCoachProvider extends BaseOpenAiCompatibleProvider {
  constructor() {
    super({
      client: new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      }),
      replyModel: env.OPENAI_MODEL,
      providerName: "openai",
    });
  }
}

class GeminiAiCoachProvider extends BaseOpenAiCompatibleProvider {
  constructor() {
    super({
      client: new OpenAI({
        apiKey: env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      }),
      replyModel: env.GEMINI_MODEL,
      providerName: "gemini",
    });
  }
}

export function getAiCoachProvider(): AiCoachProvider {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    return new OpenAiCoachProvider();
  }

  if (env.AI_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    return new GeminiAiCoachProvider();
  }

  if (env.AI_PROVIDER === "openai" && !env.OPENAI_API_KEY) {
    logger.warn("openai_provider_missing_api_key", {
      provider: env.AI_PROVIDER,
    });
  }

  if (env.AI_PROVIDER === "gemini" && !env.GEMINI_API_KEY) {
    logger.warn("gemini_provider_missing_api_key", {
      provider: env.AI_PROVIDER,
    });
  }

  return new MockAiCoachProvider();
}

export function getMockAiCoachProvider(): AiCoachProvider {
  return new MockAiCoachProvider();
}
