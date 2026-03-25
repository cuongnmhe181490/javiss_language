import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Badge>Khôi phục quyền truy cập</Badge>
          <SectionHeader
            title={vi.auth.forgotPasswordTitle}
            description={vi.auth.forgotPasswordDescription}
          />
          <Card className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
            <CardContent className="p-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Nếu bạn chưa được phê duyệt hoặc chưa kích hoạt email, liên kết đặt lại mật khẩu sẽ
              không được gửi. Khi đó, hãy hoàn tất quy trình đăng ký và xác thực trước.
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/70 bg-white/80 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="p-8">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
