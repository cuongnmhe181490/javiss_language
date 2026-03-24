import { z } from "zod";

export const aiCoachMessageSchema = z.object({
  message: z
    .string()
    .min(2, "Vui lòng nhập nội dung đủ rõ để AI Coach có thể hỗ trợ.")
    .max(4000, "Nội dung đang quá dài. Vui lòng rút gọn trước khi gửi."),
});

export const aiSpeakingSessionSchema = z.object({
  part: z.enum(["part1", "part2", "part3"], {
    message: "Vui lòng chọn đúng phần thi speaking.",
  }),
  topic: z
    .string()
    .max(120, "Chủ đề đang quá dài. Vui lòng rút gọn lại.")
    .optional()
    .transform((value) => value?.trim() || undefined),
});

export const aiSpeakingTurnSchema = z.object({
  transcript: z
    .string()
    .min(2, "Vui lòng nói hoặc nhập câu trả lời rõ hơn trước khi gửi.")
    .max(4000, "Phần trả lời đang quá dài. Vui lòng rút gọn lại."),
});

export type AiCoachMessageInput = z.infer<typeof aiCoachMessageSchema>;
export type AiSpeakingSessionInput = z.infer<typeof aiSpeakingSessionSchema>;
export type AiSpeakingTurnInput = z.infer<typeof aiSpeakingTurnSchema>;
