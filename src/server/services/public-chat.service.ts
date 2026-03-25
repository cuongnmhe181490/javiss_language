import OpenAI from "openai";
import { env } from "@/config/env";
import type { PublicChatMessageInput } from "@/features/public-chat/schemas";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { consumeDailyProviderQuota } from "@/lib/rate-limit/provider-quota";
import { AppError } from "@/lib/utils/app-error";

type PublicChatProviderName = "mock" | "openai" | "gemini";
type PublicChatAction = {
  label: string;
  href: string;
};

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
    modelName: "javiss-public-demo",
  };
}

function getOpenAiClient(provider: PublicChatProviderName) {
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

function buildPublicChatPrompt() {
  return [
    "Bạn là chatbot tư vấn công khai của Javiss Language.",
    "Luôn trả lời bằng tiếng Việt tự nhiên, ngắn gọn, thân thiện và rõ ràng.",
    "Mục tiêu chính là giúp người dùng hiểu sản phẩm và đi tới hành động tiếp theo phù hợp.",
    "Bạn chỉ tư vấn các chủ đề này:",
    "- Javiss Language là gì",
    "- Quy trình đăng ký có kiểm duyệt",
    "- Trạng thái chờ duyệt, đã gửi mã xác thực, bị từ chối, đã kích hoạt",
    "- Cách xác thực email",
    "- Các tính năng như dashboard học tập, AI speaking, writing feedback, AI Coach",
    "- Các kỳ thi/ngôn ngữ đang hỗ trợ",
    "- Cách đăng nhập, quên mật khẩu, gửi lại mã",
    "",
    "Thông tin sản phẩm hiện tại:",
    "- Nền tảng ưu tiên IELTS tiếng Anh ở giai đoạn này.",
    "- Kiến trúc đã sẵn sàng mở rộng sang HSK, JLPT, TOPIK.",
    "- Người dùng đăng ký xong chưa dùng ngay; phải chờ đội ngũ phê duyệt.",
    "- Khi được duyệt, hệ thống gửi mã xác thực về email để kích hoạt tài khoản.",
    "- Sau khi kích hoạt, người học có thể vào dashboard, dùng AI Coach và speaking mock.",
    "",
    "Nguyên tắc trả lời:",
    "- Nếu người dùng hỏi cách bắt đầu: khuyên vào trang đăng ký.",
    "- Nếu người dùng hỏi chưa đăng nhập được: giải thích 4 trạng thái có thể xảy ra và hướng xử lý.",
    "- Nếu người dùng hỏi học được gì: nhấn mạnh dashboard, speaking AI, lộ trình cá nhân.",
    "- Nếu người dùng hỏi ngoài phạm vi sản phẩm, hãy nói ngắn gọn rằng chatbot này chủ yếu hỗ trợ thông tin về nền tảng.",
    "- Không bịa giá, không bịa tính năng chưa có, không hứa điều chưa triển khai.",
    "- Khi phù hợp, kết thúc bằng một gợi ý hành động ngắn như 'Bạn có thể bấm Đăng ký ngay' hoặc 'Bạn có thể vào trang Xác thực'.",
  ].join("\n");
}

function buildMockReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("đăng ký") || normalized.includes("dang ky")) {
    return "Để bắt đầu, bạn vào trang Đăng ký, điền mục tiêu học và gửi hồ sơ. Sau đó đội ngũ sẽ xem xét trước khi mở quyền truy cập cho bạn.";
  }

  if (normalized.includes("xác thực") || normalized.includes("mã") || normalized.includes("verify")) {
    return "Sau khi hồ sơ được duyệt, hệ thống sẽ gửi mã xác thực về email của bạn. Bạn chỉ cần vào trang Xác thực, nhập email và mã để kích hoạt tài khoản.";
  }

  if (normalized.includes("chờ duyệt") || normalized.includes("pending")) {
    return "Trạng thái chờ duyệt nghĩa là hồ sơ của bạn đã được ghi nhận nhưng chưa được đội ngũ phê duyệt. Trong giai đoạn này bạn chưa đăng nhập vào khu học tập được.";
  }

  if (normalized.includes("bị từ chối") || normalized.includes("rejected")) {
    return "Nếu hồ sơ chưa được phê duyệt, bạn sẽ thấy trạng thái bị từ chối. Khi đó bạn có thể liên hệ lại đội ngũ hỗ trợ hoặc gửi lại hồ sơ mới khi phù hợp.";
  }

  if (normalized.includes("học được gì") || normalized.includes("tính năng") || normalized.includes("feature")) {
    return "Sau khi kích hoạt, bạn có thể dùng dashboard học tập, AI Coach 1:1, speaking mock và theo dõi tiến độ theo mục tiêu thi của mình.";
  }

  return "Javiss Language là nền tảng luyện thi ngôn ngữ bằng AI có kiểm duyệt tài khoản. Nếu bạn muốn bắt đầu, cách nhanh nhất là vào trang Đăng ký để gửi hồ sơ học tập.";
}

