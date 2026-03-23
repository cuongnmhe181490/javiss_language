import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gói học và license"
        description="Nền tảng cho entitlement và phân phối quyền truy cập theo plan."
      />
      <Card>
        <CardContent className="p-6">
          {plans.length === 0 ? (
            <EmptyState
              title="Chưa có gói học"
              description="Hãy thêm plan mới trong giai đoạn tiếp theo."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-950 dark:text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {plan.description ?? "Chưa có mô tả."}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {plan.isDefault ? "Gói mặc định" : "Gói tùy chỉnh"} • {plan.currency}{" "}
                    {plan.priceCents / 100}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
