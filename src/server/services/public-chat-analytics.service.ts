import { AnalyticsEventType, type Prisma } from "@prisma/client";
import type { PublicAnalyticsEventInput } from "@/features/public-chat/schemas";
import {
  countAnalyticsEvents,
  createAnalyticsEvent,
  listAnalyticsEvents,
} from "@/server/repositories/analytics.repository";

type PublicChatTopIntent = {
  intent: string;
  count: number;
};

type PublicChatTopAction = {
  label: string;
  href: string;
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

function mapEventNameToType(eventName: PublicAnalyticsEventInput["eventName"]) {
  switch (eventName) {
    case "widget_opened":
      return AnalyticsEventType.public_chat_widget_opened;
    case "action_clicked":
      return AnalyticsEventType.public_chat_action_clicked;
    case "landing_cta_clicked":
      return AnalyticsEventType.landing_cta_clicked;
    default:
      return AnalyticsEventType.public_chat_action_clicked;
  }
}

export async function trackPublicAnalyticsEvent(input: {
  values: PublicAnalyticsEventInput;
  ipAddress?: string | null;
}) {
  return createAnalyticsEvent({
    eventType: mapEventNameToType(input.values.eventName),
    entityType: "public_interaction",
    metadata: {
      source: input.values.source,
      sessionId: input.values.sessionId ?? null,
      label: input.values.label ?? null,
      href: input.values.href ?? null,
      intent: input.values.intent ?? null,
      fingerprint: input.ipAddress?.trim() || "anonymous",
    },
  });
}

export async function getPublicChatAnalyticsSummary() {
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [widgetOpens, totalMessages, actionClicks, landingCtaClicks, recentEvents] =
    await Promise.all([
      countAnalyticsEvents({
        eventType: AnalyticsEventType.public_chat_widget_opened,
        from,
      }),
      countAnalyticsEvents({
        eventType: AnalyticsEventType.public_chat_message_completed,
        from,
      }),
      countAnalyticsEvents({
        eventType: AnalyticsEventType.public_chat_action_clicked,
        from,
      }),
      countAnalyticsEvents({
        eventType: AnalyticsEventType.landing_cta_clicked,
        from,
      }),
      listAnalyticsEvents({
        eventTypes: [
          AnalyticsEventType.public_chat_message_completed,
          AnalyticsEventType.public_chat_action_clicked,
          AnalyticsEventType.landing_cta_clicked,
        ],
        from,
        take: 500,
      }),
    ]);

  const intentCounts = new Map<string, number>();
  const actionCounts = new Map<string, { label: string; href: string; count: number }>();
  let registerIntentClicks = 0;
  let loginIntentClicks = 0;
  let verifyIntentClicks = 0;

  for (const event of recentEvents) {
    const intent = getMetadataValue(event.metadata, "intent");
    const label = getMetadataValue(event.metadata, "label");
    const href = getMetadataValue(event.metadata, "href");

    if (event.eventType === AnalyticsEventType.public_chat_message_completed && intent) {
      intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1);
    }

    if (
      (event.eventType === AnalyticsEventType.public_chat_action_clicked ||
        event.eventType === AnalyticsEventType.landing_cta_clicked) &&
      label &&
      href
    ) {
      const key = `${label}::${href}`;
      const current = actionCounts.get(key);
      actionCounts.set(key, {
        label,
        href,
        count: (current?.count ?? 0) + 1,
      });

      if (href === "/register") {
        registerIntentClicks += 1;
      }

      if (href === "/login") {
        loginIntentClicks += 1;
      }

      if (href === "/verify") {
        verifyIntentClicks += 1;
      }
    }
  }

  const topIntents: PublicChatTopIntent[] = [...intentCounts.entries()]
    .map(([intent, count]) => ({
      intent,
      count,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const topActions: PublicChatTopAction[] = [...actionCounts.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  return {
    periodLabel: "7 ngày gần đây",
    widgetOpens,
    totalMessages,
    totalTrackedClicks: actionClicks + landingCtaClicks,
    registerIntentClicks,
    loginIntentClicks,
    verifyIntentClicks,
    registerConversionRate:
      totalMessages > 0 ? `${((registerIntentClicks / totalMessages) * 100).toFixed(1)}%` : "0.0%",
    topIntents,
    topActions,
  };
}
