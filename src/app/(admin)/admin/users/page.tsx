import { ToggleUserBlock } from "@/components/admin/toggle-user-block";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { listUsers } from "@/server/repositories/user.repository";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const users = await listUsers(params.q);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Người dùng"
        description="Theo dõi trạng thái tài khoản và thao tác khóa hoặc mở khóa nhanh."
      />
      <Card>
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input defaultValue={params.q} name="q" placeholder="Tìm theo họ tên hoặc email" />
            <button
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              type="submit"
            >
              Tìm kiếm
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Chưa có người dùng phù hợp"
                description="Hãy thay đổi từ khóa tìm kiếm."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.profile?.fullName ?? "Chưa có tên"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.roles.map((role) => role.role.code).join(", ")}</TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>{user.createdAt.toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        <ToggleUserBlock
                          userId={user.id}
                          isBlocked={user.status === "blocked"}
                        />
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
