import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

const nextSteps = [
  "Kiểm tra email thường xuyên để nhận thông báo phê duyệt.",
  "Sau khi được duyệt, mở trang xác thực và nhập mã được gửi tới hộp thư.",
  "Nếu cần, bạn vẫn có thể quay lại đăng nhập để kiểm tra trạng thái tài khoản.",
];

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; email?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const isSubmitted = params.submitted === "1";

  return (
    <AppShell session={session}>
      <div className="mx-auto max-w-4xl space-y-6">
        {isSubmitted ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Gửi yêu cầu đăng ký thành công
            </p>
            <p className="mt-2 text-sm leading-7 text-emerald-700 dark:text-emerald-300">
              Chúng tôi đã ghi nhận hồ sơ của bạn
              {params.email ? ` với email ${params.email}` : ""}. Bước tiếp theo là chờ đội ngũ
              phê duyệt trước khi bạn nhận mã kích hoạt.
            </p>
          </div>
        ) : null}

        <Card className="border-white/70 bg-white/80 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="space-y-6 p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Trạng thái hiện tại</Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {vi.userStatus.pending}
              </Badge>
            </div>

            <SectionHeader title={vi.auth.pendingTitle} description={vi.auth.pendingDescription} />

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Trong thời gian chờ duyệt, bạn nên làm gì?
              </p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {nextSteps.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={params.email ? `/verify?email=${encodeURIComponent(params.email)}` : "/verify"}>
                <Button variant="outline">Tôi đã nhận được mã xác thực</Button>
              </Link>
              <Link href="/login">
                <Button>Đến trang đăng nhập</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
