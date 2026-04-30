import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { ConfigError, createApiConfig } from "./config.js";

describe("API config validation", () => {
  it("fails clearly when AUTH_MODE is missing", () => {
    expect(() =>
      createApiConfig({
        NODE_ENV: "development",
        CORS_ALLOWED_ORIGINS: "http://localhost:3000",
      }),
    ).toThrow(ZodError);
  });

  it("allows dev-header mode outside production", () => {
    expect(
      createApiConfig({
        NODE_ENV: "development",
        AUTH_MODE: "dev-header",
        CORS_ALLOWED_ORIGINS: "http://localhost:3000",
      }),
    ).toMatchObject({
      authMode: "dev-header",
      port: 4000,
    });
  });

  it("fails fast when dev-header auth is configured for production", () => {
    expect(() =>
      createApiConfig({
        NODE_ENV: "production",
        AUTH_MODE: "dev-header",
        CORS_ALLOWED_ORIGINS: "https://academy.example.com",
      }),
    ).toThrow(ConfigError);
  });

  it("rejects wildcard CORS in production", () => {
    expect(() =>
      createApiConfig({
        NODE_ENV: "production",
        AUTH_MODE: "oidc",
        CORS_ALLOWED_ORIGINS: "*",
      }),
    ).toThrow(ConfigError);
  });

  it("requires Redis in production so rate limiting is not process-local", () => {
    expect(() =>
      createApiConfig({
        NODE_ENV: "production",
        AUTH_MODE: "oidc",
        CORS_ALLOWED_ORIGINS: "https://academy.example.com",
        DATABASE_URL: "postgresql://user:pass@example.com:5432/polyglot",
        OIDC_AUDIENCE: "polyglot-api",
        OIDC_ISSUER_URL: "https://issuer.example.com",
        OIDC_JWKS_URL: "https://issuer.example.com/.well-known/jwks.json",
      }),
    ).toThrow(ConfigError);
  });

  it("requires OIDC issuer, audience, and JWKS URL when auth mode is oidc", () => {
    expect(() =>
      createApiConfig({
        NODE_ENV: "development",
        AUTH_MODE: "oidc",
        CORS_ALLOWED_ORIGINS: "http://localhost:3000",
      }),
    ).toThrow(ConfigError);
  });

  it("does not require OTEL endpoint for local development", () => {
    expect(
      createApiConfig({
        NODE_ENV: "development",
        AUTH_MODE: "dev-header",
        CORS_ALLOWED_ORIGINS: "http://localhost:3000",
      }),
    ).toMatchObject({
      otelServiceName: "polyglot-api",
    });
  });
});
