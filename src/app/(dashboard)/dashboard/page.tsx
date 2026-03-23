import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireActiveStudentSession();
  const user = await findUserById(session.userId);

  if (!user) {
    return null;
  }

  const goal = user.goals[0];
  const plan = user.studyPlans[0];
  const snapshot = user.snapshots[0];

  return (
    <div className="space-y-8">
      <SectionHeader title={vi.dashboard.title} description={vi.dashboard.welcome} />
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title={vi.dashboard.targetExam}
          value={goal?.exam.name ?? "Chưa có"}
          description="Kỳ thi mục tiêu hiện tại của bạn."
        />
        <MetricCard
          title={vi.dashboard.targetScore}
          value={goal?.targetScore ?? "Chưa đặt"}
          description="Mức điểm bạn đang hướng tới."
        />
        <MetricCard
          title={vi.dashboard.currentStatus}
          value={vi.userStatus[user.status]}
          description="Trạng thái tài khoản và học tập hiện tại."
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{vi.dashboard.nextStep}</CardTitle>
            <CardDescription>Gợi ý bước đi tiếp theo từ hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusBadge status={user.status} />
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              {plan?.nextAction ??
                "Hoàn thiện hồ sơ học tập, xác định kỹ năng yếu và bắt đầu bài luyện đầu tiên."}
            </p>
            <Link href="/dashboard/lessons">
              <Button size="sm">Mở khu bài luyện</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{vi.dashboard.progress}</CardTitle>
            <CardDescription>Điểm nhìn nhanh về tiến độ khởi tạo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>Tổng tiến độ: {snapshot?.overallProgress ?? 0}%</p>
            <p>Speaking: {snapshot?.speakingProgress ?? 0}%</p>
            <p>Writing: {snapshot?.writingProgress ?? 0}%</p>
            <p>Reading: {snapshot?.readingProgress ?? 0}%</p>
            <p>Listening: {snapshot?.listeningProgress ?? 0}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
