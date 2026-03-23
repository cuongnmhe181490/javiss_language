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

export const createAdminSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên admin."),
  email: z.email("Email admin không hợp lệ."),
  password: z
    .string()
    .min(8, "Mật khẩu cần có ít nhất 8 ký tự.")
    .regex(/[A-Z]/, "Mật khẩu cần có ít nhất 1 chữ in hoa.")
    .regex(/[0-9]/, "Mật khẩu cần có ít nhất 1 chữ số."),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
