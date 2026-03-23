import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/app-error";
import { createAuditLog, listAuditLogs } from "@/server/services/audit.service";

export async function toggleBlockUser(input: {
  actorId: string;
  userId: string;
  ipAddress?: string | null;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng.", 404, "USER_NOT_FOUND");
  }

  const nextStatus = user.status === UserStatus.blocked ? UserStatus.active : UserStatus.blocked;

  await prisma.user.update({
    where: { id: user.id },
    data: { status: nextStatus },
  });

  await createAuditLog({
    actorId: input.actorId,
    action: nextStatus === UserStatus.blocked ? "user_blocked" : "user_unblocked",
    targetType: "user",
    targetId: user.id,
    ipAddress: input.ipAddress,
  });

  return {
    message:
      nextStatus === UserStatus.blocked
        ? "Đã khóa tài khoản người dùng."
        : "Đã mở khóa tài khoản người dùng.",
  };
}

export { listAuditLogs };
