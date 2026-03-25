import { z } from "zod";

export const publicChatMessageSchema = z.object({
  message: z
    .string()
    .min(2, "Vui lòng nhập câu hỏi rõ hơn để chatbot có thể hỗ trợ.")
    .max(1200, "Câu hỏi đang quá dài. Vui lòng rút gọn trước khi gửi."),
});

export type PublicChatMessageInput = z.infer<typeof publicChatMessageSchema>;
