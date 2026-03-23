import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getAllSettings } from "@/server/repositories/settings.repository";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  admin_notification_email: "Email admin nhận thông báo",
  verification_code_ttl_minutes: "Số phút hết hạn mã xác nhận",
  verification_max_attempts: "Số lần nhập mã tối đa",
  resend_cooldown_seconds: "Thời gian chờ gửi lại mã",
  open_registration: "Cho phép mở đăng ký",
};

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cài đặt hệ thống"
        description="Các tham số lõi cho luồng đăng ký, xác thực và thông báo."
      />
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          {settings.map((setting) => (
            <div key={setting.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {labels[setting.key] ?? setting.key}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{setting.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
