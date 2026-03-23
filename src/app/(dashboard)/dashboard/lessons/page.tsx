import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { getLearningCatalogForUser } from "@/server/repositories/learning.repository";

export const dynamic = "force-dynamic";

export default async function DashboardLessonsPage() {
  const session = await requireActiveStudentSession();
  const catalog = await getLearningCatalogForUser(session.userId);

  if (!catalog) {
    return (
      <EmptyState
        title="Chưa có lộ trình học phù hợp"
        description="Hãy hoàn thiện mục tiêu học tập để hệ thống gợi ý bài luyện tương ứng."
      />
    );
  }

  const topics = catalog.packs.flatMap((pack) =>
    pack.topics.map((topic) => ({
      ...topic,
      packName: pack.name,
    })),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Bài luyện IELTS"
        description={`Nội dung hiện tại đang bám theo ${catalog.goal.exam.name} và exam pack đã được kích hoạt.`}
      />
      {topics.length === 0 ? (
        <EmptyState
          title="Chưa có topic nào sẵn sàng"
          description="Hãy seed thêm lesson/exercise hoặc mở thêm exam pack."
        />
      ) : (
        <div className="grid gap-6">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle>{topic.name}</CardTitle>
                  <Badge>{topic.packName}</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {topic.description ?? "Chưa có mô tả chi tiết cho topic này."}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                {topic.lessons.length === 0 ? (
                  <EmptyState
                    title="Chưa có lesson đã xuất bản"
                    description="Topic này chưa có lesson nào ở trạng thái xuất bản."
                  />
                ) : (
                  topic.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-950 dark:text-white">
                            {lesson.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {lesson.summary ?? "Lesson này chưa có phần giới thiệu ngắn."}
                          </p>
                        </div>
                        <Badge>{lesson.exercises.length} bài</Badge>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {lesson.exercises.map((exercise) => (
                          <Link
                            key={exercise.id}
                            href={`/dashboard/exercises/${exercise.slug}`}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                          >
                            {exercise.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
