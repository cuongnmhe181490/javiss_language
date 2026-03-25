import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function RejectedPage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <div className="mx-auto max-w-3xl">
        <Card className="border-white/70 bg-white/80 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="space-y-6 p-8">
            <SectionHeader title={vi.auth.rejectedTitle} description={vi.auth.rejectedDescription} />
            <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
              <p className="text-sm leading-7 text-amber-800 dark:text-amber-200">
                Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ đội ngũ hỗ trợ và cung cấp email đã dùng
                khi đăng ký để được kiểm tra lại hồ sơ.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button>Gửi lại yêu cầu đăng ký</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">{vi.common.backToHome}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
