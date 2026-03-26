import { z } from "zod";

export const publicChatMessageSchema = z.object({
  message: z
    .string()
    .min(2, "Vui lòng nhập câu hỏi rõ hơn để chatbot có thể hỗ trợ.")
    .max(1200, "Câu hỏi đang quá dài. Vui lòng rút gọn trước khi gửi."),
  source: z.enum(["manual", "suggestion"]).optional().default("manual"),
  sessionId: z.string().max(120, "Mã phiên không hợp lệ.").optional(),
});

export type PublicChatMessageInput = z.infer<typeof publicChatMessageSchema>;

export const publicAnalyticsEventSchema = z.object({
  eventName: z.enum(["widget_opened", "action_clicked", "landing_cta_clicked"], {
    message: "Loại sự kiện không hợp lệ.",
  }),
  sessionId: z.string().max(120, "Mã phiên không hợp lệ.").optional(),
  label: z.string().max(200, "Nội dung nhãn quá dài.").optional(),
  href: z.string().max(300, "Đường dẫn quá dài.").optional(),
  source: z.enum(["widget", "landing", "hero", "faq", "cta"]).optional().default("widget"),
  intent: z.string().max(80, "Nhãn intent quá dài.").optional(),
});

export type PublicAnalyticsEventInput = z.infer<typeof publicAnalyticsEventSchema>;
