import { z } from "zod";

export const aiCoachMessageSchema = z.object({
  message: z
    .string()
    .min(2, "Vui lòng nhập nội dung đủ rõ để AI Coach có thể hỗ trợ.")
    .max(4000, "Nội dung đang quá dài. Vui lòng rút gọn trước khi gửi."),
});

export type AiCoachMessageInput = z.infer<typeof aiCoachMessageSchema>;
