import { RegisterForm } from "@/components/forms/register-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();
  const [exams, languages] = await Promise.all([
    prisma.exam.findMany({ orderBy: { name: "asc" } }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeader title={vi.auth.registerTitle} description={vi.auth.registerDescription} />
        <Card>
          <CardContent className="p-8">
            <RegisterForm exams={exams} languages={languages} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
