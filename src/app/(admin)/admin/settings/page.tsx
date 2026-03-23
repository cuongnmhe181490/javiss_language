import { SettingsForm } from "@/components/admin/settings-form";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getAllSettings } from "@/server/repositories/settings.repository";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();
  const settingMap = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cài đặt hệ thống"
        description="Cập nhật các tham số lõi cho luồng đăng ký, xác thực và thông báo."
      />
      <Card>
        <CardContent className="p-6">
          <SettingsForm
            defaultValues={{
              adminNotificationEmail: settingMap.admin_notification_email ?? "",
              verificationCodeTtlMinutes: Number(
                settingMap.verification_code_ttl_minutes ?? "15",
              ),
              verificationMaxAttempts: Number(
                settingMap.verification_max_attempts ?? "5",
              ),
              resendCooldownSeconds: Number(
                settingMap.resend_cooldown_seconds ?? "90",
              ),
              openRegistration: settingMap.open_registration !== "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
