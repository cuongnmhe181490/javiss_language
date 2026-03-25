import { UserStatus } from "@prisma/client";
import { env } from "@/config/env";
import type { ForgotPasswordInput, ResetPasswordInput } from "@/features/auth/schemas";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { hashPassword } from "@/lib/security/password";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/security/password-reset";
import { AppError } from "@/lib/utils/app-error";
import {
  completePasswordReset,
  createPasswordResetToken,
  findPasswordResetTokenByHash,
  invalidateActivePasswordResetTokens,
} from "@/server/repositories/password-reset.repository";
import { findUserByEmail } from "@/server/repositories/user.repository";
import { createAuditLog } from "@/server/services/audit.service";
import { sendPasswordResetEmail } from "@/server/services/email.service";

const GENERIC_MESSAGE =
  "Nếu email tồn tại trong hệ thống và tài khoản đã hoạt động, chúng tôi đã gửi liên kết đặt lại mật khẩu tới hộp thư của bạn.";

export async function requestPasswordReset(
  input: ForgotPasswordInput,
  ipAddress?: string | null,
) {
  await enforceRateLimit(`forgot-password:${input.email}`, 3, 15 * 60 * 1000);

  const user = await findUserByEmail(input.email);

  if (!user || user.status !== UserStatus.active) {
    return {
      message: GENERIC_MESSAGE,
    };
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
  const resetUrl = `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await invalidateActivePasswordResetTokens(user.id);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
    sentToEmail: user.email,
  });

  await createAuditLog({
    actorId: user.id,
    action: "password_reset_requested",
    targetType: "user",
    targetId: user.id,
    ipAddress,
  });

  await sendPasswordResetEmail({
    email: user.email,
    name: user.profile?.fullName ?? user.email,
    resetUrl,
  });

  return {
    message: GENERIC_MESSAGE,
  };
}

export async function resetPassword(input: ResetPasswordInput, ipAddress?: string | null) {
  await enforceRateLimit(`reset-password:${input.token}`, 5, 15 * 60 * 1000);

  const tokenHash = hashPasswordResetToken(input.token);
  const resetToken = await findPasswordResetTokenByHash(tokenHash);

  if (!resetToken) {
    throw new AppError("Liên kết đặt lại mật khẩu không hợp lệ.", 400, "INVALID_RESET_TOKEN");
  }

  if (resetToken.usedAt) {
    throw new AppError(
      "Liên kết đặt lại mật khẩu này đã được sử dụng.",
      400,
      "RESET_TOKEN_ALREADY_USED",
    );
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    throw new AppError("Liên kết đặt lại mật khẩu đã hết hạn.", 400, "RESET_TOKEN_EXPIRED");
  }

  if (resetToken.user.status !== UserStatus.active) {
    throw new AppError(
      "Tài khoản hiện không thể đặt lại mật khẩu.",
      400,
      "INVALID_USER_STATUS",
    );
  }

  const passwordHash = await hashPassword(input.password);

  await completePasswordReset({
    tokenId: resetToken.id,
    userId: resetToken.userId,
    passwordHash,
  });

  await createAuditLog({
    actorId: resetToken.userId,
    action: "password_reset_completed",
    targetType: "user",
    targetId: resetToken.userId,
    ipAddress,
  });

  return {
    message: "Mật khẩu mới đã được cập nhật thành công. Bạn có thể đăng nhập lại ngay bây giờ.",
  };
}
