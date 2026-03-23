"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ExerciseAttemptFormProps = {
  slug: string;
  questions: Array<{
    id: string;
    prompt: string;
    type: string;
  }>;
  initialAnswers?: Record<string, string>;
};

type FormShape = {
  answers: Record<string, string>;
};

const questionTypeLabelMap: Record<string, string> = {
  speaking: "Nói",
  writing: "Viết",
  reading: "Đọc",
  listening: "Nghe",
  essay: "Tự luận",
  multiple_choice: "Trắc nghiệm",
  short_answer: "Trả lời ngắn",
};

export function ExerciseAttemptForm({
  slug,
  questions,
  initialAnswers = {},
}: ExerciseAttemptFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo(
    () => ({
      answers: questions.reduce<Record<string, string>>((accumulator, question) => {
        accumulator[question.id] = initialAnswers[question.id] ?? "";
        return accumulator;
      }, {}),
    }),
    [initialAnswers, questions],
  );

  const { register, handleSubmit } = useForm<FormShape>({
    defaultValues,
    values: defaultValues,
  });

  const submit = (action: "draft" | "submit") =>
    handleSubmit((values) => {
      startTransition(async () => {
        const answers = Object.entries(values.answers)
          .map(([questionId, answerText]) => ({
            questionId,
            answerText: answerText.trim(),
          }))
          .filter((item) => item.answerText.length > 0);

        const response = await fetch(`/api/exercises/${slug}/attempts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            answers,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          toast.error(payload?.error?.message ?? "Không thể lưu bài luyện.");
          return;
        }

        toast.success(payload.data.message);
        router.refresh();
      });
    })();

  return (
    <div className="space-y-5">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              Câu {index + 1}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {questionTypeLabelMap[question.type] ?? question.type}
            </span>
          </div>
          <p className="mb-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
            {question.prompt}
          </p>
          <Textarea
            placeholder="Nhập câu trả lời hoặc dàn ý của bạn tại đây..."
            {...register(`answers.${question.id}`)}
          />
        </div>
      ))}
      <div className="flex gap-3">
        <Button disabled={isPending} onClick={() => submit("draft")} type="button">
          {isPending ? "Đang lưu..." : "Lưu bản nháp"}
        </Button>
        <Button
          disabled={isPending}
          onClick={() => submit("submit")}
          type="button"
          variant="outline"
        >
          {isPending ? "Đang nộp..." : "Nộp bài luyện"}
        </Button>
      </div>
    </div>
  );
}
