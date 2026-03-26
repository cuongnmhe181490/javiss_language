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
