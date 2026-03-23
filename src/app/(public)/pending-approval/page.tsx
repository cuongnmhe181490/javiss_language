import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="space-y-6 p-8">
            <SectionHeader
              title={vi.auth.pendingTitle}
              description={vi.auth.pendingDescription}
            />
            <div className="flex gap-3">
              <Link href="/verify">
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
