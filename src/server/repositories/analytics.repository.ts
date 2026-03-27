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

export async function findAnalyticsEventForUser(params: {
  userId: string;
  eventType: AnalyticsEventType;
}) {
  return prisma.analyticsEvent.findFirst({
    where: {
      userId: params.userId,
      eventType: params.eventType,
    },
    select: {
      id: true,
    },
  });
}

export async function findFirstAnalyticsEventForUser(params: {
  userId: string;
  eventTypes: AnalyticsEventType[];
}) {
  return prisma.analyticsEvent.findFirst({
    where: {
      userId: params.userId,
      eventType: {
        in: params.eventTypes,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      eventType: true,
      createdAt: true,
      metadata: true,
    },
  });
}

export async function createAnalyticsEventOnceForUser(input: {
  tenantId?: string | null;
  userId: string;
  eventType: AnalyticsEventType;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  const existingEvent = await findAnalyticsEventForUser({
    userId: input.userId,
    eventType: input.eventType,
  });

  if (existingEvent) {
    return existingEvent;
  }

  return createAnalyticsEvent(input);
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

export async function countDistinctUsersByEventType(params: {
  eventType: AnalyticsEventType;
  from?: Date;
}) {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["userId"],
    where: {
      userId: {
        not: null,
      },
      eventType: params.eventType,
      createdAt: params.from
        ? {
            gte: params.from,
          }
        : undefined,
    },
  });

  return rows.length;
}
