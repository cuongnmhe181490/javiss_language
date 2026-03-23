type Entry = {
  count: number;
  expiresAt: number;
};

const bucket = new Map<string, Entry>();

export async function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = bucket.get(key);

  if (!existing || existing.expiresAt < now) {
    bucket.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  existing.count += 1;
}
