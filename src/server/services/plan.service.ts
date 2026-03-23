import { AppError } from "@/lib/utils/app-error";
import type { CreatePlanInput } from "@/features/admin/schemas";
import { createPlan } from "@/server/repositories/plan.repository";
import { createAuditLog } from "@/server/services/audit.service";

export async function createSubscriptionPlan(input: {
  actorId: string;
  actorRoles: Array<"super_admin" | "admin" | "teacher" | "student">;
  values: CreatePlanInput;
  ipAddress?: string | null;
}) {
  if (!input.actorRoles.some((role) => ["super_admin", "admin"].includes(role))) {
    throw new AppError("Bạn không có quyền tạo gói học mới.", 403, "FORBIDDEN");
  }

  const plan = await createPlan({
    code: input.values.code,
    name: input.values.name,
    description: input.values.description,
    priceCents: input.values.priceCents,
    currency: input.values.currency.toUpperCase(),
    isDefault: input.values.isDefault,
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "settings_updated",
    targetType: "subscription_plan",
    targetId: plan.id,
    ipAddress: input.ipAddress,
    metadata: {
      code: plan.code,
      isDefault: plan.isDefault,
    },
  });

  return {
    message: "Đã tạo gói học mới.",
  };
}
