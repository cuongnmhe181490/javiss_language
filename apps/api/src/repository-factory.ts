import type { ApiConfig } from "./config.js";
import { getPrismaClient } from "./prisma-client.js";
import { createPrismaRepositories } from "./prisma-repositories.js";
import { createInMemoryRepositories, type ApiRepositories } from "./repositories.js";

export function createRepositories(config: ApiConfig): ApiRepositories {
  if (config.databaseUrl) {
    return createPrismaRepositories(getPrismaClient());
  }

  if (config.nodeEnv === "production") {
    throw new Error("DATABASE_URL is required for production repositories.");
  }

  return createInMemoryRepositories();
}
