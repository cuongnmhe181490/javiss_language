import type { Actor } from "@polyglot/contracts";
import { SpanStatusCode, trace } from "@opentelemetry/api";

import type { ApiConfig } from "./config.js";

export function buildRequestSpanAttributes(input: {
  actor: Actor | null;
  method: string;
  requestId: string;
  route: string;
  status?: number;
  tenantId?: string;
}): Record<string, string | number | boolean> {
  return compactAttributes({
    "actor.id": input.actor?.userId,
    "http.request.method": input.method,
    "http.response.status_code": input.status,
    "request.id": input.requestId,
    route: input.route,
    "tenant.id": input.tenantId ?? input.actor?.tenantId,
  });
}

export async function withRequestSpan<T>(
  config: Pick<ApiConfig, "otelServiceName">,
  name: string,
  attributes: Record<string, string | number | boolean>,
  run: () => Promise<T>,
): Promise<T> {
  const tracer = trace.getTracer(config.otelServiceName);
  const span = tracer.startSpan(name, {
    attributes,
  });

  try {
    const result = await run();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
}

function compactAttributes(
  attributes: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(attributes).filter((entry): entry is [string, string | number | boolean] => {
      return entry[1] !== undefined && !String(entry[0]).toLowerCase().includes("email");
    }),
  );
}
