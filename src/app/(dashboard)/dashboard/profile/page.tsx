import { ProfileForm } from "@/components/forms/profile-form";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const session = await requireActiveStudentSession();
  const user = await findUserById(session.userId);
  const goal = user?.goals[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={vi.dashboard.profileTitle}
        description="Cập nhật hồ sơ học tập để hệ thống cá nhân hóa lộ trình tốt hơn."
      />
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa hồ sơ học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              fullName: user?.profile?.fullName ?? "",
              currentLevel: user?.profile?.currentLevel ?? "",
              strongestSkills: user?.profile?.strongestSkills?.join(", ") ?? "",
              weakestSkills: user?.profile?.weakestSkills?.join(", ") ?? "",
              preferredStudyWindow: user?.profile?.preferredStudyWindow ?? "",
              targetScore: goal?.targetScore ?? "",
              estimatedLevel: goal?.estimatedLevel ?? "",
              preferredSchedule: goal?.preferredSchedule ?? "",
              targetExamDate: goal?.targetExamDate
                ? goal.targetExamDate.toISOString().slice(0, 10)
                : "",
              onboardingNotes: user?.profile?.onboardingNotes ?? "",
            }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt hiện tại</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
          <p>Họ tên: {user?.profile?.fullName ?? "Chưa có"}</p>
          <p>Email: {user?.email ?? "Chưa có"}</p>
          <p>Ngôn ngữ muốn học: {goal?.language.nativeName ?? "Chưa đặt"}</p>
          <p>Kỳ thi mục tiêu: {goal?.exam.name ?? "Chưa đặt"}</p>
          <p>Điểm mục tiêu: {goal?.targetScore ?? "Chưa đặt"}</p>
          <p>Trình độ hiện tại ước lượng: {goal?.estimatedLevel ?? "Đang cập nhật"}</p>
          <p>Khung giờ học mong muốn: {user?.profile?.preferredStudyWindow ?? "Đang cập nhật"}</p>
          <p>Ngày thi: {goal?.targetExamDate?.toLocaleDateString("vi-VN") ?? "Chưa đặt"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
