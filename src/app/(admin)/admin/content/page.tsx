import { CreateExerciseForm } from "@/components/admin/create-exercise-form";
import { CreateLessonForm } from "@/components/admin/create-lesson-form";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRoles } from "@/lib/auth/guards";
import {
  listContentFormOptions,
  listContentOverview,
} from "@/server/repositories/content.repository";

export const dynamic = "force-dynamic";

const lessonStatusLabelMap: Record<string, string> = {
  draft: "Bản nháp",
  published: "Xuất bản",
  archived: "Lưu trữ",
};

const exerciseTypeLabelMap: Record<string, string> = {
  practice: "Luyện tập",
  mock_test: "Thi thử",
  assessment: "Đánh giá",
};

export default async function AdminContentPage() {
  await requireRoles(["super_admin", "admin"]);
  const [overview, options] = await Promise.all([
    listContentOverview(),
    listContentFormOptions(),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Quản trị nội dung"
        description="Tạo lesson và bài luyện mới để nội dung học tập xuất hiện ngay trên dashboard của học viên."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 space-y-1">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Tạo lesson mới
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gắn lesson vào topic hiện có để exam pack tương ứng tự nhận nội dung.
              </p>
            </div>
            {options.topics.length === 0 ? (
              <EmptyState
                title="Chưa có topic để gắn lesson"
                description="Hãy seed topic trước khi tạo lesson mới."
              />
            ) : (
              <CreateLessonForm
                topics={options.topics.map((topic) => ({
                  id: topic.id,
                  name: topic.name,
                  packName: topic.examPack.name,
                  examName: topic.examPack.exam.name,
                }))}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 space-y-1">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Tạo bài luyện mới
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mỗi dòng câu hỏi sẽ được tạo thành một question mới cho exercise.
              </p>
            </div>
            {options.lessons.length === 0 ? (
              <EmptyState
                title="Chưa có lesson để tạo bài luyện"
                description="Hãy tạo lesson trước khi thêm exercise mới."
              />
            ) : (
              <CreateExerciseForm
                lessons={options.lessons.map((lesson) => ({
                  id: lesson.id,
                  title: lesson.title,
                  topicName: lesson.topic.name,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 space-y-1">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Cây nội dung hiện tại
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Theo dõi nhanh topic, lesson và bài luyện đang có trong hệ thống.
            </p>
          </div>
          {overview.length === 0 ? (
            <EmptyState
              title="Chưa có topic nào để quản lý"
              description="Hãy seed thêm exam pack và topic trước khi tạo lesson mới."
            />
          ) : (
            <div className="grid gap-5">
              {overview.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                      {topic.name}
                    </h3>
                    <Badge>{topic.examPack.name}</Badge>
                    <Badge>{topic.examPack.exam.name}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {topic.description ?? "Topic này chưa có mô tả."}
                  </p>
                  <div className="mt-5 grid gap-4">
                    {topic.lessons.length === 0 ? (
                      <EmptyState
                        title="Chưa có lesson nào"
                        description="Topic này chưa có lesson được tạo."
                      />
                    ) : (
                      topic.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="font-semibold text-slate-950 dark:text-white">
                              {lesson.title}
                            </h4>
                            <Badge>{lessonStatusLabelMap[lesson.status] ?? lesson.status}</Badge>
                            <Badge>{lesson.exercises.length} bài luyện</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {lesson.summary ?? "Lesson này chưa có tóm tắt."}
                          </p>
                          <div className="mt-3 grid gap-2">
                            {lesson.exercises.length === 0 ? (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Chưa có bài luyện nào trong lesson này.
                              </p>
                            ) : (
                              lesson.exercises.map((exercise) => (
                                <div
                                  key={exercise.id}
                                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
                                >
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="font-medium text-slate-950 dark:text-white">
                                      {exercise.title}
                                    </span>
                                    <Badge>
                                      {exerciseTypeLabelMap[exercise.type] ?? exercise.type}
                                    </Badge>
                                    <Badge>{exercise.questions.length} câu hỏi</Badge>
                                  </div>
                                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                                    Slug: {exercise.slug}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
