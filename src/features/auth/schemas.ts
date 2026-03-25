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
  code: z.string().min(4, "Vui lòng nhập mã xác thực."),
});

export const resendCodeSchema = z.object({
  email: z.email("Email không hợp lệ."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email không hợp lệ."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Liên kết đặt lại mật khẩu không hợp lệ."),
    password: z
      .string()
      .min(8, "Mật khẩu cần có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu cần có ít nhất 1 chữ in hoa.")
      .regex(/[0-9]/, "Mật khẩu cần có ít nhất 1 chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ và tên."),
  currentLevel: z.string().optional(),
  strongestSkills: z.string().optional(),
  weakestSkills: z.string().optional(),
  preferredStudyWindow: z.string().optional(),
  targetScore: z.string().optional(),
  estimatedLevel: z.string().optional(),
  preferredSchedule: z.string().optional(),
  targetExamDate: z.string().optional(),
  onboardingNotes: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
