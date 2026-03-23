import { z } from "zod";

export const submitExerciseAttemptSchema = z.object({
  action: z.enum(["draft", "submit"]),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        answerText: z.string().min(1, "Vui lòng nhập câu trả lời."),
      }),
    )
    .min(1, "Vui lòng trả lời ít nhất một câu."),
});

export type SubmitExerciseAttemptInput = z.infer<typeof submitExerciseAttemptSchema>;
