import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/guards";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function DashboardPlanPage() {
  const session = await requireSession();
  const user = await findUserById(session.userId);
  const plan = user?.studyPlans[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={vi.dashboard.planTitle}
        description="Khung kế hoạch học tập cá nhân ở giai đoạn hiện tại."
      />
      <Card>
        <CardHeader>
          <CardTitle>{plan?.title ?? "Kế hoạch đang được chuẩn bị"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
          <p>
            {plan?.summary ??
              "Hệ thống sẽ sớm cá nhân hóa sâu hơn khi dữ liệu học tập được tích lũy."}
          </p>
          <p>
            Bước tiếp theo:{" "}
            {plan?.nextAction ?? "Hoàn thiện hồ sơ và bắt đầu bài luyện đầu tiên."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
