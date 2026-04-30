import { createClient, type RedisClientType } from "redis";

import type { ApiConfig } from "./config.js";

export type RateLimitDecision =
  | { allowed: true; remaining: number; resetAt: Date; retryAfterSeconds?: number }
  | { allowed: false; remaining: 0; resetAt: Date; retryAfterSeconds: number };

export type RateLimiter = {
  readonly kind: "memory" | "redis";
  check(key: string, now: Date): Promise<RateLimitDecision>;
  healthCheck(): Promise<boolean>;
};

export type RateLimiterStore = {
  increment(input: {
    key: string;
    now: Date;
    windowSeconds: number;
  }): Promise<{ points: number; resetAt: Date }>;
  healthCheck?(): Promise<boolean>;
};

export function createRateLimiter(
  config: Pick<ApiConfig, "rateLimitMax" | "rateLimitWindowSeconds">,
  store: RateLimiterStore,
  kind: RateLimiter["kind"],
): RateLimiter {
  return {
    kind,
    async check(key, now) {
      const result = await store.increment({
        key,
        now,
        windowSeconds: config.rateLimitWindowSeconds,
      });

      if (result.points > config.rateLimitMax) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: result.resetAt,
          retryAfterSeconds: Math.max(
            Math.ceil((result.resetAt.getTime() - now.getTime()) / 1000),
            1,
          ),
        };
      }

      return {
        allowed: true,
        remaining: Math.max(config.rateLimitMax - result.points, 0),
        resetAt: result.resetAt,
      };
    },
    async healthCheck() {
      return store.healthCheck ? await store.healthCheck() : true;
    },
  };
}

export function createInMemoryRateLimiter(
  config: Pick<ApiConfig, "rateLimitMax" | "rateLimitWindowSeconds">,
): RateLimiter {
  return createRateLimiter(config, new InMemoryRateLimiterStore(), "memory");
}

export function createRedisRateLimiter(config: ApiConfig): RateLimiter {
  if (!config.redisUrl) {
    throw new Error("REDIS_URL is required for Redis-backed rate limiting.");
  }

  return createRateLimiter(config, new RedisRateLimiterStore(config.redisUrl), "redis");
}

export class InMemoryRateLimiterStore implements RateLimiterStore {
  private readonly buckets = new Map<string, { count: number; resetAtMs: number }>();

  async increment(input: {
    key: string;
    now: Date;
    windowSeconds: number;
  }): Promise<{ points: number; resetAt: Date }> {
    const nowMs = input.now.getTime();
    const windowMs = input.windowSeconds * 1000;
    const existing = this.buckets.get(input.key);

    if (!existing || existing.resetAtMs <= nowMs) {
      const resetAtMs = nowMs + windowMs;
      this.buckets.set(input.key, { count: 1, resetAtMs });
      return {
        points: 1,
        resetAt: new Date(resetAtMs),
      };
    }

    existing.count += 1;

    return {
      points: existing.count,
      resetAt: new Date(existing.resetAtMs),
    };
  }
}

export class RedisRateLimiterStore implements RateLimiterStore {
  private client: RedisClientType | null = null;

  constructor(private readonly redisUrl: string) {}

  async increment(input: {
    key: string;
    now: Date;
    windowSeconds: number;
  }): Promise<{ points: number; resetAt: Date }> {
    const client = await this.getClient();
    const redisKey = `rate_limit:${input.key}`;
    const points = await client.incr(redisKey);

    if (points === 1) {
      await client.pExpire(redisKey, input.windowSeconds * 1000);
    }

    const ttlMs = await client.pTTL(redisKey);

    return {
      points,
      resetAt: new Date(input.now.getTime() + Math.max(ttlMs, 0)),
    };
  }

  async healthCheck(): Promise<boolean> {
    const client = await this.getClient();
    return (await client.ping()) === "PONG";
  }

  private async getClient(): Promise<RedisClientType> {
    if (!this.client) {
      this.client = createClient({
        url: this.redisUrl,
      });
      await this.client.connect();
    }

    return this.client;
  }
}
