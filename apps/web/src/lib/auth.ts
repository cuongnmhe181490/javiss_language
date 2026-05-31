/**
 * Auth configuration helpers.
 *
 * The web app integrates Clerk for authentication, but is designed to also run
 * in a keyless "demo mode" so it can build and run out-of-the-box without real
 * third-party credentials. Clerk is only activated when a valid publishable key
 * is configured; otherwise the app falls back to public demo access.
 *
 * A key is considered configured when it is present, starts with the Clerk
 * `pk_` prefix, and is not one of the example placeholder values shipped in
 * `.env.local.example`.
 */

const PLACEHOLDER_MARKERS = ["placeholder", "xxxxx", "your_", "changeme"];

export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();

  if (!key) {
    return false;
  }

  const normalized = key.toLowerCase();
  if (PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))) {
    return false;
  }

  return key.startsWith("pk_");
}
