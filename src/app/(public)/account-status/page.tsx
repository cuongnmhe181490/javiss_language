import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const contentMap = {
  rejected: {
    title: "Yêu cầu đăng ký chưa được phê duyệt",
    description:
      "Tài khoản của bạn hiện đang ở trạng thái bị từ chối. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên để được hỗ trợ.",
  },
  blocked: {
    title: "Tài khoản hiện đang bị khóa",
    description:
      "Quyền truy cập của bạn đã tạm thời bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết và hướng xử lý tiếp theo.",
  },
  unknown: {
    title: "Không thể xác định trạng thái tài khoản",
    description:
      "Hệ thống chưa xác định được trạng thái hiện tại của tài khoản. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
  },
} as const;

export default async function AccountStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: keyof typeof contentMap }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const content = contentMap[params.state ?? "unknown"] ?? contentMap.unknown;

  return (
    <AppShell session={session}>
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="space-y-6 p-8">
            <SectionHeader title={content.title} description={content.description} />
            <div className="flex gap-3">
              <Link href="/login">
                <Button>Quay lại đăng nhập</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Về trang chủ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
