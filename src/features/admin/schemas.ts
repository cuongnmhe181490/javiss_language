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

export const createPlanSchema = z.object({
  code: z.string().min(2, "Vui lòng nhập mã plan."),
  name: z.string().min(2, "Vui lòng nhập tên plan."),
  description: z.string().optional(),
  priceCents: z.coerce.number().int().min(0, "Giá không hợp lệ."),
  currency: z.string().min(3, "Mã tiền tệ không hợp lệ."),
  isDefault: z.boolean(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const createLessonSchema = z.object({
  topicId: z.string().min(1, "Vui lòng chọn topic."),
  slug: z.string().min(2, "Vui lòng nhập slug lesson."),
  title: z.string().min(2, "Vui lòng nhập tiêu đề lesson."),
  summary: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const createExerciseSchema = z.object({
  lessonId: z.string().min(1, "Vui lòng chọn lesson."),
  slug: z.string().min(2, "Vui lòng nhập slug bài luyện."),
  title: z.string().min(2, "Vui lòng nhập tiêu đề bài luyện."),
  type: z.enum(["practice", "mock_test", "assessment"]),
  instructions: z.string().optional(),
  questionType: z.enum([
    "multiple_choice",
    "short_answer",
    "essay",
    "speaking",
    "listening",
    "reading",
  ]),
  questionPrompts: z.string().min(3, "Vui lòng nhập ít nhất một câu hỏi."),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
