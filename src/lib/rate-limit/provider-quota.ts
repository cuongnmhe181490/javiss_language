import { getRedisClient } from "@/lib/db/redis";
import { logger } from "@/lib/logger";

function getRemainingWindowSeconds() {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0),
  );
  return Math.max(60, Math.ceil((tomorrow.getTime() - now.getTime()) / 1000));
}

export async function consumeDailyProviderQuota(input: {
  provider: string;
  userId: string;
  limit: number;
}) {
  if (input.limit <= 0) {
    return {
      allowed: true,
      count: 0,
      remaining: 0,
      source: "disabled" as const,
    };
  }

  const redis = await getRedisClient();

  if (!redis) {
    return {
      allowed: true,
      count: 0,
      remaining: input.limit,
      source: "unavailable" as const,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `quota:${input.provider}:${input.userId}:${today}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, getRemainingWindowSeconds());
    }

    return {
      allowed: count <= input.limit,
      count,
      remaining: Math.max(0, input.limit - count),
      source: "redis" as const,
    };
  } catch (error) {
    logger.warn("provider_quota_check_failed", {
      provider: input.provider,
      userId: input.userId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return {
      allowed: true,
      count: 0,
      remaining: input.limit,
      source: "error" as const,
    };
  }
}
