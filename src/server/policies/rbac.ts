import { AppError } from "@/lib/utils/app-error";
import type { SessionRole } from "@/lib/auth/session";

export function assertHasRole(userRoles: SessionRole[], allowedRoles: SessionRole[]) {
  if (!userRoles.some((role) => allowedRoles.includes(role))) {
    throw new AppError("Bạn không có quyền thực hiện thao tác này.", 403, "FORBIDDEN");
  }
}

export function canManageGlobalSettings(userRoles: SessionRole[]) {
  return userRoles.includes("super_admin");
}
