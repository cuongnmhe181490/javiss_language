import type { ApiConfig } from "./config.js";
import {
  createInMemoryRateLimiter,
  createRedisRateLimiter,
  type RateLimiter,
} from "./rate-limit.js";

export function createRateLimiterForConfig(config: ApiConfig): RateLimiter {
  if (config.redisUrl) {
    return createRedisRateLimiter(config);
  }

  if (config.nodeEnv === "production") {
    throw new Error("REDIS_URL is required for production rate limiting.");
  }

  return createInMemoryRateLimiter(config);
}
