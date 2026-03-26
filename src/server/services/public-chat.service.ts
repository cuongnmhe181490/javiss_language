import { AnalyticsEventType } from "@prisma/client";
import OpenAI from "openai";
import { env } from "@/config/env";
import type { PublicChatMessageInput } from "@/features/public-chat/schemas";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { consumeDailyProviderQuota } from "@/lib/rate-limit/provider-quota";
import { AppError } from "@/lib/utils/app-error";
import { createAnalyticsEvent } from "@/server/repositories/analytics.repository";

type PublicChatProviderName = "mock" | "openai" | "gemini";
type PublicChatIntent =
  | "registration"
  | "approval_status"
  | "verification"
  | "login_support"
  | "speaking"
  | "writing"
  | "pricing"
  | "exam_scope"
  | "dashboard"
  | "general";

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

function detectPublicChatIntent(message: string): PublicChatIntent {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("đăng ký") ||
    normalized.includes("dang ky") ||
    normalized.includes("hồ sơ") ||
    normalized.includes("ho so")
  ) {
    return "registration";
  }

  if (
    normalized.includes("chờ duyệt") ||
    normalized.includes("cho duyet") ||
    normalized.includes("pending") ||
    normalized.includes("bị từ chối") ||
    normalized.includes("bi tu choi") ||
    normalized.includes("rejected") ||
    normalized.includes("blocked") ||
    normalized.includes("bị khóa")
  ) {
    return "approval_status";
  }

  if (
    normalized.includes("xác thực") ||
    normalized.includes("xac thuc") ||
    normalized.includes("mã") ||
    normalized.includes("ma") ||
    normalized.includes("verify")
  ) {
    return "verification";
  }

  if (
    normalized.includes("đăng nhập") ||
    normalized.includes("dang nhap") ||
    normalized.includes("quên mật khẩu") ||
    normalized.includes("quen mat khau") ||
    normalized.includes("reset")
  ) {
    return "login_support";
  }

  if (normalized.includes("speaking") || normalized.includes("nói") || normalized.includes("noi")) {
    return "speaking";
  }

  if (normalized.includes("writing") || normalized.includes("viết") || normalized.includes("viet")) {
    return "writing";
  }

  if (
    normalized.includes("giá") ||
    normalized.includes("gia") ||
    normalized.includes("phí") ||
    normalized.includes("phi") ||
    normalized.includes("gói") ||
    normalized.includes("goi") ||
    normalized.includes("plan")
  ) {
    return "pricing";
  }

  if (
    normalized.includes("ielts") ||
    normalized.includes("hsk") ||
    normalized.includes("jlpt") ||
    normalized.includes("topik") ||
    normalized.includes("tiếng anh") ||
    normalized.includes("tiếng nhật") ||
    normalized.includes("tiếng hàn") ||
    normalized.includes("tiếng trung")
  ) {
    return "exam_scope";
  }

  if (normalized.includes("dashboard") || normalized.includes("lộ trình") || normalized.includes("lo trinh")) {
    return "dashboard";
  }

  return "general";
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
    "- Sau khi kích hoạt, người học có thể vào dashboard, dùng AI Coach, speaking mock và writing feedback.",
    "",
    "Nguyên tắc trả lời:",
    "- Nếu người dùng hỏi cách bắt đầu: khuyên vào trang Đăng ký.",
    "- Nếu người dùng hỏi chưa đăng nhập được: giải thích trạng thái có thể xảy ra và hướng xử lý.",
    "- Nếu người dùng hỏi học được gì: nhấn mạnh dashboard, speaking AI, writing feedback và lộ trình cá nhân hóa.",
    "- Nếu người dùng hỏi ngoài phạm vi sản phẩm, nói ngắn gọn rằng chatbot này chủ yếu hỗ trợ thông tin về nền tảng.",
    "- Không bịa giá, không bịa tính năng chưa có, không hứa điều chưa triển khai.",
    "- Khi phù hợp, kết thúc bằng một gợi ý hành động ngắn như 'Bạn có thể bấm Đăng ký ngay' hoặc 'Bạn có thể vào trang Xác thực'.",
  ].join("\n");
}

