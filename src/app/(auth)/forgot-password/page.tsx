import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeader
          title={vi.auth.forgotPasswordTitle}
          description={vi.auth.forgotPasswordDescription}
        />
        <Card>
          <CardContent className="p-8">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
