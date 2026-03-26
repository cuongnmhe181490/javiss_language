"use client";

import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  getOrCreatePublicAttributionSessionId,
  storePublicAttribution,
} from "@/lib/public/attribution";

type PublicAnalyticsLinkButtonProps = {
  href: string;
  label: string;
  eventName: "action_clicked" | "landing_cta_clicked";
  source: "widget" | "landing" | "hero" | "faq" | "cta";
  intent?: string;
  sessionId?: string;
} & Pick<ButtonProps, "variant" | "size" | "className">;

function trackPublicAnalytics(payload: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], {
      type: "application/json",
    });

    navigator.sendBeacon("/api/public-analytics", blob);
    return;
  }

  void fetch("/api/public-analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

export function PublicAnalyticsLinkButton({
  href,
  label,
  eventName,
  source,
  intent,
  sessionId,
  variant,
  size,
  className,
}: PublicAnalyticsLinkButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        const resolvedSessionId = sessionId ?? getOrCreatePublicAttributionSessionId();

        if (href === "/register") {
          storePublicAttribution({
            sessionId: resolvedSessionId,
            source,
            intent,
            label,
            href,
          });
        }

        trackPublicAnalytics({
          eventName,
          source,
          label,
          href,
          intent,
          sessionId: resolvedSessionId,
        });
        router.push(href);
      }}
    >
      {label}
    </Button>
  );
}
