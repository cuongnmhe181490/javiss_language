import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/guards";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const session = await requireSession();
  const user = await findUserById(session.userId);
  const goal = user?.goals[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={vi.dashboard.profileTitle}
        description="Thông tin cá nhân hóa phục vụ học tập."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hiện tại</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
          <p>Họ tên: {user?.profile?.fullName ?? "Chưa có"}</p>
          <p>Email: {user?.email ?? "Chưa có"}</p>
          <p>Ngôn ngữ muốn học: {goal?.language.nativeName ?? "Chưa đặt"}</p>
          <p>Kỳ thi mục tiêu: {goal?.exam.name ?? "Chưa đặt"}</p>
          <p>Điểm mục tiêu: {goal?.targetScore ?? "Chưa đặt"}</p>
          <p>Trình độ hiện tại ước lượng: {goal?.estimatedLevel ?? "Đang cập nhật"}</p>
          <p>Khung giờ học mong muốn: {goal?.preferredSchedule ?? "Đang cập nhật"}</p>
          <p>Ngày thi: {goal?.targetExamDate?.toLocaleDateString("vi-VN") ?? "Chưa đặt"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
