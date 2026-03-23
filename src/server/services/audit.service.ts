import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function createAuditLog(input: {
  actorId?: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export async function listAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      actor: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
