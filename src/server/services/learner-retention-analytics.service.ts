import { AnalyticsEventType, type Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
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

type CohortItem = {
  cohortLabel: string;
  activatedUsers: number;
  startedLearningUsers: number;
  learningStartRate: string;
  repeatLearners: number;
  repeatRate: string;
};

type SegmentItem = {
  label: string;
  activatedUsers: number;
  startedLearningUsers: number;
  learningStartRate: string;
  repeatLearners: number;
  repeatRate: string;
};

type FirstPathItem = {
  label: string;
  startedUsers: number;
  repeatLearners: number;
  repeatRate: string;
  d7ReturnedUsers: number;
  d7ReturnRate: string;
  d30ReturnedUsers: number;
  d30ReturnRate: string;
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

function formatHours(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value < 24) {
    return `${value.toFixed(1)} giờ`;
  }

  return `${(value / 24).toFixed(1)} ngày`;
}

function normalizeSegmentLabel(value: string | null | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

function formatDecimal(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value.toFixed(1);
}

function formatSignedDecimal(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function parseNumeric(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function averageNumbers(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function medianNumbers(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  }

  return sortedValues[middleIndex];
}

function getLearningPathKey(eventType: AnalyticsEventType) {
  switch (eventType) {
    case AnalyticsEventType.lesson_catalog_first_opened:
      return "lesson";
    case AnalyticsEventType.speaking_mock_first_started:
      return "speaking";
    case AnalyticsEventType.exercise_first_submitted:
      return "exercise";
    case AnalyticsEventType.writing_feedback_first_completed:
      return "writing";
    default:
      return null;
  }
}

function getLearningPathLabel(pathKey: string) {
  switch (pathKey) {
    case "lesson":
      return "Bắt đầu từ khu bài luyện";
    case "speaking":
      return "Bắt đầu từ speaking mock";
    case "exercise":
      return "Bắt đầu từ exercise";
    case "writing":
      return "Bắt đầu từ writing feedback";
    default:
      return "Hành động khác";
  }
}

function getWeekStart(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);

  return start;
}

function getWeekLabel(date: Date) {
  const start = getWeekStart(date);

  return start.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
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

export async function trackSpeakingMockFirstCompletion(input: {
  tenantId?: string | null;
  userId: string;
  conversationId: string;
}) {
  await trackFirstLearnerEvent({
    tenantId: input.tenantId,
    userId: input.userId,
    eventType: AnalyticsEventType.speaking_mock_first_completed,
    entityType: "ai_conversation",
    entityId: input.conversationId,
  });
}

export async function trackExerciseFirstSubmission(input: {
  tenantId?: string | null;
  userId: string;
  exerciseId: string;
  attemptId: string;
}) {
  await trackFirstLearnerEvent({
    tenantId: input.tenantId,
    userId: input.userId,
    eventType: AnalyticsEventType.exercise_first_submitted,
    entityType: "exercise_attempt",
    entityId: input.attemptId,
    metadata: {
      exerciseId: input.exerciseId,
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
    firstSpeakingCompletions,
    firstExerciseSubmissions,
    firstWritingCompletions,
    activationEvents,
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
      eventType: AnalyticsEventType.speaking_mock_first_completed,
      from,
    }),
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.exercise_first_submitted,
      from,
    }),
    countDistinctUsersByEventType({
      eventType: AnalyticsEventType.writing_feedback_first_completed,
      from,
    }),
    listAnalyticsEvents({
      eventTypes: [AnalyticsEventType.account_activated],
      from,
      take: 2000,
    }),
    listAnalyticsEvents({
      eventTypes: [
        AnalyticsEventType.lesson_catalog_first_opened,
        AnalyticsEventType.speaking_mock_first_started,
        AnalyticsEventType.speaking_mock_first_completed,
        AnalyticsEventType.exercise_first_submitted,
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

    if (event.eventType === AnalyticsEventType.exercise_first_submitted) {
      learningActionCounts.set(
        "exercise",
        (learningActionCounts.get("exercise") ?? 0) + 1,
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
  const firstLearningPathByUser = new Map<string, string>();

  const activationByUser = new Map<string, Date>();
  const firstLearningActionByUser = new Map<string, Date>();
  const firstRegistrationSourceByUser = new Map<string, string>();
  const cohortMap = new Map<
    string,
    {
      cohortLabel: string;
      activatedUsers: Set<string>;
      startedLearningUsers: Set<string>;
      repeatedUsers: Set<string>;
    }
  >();

  for (const event of activationEvents) {
    if (!event.userId) {
      continue;
    }

    if (!activationByUser.has(event.userId)) {
      activationByUser.set(event.userId, event.createdAt);
    }

    const cohortStart = getWeekStart(event.createdAt);
    const cohortKey = cohortStart.toISOString();
    const current = cohortMap.get(cohortKey) ?? {
      cohortLabel: getWeekLabel(event.createdAt),
      activatedUsers: new Set<string>(),
      startedLearningUsers: new Set<string>(),
      repeatedUsers: new Set<string>(),
    };
    current.activatedUsers.add(event.userId);
    cohortMap.set(cohortKey, current);
  }

  const registrationSubmissionEvents = await listAnalyticsEvents({
    eventTypes: [AnalyticsEventType.registration_submitted],
    take: 4000,
  });

  for (const event of [...registrationSubmissionEvents].reverse()) {
    if (!event.userId || !activationByUser.has(event.userId)) {
      continue;
    }

    if (!firstRegistrationSourceByUser.has(event.userId)) {
      firstRegistrationSourceByUser.set(
        event.userId,
        getMetadataValue(event.metadata, "attributionSource") ?? "direct",
      );
    }
  }

  const learningStartEventsAscending = [...learningStartEvents].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );

  for (const event of learningStartEventsAscending) {
    if (!event.userId) {
      continue;
    }

    if (!firstLearningActionByUser.has(event.userId)) {
      firstLearningActionByUser.set(event.userId, event.createdAt);
    }

    if (!firstLearningPathByUser.has(event.userId)) {
      const learningPathKey = getLearningPathKey(event.eventType);

      if (learningPathKey) {
        firstLearningPathByUser.set(event.userId, learningPathKey);
      }
    }
  }

  const timeDiffHours: number[] = [];

  for (const [userId, activatedAt] of activationByUser.entries()) {
    const firstActionAt = firstLearningActionByUser.get(userId);

    if (firstActionAt) {
      timeDiffHours.push(
        (firstActionAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60),
      );

      const cohortKey = getWeekStart(activatedAt).toISOString();
      const current = cohortMap.get(cohortKey);
      current?.startedLearningUsers.add(userId);
    }
  }

  const averageTimeToLearningStartHours =
    timeDiffHours.length > 0
      ? timeDiffHours.reduce((sum, value) => sum + value, 0) / timeDiffHours.length
      : null;
  const medianTimeToLearningStartHours = medianNumbers(timeDiffHours);

  const activatedUserIds = [...activationByUser.keys()];
  const activatedUsersData =
    activatedUserIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: {
              in: activatedUserIds,
            },
          },
          include: {
            goals: {
              include: {
                exam: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            licenses: {
              include: {
                plan: true,
              },
              where: {
                status: "active",
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            entitlements: {
              include: {
                plan: true,
              },
              where: {
                status: "active",
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        })
      : [];

  const repeatWindowFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rolling30WindowFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    speakingRepeatRows,
    writingRepeatRows,
    exerciseRepeatRows,
    speakingRolling30Rows,
    writingRolling30Rows,
    exerciseRolling30Rows,
  ] =
    activatedUserIds.length > 0
      ? await Promise.all([
          prisma.aiConversation.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: activatedUserIds,
              },
              kind: "speaking_mock",
              createdAt: {
                gte: repeatWindowFrom,
              },
            },
            _count: {
              _all: true,
            },
          }),
          prisma.writingFeedbackSubmission.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: activatedUserIds,
              },
              createdAt: {
                gte: repeatWindowFrom,
              },
            },
            _count: {
              _all: true,
            },
          }),
          prisma.exerciseAttempt.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: activatedUserIds,
              },
              status: "submitted",
              submittedAt: {
                gte: repeatWindowFrom,
              },
            },
            _count: {
              _all: true,
            },
          }),
          prisma.aiConversation.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: activatedUserIds,
              },
              kind: "speaking_mock",
              createdAt: {
                gte: rolling30WindowFrom,
              },
            },
            _count: {
              _all: true,
            },
          }),
          prisma.writingFeedbackSubmission.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: activatedUserIds,
              },
              createdAt: {
                gte: rolling30WindowFrom,
              },
            },
            _count: {
              _all: true,
            },
          }),
          prisma.exerciseAttempt.groupBy({
            by: ["userId"],
            where: {
              userId: {
                in: activatedUserIds,
              },
              status: "submitted",
              submittedAt: {
                gte: rolling30WindowFrom,
              },
            },
            _count: {
              _all: true,
            },
          }),
        ])
      : [[], [], [], [], [], []];

  const repeatUsageByUser = new Map<
    string,
    {
      speaking: number;
      writing: number;
      exercise: number;
    }
  >();

  for (const row of speakingRepeatRows) {
    const current = repeatUsageByUser.get(row.userId) ?? {
      speaking: 0,
      writing: 0,
      exercise: 0,
    };
    current.speaking = row._count._all;
    repeatUsageByUser.set(row.userId, current);
  }

  for (const row of writingRepeatRows) {
    const current = repeatUsageByUser.get(row.userId) ?? {
      speaking: 0,
      writing: 0,
      exercise: 0,
    };
    current.writing = row._count._all;
    repeatUsageByUser.set(row.userId, current);
  }

  for (const row of exerciseRepeatRows) {
    const current = repeatUsageByUser.get(row.userId) ?? {
      speaking: 0,
      writing: 0,
      exercise: 0,
    };
    current.exercise = row._count._all;
    repeatUsageByUser.set(row.userId, current);
  }

  const repeatLearners = new Set<string>();
  const multiSurfaceLearners = new Set<string>();
  let totalLearningActionsLast7Days = 0;

  for (const [userId, usage] of repeatUsageByUser.entries()) {
    const totalActions = usage.speaking + usage.writing + usage.exercise;
    const activeSurfaceCount = [usage.speaking, usage.writing, usage.exercise].filter(
      (count) => count > 0,
    ).length;

    totalLearningActionsLast7Days += totalActions;

    if (totalActions >= 2) {
      repeatLearners.add(userId);
    }

    if (activeSurfaceCount >= 2) {
      multiSurfaceLearners.add(userId);
    }
  }

  for (const [userId, activatedAt] of activationByUser.entries()) {
    if (!repeatLearners.has(userId)) {
      continue;
    }

    const cohortKey = getWeekStart(activatedAt).toISOString();
    const current = cohortMap.get(cohortKey);
    current?.repeatedUsers.add(userId);
  }

  const activeLearnersLast7Days = repeatUsageByUser.size;
  const averageActionsPerActiveLearner =
    activeLearnersLast7Days > 0
      ? totalLearningActionsLast7Days / activeLearnersLast7Days
      : null;
  const repeatLearnerRate =
    activatedUsers > 0 ? (repeatLearners.size / activatedUsers) * 100 : 0;
  const multiSurfaceRate =
    activatedUsers > 0 ? (multiSurfaceLearners.size / activatedUsers) * 100 : 0;
  const actionDepthRate =
    averageActionsPerActiveLearner && averageActionsPerActiveLearner > 0
      ? Math.min(averageActionsPerActiveLearner / 3, 1) * 100
      : 0;
  const repeatLearnerQualityScore = Math.round(
    repeatLearnerRate * 0.45 + multiSurfaceRate * 0.35 + actionDepthRate * 0.2,
  );
  const topRepeatSurface =
    [
      { key: "speaking", count: speakingRepeatRows.reduce((sum, row) => sum + row._count._all, 0) },
      { key: "writing", count: writingRepeatRows.reduce((sum, row) => sum + row._count._all, 0) },
      { key: "exercise", count: exerciseRepeatRows.reduce((sum, row) => sum + row._count._all, 0) },
    ].sort((left, right) => right.count - left.count)[0]?.key ?? null;

  const rolling30UsageByUser = new Map<
    string,
    {
      speaking: number;
      writing: number;
      exercise: number;
    }
  >();

  for (const row of speakingRolling30Rows) {
    const current = rolling30UsageByUser.get(row.userId) ?? {
      speaking: 0,
      writing: 0,
      exercise: 0,
    };
    current.speaking = row._count._all;
    rolling30UsageByUser.set(row.userId, current);
  }

  for (const row of writingRolling30Rows) {
    const current = rolling30UsageByUser.get(row.userId) ?? {
      speaking: 0,
      writing: 0,
      exercise: 0,
    };
    current.writing = row._count._all;
    rolling30UsageByUser.set(row.userId, current);
  }

  for (const row of exerciseRolling30Rows) {
    const current = rolling30UsageByUser.get(row.userId) ?? {
      speaking: 0,
      writing: 0,
      exercise: 0,
    };
    current.exercise = row._count._all;
    rolling30UsageByUser.set(row.userId, current);
  }

  const rolling30RepeatLearners = new Set<string>();
  const rolling30MultiSurfaceLearners = new Set<string>();
  let rolling30TotalActions = 0;

  for (const [userId, usage] of rolling30UsageByUser.entries()) {
    const totalActions = usage.speaking + usage.writing + usage.exercise;
    const activeSurfaceCount = [usage.speaking, usage.writing, usage.exercise].filter(
      (count) => count > 0,
    ).length;

    rolling30TotalActions += totalActions;

    if (totalActions >= 2) {
      rolling30RepeatLearners.add(userId);
    }

    if (activeSurfaceCount >= 2) {
      rolling30MultiSurfaceLearners.add(userId);
    }
  }

  const rolling30ActiveLearners = rolling30UsageByUser.size;
  const rolling30AverageActionsPerActiveLearner =
    rolling30ActiveLearners > 0
      ? rolling30TotalActions / rolling30ActiveLearners
      : null;

  const [speakingActivityRows, writingActivityRows, exerciseActivityRows, latestSnapshots] =
    activatedUserIds.length > 0
      ? await Promise.all([
          prisma.aiConversation.findMany({
            where: {
              userId: {
                in: activatedUserIds,
              },
              kind: "speaking_mock",
            },
            select: {
              userId: true,
              createdAt: true,
              speakingCompletedAt: true,
              speakingFinalBand: true,
              speakingEstimatedBand: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
          }),
          prisma.writingFeedbackSubmission.findMany({
            where: {
              userId: {
                in: activatedUserIds,
              },
            },
            select: {
              userId: true,
              createdAt: true,
              overallBand: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
          prisma.exerciseAttempt.findMany({
            where: {
              userId: {
                in: activatedUserIds,
              },
              status: "submitted",
            },
            select: {
              userId: true,
              createdAt: true,
              submittedAt: true,
            },
            orderBy: {
              submittedAt: "desc",
            },
          }),
          prisma.progressSnapshot.findMany({
            where: {
              userId: {
                in: activatedUserIds,
              },
            },
            select: {
              userId: true,
              overallProgress: true,
              speakingProgress: true,
              writingProgress: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
        ])
      : [[], [], [], []];

  const activityDatesByUser = new Map<string, Date[]>();

  for (const row of speakingActivityRows) {
    const current = activityDatesByUser.get(row.userId) ?? [];
    current.push(row.createdAt);
    if (row.speakingCompletedAt) {
      current.push(row.speakingCompletedAt);
    }
    activityDatesByUser.set(row.userId, current);
  }

  for (const row of writingActivityRows) {
    const current = activityDatesByUser.get(row.userId) ?? [];
    current.push(row.createdAt);
    activityDatesByUser.set(row.userId, current);
  }

  for (const row of exerciseActivityRows) {
    const current = activityDatesByUser.get(row.userId) ?? [];
    current.push(row.submittedAt ?? row.createdAt);
    activityDatesByUser.set(row.userId, current);
  }

  let d1Eligible = 0;
  let d1Returned = 0;
  let d7Eligible = 0;
  let d7Returned = 0;
  let d14Eligible = 0;
  let d14Returned = 0;
  let d30Eligible = 0;
  let d30Returned = 0;
  const d7ReturnedUsers = new Set<string>();
  const d30ReturnedUsers = new Set<string>();

  for (const [userId, activatedAt] of activationByUser.entries()) {
    const activityDates = activityDatesByUser.get(userId) ?? [];
    const elapsedMs = Date.now() - activatedAt.getTime();
    const day1Threshold = activatedAt.getTime() + 24 * 60 * 60 * 1000;
    const day7Threshold = activatedAt.getTime() + 7 * 24 * 60 * 60 * 1000;
    const day14Threshold = activatedAt.getTime() + 14 * 24 * 60 * 60 * 1000;
    const day30Threshold = activatedAt.getTime() + 30 * 24 * 60 * 60 * 1000;

    if (elapsedMs >= 24 * 60 * 60 * 1000) {
      d1Eligible += 1;
      if (activityDates.some((date) => date.getTime() >= day1Threshold)) {
        d1Returned += 1;
      }
    }

    if (elapsedMs >= 7 * 24 * 60 * 60 * 1000) {
      d7Eligible += 1;
      if (activityDates.some((date) => date.getTime() >= day7Threshold)) {
        d7Returned += 1;
        d7ReturnedUsers.add(userId);
      }
    }

    if (elapsedMs >= 14 * 24 * 60 * 60 * 1000) {
      d14Eligible += 1;
      if (activityDates.some((date) => date.getTime() >= day14Threshold)) {
        d14Returned += 1;
      }
    }

    if (elapsedMs >= 30 * 24 * 60 * 60 * 1000) {
      d30Eligible += 1;
      if (activityDates.some((date) => date.getTime() >= day30Threshold)) {
        d30Returned += 1;
        d30ReturnedUsers.add(userId);
      }
    }
  }

  const latestSpeakingBandByUser = new Map<string, number>();
  const latestWritingBandByUser = new Map<string, number>();
  const latestProgressByUser = new Map<
    string,
    { overallProgress: number; speakingProgress: number; writingProgress: number }
  >();

  for (const row of speakingActivityRows) {
    if (latestSpeakingBandByUser.has(row.userId)) {
      continue;
    }

    const band = parseNumeric(row.speakingFinalBand ?? row.speakingEstimatedBand);
    if (band !== null) {
      latestSpeakingBandByUser.set(row.userId, band);
    }
  }

  for (const row of writingActivityRows) {
    if (latestWritingBandByUser.has(row.userId)) {
      continue;
    }

    latestWritingBandByUser.set(row.userId, row.overallBand);
  }

  for (const row of latestSnapshots) {
    if (latestProgressByUser.has(row.userId)) {
      continue;
    }

    latestProgressByUser.set(row.userId, {
      overallProgress: row.overallProgress,
      speakingProgress: row.speakingProgress,
      writingProgress: row.writingProgress,
    });
  }

  const repeatGroup = {
    speakingBands: [] as number[],
    writingBands: [] as number[],
    overallProgress: [] as number[],
  };
  const nonRepeatGroup = {
    speakingBands: [] as number[],
    writingBands: [] as number[],
    overallProgress: [] as number[],
  };

  for (const userId of activatedUserIds) {
    const bucket = repeatLearners.has(userId) ? repeatGroup : nonRepeatGroup;
    const speakingBand = latestSpeakingBandByUser.get(userId);
    const writingBand = latestWritingBandByUser.get(userId);
    const progress = latestProgressByUser.get(userId);

    if (typeof speakingBand === "number") {
      bucket.speakingBands.push(speakingBand);
    }

    if (typeof writingBand === "number") {
      bucket.writingBands.push(writingBand);
    }

    if (progress) {
      bucket.overallProgress.push(progress.overallProgress);
    }
  }

  const sourceSegments = new Map<
    string,
    { activated: Set<string>; started: Set<string>; repeated: Set<string> }
  >();
  const planSegments = new Map<
    string,
    { activated: Set<string>; started: Set<string>; repeated: Set<string> }
  >();
  const examSegments = new Map<
    string,
    { activated: Set<string>; started: Set<string>; repeated: Set<string> }
  >();

  for (const user of activatedUsersData) {
    const sourceLabel = normalizeSegmentLabel(
      firstRegistrationSourceByUser.get(user.id),
      "direct",
    );
    const planLabel = normalizeSegmentLabel(
      user.licenses[0]?.plan?.name ?? user.entitlements[0]?.plan?.name,
      "Chưa gán gói",
    );
    const examLabel = normalizeSegmentLabel(user.goals[0]?.exam.name, "Chưa đặt kỳ thi");

    const segmentPayloads = [
      { map: sourceSegments, label: sourceLabel },
      { map: planSegments, label: planLabel },
      { map: examSegments, label: examLabel },
    ];

    for (const segment of segmentPayloads) {
      const current = segment.map.get(segment.label) ?? {
        activated: new Set<string>(),
        started: new Set<string>(),
        repeated: new Set<string>(),
      };

      current.activated.add(user.id);

      if (startedLearningUsers.has(user.id)) {
        current.started.add(user.id);
      }

      if (repeatLearners.has(user.id)) {
        current.repeated.add(user.id);
      }

      segment.map.set(segment.label, current);
    }
  }

  function toSegmentItems(
    map: Map<
      string,
      { activated: Set<string>; started: Set<string>; repeated: Set<string> }
    >,
  ): SegmentItem[] {
    return [...map.entries()]
      .map(([label, value]) => ({
        label,
        activatedUsers: value.activated.size,
        startedLearningUsers: value.started.size,
        learningStartRate: formatPercentage(
          value.started.size,
          value.activated.size,
        ),
        repeatLearners: value.repeated.size,
        repeatRate: formatPercentage(
          value.repeated.size,
          value.activated.size,
        ),
      }))
      .sort((left, right) => {
        if (right.repeatLearners !== left.repeatLearners) {
          return right.repeatLearners - left.repeatLearners;
        }

        if (right.startedLearningUsers !== left.startedLearningUsers) {
          return right.startedLearningUsers - left.startedLearningUsers;
        }

        return right.activatedUsers - left.activatedUsers;
      })
      .slice(0, 5);
  }

  const firstPathSegments = new Map<
    string,
    {
      started: Set<string>;
      repeated: Set<string>;
      d7Returned: Set<string>;
      d30Returned: Set<string>;
    }
  >();

  for (const [userId, pathKey] of firstLearningPathByUser.entries()) {
    const current = firstPathSegments.get(pathKey) ?? {
      started: new Set<string>(),
      repeated: new Set<string>(),
      d7Returned: new Set<string>(),
      d30Returned: new Set<string>(),
    };

    current.started.add(userId);

    if (repeatLearners.has(userId)) {
      current.repeated.add(userId);
    }

    if (d7ReturnedUsers.has(userId)) {
      current.d7Returned.add(userId);
    }

    if (d30ReturnedUsers.has(userId)) {
      current.d30Returned.add(userId);
    }

    firstPathSegments.set(pathKey, current);
  }

  const retentionByFirstPath = [...firstPathSegments.entries()]
    .map(([pathKey, value]) => ({
      label: getLearningPathLabel(pathKey),
      startedUsers: value.started.size,
      repeatLearners: value.repeated.size,
      repeatRate: formatPercentage(value.repeated.size, value.started.size),
      d7ReturnedUsers: value.d7Returned.size,
      d7ReturnRate: formatPercentage(value.d7Returned.size, value.started.size),
      d30ReturnedUsers: value.d30Returned.size,
      d30ReturnRate: formatPercentage(value.d30Returned.size, value.started.size),
    }))
    .sort((left, right) => {
      if (right.repeatLearners !== left.repeatLearners) {
        return right.repeatLearners - left.repeatLearners;
      }

      return right.startedUsers - left.startedUsers;
    }) satisfies FirstPathItem[];

  const cohortItems = [...cohortMap.entries()]
    .map(([cohortKey, value]) => ({
      cohortKey,
      cohortLabel: value.cohortLabel,
      activatedUsers: value.activatedUsers.size,
      startedLearningUsers: value.startedLearningUsers.size,
      learningStartRate: formatPercentage(
        value.startedLearningUsers.size,
        value.activatedUsers.size,
      ),
      repeatLearners: value.repeatedUsers.size,
      repeatRate: formatPercentage(
        value.repeatedUsers.size,
        value.activatedUsers.size,
      ),
    }))
    .sort((left, right) => right.cohortKey.localeCompare(left.cohortKey))
    .slice(0, 4);

  const repeatSpeakingBandAverage = averageNumbers(repeatGroup.speakingBands);
  const nonRepeatSpeakingBandAverage = averageNumbers(nonRepeatGroup.speakingBands);
  const repeatWritingBandAverage = averageNumbers(repeatGroup.writingBands);
  const nonRepeatWritingBandAverage = averageNumbers(nonRepeatGroup.writingBands);
  const repeatOverallProgressAverage = averageNumbers(repeatGroup.overallProgress);
  const nonRepeatOverallProgressAverage = averageNumbers(nonRepeatGroup.overallProgress);

  return {
    periodLabel: "30 ngày gần đây",
    activatedUsers,
    firstDashboardVisits,
    firstLessonOpens,
    firstSpeakingStarts,
    firstSpeakingCompletions,
    firstExerciseSubmissions,
    firstWritingCompletions,
    startedLearningUsers: startedLearningUsers.size,
    dashboardVisitRate: formatPercentage(firstDashboardVisits, activatedUsers),
    lessonOpenRate: formatPercentage(firstLessonOpens, activatedUsers),
    speakingStartRate: formatPercentage(firstSpeakingStarts, activatedUsers),
    speakingCompletionRate: formatPercentage(firstSpeakingCompletions, activatedUsers),
    exerciseSubmissionRate: formatPercentage(firstExerciseSubmissions, activatedUsers),
    writingCompletionRate: formatPercentage(firstWritingCompletions, activatedUsers),
    learningStartRate: formatPercentage(startedLearningUsers.size, activatedUsers),
    averageTimeToLearningStart: formatHours(averageTimeToLearningStartHours),
    medianTimeToLearningStart: formatHours(medianTimeToLearningStartHours),
    activeLearnersLast7Days,
    repeatLearnersLast7Days: repeatLearners.size,
    multiSurfaceLearnersLast7Days: multiSurfaceLearners.size,
    repeatLearnerRate: formatPercentage(repeatLearners.size, activatedUsers),
    multiSurfaceLearnerRate: formatPercentage(multiSurfaceLearners.size, activatedUsers),
    rolling30ActiveLearners,
    rolling30RepeatLearners: rolling30RepeatLearners.size,
    rolling30MultiSurfaceLearners: rolling30MultiSurfaceLearners.size,
    rolling30RepeatRate: formatPercentage(rolling30RepeatLearners.size, activatedUsers),
    rolling30MultiSurfaceRate: formatPercentage(
      rolling30MultiSurfaceLearners.size,
      activatedUsers,
    ),
    rolling30AverageActionsPerActiveLearner: formatDecimal(
      rolling30AverageActionsPerActiveLearner,
    ),
    d1EligibleUsers: d1Eligible,
    d1ReturnedUsers: d1Returned,
    d1ReturnRate: formatPercentage(d1Returned, d1Eligible),
    d7EligibleUsers: d7Eligible,
    d7ReturnedUsers: d7Returned,
    d7ReturnRate: formatPercentage(d7Returned, d7Eligible),
    d14EligibleUsers: d14Eligible,
    d14ReturnedUsers: d14Returned,
    d14ReturnRate: formatPercentage(d14Returned, d14Eligible),
    d30EligibleUsers: d30Eligible,
    d30ReturnedUsers: d30Returned,
    d30ReturnRate: formatPercentage(d30Returned, d30Eligible),
    averageActionsPerActiveLearner: formatDecimal(averageActionsPerActiveLearner),
    repeatLearnerQualityScore,
    topRepeatSurface,
    repeatSpeakingBandAverage: formatDecimal(repeatSpeakingBandAverage),
    nonRepeatSpeakingBandAverage: formatDecimal(nonRepeatSpeakingBandAverage),
    repeatWritingBandAverage: formatDecimal(repeatWritingBandAverage),
    nonRepeatWritingBandAverage: formatDecimal(nonRepeatWritingBandAverage),
    repeatOverallProgressAverage: formatDecimal(repeatOverallProgressAverage),
    nonRepeatOverallProgressAverage: formatDecimal(nonRepeatOverallProgressAverage),
    speakingBandLift: formatSignedDecimal(
      repeatSpeakingBandAverage !== null && nonRepeatSpeakingBandAverage !== null
        ? repeatSpeakingBandAverage - nonRepeatSpeakingBandAverage
        : null,
    ),
    writingBandLift: formatSignedDecimal(
      repeatWritingBandAverage !== null && nonRepeatWritingBandAverage !== null
        ? repeatWritingBandAverage - nonRepeatWritingBandAverage
        : null,
    ),
    progressLift: formatSignedDecimal(
      repeatOverallProgressAverage !== null && nonRepeatOverallProgressAverage !== null
        ? repeatOverallProgressAverage - nonRepeatOverallProgressAverage
        : null,
    ),
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
        label: "Hoàn tất speaking đầu tiên",
        count: firstSpeakingCompletions,
        rateFromActivated: formatPercentage(firstSpeakingCompletions, activatedUsers),
      },
      {
        label: "Nộp exercise đầu tiên",
        count: firstExerciseSubmissions,
        rateFromActivated: formatPercentage(firstExerciseSubmissions, activatedUsers),
      },
      {
        label: "Gửi writing đầu tiên",
        count: firstWritingCompletions,
        rateFromActivated: formatPercentage(firstWritingCompletions, activatedUsers),
      },
    ] satisfies RetentionStageItem[],
    cohortItems: cohortItems.map(
      (item): CohortItem => ({
        cohortLabel: item.cohortLabel,
        activatedUsers: item.activatedUsers,
        startedLearningUsers: item.startedLearningUsers,
        learningStartRate: item.learningStartRate,
        repeatLearners: item.repeatLearners,
        repeatRate: item.repeatRate,
      }),
    ),
    retentionBySource: toSegmentItems(sourceSegments),
    retentionByPlan: toSegmentItems(planSegments),
    retentionByExam: toSegmentItems(examSegments),
    retentionByFirstPath,
  };
}
