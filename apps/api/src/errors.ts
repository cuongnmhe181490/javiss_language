import { ZodError } from "zod";

import type { ApiConfig } from "./config.js";

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export type ResponseContext = {
  config: Pick<ApiConfig, "corsAllowedOrigins">;
  origin?: string;
  requestId: string;
  timestamp: string;
  cachePolicy?: string;
};

export function toApiErrorResponse(error: unknown, context: ResponseContext): Response {
  if (error instanceof ApiHttpError) {
    return jsonResponse(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      },
      error.status,
      context,
    );
  }

  if (error instanceof ZodError) {
    return jsonResponse(
      {
        error: {
          code: "request.validation_failed",
          message: "Request validation failed.",
          details: {
            fields: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      },
      400,
      context,
    );
  }

  return jsonResponse(
    {
      error: {
        code: "internal.unhandled",
        message: "Unexpected server error.",
        details: {},
        requestId: context.requestId,
        timestamp: context.timestamp,
      },
    },
    500,
    context,
  );
}

export function jsonResponse(body: unknown, status: number, context: ResponseContext): Response {
  const headers = securityHeaders(context);

  if (context.origin && isOriginAllowed(context.origin, context.config.corsAllowedOrigins)) {
    headers.set("access-control-allow-origin", context.origin);
    headers.set("access-control-allow-credentials", "true");
    headers.set("vary", "origin");
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function securityHeaders(context: ResponseContext): Headers {
  return new Headers({
    "cache-control": context.cachePolicy ?? "no-store",
    "content-security-policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    "content-type": "application/json; charset=utf-8",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-request-id": context.requestId,
  });
}

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}
