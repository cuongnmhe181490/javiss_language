import { RegistrationStatus, UserStatus } from "@prisma/client";
import { env } from "@/config/env";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { hashPassword } from "@/lib/security/password";
import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/security/verification-code";
import { AppError } from "@/lib/utils/app-error";
import type {
  RegisterInput,
  ResendCodeInput,
  VerifyInput,
} from "@/features/auth/schemas";
import { findExamByCode, findLanguageByCode } from "@/server/repositories/exam.repository";
import {
  createDefaultLearningArtifacts,
  createStudentEntitlements,
  ensureStudentRole,
  findLatestAvailableVerificationCode,
  findLatestVerificationCode,
  findRegistrationById,
  updateUserStatus,
} from "@/server/repositories/registration.repository";
import { findUserByEmail } from "@/server/repositories/user.repository";
import { getSettingValue } from "@/server/repositories/settings.repository";
import { createAuditLog } from "@/server/services/audit.service";
import {
  notifyAdminsOfRegistration,
  sendRejectionEmail,
  sendVerificationCodeEmail,
} from "@/server/services/email.service";

async function getVerificationPolicy() {
  const ttlMinutes = Number(
    (await getSettingValue("verification_code_ttl_minutes")) ??
      env.VERIFICATION_CODE_TTL_MINUTES,
  );
  const maxAttempts = Number(
    (await getSettingValue("verification_max_attempts")) ?? env.VERIFICATION_MAX_ATTEMPTS,
  );
  const resendCooldownSeconds = Number(
    (await getSettingValue("resend_cooldown_seconds")) ?? env.RESEND_COOLDOWN_SECONDS,
  );

  return {
    ttlMinutes,
    maxAttempts,
    resendCooldownSeconds,
  };
}

export async function registerUser(input: RegisterInput, ipAddress?: string | null) {
  await enforceRateLimit(`register:${input.email}`, 3, 15 * 60 * 1000);

  const openRegistration = await getSettingValue("open_registration");
  if (openRegistration === "false") {
    throw new AppError(
      "Hệ thống đang tạm dừng nhận đăng ký mới. Vui lòng thử lại sau.",
      403,
      "REGISTRATION_DISABLED",
    );
  }

  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new AppError("Email này đã tồn tại trong hệ thống.", 409, "EMAIL_EXISTS");
  }

  const [exam, language, studentRole] = await Promise.all([
    findExamByCode(input.targetExam),
    findLanguageByCode(input.preferredLanguage),
    prisma.role.findUnique({ where: { code: "student" } }),
  ]);

  if (!exam || !language || !studentRole) {
    throw new AppError("Dữ liệu đăng ký không hợp lệ.", 400, "INVALID_REGISTRATION_DATA");
  }

  const passwordHash = await hashPassword(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        status: UserStatus.pending,
        profile: {
          create: {
            fullName: input.name,
            preferredLocale: env.DEFAULT_LOCALE,
            preferredLanguageId: language.id,
          },
        },
        roles: {
          create: {
            roleId: studentRole.id,
          },
        },
        goals: {
          create: {
            examId: exam.id,
            languageId: language.id,
            targetScore: input.targetScore,
            status: "active",
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const registration = await tx.registrationRequest.create({
      data: {
        userId: user.id,
        fullName: input.name,
        email: input.email,
        targetExamId: exam.id,
        targetScore: input.targetScore,
        preferredLanguageId: language.id,
        status: RegistrationStatus.pending,
      },
    });

    await tx.adminNotification.create({
      data: {
        title: "Có yêu cầu đăng ký mới",
        body: `${input.name} vừa gửi yêu cầu đăng ký.`,
        entityType: "registration_request",
        entityId: registration.id,
      },
    });

    return { user, registration, exam, language };
  });

  await createAuditLog({
    actorId: result.user.id,
    action: "registration_created",
    targetType: "registration_request",
    targetId: result.registration.id,
    ipAddress,
  });

  await notifyAdminsOfRegistration({
    name: input.name,
    email: input.email,
    targetExam: result.exam.name,
    targetScore: input.targetScore,
    preferredLanguage: result.language.nativeName,
  });

  return {
    message:
      "Đăng ký đã được gửi thành công. Vui lòng chờ quản trị viên phê duyệt tài khoản của bạn.",
  };
}

export async function approveRegistration(input: {
  registrationId: string;
  actorId: string;
  ipAddress?: string | null;
}) {
  const registration = await findRegistrationById(input.registrationId);

  if (!registration) {
    throw new AppError("Không tìm thấy yêu cầu đăng ký.", 404, "REGISTRATION_NOT_FOUND");
  }

  if (registration.status !== RegistrationStatus.pending) {
    throw new AppError("Yêu cầu này không còn ở trạng thái chờ duyệt.", 400, "INVALID_STATE");
  }

  const policy = await getVerificationPolicy();
  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + policy.ttlMinutes * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.registrationRequest.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.approved,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: registration.userId },
      data: {
        status: UserStatus.verification_sent,
      },
    });

    await tx.verificationCode.create({
      data: {
        userId: registration.userId,
        codeHash,
        expiresAt,
        sentToEmail: registration.email,
      },
    });
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "registration_approved",
    targetType: "registration_request",
    targetId: registration.id,
    ipAddress: input.ipAddress,
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "verification_code_sent",
    targetType: "user",
    targetId: registration.userId,
    ipAddress: input.ipAddress,
  });

  await sendVerificationCodeEmail({
    email: registration.email,
    name: registration.fullName,
    code,
  });

  return {
    message: "Đã duyệt yêu cầu và gửi mã xác nhận cho người dùng.",
  };
}

