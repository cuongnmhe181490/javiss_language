import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ và tên."),
  email: z.email("Email không hợp lệ."),
  password: z
    .string()
    .min(8, "Mật khẩu cần có ít nhất 8 ký tự.")
    .regex(/[A-Z]/, "Mật khẩu cần có ít nhất 1 chữ in hoa.")
    .regex(/[0-9]/, "Mật khẩu cần có ít nhất 1 chữ số."),
  targetExam: z.string().min(1, "Vui lòng chọn kỳ thi mục tiêu."),
  targetScore: z.string().min(1, "Vui lòng nhập điểm mục tiêu."),
  preferredLanguage: z.string().min(1, "Vui lòng chọn ngôn ngữ muốn học."),
});

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const verifySchema = z.object({
  email: z.email("Email không hợp lệ."),
  code: z.string().min(4, "Vui lòng nhập mã xác nhận."),
});

export const resendCodeSchema = z.object({
  email: z.email("Email không hợp lệ."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;
