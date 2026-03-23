import { AppError } from "@/lib/utils/app-error";
import { hashPassword } from "@/lib/security/password";
import type { CreateAdminInput } from "@/features/admin/schemas";
import type { UpdateProfileInput } from "@/features/auth/schemas";
import { assertHasRole, canManageGlobalSettings } from "@/server/policies/rbac";
import {
  createAdminUser,
  findUserByEmail,
  updateUserLearningProfile,
} from "@/server/repositories/user.repository";
import { createAuditLog } from "@/server/services/audit.service";

function parseCommaSeparated(input?: string) {
  return (input ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createAdminAccount(input: {
  actorId: string;
  actorRoles: Array<"super_admin" | "admin" | "teacher" | "student">;
  values: CreateAdminInput;
  ipAddress?: string | null;
}) {
  assertHasRole(input.actorRoles, ["super_admin"]);

  if (!canManageGlobalSettings(input.actorRoles)) {
    throw new AppError("Chỉ super admin mới được tạo admin mới.", 403, "FORBIDDEN");
  }

  const existingUser = await findUserByEmail(input.values.email);
  if (existingUser) {
    throw new AppError("Email này đã tồn tại trong hệ thống.", 409, "EMAIL_EXISTS");
  }

  const passwordHash = await hashPassword(input.values.password);
  const admin = await createAdminUser({
    email: input.values.email,
    passwordHash,
    fullName: input.values.fullName,
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "admin_created",
    targetType: "user",
    targetId: admin.id,
    ipAddress: input.ipAddress,
    metadata: {
      email: admin.email,
      roles: admin.roles.map((item) => item.role.code),
    },
  });

  return {
    message: "Đã tạo tài khoản admin mới.",
  };
}

export async function updateStudentProfile(input: {
  actorId: string;
  values: UpdateProfileInput;
  ipAddress?: string | null;
}) {
  const updated = await updateUserLearningProfile({
    userId: input.actorId,
    fullName: input.values.fullName,
    currentLevel: input.values.currentLevel,
    strongestSkills: parseCommaSeparated(input.values.strongestSkills),
    weakestSkills: parseCommaSeparated(input.values.weakestSkills),
    preferredStudyWindow: input.values.preferredStudyWindow,
    onboardingNotes: input.values.onboardingNotes,
    targetScore: input.values.targetScore,
    estimatedLevel: input.values.estimatedLevel,
    preferredSchedule: input.values.preferredSchedule,
    targetExamDate: input.values.targetExamDate
      ? new Date(input.values.targetExamDate)
      : null,
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "profile_updated",
    targetType: "user",
    targetId: input.actorId,
    ipAddress: input.ipAddress,
  });

  return {
    message: "Đã cập nhật hồ sơ học tập.",
    user: updated,
  };
}
