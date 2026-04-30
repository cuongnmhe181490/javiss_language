import { describe, expect, it } from "vitest";

import { createTestApiConfig } from "./config.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";

describe("rate limiting", () => {
  it("blocks requests after the configured limit and returns retry timing", async () => {
    const limiter = createInMemoryRateLimiter(
      createTestApiConfig({
        rateLimitMax: 1,
        rateLimitWindowSeconds: 60,
      }),
    );
    const now = new Date("2026-04-27T10:00:00.000Z");

    await expect(limiter.check("tenant:user:route", now)).resolves.toMatchObject({
      allowed: true,
      remaining: 0,
    });
    await expect(limiter.check("tenant:user:route", now)).resolves.toMatchObject({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });
});
