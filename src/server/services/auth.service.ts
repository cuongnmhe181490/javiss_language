import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/security/password";
import { AppError } from "@/lib/utils/app-error";
import { createAuditLog } from "@/server/services/audit.service";
import { findUserByEmail } from "@/server/repositories/user.repository";

export async function loginUser(input: {
  email: string;
  password: string;
  ipAddress?: string | null;
}) {
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
    const messageMap: Record<UserStatus, { message: string; code: string }> = {
      pending: {
        message: "Tài khoản của bạn vẫn đang chờ đội ngũ phê duyệt.",
        code: "PENDING_APPROVAL",
      },
      approved: {
        message: "Tài khoản đã được duyệt nội bộ. Vui lòng hoàn tất bước xác thực email.",
        code: "APPROVED_PENDING_VERIFICATION",
      },
      verification_sent: {
        message: "Vui lòng nhập mã xác thực đã được gửi tới email của bạn.",
        code: "VERIFICATION_REQUIRED",
      },
      active: {
        message: "",
        code: "ACTIVE",
      },
      rejected: {
        message: "Yêu cầu đăng ký của bạn hiện chưa được phê duyệt.",
        code: "REGISTRATION_REJECTED",
      },
      blocked: {
        message: "Tài khoản của bạn hiện đang bị khóa.",
        code: "ACCOUNT_BLOCKED",
      },
    };

    throw new AppError(messageMap[user.status].message, 403, messageMap[user.status].code);
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
    sessionVersion: user.sessionVersion,
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
