import { AppError } from "@/lib/utils/app-error";
import type { SubmitExerciseAttemptInput } from "@/features/learning/schemas";
import {
  getExerciseBySlug,
  upsertExerciseAttempt,
  updateProgressFromAttempt,
} from "@/server/repositories/learning.repository";

export async function saveExerciseAttempt(input: {
  userId: string;
  slug: string;
  values: SubmitExerciseAttemptInput;
}) {
  const exercise = await getExerciseBySlug(input.slug);

  if (!exercise) {
    throw new AppError("Không tìm thấy bài luyện.", 404, "EXERCISE_NOT_FOUND");
  }

  const questionIds = new Set(exercise.questions.map((question) => question.id));
  const hasInvalidQuestion = input.values.answers.some(
    (answer) => !questionIds.has(answer.questionId),
  );

  if (hasInvalidQuestion) {
    throw new AppError("Dữ liệu câu trả lời không hợp lệ.", 400, "INVALID_QUESTION");
  }

  const attempt = await upsertExerciseAttempt({
    userId: input.userId,
    exerciseId: exercise.id,
    status: input.values.action === "submit" ? "submitted" : "draft",
    answers: input.values.answers,
  });

  if (input.values.action === "submit") {
    await updateProgressFromAttempt({
      userId: input.userId,
      exerciseId: exercise.id,
    });
  }

  return {
    message:
      input.values.action === "submit"
        ? "Đã nộp bài luyện và cập nhật tiến độ."
        : "Đã lưu bản nháp bài luyện.",
    attempt,
  };
}
