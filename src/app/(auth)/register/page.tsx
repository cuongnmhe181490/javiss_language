import { RegisterForm } from "@/components/forms/register-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

const conversionPoints = [
  "Có đội ngũ kiểm duyệt, không mở tài khoản đại trà.",
  "Có dashboard học tập cá nhân ngay sau khi kích hoạt.",
  "Có AI speaking 1:1 để luyện nói theo từng lượt.",
];

export default async function RegisterPage() {
  const session = await getSession();
  const [exams, languages] = await Promise.all([
    prisma.exam.findMany({ orderBy: { name: "asc" } }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Badge>Đăng ký có kiểm duyệt</Badge>
          <SectionHeader title={vi.auth.registerTitle} description={vi.auth.registerDescription} />
          <div className="grid gap-4">
            {conversionPoints.map((item) => (
              <Card
                key={item}
                className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80"
              >
                <CardContent className="p-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {item}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-white/70 bg-white/80 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="p-8">
            <RegisterForm exams={exams} languages={languages} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
