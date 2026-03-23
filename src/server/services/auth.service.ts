import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/security/password";
import { AppError } from "@/lib/utils/app-error";
import { createAuditLog } from "@/server/services/audit.service";
import { findUserByEmail } from "@/server/repositories/user.repository";

export async function loginUser(input: { email: string; password: string; ipAddress?: string | null }) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    await createAuditLog({
      action: "login_failed",
      targetType: "user",
      targetId: input.email,
      ipAddress: input.ipAddress,
      metadata: { reason: "user_not_found" },
    });
    throw new AppError("Email hoặc mật khẩu không đúng.", 401, "INVALID_CREDENTIALS");
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    await createAuditLog({
      actorId: user.id,
      action: "login_failed",
      targetType: "user",
      targetId: user.id,
      ipAddress: input.ipAddress,
      metadata: { reason: "password_mismatch" },
    });
    throw new AppError("Email hoặc mật khẩu không đúng.", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== UserStatus.active) {
    const messageMap: Record<UserStatus, string> = {
      pending: "Tài khoản của bạn vẫn đang chờ admin duyệt.",
      approved: "Tài khoản đã được duyệt nội bộ, vui lòng hoàn tất bước xác thực mã.",
      verification_sent: "Vui lòng nhập mã xác thực đã được gửi tới email của bạn.",
      active: "",
      rejected: "Yêu cầu đăng ký của bạn đã bị từ chối.",
      blocked: "Tài khoản của bạn hiện đang bị khóa.",
    };
    throw new AppError(messageMap[user.status], 403, "USER_NOT_ACTIVE");
  }

  const roles = user.roles.map((item) => item.role.code) as Array<
    "super_admin" | "admin" | "teacher" | "student"
  >;

  const token = await signSession({
    userId: user.id,
    email: user.email,
    status: user.status,
    roles,
    fullName: user.profile?.fullName ?? user.email,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createAuditLog({
    actorId: user.id,
    action: "login_succeeded",
    targetType: "user",
    targetId: user.id,
    ipAddress: input.ipAddress,
  });

  return {
    token,
    user,
  };
}