function buildSuggestedActions(message: string): PublicChatAction[] {
  const normalized = message.toLowerCase();

  if (normalized.includes("đăng ký") || normalized.includes("dang ky")) {
    return [
      { label: "Mở trang Đăng ký", href: "/register" },
      { label: "Xem trạng thái chờ duyệt", href: "/pending-approval" },
    ];
  }

  if (
    normalized.includes("xác thực") ||
    normalized.includes("mã") ||
    normalized.includes("verify")
  ) {
    return [
      { label: "Đến trang Xác thực", href: "/verify" },
      { label: "Đăng nhập lại", href: "/login" },
    ];
  }

  if (normalized.includes("chờ duyệt") || normalized.includes("pending")) {
    return [
      { label: "Xem trang Chờ duyệt", href: "/pending-approval" },
      { label: "Đi tới Xác thực", href: "/verify" },
    ];
  }

  if (normalized.includes("từ chối") || normalized.includes("rejected")) {
    return [
      { label: "Xem trạng thái bị từ chối", href: "/rejected" },
      { label: "Gửi lại đăng ký", href: "/register" },
    ];
  }

  if (
    normalized.includes("quên mật khẩu") ||
    normalized.includes("đặt lại mật khẩu") ||
    normalized.includes("reset")
  ) {
    return [
      { label: "Quên mật khẩu", href: "/forgot-password" },
      { label: "Đăng nhập", href: "/login" },
    ];
  }

  return [
    { label: "Đăng ký ngay", href: "/register" },
    { label: "Đăng nhập", href: "/login" },
  ];
}

export async function sendPublicChatMessage(input: {
  values: PublicChatMessageInput;
  ipAddress?: string | null;
}) {
  const fingerprint = input.ipAddress?.trim() || "anonymous";

  await enforceRateLimit(`public-chat:${fingerprint}`, 12, 10 * 60 * 1000);

  const providerConfig = resolveProviderConfig();

  if (providerConfig.provider === "gemini") {
    const quota = await consumeDailyProviderQuota({
      provider: "gemini-public-chat",
      userId: fingerprint,
      limit: Math.max(20, Math.floor(env.GEMINI_DAILY_REQUEST_LIMIT / 2)),
    });

    if (!quota.allowed) {
      return {
        reply: buildMockReply(input.values.message),
        provider: "mock" as const,
        modelName: "javiss-public-demo",
        fallbackReason: "daily_quota_reached" as const,
        actions: buildSuggestedActions(input.values.message),
      };
    }
  }

  if (providerConfig.provider === "mock") {
    return {
      reply: buildMockReply(input.values.message),
      provider: "mock" as const,
      modelName: "javiss-public-demo",
      fallbackReason: null,
      actions: buildSuggestedActions(input.values.message),
    };
  }

  const client = getOpenAiClient(providerConfig.provider);

  if (!client) {
    return {
      reply: buildMockReply(input.values.message),
      provider: "mock" as const,
      modelName: "javiss-public-demo",
      fallbackReason: "provider_request_failed" as const,
      actions: buildSuggestedActions(input.values.message),
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: providerConfig.modelName,
      messages: [
        {
          role: "system",
          content: buildPublicChatPrompt(),
        },
        {
          role: "user",
          content: input.values.message,
        },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("EMPTY_PUBLIC_CHAT_REPLY");
    }

    return {
      reply,
      provider: providerConfig.provider,
      modelName: providerConfig.modelName,
      fallbackReason: null,
      actions: buildSuggestedActions(input.values.message),
    };
  } catch (error) {
    logger.warn("public_chat_provider_failed", {
      provider: providerConfig.provider,
      error: error instanceof Error ? error.message : "unknown",
    });

    if (!env.AI_FALLBACK_TO_MOCK) {
      throw new AppError(
        "Chatbot đang tạm thời quá tải. Vui lòng thử lại sau ít phút.",
        503,
        "PUBLIC_CHAT_UNAVAILABLE",
      );
    }

    return {
      reply: buildMockReply(input.values.message),
      provider: "mock" as const,
      modelName: "javiss-public-demo",
      fallbackReason: "provider_request_failed" as const,
      actions: buildSuggestedActions(input.values.message),
    };
  }
}
