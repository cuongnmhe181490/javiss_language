import { AnalyticsEventType, type Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import {
  countDistinctUsersByEventType,
  createAnalyticsEventOnceForUser,
  listAnalyticsEvents,
} from "@/server/repositories/analytics.repository";

type RetentionStageItem = {
  label: string;
  count: number;
  rateFromActivated: string;
};

function formatPercentage(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return "0.0%";
  }

  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function getMetadataValue(
  metadata: Prisma.JsonValue | null | undefined,
  key: string,
) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, Prisma.JsonValue | undefined>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

async function trackFirstLearnerEvent(input: {
  tenantId?: string | null;
  userId: string;
  eventType: AnalyticsEventType;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await createAnalyticsEventOnceForUser({
      tenantId: input.tenantId,
      userId: input.userId,
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    });
  } catch (error) {
    logger.warn("learner_retention_analytics_tracking_failed", {
      userId: input.userId,
      eventType: input.eventType,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function trackLearnerDashboardFirstVisit(input: {
  tenantId?: string | null;
  userId: string;
}) {
  await trackFirstLearnerEvent({
    tenantId: input.tenantId,
    userId: input.userId,
    eventType: AnalyticsEventType.learner_dashboard_first_visited,
    entityType: "learner_dashboard",
  });
}

export async function trackLessonCatalogFirstOpen(input: {
  tenantId?: string | null;
  userId: string;
}) {
  await trackFirstLearnerEvent({
    tenantId: input.tenantId,
    userId: input.userId,
    eventType: AnalyticsEventType.lesson_catalog_first_opened,
    entityType: "lesson_catalog",
  });
}

export async function trackSpeakingMockFirstStart(input: {
  tenantId?: string | null;
  userId: string;
  conversationId: string;
  scenario?: string | null;
}) {
  await trackFirstLearnerEvent({
    tenantId: input.tenantId,
    userId: input.userId,
    eventType: AnalyticsEventType.speaking_mock_first_started,
    entityType: "ai_conversation",
    entityId: input.conversationId,
    metadata: {
      scenario: input.scenario ?? null,
    },
  });
}

export async function trackWritingFeedbackFirstCompletion(input: {
  tenantId?: string | null;
  userId: string;
  submissionId: string;
  taskType: string;
}) {
  await trackFirstLearnerEvent({
    tenantId: input.tenantId,
    userId: input.userId,
    eventType: AnalyticsEventType.writing_feedback_first_completed,
    entityType: "writing_feedback_submission",
    entityId: input.submissionId,
    metadata: {
      taskType: input.taskType,
    },
  });
}

export async function getLearnerRetentionSummary() {
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    activatedUsers,
    firstDashboardVisits,
    firstLessonOpens,
    firstSpeakingStarts,
    firstWritingCompletions,
    learningStartEvents,
  ] = await Promise.all([
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.account_activated,
      from,
    }),
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.learner_dashboard_first_visited,
      from,
    }),
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.lesson_catalog_first_opened,
      from,
    }),
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.speaking_mock_first_started,
      from,
    }),
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.writing_feedback_first_completed,
      from,
    }),
    listAnalyticsEvents({
      eventTypes: [
        AnalyticsEventType.lesson_catalog_first_opened,
        AnalyticsEventType.speaking_mock_first_started,
        AnalyticsEventType.writing_feedback_first_completed,
      ],
      from,
      take: 2000,
    }),
  ]);

  const startedLearningUsers = new Set<string>();
  const learningActionCounts = new Map<string, number>();

  for (const event of learningStartEvents) {
    if (event.userId) {
      startedLearningUsers.add(event.userId);
    }

    if (event.eventType === AnalyticsEventType.lesson_catalog_first_opened) {
      learningActionCounts.set(
        "lesson",
        (learningActionCounts.get("lesson") ?? 0) + 1,
      );
    }

    if (event.eventType === AnalyticsEventType.speaking_mock_first_started) {
      learningActionCounts.set(
        "speaking",
        (learningActionCounts.get("speaking") ?? 0) + 1,
      );
    }

    if (event.eventType === AnalyticsEventType.writing_feedback_first_completed) {
      learningActionCounts.set(
        "writing",
        (learningActionCounts.get("writing") ?? 0) + 1,
      );
    }
  }

  const latestSpeakingTopic =
    learningStartEvents.find(
      (event) => event.eventType === AnalyticsEventType.speaking_mock_first_started,
    ) ?? null;

  return {
    periodLabel: "30 ngày gần đây",
    activatedUsers,
    firstDashboardVisits,
    firstLessonOpens,
    firstSpeakingStarts,
    firstWritingCompletions,
    startedLearningUsers: startedLearningUsers.size,
    dashboardVisitRate: formatPercentage(firstDashboardVisits, activatedUsers),
    lessonOpenRate: formatPercentage(firstLessonOpens, activatedUsers),
    speakingStartRate: formatPercentage(firstSpeakingStarts, activatedUsers),
    writingCompletionRate: formatPercentage(firstWritingCompletions, activatedUsers),
    learningStartRate: formatPercentage(startedLearningUsers.size, activatedUsers),
    topLearningAction:
      [...learningActionCounts.entries()]
        .sort((left, right) => right[1] - left[1])[0]?.[0] ?? null,
    latestSpeakingTopic:
      getMetadataValue(latestSpeakingTopic?.metadata, "scenario") ?? null,
    stageItems: [
      {
        label: "Vào dashboard lần đầu",
        count: firstDashboardVisits,
        rateFromActivated: formatPercentage(firstDashboardVisits, activatedUsers),
      },
      {
        label: "Mở khu bài luyện",
        count: firstLessonOpens,
        rateFromActivated: formatPercentage(firstLessonOpens, activatedUsers),
      },
      {
        label: "Bắt đầu speaking",
        count: firstSpeakingStarts,
        rateFromActivated: formatPercentage(firstSpeakingStarts, activatedUsers),
      },
      {
        label: "Gửi writing đầu tiên",
        count: firstWritingCompletions,
        rateFromActivated: formatPercentage(firstWritingCompletions, activatedUsers),
      },
    ] satisfies RetentionStageItem[],
  };
}
