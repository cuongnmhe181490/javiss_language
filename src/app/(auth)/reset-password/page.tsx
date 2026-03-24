import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  return (
    <AppShell session={session}>
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeader
          title={vi.auth.resetPasswordTitle}
          description={vi.auth.resetPasswordDescription}
        />
        <Card>
          <CardContent className="p-8">
            {params.token ? (
              <ResetPasswordForm token={params.token} />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {vi.auth.missingResetToken}
                </p>
                <Link href="/forgot-password">
                  <Button className="w-full" type="button">
                    {vi.auth.submitForgotPassword}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
