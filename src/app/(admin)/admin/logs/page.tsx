import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await listAuditLogs();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Nhật ký hệ thống"
        description="Theo dõi các hành động nhạy cảm như duyệt đăng ký, gửi mã và khóa tài khoản."
      />
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <thead>
              <tr>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Thời điểm</TableHead>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.actor?.profile?.fullName ?? log.actor?.email ?? "Hệ thống"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.targetType} / {log.targetId}
                  </TableCell>
                  <TableCell>{log.createdAt.toLocaleString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
