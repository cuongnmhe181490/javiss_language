import { AppError } from "@/lib/utils/app-error";
import type {
  CreateExerciseInput,
  CreateLessonInput,
} from "@/features/admin/schemas";
import {
  createExerciseWithQuestions,
  createLesson,
  findExerciseBySlug,
  findLessonBySlug,
} from "@/server/repositories/content.repository";
import { createAuditLog } from "@/server/services/audit.service";

export async function createLessonContent(input: {
  actorId: string;
  actorRoles: Array<"super_admin" | "admin" | "teacher" | "student">;
  values: CreateLessonInput;
  ipAddress?: string | null;
}) {
  if (!input.actorRoles.some((role) => ["super_admin", "admin"].includes(role))) {
    throw new AppError("Bạn không có quyền tạo lesson mới.", 403, "FORBIDDEN");
  }

  const existingLesson = await findLessonBySlug(input.values.slug);

  if (existingLesson) {
    throw new AppError("Slug lesson này đã tồn tại.", 409, "LESSON_SLUG_EXISTS");
  }

  const lesson = await createLesson(input.values);

  await createAuditLog({
    actorId: input.actorId,
    action: "lesson_created",
    targetType: "lesson",
    targetId: lesson.id,
    ipAddress: input.ipAddress,
    metadata: {
      slug: lesson.slug,
      status: lesson.status,
    },
  });

  return {
    message: "Đã tạo lesson mới.",
  };
}

export async function createExerciseContent(input: {
  actorId: string;
  actorRoles: Array<"super_admin" | "admin" | "teacher" | "student">;
  values: CreateExerciseInput;
  ipAddress?: string | null;
}) {
  if (!input.actorRoles.some((role) => ["super_admin", "admin"].includes(role))) {
    throw new AppError("Bạn không có quyền tạo bài luyện mới.", 403, "FORBIDDEN");
  }

  const existingExercise = await findExerciseBySlug(input.values.slug);

  if (existingExercise) {
    throw new AppError("Slug bài luyện này đã tồn tại.", 409, "EXERCISE_SLUG_EXISTS");
  }

  const questionPrompts = input.values.questionPrompts
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (questionPrompts.length === 0) {
    throw new AppError("Bạn cần nhập ít nhất một câu hỏi.", 400, "QUESTION_REQUIRED");
  }

  const exercise = await createExerciseWithQuestions({
    lessonId: input.values.lessonId,
    slug: input.values.slug,
    title: input.values.title,
    type: input.values.type,
    instructions: input.values.instructions,
    questionType: input.values.questionType,
    questionPrompts,
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "exercise_created",
    targetType: "exercise",
    targetId: exercise.id,
    ipAddress: input.ipAddress,
    metadata: {
      slug: exercise.slug,
      questionCount: questionPrompts.length,
      type: exercise.type,
    },
  });

  return {
    message: "Đã tạo bài luyện mới.",
  };
}