function buildMockReply(intent: PublicChatIntent) {
  switch (intent) {
    case "registration":
      return "Để bắt đầu, bạn vào trang Đăng ký, điền mục tiêu học và gửi hồ sơ. Sau đó đội ngũ sẽ xem xét trước khi mở quyền truy cập cho bạn.";
    case "verification":
      return "Sau khi hồ sơ được duyệt, hệ thống sẽ gửi mã xác thực về email của bạn. Bạn chỉ cần vào trang Xác thực, nhập email và mã để kích hoạt tài khoản.";
    case "approval_status":
      return "Nếu tài khoản đang chờ duyệt hoặc bị từ chối, bạn sẽ thấy trạng thái tương ứng trên hệ thống. Trong giai đoạn chờ duyệt, bạn chưa thể vào khu học tập.";
    case "login_support":
      return "Nếu chưa đăng nhập được, bạn nên kiểm tra xem tài khoản đang chờ duyệt, cần xác thực email, bị từ chối hay bị khóa. Nếu quên mật khẩu, bạn có thể dùng trang Quên mật khẩu.";
    case "speaking":
      return "Sau khi kích hoạt tài khoản, bạn có thể luyện speaking với AI theo từng Part, nhận band sơ bộ và xem lại lịch sử các phiên đã luyện.";
    case "writing":
      return "Sau khi kích hoạt tài khoản, bạn có thể gửi bài writing để nhận band sơ bộ, điểm mạnh, điểm cần cải thiện và lưu lại lịch sử tiến bộ.";
    case "pricing":
      return "Hiện chatbot công khai chỉ hỗ trợ thông tin về nền tảng và quy trình sử dụng. Nếu bạn cần thông tin về gói học, hãy đăng ký hoặc liên hệ đội ngũ hỗ trợ.";
    case "exam_scope":
      return "Ở giai đoạn này, nền tảng ưu tiên IELTS tiếng Anh. Kiến trúc đã sẵn sàng để mở rộng sang HSK, JLPT và TOPIK trong các bước tiếp theo.";
    case "dashboard":
      return "Sau khi kích hoạt tài khoản, bạn sẽ có dashboard để theo dõi mục tiêu điểm, bước học tiếp theo, tiến độ speaking và writing.";
    default:
      return "Javiss Language là nền tảng luyện thi ngôn ngữ bằng AI có kiểm duyệt tài khoản. Nếu bạn muốn bắt đầu, cách nhanh nhất là vào trang Đăng ký để gửi hồ sơ học tập.";
  }
}

