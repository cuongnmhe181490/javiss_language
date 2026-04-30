import { describe, expect, it } from "vitest";

import { createJsonLogger, redactForLog, requestLogFields } from "./logging.js";

describe("structured redacted logging", () => {
  it("redacts token, secret, password, cookie, and raw transcript fields", () => {
    expect(
      redactForLog({
        authorization: "Bearer raw-token",
        nested: {
          apiKey: "key",
          rawTranscript: "hello",
          safe: "kept",
        },
        password: "pw",
      }),
    ).toEqual({
      authorization: "[REDACTED]",
      nested: {
        apiKey: "[REDACTED]",
        rawTranscript: "[REDACTED]",
        safe: "kept",
      },
      password: "[REDACTED]",
    });
  });

  it("emits JSON request logs with requestId", () => {
    const lines: string[] = [];
    const logger = createJsonLogger({ logLevel: "info" }, (line) => lines.push(line));

    logger.info(
      "api.request",
      requestLogFields({
        actor: null,
        durationMs: 4,
        method: "GET",
        requestId: "req_123",
        route: "/health",
        status: 200,
      }),
    );

    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({
      event: "api.request",
      requestId: "req_123",
      status: 200,
    });
  });
});
