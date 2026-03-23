import { VerifyForm } from "@/components/forms/verify-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeader title={vi.auth.verifyTitle} description={vi.auth.verifyDescription} />
        <Card>
          <CardContent className="p-8">
            <VerifyForm defaultEmail={params.email ?? ""} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
