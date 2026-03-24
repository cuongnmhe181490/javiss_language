import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

declare global {
  var redisClientSingleton: Redis | undefined;
}

function createRedisClient() {
  try {
    const client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
    });

    client.on("error", (error) => {
      logger.warn("redis_client_error", {
        error: error.message,
      });
    });

    return client;
  } catch (error) {
    logger.warn("redis_client_init_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function getRedisClient() {
  if (!global.redisClientSingleton) {
    const client = createRedisClient();

    if (!client) {
      return null;
    }

    global.redisClientSingleton = client;
  }

  try {
    if (global.redisClientSingleton.status === "wait") {
      await global.redisClientSingleton.connect();
    }

    return global.redisClientSingleton;
  } catch (error) {
    logger.warn("redis_client_connect_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}
