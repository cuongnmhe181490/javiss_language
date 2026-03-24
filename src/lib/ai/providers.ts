import OpenAI from "openai";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import type {
  AiCoachContext,
  AiCoachProvider,
  AiCoachReplyInput,
  AiCoachReplyOutput,
} from "@/lib/ai/types";

function joinOrDefault(values: string[], fallback: string) {
  return values.length > 0 ? values.join(", ") : fallback;
}

function buildCoachInstructions(context: AiCoachContext) {
  return [
    "Bạn là Javiss AI Coach, một trợ lý luyện thi ngôn ngữ 1:1 cho học viên.",
    "Luôn trả lời bằng tiếng Việt tự nhiên, rõ ràng, mang tính coaching thực tế.",
    "Ưu tiên các bước hành động cụ thể, ngắn gọn, dễ làm ngay.",
    "Không bịa kết quả học tập hay dữ liệu không có trong ngữ cảnh.",
    "Nếu học viên hỏi về chiến lược học, hãy cá nhân hóa theo hồ sơ bên dưới.",
    "Nếu học viên yêu cầu phản hồi bằng tiếng Anh hoặc ngôn ngữ khác, bạn có thể đáp ứng.",
    "",
    "Hồ sơ học viên hiện tại:",
    `- Họ tên: ${context.fullName}`,
    `- Email: ${context.email}`,
    `- Locale giao diện: ${context.preferredLocale}`,
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
    "You are an IELTS Speaking examiner for a 1:1 mock speaking session.",
    "Speak in English during the interview.",
    "Ask only one question at a time, and keep each examiner turn concise and natural.",
    "Do not provide long explanations during the interview.",
    "If the learner explicitly asks for feedback, then give short feedback in Vietnamese with actionable advice.",
    "If the learner answer is too short, ask one short follow-up question.",
    "Stay in examiner role unless the learner requests feedback or strategy.",
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
  const transcript = input.message.trim();
  const message = transcript.toLowerCase();
  const scenario = input.scenario ?? "IELTS Speaking mock";

  if (
    message.includes("feedback") ||
    message.includes("nhận xét") ||
    message.includes("đánh giá")
  ) {
    return [
      "Nhận xét nhanh:",
      "- Câu trả lời của bạn đã có ý chính, nhưng vẫn có thể kéo dài thêm bằng ví dụ cụ thể.",
      "- Hãy nói chậm hơn một chút ở phần mở đầu để phát âm rõ hơn.",
      "- Ở lượt tiếp theo, cố gắng dùng một câu nối như “The main reason is…” hoặc “What I mean is…”.",
      "",
      "Let me ask you one more question: What would you improve first in your speaking performance?",
    ].join("\n");
  }

  if (scenario.includes("Part 1")) {
    return "Why do you think this is important in your daily life?";
  }

  if (scenario.includes("Part 2")) {
    return "Thank you. Could you continue and explain why this experience was memorable for you?";
  }

  return "What changes do you think society will see in the future regarding this topic?";
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
    };
  }
}

class OpenAiCoachProvider implements AiCoachProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async generateReply(input: AiCoachReplyInput): Promise<AiCoachReplyOutput> {
    const response = await this.client.responses.create({
      model: env.OPENAI_MODEL,
      instructions:
        input.mode === "speaking_mock"
          ? buildSpeakingInstructions(input.context, input.scenario)
          : buildCoachInstructions(input.context),
      previous_response_id: input.previousResponseId ?? undefined,
      input: [
        {
          role: "user",
          content: input.message,
        },
      ],
      store: true,
    });

    const text = response.output_text?.trim();

    return {
      text:
        text && text.length > 0
          ? text
          : "Mình chưa tạo được phản hồi phù hợp ở lượt này. Bạn hãy thử hỏi lại cụ thể hơn.",
      provider: "openai",
      modelName: env.OPENAI_MODEL,
      providerResponseId: response.id,
    };
  }
}

class GeminiAiCoachProvider implements AiCoachProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  async generateReply(input: AiCoachReplyInput): Promise<AiCoachReplyOutput> {
    const response = await this.client.chat.completions.create({
      model: env.GEMINI_MODEL,
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
      provider: "gemini",
      modelName: env.GEMINI_MODEL,
      providerResponseId: response.id ?? null,
    };
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
