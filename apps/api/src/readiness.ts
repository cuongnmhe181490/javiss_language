import type { ApiConfig } from "./config.js";
import type { RateLimiter } from "./rate-limit.js";
import type { ApiRepositories } from "./repositories.js";

export type ReadinessCheck = {
  status: "ok" | "degraded" | "error";
};

export type ReadinessChecks = Record<string, ReadinessCheck>;

export async function createReadinessChecks(input: {
  config: ApiConfig;
  rateLimiter: RateLimiter;
  repositories: ApiRepositories;
}): Promise<ReadinessChecks> {
  const checks: ReadinessChecks = {
    auth: { status: input.config.authMode === "oidc" ? "ok" : "degraded" },
    repositories: { status: "ok" },
  };

  if (input.config.databaseUrl) {
    checks.database = await check("database", () =>
      input.repositories.tenants.findById("00000000-0000-4000-8000-000000000000"),
    );
  }

  if (input.config.redisUrl) {
    checks.redis =
      input.rateLimiter.kind === "redis" && (await input.rateLimiter.healthCheck())
        ? { status: "ok" }
        : { status: "error" };
  }

  return checks;
}

export function summarizeReadiness(checks: ReadinessChecks): "ok" | "degraded" | "error" {
  if (Object.values(checks).some((check) => check.status === "error")) {
    return "error";
  }

  if (Object.values(checks).some((check) => check.status === "degraded")) {
    return "degraded";
  }

  return "ok";
}

async function check(name: string, run: () => Promise<unknown>): Promise<ReadinessCheck> {
  try {
    await run();
    return { status: "ok" };
  } catch {
    return { status: name === "database" ? "error" : "degraded" };
  }
}
