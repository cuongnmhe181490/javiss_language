import { type AnalyticsEventType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function createAnalyticsEvent(input: {
  tenantId?: string | null;
  userId?: string | null;
  eventType: AnalyticsEventType;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.analyticsEvent.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}

export async function listAnalyticsEvents(params?: {
  eventTypes?: AnalyticsEventType[];
  from?: Date;
  take?: number;
}) {
  return prisma.analyticsEvent.findMany({
    where: {
      eventType: params?.eventTypes ? { in: params.eventTypes } : undefined,
      createdAt: params?.from
        ? {
            gte: params.from,
          }
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: params?.take ?? 500,
  });
}

export async function countAnalyticsEvents(params: {
  eventType: AnalyticsEventType;
  from?: Date;
}) {
  return prisma.analyticsEvent.count({
    where: {
      eventType: params.eventType,
      createdAt: params.from
        ? {
            gte: params.from,
          }
        : undefined,
    },
  });
}
