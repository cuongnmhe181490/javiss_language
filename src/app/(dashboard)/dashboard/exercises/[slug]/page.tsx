import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { getExerciseBySlug } from "@/server/repositories/learning.repository";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireActiveStudentSession();
  const { slug } = await params;
  const exercise = await getExerciseBySlug(slug);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{exercise.title}</CardTitle>
            <Badge>{exercise.lesson.topic.examPack.exam.name}</Badge>
            <Badge>{exercise.type}</Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {exercise.instructions ??
              "Đọc kỹ yêu cầu, tự trả lời từng câu hỏi và dùng phần này như một bài luyện độc lập."}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {exercise.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
            >
              <div className="mb-3 flex items-center gap-3">
                <Badge>Câu {index + 1}</Badge>
                <Badge>{question.type}</Badge>
              </div>
              <p className="mb-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {question.prompt}
              </p>
              <Textarea placeholder="Nhập câu trả lời hoặc dàn ý của bạn tại đây..." />
            </div>
          ))}
          <div className="flex gap-3">
            <Button type="button">Lưu bản nháp cục bộ</Button>
            <Button type="button" variant="outline">
              Hoàn thành bài luyện
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
