import { LoginForm } from "@/components/forms/login-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

const statusCards = [
  {
    key: "pending",
    label: "Đang chờ duyệt",
    description: "Bạn đã gửi hồ sơ nhưng vẫn đang chờ đội ngũ xét duyệt.",
  },
  {
    key: "verification_sent",
    label: "Đã gửi mã xác thực",
    description: "Bạn cần nhập mã đã nhận qua email để kích hoạt tài khoản.",
  },
  {
    key: "rejected",
    label: "Chưa được phê duyệt",
    description: "Hồ sơ hiện chưa phù hợp để mở tài khoản học tập.",
  },
  {
    key: "blocked",
    label: "Tài khoản tạm khóa",
    description: "Bạn cần liên hệ quản trị viên để được hỗ trợ mở lại quyền truy cập.",
  },
];

const bannerMap = {
  pending: {
    title: "Tài khoản của bạn vẫn đang chờ duyệt",
    description: "Bạn chưa thể đăng nhập cho tới khi đội ngũ phê duyệt hồ sơ.",
  },
  verification_sent: {
    title: "Bạn cần xác thực email trước",
    description: "Hãy nhập mã xác thực đã nhận qua email để kích hoạt tài khoản.",
  },
  rejected: {
    title: "Yêu cầu đăng ký hiện chưa được phê duyệt",
    description: "Bạn có thể xem lại trạng thái hồ sơ hoặc liên hệ để được hỗ trợ thêm.",
  },
  blocked: {
    title: "Tài khoản đang tạm khóa",
    description: "Quyền truy cập hiện chưa sẵn sàng. Vui lòng liên hệ quản trị viên.",
  },
} as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: keyof typeof bannerMap }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const banner = params.state ? bannerMap[params.state] : null;

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Badge>Đăng nhập dành cho tài khoản đã kích hoạt</Badge>
          <SectionHeader title={vi.auth.loginTitle} description={vi.auth.loginDescription} />

          {banner ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {banner.title}
              </p>
              <p className="mt-2 text-sm leading-7 text-amber-700 dark:text-amber-300">
                {banner.description}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4">
            {statusCards.map((item) => (
              <Card
                key={item.key}
                className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80"
              >
                <CardContent className="p-5">
                  <p className="font-semibold text-slate-950 dark:text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-white/70 bg-white/80 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="p-8">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
