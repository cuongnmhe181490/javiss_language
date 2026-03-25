import { VerifyForm } from "@/components/forms/verify-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

const verifySteps = [
  "Dùng đúng email đã được phê duyệt.",
  "Nhập mã xác thực vừa nhận trong email.",
  "Sau khi kích hoạt thành công, quay lại đăng nhập để vào dashboard học tập.",
];

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Badge>{vi.userStatus.verification_sent}</Badge>
          <SectionHeader title={vi.auth.verifyTitle} description={vi.auth.verifyDescription} />
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Kích hoạt tài khoản trong 3 bước
            </p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
              {verifySteps.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-white/70 bg-white/80 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="p-8">
            <VerifyForm defaultEmail={params.email ?? ""} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
