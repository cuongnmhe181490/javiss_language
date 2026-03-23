import { z } from "zod";

export const rejectRegistrationSchema = z.object({
  reason: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  adminNotificationEmail: z.email("Email admin không hợp lệ."),
  verificationCodeTtlMinutes: z.coerce
    .number()
    .int()
    .min(1, "Số phút hết hạn phải lớn hơn 0."),
  verificationMaxAttempts: z.coerce
    .number()
    .int()
    .min(1, "Số lần nhập tối đa phải lớn hơn 0."),
  resendCooldownSeconds: z.coerce
    .number()
    .int()
    .min(30, "Thời gian chờ gửi lại mã phải từ 30 giây trở lên."),
  openRegistration: z.boolean(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
