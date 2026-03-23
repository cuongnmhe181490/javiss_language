import { CreatePlanForm } from "@/components/admin/create-plan-form";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRoles } from "@/lib/auth/guards";
import { listPlans } from "@/server/repositories/plan.repository";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  await requireRoles(["super_admin", "admin"]);
  const plans = await listPlans();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gói học và license"
        description="Quản lý plan, entitlement và nền tảng phân quyền truy cập theo gói."
      />
      <Card>
        <CardContent className="border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="mb-4 space-y-1">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Tạo gói học mới
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Bạn có thể tạo thêm plan để dùng cho entitlement và license trong giai đoạn tiếp theo.
            </p>
          </div>
          <CreatePlanForm />
        </CardContent>
        <CardContent className="p-6">
          {plans.length === 0 ? (
            <EmptyState title="Chưa có gói học" description="Hãy tạo plan đầu tiên cho hệ thống." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950 dark:text-white">{plan.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {plan.code}
                      </p>
                    </div>
                    {plan.isDefault ? <Badge>Gói mặc định</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {plan.description ?? "Chưa có mô tả."}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <p>Giá: {plan.currency} {plan.priceCents / 100}</p>
                    <p>License: {plan.licenses.length}</p>
                    <p>Entitlement: {plan.entitlements.length}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
