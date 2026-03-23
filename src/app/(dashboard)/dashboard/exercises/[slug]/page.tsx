import { notFound } from "next/navigation";
import { ExerciseAttemptForm } from "@/components/forms/exercise-attempt-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { getExerciseDetailForUser } from "@/server/repositories/learning.repository";

export const dynamic = "force-dynamic";

const attemptStatusLabelMap: Record<string, string> = {
  draft: "Bản nháp",
  submitted: "Đã nộp",
  reviewed: "Đã chấm",
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

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireActiveStudentSession();
  const { slug } = await params;
  const exercise = await getExerciseDetailForUser(slug, session.userId);

  if (!exercise) {
    notFound();
  }

  const initialAnswers = Object.fromEntries(
    (exercise.currentAttempt?.answers ?? []).map((answer) => [answer.questionId, answer.answerText]),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{exercise.title}</CardTitle>
            <Badge>{exercise.lesson.topic.examPack.exam.name}</Badge>
            <Badge>{questionTypeLabelMap[exercise.type] ?? exercise.type}</Badge>
            {exercise.currentAttempt ? (
              <Badge>
                {attemptStatusLabelMap[exercise.currentAttempt.status] ?? exercise.currentAttempt.status}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {exercise.instructions ??
              "Đọc kỹ yêu cầu, tự trả lời từng câu hỏi và dùng phần này như một bài luyện độc lập."}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <ExerciseAttemptForm
            slug={slug}
            questions={exercise.questions}
            initialAnswers={initialAnswers}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bài làm gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          {exercise.attempts.length === 0 ? (
            <p>Chưa có lần làm bài nào cho bài luyện này.</p>
          ) : (
            exercise.attempts.map((attempt, index) => (
              <div
                key={attempt.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <p className="font-medium text-slate-950 dark:text-white">
                  Lần làm #{exercise.attempts.length - index}
                </p>
                <p>Trạng thái: {attemptStatusLabelMap[attempt.status] ?? attempt.status}</p>
                <p>Tạo lúc: {attempt.createdAt.toLocaleString("vi-VN")}</p>
                <p>Số câu đã lưu: {attempt.answers.length}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
