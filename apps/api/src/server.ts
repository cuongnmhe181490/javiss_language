import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Buffer } from "node:buffer";

import { handleApiRequest } from "./app.js";
import { createDefaultAiOrchestrator } from "./ai-orchestrator.js";
import { createAuthProvider } from "./auth-provider.js";
import { createApiConfig, type ApiConfig } from "./config.js";
import { jsonResponse } from "./errors.js";
import { createJsonLogger } from "./logging.js";
import { createRateLimiterForConfig } from "./rate-limiter-factory.js";
import { createRepositories } from "./repository-factory.js";

export function startServer(config: ApiConfig = createApiConfig(process.env)) {
  const dependencies = {
    authProvider: createAuthProvider(config),
    aiOrchestrator: createDefaultAiOrchestrator(),
    config,
    logger: createJsonLogger(config),
    rateLimiter: createRateLimiterForConfig(config),
    repositories: createRepositories(config),
    now: () => new Date(),
    randomId: () => crypto.randomUUID(),
  };
  const server = createServer(async (incomingRequest, outgoingResponse) => {
    try {
      const request = await toWebRequest(incomingRequest, config);
      const response = await handleApiRequest(request, dependencies);
      await sendWebResponse(response, outgoingResponse);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        const requestId = requestHeader(incomingRequest, "x-request-id") ?? crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const response = jsonResponse(
          {
            error: {
              code: "request.body_too_large",
              message: "Request body is too large.",
              details: {
                maxBodyBytes: config.maxBodyBytes,
              },
              requestId,
              timestamp,
            },
          },
          413,
          {
            config,
            origin: requestHeader(incomingRequest, "origin") ?? undefined,
            requestId,
            timestamp,
          },
        );
        await sendWebResponse(response, outgoingResponse);
        return;
      }

      if (incomingRequest.readableEnded === false) {
        incomingRequest.destroy();
      }

      outgoingResponse.writeHead(500, {
        "content-type": "application/json; charset=utf-8",
        "x-content-type-options": "nosniff",
      });
      outgoingResponse.end(
        JSON.stringify({
          error: {
            code: "internal.server_adapter_error",
            message: "API server adapter failed.",
            details: [],
          },
        }),
      );
    }
  });

  server.listen(config.port, () => {
    console.log(`Polyglot API listening on http://127.0.0.1:${config.port}`);
  });

  return server;
}

async function toWebRequest(incomingRequest: IncomingMessage, config: ApiConfig): Promise<Request> {
  const host = incomingRequest.headers.host ?? `127.0.0.1:${config.port}`;
  const url = `http://${host}${incomingRequest.url ?? "/"}`;
  const method = incomingRequest.method ?? "GET";
  const headers = new Headers();

  for (const [key, value] of Object.entries(incomingRequest.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value) {
      headers.set(key, value);
    }
  }

  const declaredLength = Number(incomingRequest.headers["content-length"] ?? 0);

  if (declaredLength > config.maxBodyBytes) {
    return new Request(url, {
      method,
      headers,
    });
  }

  const bodyBuffer =
    method === "GET" || method === "HEAD" ? undefined : await readBody(incomingRequest, config);

  return new Request(url, {
    method,
    headers,
    body: bodyBuffer ? new Uint8Array(bodyBuffer) : undefined,
  });
}

async function readBody(incomingRequest: IncomingMessage, config: ApiConfig): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of incomingRequest) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > config.maxBodyBytes) {
      throw new RequestBodyTooLargeError();
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeded configured limit.");
    this.name = "RequestBodyTooLargeError";
  }
}

function requestHeader(request: IncomingMessage, name: string): string | null {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function sendWebResponse(response: Response, outgoingResponse: ServerResponse) {
  const headers: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  outgoingResponse.writeHead(response.status, headers);
  outgoingResponse.end(Buffer.from(await response.arrayBuffer()));
}
