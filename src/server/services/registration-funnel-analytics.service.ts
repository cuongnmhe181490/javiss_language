import { AnalyticsEventType, type Prisma } from "@prisma/client";
import {
  countAnalyticsEvents,
  listAnalyticsEvents,
} from "@/server/repositories/analytics.repository";

type RegistrationSourceItem = {
  source: string;
  count: number;
};

function getMetadataValue(
  metadata: Prisma.JsonValue | null | undefined,
  key: string,
): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, Prisma.JsonValue | undefined>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function formatPercentage(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return "0.0%";
  }

  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function getSourceLabel(source: string) {
  switch (source) {
    case "hero":
      return "Hero landing";
    case "cta":
      return "Thanh điều hướng";
    case "widget":
      return "Chatbot công khai";
    case "landing":
      return "Landing page";
    case "faq":
      return "FAQ";
    case "direct":
      return "Truy cập trực tiếp";
    default:
      return source;
  }
}

export async function getRegistrationFunnelSummary() {
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    submittedCount,
    approvedCount,
    rejectedCount,
    activatedCount,
    clickEvents,
    submissionEvents,
  ] = await Promise.all([
    countAnalyticsEvents({
      eventType: AnalyticsEventType.registration_submitted,
      from,
    }),
    countAnalyticsEvents({
      eventType: AnalyticsEventType.registration_approved,
      from,
    }),
    countAnalyticsEvents({
      eventType: AnalyticsEventType.registration_rejected,
      from,
    }),
    countAnalyticsEvents({
      eventType: AnalyticsEventType.account_activated,
      from,
    }),
    listAnalyticsEvents({
      eventTypes: [
        AnalyticsEventType.public_chat_action_clicked,
        AnalyticsEventType.landing_cta_clicked,
      ],
      from,
      take: 1000,
    }),
    listAnalyticsEvents({
      eventTypes: [AnalyticsEventType.registration_submitted],
      from,
      take: 1000,
    }),
  ]);

  const registerClickSessions = new Set<string>();
  let registerClickCount = 0;

  for (const event of clickEvents) {
    const href = getMetadataValue(event.metadata, "href");
    const sessionId = getMetadataValue(event.metadata, "sessionId");

    if (href !== "/register") {
      continue;
    }

    registerClickCount += 1;

    if (sessionId) {
      registerClickSessions.add(sessionId);
    }
  }

  const sourceCounts = new Map<string, number>();
  let attributedRegistrations = 0;

  for (const event of submissionEvents) {
    const source = getMetadataValue(event.metadata, "attributionSource") ?? "direct";
    const attributionSessionId = getMetadataValue(event.metadata, "attributionSessionId");

    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);

    if (attributionSessionId) {
      attributedRegistrations += 1;
    }
  }

  const topSources: RegistrationSourceItem[] = [...sourceCounts.entries()]
    .map(([source, count]) => ({
      source: getSourceLabel(source),
      count,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  return {
    periodLabel: "7 ngày gần đây",
    registerClickCount,
    registerClickSessions: registerClickSessions.size,
    registrationsSubmitted: submittedCount,
    attributedRegistrations,
    approvedRegistrations: approvedCount,
    rejectedRegistrations: rejectedCount,
    activatedAccounts: activatedCount,
    clickToRegistrationRate: formatPercentage(attributedRegistrations, registerClickSessions.size),
    approvalRate: formatPercentage(approvedCount, submittedCount),
    activationRate: formatPercentage(activatedCount, approvedCount),
    topSources,
  };
}