function buildSuggestedActions(intent: PublicChatIntent): PublicChatAction[] {
  switch (intent) {
    case "registration":
      return [
        { label: "Mở trang Đăng ký", href: "/register" },
        { label: "Xem trạng thái chờ duyệt", href: "/pending-approval" },
      ];
    case "verification":
      return [
        { label: "Đến trang Xác thực", href: "/verify" },
        { label: "Đăng nhập lại", href: "/login" },
      ];
    case "login_support":
      return [
        { label: "Đăng nhập", href: "/login" },
        { label: "Quên mật khẩu", href: "/forgot-password" },
      ];
    case "approval_status":
      return [
        { label: "Xem trạng thái chờ duyệt", href: "/pending-approval" },
        { label: "Xem trạng thái bị từ chối", href: "/rejected" },
      ];
    case "speaking":
      return [
        { label: "Đăng ký để dùng AI Coach", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
      ];
    case "writing":
      return [
        { label: "Đăng ký để dùng Writing Feedback", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
      ];
    case "pricing":
      return [
        { label: "Đăng ký để được tư vấn", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
      ];
    case "exam_scope":
      return [
        { label: "Xem trang Đăng ký", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
      ];
    case "dashboard":
      return [
        { label: "Đăng ký ngay", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
      ];
    default:
      return [
        { label: "Đăng ký ngay", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
      ];
  }
}

export async function sendPublicChatMessage(input: {
  values: PublicChatMessageInput;
  ipAddress?: string | null;
}) {
  const fingerprint = input.ipAddress?.trim() || "anonymous";
  const intent = detectPublicChatIntent(input.values.message);

  await enforceRateLimit(`public-chat:${fingerprint}`, 12, 10 * 60 * 1000);

  await createAnalyticsEvent({
    eventType: AnalyticsEventType.public_chat_message_requested,
    entityType: "public_chat",
    metadata: {
      intent,
      source: input.values.source,
      sessionId: input.values.sessionId ?? null,
      messageLength: input.values.message.length,
      fingerprint,
    },
  });

  const providerConfig = resolveProviderConfig();

  if (providerConfig.provider === "gemini") {
    const quota = await consumeDailyProviderQuota({
      provider: "gemini-public-chat",
      userId: fingerprint,
      limit: Math.max(20, Math.floor(env.GEMINI_DAILY_REQUEST_LIMIT / 2)),
    });

    if (!quota.allowed) {
      await Promise.all([
        createAnalyticsEvent({
          eventType: AnalyticsEventType.public_chat_message_completed,
          entityType: "public_chat",
          metadata: {
            intent,
            source: input.values.source,
            sessionId: input.values.sessionId ?? null,
            provider: "mock",
            modelName: "javiss-public-demo",
          },
        }),
        createAnalyticsEvent({
          eventType: AnalyticsEventType.public_chat_fallback_used,
          entityType: "public_chat",
          metadata: {
            intent,
            source: input.values.source,
            sessionId: input.values.sessionId ?? null,
            fallbackReason: "daily_quota_reached",
          },
        }),
      ]);

      return {
        reply: buildMockReply(intent),
        provider: "mock" as const,
        modelName: "javiss-public-demo",
        fallbackReason: "daily_quota_reached" as const,
        actions: buildSuggestedActions(intent),
        intent,
      };
    }
  }

  if (providerConfig.provider === "mock") {
    await createAnalyticsEvent({
      eventType: AnalyticsEventType.public_chat_message_completed,
      entityType: "public_chat",
      metadata: {
        intent,
        source: input.values.source,
        sessionId: input.values.sessionId ?? null,
        provider: "mock",
        modelName: "javiss-public-demo",
      },
    });

    return {
      reply: buildMockReply(intent),
      provider: "mock" as const,
      modelName: "javiss-public-demo",
      fallbackReason: null,
      actions: buildSuggestedActions(intent),
      intent,
    };
  }

  const client = getOpenAiClient(providerConfig.provider);

  if (!client) {
    await Promise.all([
      createAnalyticsEvent({
        eventType: AnalyticsEventType.public_chat_message_completed,
        entityType: "public_chat",
        metadata: {
          intent,
          source: input.values.source,
          sessionId: input.values.sessionId ?? null,
          provider: "mock",
          modelName: "javiss-public-demo",
        },
      }),
      createAnalyticsEvent({
        eventType: AnalyticsEventType.public_chat_fallback_used,
        entityType: "public_chat",
        metadata: {
          intent,
          source: input.values.source,
          sessionId: input.values.sessionId ?? null,
          fallbackReason: "provider_request_failed",
        },
      }),
    ]);

    return {
      reply: buildMockReply(intent),
      provider: "mock" as const,
      modelName: "javiss-public-demo",
      fallbackReason: "provider_request_failed" as const,
      actions: buildSuggestedActions(intent),
      intent,
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: providerConfig.modelName,
      temperature: 0.3,
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

    await createAnalyticsEvent({
      eventType: AnalyticsEventType.public_chat_message_completed,
      entityType: "public_chat",
      metadata: {
        intent,
        source: input.values.source,
        sessionId: input.values.sessionId ?? null,
        provider: providerConfig.provider,
        modelName: providerConfig.modelName,
      },
    });

    return {
      reply,
      provider: providerConfig.provider,
      modelName: providerConfig.modelName,
      fallbackReason: null,
      actions: buildSuggestedActions(intent),
      intent,
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

    await Promise.all([
      createAnalyticsEvent({
        eventType: AnalyticsEventType.public_chat_message_completed,
        entityType: "public_chat",
        metadata: {
          intent,
          source: input.values.source,
          sessionId: input.values.sessionId ?? null,
          provider: "mock",
          modelName: "javiss-public-demo",
        },
      }),
      createAnalyticsEvent({
        eventType: AnalyticsEventType.public_chat_fallback_used,
        entityType: "public_chat",
        metadata: {
          intent,
          source: input.values.source,
          sessionId: input.values.sessionId ?? null,
          fallbackReason: "provider_request_failed",
        },
      }),
    ]);

    return {
      reply: buildMockReply(intent),
      provider: "mock" as const,
      modelName: "javiss-public-demo",
      fallbackReason: "provider_request_failed" as const,
      actions: buildSuggestedActions(intent),
      intent,
    };
  }
}
