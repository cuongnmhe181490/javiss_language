import { AppError } from "@/lib/utils/app-error";
import type { UpdateSettingsInput } from "@/features/admin/schemas";
import { canManageGlobalSettings } from "@/server/policies/rbac";
import { upsertSettings } from "@/server/repositories/settings.repository";
import { createAuditLog } from "@/server/services/audit.service";

export async function updateSystemSettings(input: {
  actorId: string;
  actorRoles: string[];
  values: UpdateSettingsInput;
  ipAddress?: string | null;
}) {
  if (!canManageGlobalSettings(input.actorRoles as Array<"super_admin" | "admin" | "teacher" | "student">)) {
    throw new AppError("Chỉ super admin mới được cập nhật cài đặt hệ thống.", 403, "FORBIDDEN");
  }

  await upsertSettings([
    {
      key: "admin_notification_email",
      value: input.values.adminNotificationEmail,
    },
    {
      key: "verification_code_ttl_minutes",
      value: String(input.values.verificationCodeTtlMinutes),
    },
    {
      key: "verification_max_attempts",
      value: String(input.values.verificationMaxAttempts),
    },
    {
      key: "resend_cooldown_seconds",
      value: String(input.values.resendCooldownSeconds),
    },
    {
      key: "open_registration",
      value: String(input.values.openRegistration),
    },
  ]);

  await createAuditLog({
    actorId: input.actorId,
    action: "settings_updated",
    targetType: "system_setting",
    targetId: "global",
    ipAddress: input.ipAddress,
    metadata: {
      adminNotificationEmail: input.values.adminNotificationEmail,
      verificationCodeTtlMinutes: input.values.verificationCodeTtlMinutes,
      verificationMaxAttempts: input.values.verificationMaxAttempts,
      resendCooldownSeconds: input.values.resendCooldownSeconds,
      openRegistration: input.values.openRegistration,
    },
  });

  return {
    message: "Đã cập nhật cài đặt hệ thống.",
  };
}
