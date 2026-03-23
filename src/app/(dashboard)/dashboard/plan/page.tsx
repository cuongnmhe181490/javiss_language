import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { findUserById } from "@/server/repositories/user.repository";
import { vi } from "@/i18n/dictionaries/vi";

export default async function DashboardPlanPage() {
  const session = await requireActiveStudentSession();
  const user = await findUserById(session.userId);
  const plan = user?.studyPlans[0];
  const activeLicense = user?.licenses.find((item) => item.status === "active");

  return (
    <div className="space-y-6">
      <SectionHeader
        title={vi.dashboard.planTitle}
        description="Khung kế hoạch học tập, plan và entitlement hiện tại của bạn."
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
      <Card>
        <CardHeader>
          <CardTitle>Plan và entitlement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <p>
            License hiện tại: {activeLicense?.plan?.name ?? "Chưa có license hoạt động"}
          </p>
          <div className="flex flex-wrap gap-2">
            {user?.entitlements.length ? (
              user.entitlements.map((entitlement) => (
                <Badge key={entitlement.id}>
                  {entitlement.featureKey}
                </Badge>
              ))
            ) : (
              <p>Chưa có entitlement nào được gán.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
