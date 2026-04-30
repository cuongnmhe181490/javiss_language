import type { Actor } from "@polyglot/contracts";

import type { ApiConfig } from "./config.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = {
  error(event: string, fields: Record<string, unknown>): void;
  info(event: string, fields: Record<string, unknown>): void;
  warn(event: string, fields: Record<string, unknown>): void;
};

const sensitiveKeyPattern =
  /authorization|cookie|set-cookie|token|secret|password|rawaudio|raw_audio|rawtranscript|raw_transcript|apikey|api_key/i;

export function createJsonLogger(
  config: Pick<ApiConfig, "logLevel">,
  sink: (line: string) => void = console.log,
): Logger {
  return {
    error(event, fields) {
      write("error", config.logLevel, event, fields, sink);
    },
    info(event, fields) {
      write("info", config.logLevel, event, fields, sink);
    },
    warn(event, fields) {
      write("warn", config.logLevel, event, fields, sink);
    },
  };
}

export function redactForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactForLog);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(key)) {
      redacted[key] = "[REDACTED]";
      continue;
    }

    redacted[key] = redactForLog(item);
  }

  return redacted;
}

export function requestLogFields(input: {
  actor: Actor | null;
  durationMs: number;
  method: string;
  requestId: string;
  route: string;
  status: number;
  tenantId?: string;
}): Record<string, unknown> {
  return {
    actorId: input.actor?.userId,
    durationMs: input.durationMs,
    method: input.method,
    requestId: input.requestId,
    route: input.route,
    status: input.status,
    tenantId: input.tenantId ?? input.actor?.tenantId,
  };
}

function write(
  level: LogLevel,
  configuredLevel: LogLevel,
  event: string,
  fields: Record<string, unknown>,
  sink: (line: string) => void,
): void {
  if (!shouldLog(level, configuredLevel)) {
    return;
  }

  sink(
    JSON.stringify(
      redactForLog({
        event,
        level,
        timestamp: new Date().toISOString(),
        ...fields,
      }),
    ),
  );
}

function shouldLog(level: LogLevel, configuredLevel: LogLevel): boolean {
  const order: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };

  return order[level] >= order[configuredLevel];
}
