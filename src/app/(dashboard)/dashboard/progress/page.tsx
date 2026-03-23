import Link from "next/link";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { listRecentAttemptsByUser } from "@/server/repositories/learning.repository";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

const attemptStatusLabelMap: Record<string, string> = {
  draft: "Bản nháp",
  submitted: "Đã nộp",
  reviewed: "Đã chấm",
};

export default async function DashboardProgressPage() {
  const session = await requireActiveStudentSession();
  const [user, recentAttempts] = await Promise.all([
    findUserById(session.userId),
    listRecentAttemptsByUser(session.userId),
  ]);
  const snapshot = user?.snapshots[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={vi.dashboard.progressTitle}
        description="Theo dõi mốc tiến độ thật từ các bài luyện bạn đã lưu và nộp."
      />
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ kỹ năng</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
          <p>Speaking: {snapshot?.speakingProgress ?? 0}%</p>
          <p>Writing: {snapshot?.writingProgress ?? 0}%</p>
          <p>Reading: {snapshot?.readingProgress ?? 0}%</p>
          <p>Listening: {snapshot?.listeningProgress ?? 0}%</p>
          <p>Tổng tiến độ: {snapshot?.overallProgress ?? 0}%</p>
          <p>Ghi chú: {snapshot?.notes ?? "Chưa có ghi chú mới."}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bài đã làm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          {recentAttempts.length === 0 ? (
            <p>Chưa có lần làm bài nào được ghi nhận.</p>
          ) : (
            recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950 dark:text-white">
                      {attempt.exercise.title}
                    </p>
                    <p>{attempt.exercise.lesson.topic.name}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {attemptStatusLabelMap[attempt.status] ?? attempt.status}
                  </span>
                </div>
                <p className="mt-2">Lưu lúc: {attempt.updatedAt.toLocaleString("vi-VN")}</p>
                <p>Số câu đã trả lời: {attempt.answers.length}</p>
                <Link
                  href={`/dashboard/exercises/${attempt.exercise.slug}`}
                  className="mt-3 inline-block text-sky-600 hover:underline dark:text-sky-300"
                >
                  Mở lại bài luyện
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
