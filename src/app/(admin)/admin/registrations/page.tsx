import { RegistrationStatus } from "@prisma/client";
import { RegistrationActions } from "@/components/admin/registration-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { listRegistrations } from "@/server/repositories/registration.repository";

export const dynamic = "force-dynamic";

const registrationStatusLabel: Record<RegistrationStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
};

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: RegistrationStatus; q?: string }>;
}) {
  const params = await searchParams;
  const registrations = await listRegistrations({
    status: params.status,
    query: params.q,
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Yêu cầu đăng ký"
        description="Duyệt hoặc từ chối yêu cầu trước khi gửi mã xác thực cho người học."
      />
      <Card>
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <Input
              defaultValue={params.q}
              name="q"
              placeholder="Tìm theo họ tên hoặc email"
            />
            <Select defaultValue={params.status ?? ""} name="status">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </Select>
            <button
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              type="submit"
            >
              Áp dụng bộ lọc
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {registrations.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Chưa có yêu cầu phù hợp"
                description="Hãy thay đổi bộ lọc hoặc chờ yêu cầu đăng ký mới."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <TableHead>Người đăng ký</TableHead>
                    <TableHead>Kỳ thi</TableHead>
                    <TableHead>Điểm mục tiêu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-950 dark:text-white">
                          {registration.fullName}
                        </p>
                        <p className="text-xs text-slate-500">{registration.email}</p>
                      </TableCell>
                      <TableCell>{registration.targetExam?.name ?? "Chưa chọn"}</TableCell>
                      <TableCell>{registration.targetScore ?? "Chưa đặt"}</TableCell>
                      <TableCell>
                        <Badge>{registrationStatusLabel[registration.status]}</Badge>
                      </TableCell>
                      <TableCell className="min-w-72">
                        {registration.status === "pending" ? (
                          <RegistrationActions registrationId={registration.id} />
                        ) : (
                          <p className="text-sm text-slate-500">
                            Đã xử lý lúc {registration.reviewedAt?.toLocaleString("vi-VN") ?? "N/A"}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
