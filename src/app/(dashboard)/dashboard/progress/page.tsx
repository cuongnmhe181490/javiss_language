import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/guards";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function DashboardProgressPage() {
  const session = await requireSession();
  const user = await findUserById(session.userId);
  const snapshot = user?.snapshots[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={vi.dashboard.progressTitle}
        description="Mốc tiến độ ban đầu để chuẩn bị cho lớp AI personalization sau này."
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
    </div>
  );
}
