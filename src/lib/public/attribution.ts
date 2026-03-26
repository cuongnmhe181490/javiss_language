export type PublicAttributionSource = "widget" | "landing" | "hero" | "faq" | "cta" | "direct";

export type PublicAttribution = {
  sessionId: string;
  source: PublicAttributionSource;
  intent?: string;
  label?: string;
  href?: string;
  createdAt: string;
};

const PUBLIC_ATTRIBUTION_STORAGE_KEY = "javiss_public_attribution";
const PUBLIC_ATTRIBUTION_SESSION_KEY = "javiss_public_attribution_session";
const MAX_ATTRIBUTION_AGE_MS = 24 * 60 * 60 * 1000;

function hasWindow() {
  return typeof window !== "undefined";
}

export function getOrCreatePublicAttributionSessionId() {
  if (!hasWindow()) {
    return "public-attribution-server";
  }

  const existing = window.sessionStorage.getItem(PUBLIC_ATTRIBUTION_SESSION_KEY);

  if (existing) {
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `public-attribution-${Date.now()}`;

  window.sessionStorage.setItem(PUBLIC_ATTRIBUTION_SESSION_KEY, generated);
  return generated;
}

export function storePublicAttribution(input: Omit<PublicAttribution, "createdAt">) {
  if (!hasWindow()) {
    return;
  }

  const payload: PublicAttribution = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  window.sessionStorage.setItem(PUBLIC_ATTRIBUTION_STORAGE_KEY, JSON.stringify(payload));
}

export function readPublicAttribution() {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(PUBLIC_ATTRIBUTION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PublicAttribution;

    if (!parsed?.sessionId || !parsed?.source || !parsed?.createdAt) {
      return null;
    }

    const createdAt = new Date(parsed.createdAt).getTime();

    if (!Number.isFinite(createdAt) || Date.now() - createdAt > MAX_ATTRIBUTION_AGE_MS) {
      clearPublicAttribution();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPublicAttribution() {
  if (!hasWindow()) {
    return;
  }

  window.sessionStorage.removeItem(PUBLIC_ATTRIBUTION_STORAGE_KEY);
}