export async function rejectRegistration(input: {
  registrationId: string;
  actorId: string;
  reason?: string;
  ipAddress?: string | null;
}) {
  const registration = await findRegistrationById(input.registrationId);

  if (!registration) {
    throw new AppError("Không tìm thấy yêu cầu đăng ký.", 404, "REGISTRATION_NOT_FOUND");
  }

  if (registration.status !== RegistrationStatus.pending) {
    throw new AppError("Yêu cầu này không còn ở trạng thái chờ duyệt.", 400, "INVALID_STATE");
  }

  await prisma.$transaction(async (tx) => {
    await tx.registrationRequest.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.rejected,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        rejectionReason: input.reason,
      },
    });

    await tx.user.update({
      where: { id: registration.userId },
      data: {
        status: UserStatus.rejected,
      },
    });
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "registration_rejected",
    targetType: "registration_request",
    targetId: registration.id,
    ipAddress: input.ipAddress,
    metadata: { reason: input.reason },
  });

  await sendRejectionEmail({
    email: registration.email,
    name: registration.fullName,
  });

  return {
    message: "Đã từ chối yêu cầu đăng ký.",
  };
}

export async function verifyRegistrationCode(input: VerifyInput, ipAddress?: string | null) {
  await enforceRateLimit(`verify:${input.email}`, 10, 15 * 60 * 1000);

  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError("Không tìm thấy tài khoản tương ứng.", 404, "USER_NOT_FOUND");
  }

  if (
    user.status !== UserStatus.approved &&
    user.status !== UserStatus.verification_sent
  ) {
    if (user.status === UserStatus.active) {
      throw new AppError("Tài khoản này đã được kích hoạt trước đó.", 400, "ALREADY_ACTIVE");
    }

    throw new AppError(
      "Tài khoản hiện không ở trạng thái có thể xác thực mã.",
      400,
      "INVALID_USER_STATUS",
    );
  }

  const policy = await getVerificationPolicy();
  const verification = await findLatestAvailableVerificationCode(user.id);

  if (!verification) {
    throw new AppError("Không tìm thấy mã xác nhận còn hiệu lực.", 404, "CODE_NOT_FOUND");
  }

  if (verification.usedAt) {
    throw new AppError("Mã này đã được sử dụng.", 400, "CODE_ALREADY_USED");
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    throw new AppError("Mã xác nhận đã hết hạn.", 400, "CODE_EXPIRED");
  }

  if (verification.attemptCount >= policy.maxAttempts) {
    throw new AppError(
      "Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu gửi lại mã mới.",
      429,
      "CODE_ATTEMPTS_EXCEEDED",
    );
  }

  const incomingHash = hashVerificationCode(input.code);
  const isValid = incomingHash === verification.codeHash;

  await prisma.verificationCode.update({
    where: { id: verification.id },
    data: {
      attemptCount: {
        increment: 1,
      },
    },
  });

  if (!isValid) {
    await createAuditLog({
      actorId: user.id,
      action: "verification_failed",
      targetType: "verification_code",
      targetId: verification.id,
      ipAddress,
    });

    throw new AppError(
      "Mã xác nhận không đúng. Vui lòng kiểm tra lại và thử tiếp.",
      400,
      "INVALID_CODE",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationCode.update({
      where: { id: verification.id },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.active,
        emailVerifiedAt: new Date(),
      },
    });
  });

  await ensureStudentRole(user.id);
  await createStudentEntitlements(user.id);
  await createDefaultLearningArtifacts(user.id);

  await createAuditLog({
    actorId: user.id,
    action: "verification_succeeded",
    targetType: "user",
    targetId: user.id,
    ipAddress,
  });

  return {
    message: "Xác thực tài khoản thành công. Bạn có thể đăng nhập và bắt đầu học.",
  };
}

export async function resendVerificationCode(input: ResendCodeInput, ipAddress?: string | null) {
  await enforceRateLimit(`resend:${input.email}`, 5, 30 * 60 * 1000);

  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError("Không tìm thấy tài khoản tương ứng.", 404, "USER_NOT_FOUND");
  }

  if (
    user.status !== UserStatus.approved &&
    user.status !== UserStatus.verification_sent
  ) {
    throw new AppError(
      "Tài khoản hiện không thể gửi lại mã xác nhận.",
      400,
      "INVALID_USER_STATUS",
    );
  }

  const policy = await getVerificationPolicy();
  const latestCode = await findLatestVerificationCode(user.id);

  if (latestCode && latestCode.createdAt.getTime() + policy.resendCooldownSeconds * 1000 > Date.now()) {
    throw new AppError(
      "Bạn vừa yêu cầu mã gần đây. Vui lòng chờ thêm trước khi gửi lại.",
      429,
      "RESEND_TOO_SOON",
    );
  }

  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + policy.ttlMinutes * 60 * 1000);

  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt,
      sentToEmail: user.email,
    },
  });

  await updateUserStatus(user.id, UserStatus.verification_sent);

  await createAuditLog({
    actorId: user.id,
    action: "verification_resent",
    targetType: "user",
    targetId: user.id,
    ipAddress,
  });

  await sendVerificationCodeEmail({
    email: user.email,
    name: user.profile?.fullName ?? user.email,
    code,
  });

  logger.info("verification_code_resent", { email: user.email });

  return {
    message: "Đã gửi lại mã xác nhận mới tới email của bạn.",
  };
}
