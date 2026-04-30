import { z } from "zod";

export type AuthMode = "dev-header" | "oidc";

export type ApiConfig = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  authMode: AuthMode;
  corsAllowedOrigins: string[];
  logLevel: "debug" | "info" | "warn" | "error";
  auditExportStepUpTtlSeconds: number;
  rateLimitWindowSeconds: number;
  rateLimitMax: number;
  maxBodyBytes: number;
  databaseUrl?: string;
  oidcAudience?: string;
  oidcEmailClaim: string;
  oidcIssuerUrl?: string;
  oidcJwksTimeoutMs: number;
  oidcJwksUrl?: string;
  oidcRolesClaim: string;
  oidcSubClaim: string;
  oidcTenantClaim: string;
  otelExporterOtlpEndpoint?: string;
  otelServiceName: string;
  redisUrl?: string;
  version: string;
};

const rawApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  AUTH_MODE: z.enum(["dev-header", "oidc"]),
  CORS_ALLOWED_ORIGINS: z.string().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  AUDIT_EXPORT_STEP_UP_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(600),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).max(3600).default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100000).optional(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).max(100000).optional(),
  API_MAX_BODY_BYTES: z.coerce
    .number()
    .int()
    .min(1024)
    .max(10 * 1024 * 1024)
    .default(1048576),
  DATABASE_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  REDIS_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  OIDC_ISSUER_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  OIDC_AUDIENCE: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  OIDC_JWKS_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  OIDC_TENANT_CLAIM: z.string().min(1).default("tenant_id"),
  OIDC_ROLES_CLAIM: z.string().min(1).default("roles"),
  OIDC_SUB_CLAIM: z.string().min(1).default("sub"),
  OIDC_EMAIL_CLAIM: z.string().min(1).default("email"),
  OIDC_JWKS_TIMEOUT_MS: z.coerce.number().int().min(100).max(10000).default(2000),
  OTEL_SERVICE_NAME: z.string().min(1).default("polyglot-api"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  API_VERSION: z.string().min(1).default("0.1.0"),
});

export function createApiConfig(env: Record<string, string | undefined>): ApiConfig {
  const parsed = rawApiEnvSchema.parse(env);
  const corsAllowedOrigins = parseAllowedOrigins(parsed.CORS_ALLOWED_ORIGINS);
  const port = parsed.API_PORT ?? parsed.PORT;

  if (parsed.NODE_ENV === "production" && parsed.AUTH_MODE === "dev-header") {
    throw new ConfigError("AUTH_MODE=dev-header is not allowed when NODE_ENV=production.");
  }

  if (parsed.NODE_ENV === "production" && corsAllowedOrigins.includes("*")) {
    throw new ConfigError("CORS_ALLOWED_ORIGINS cannot contain wildcard in production.");
  }

  if (parsed.NODE_ENV === "production" && corsAllowedOrigins.length === 0) {
    throw new ConfigError("CORS_ALLOWED_ORIGINS must include at least one origin in production.");
  }

  if (parsed.NODE_ENV === "production" && !parsed.DATABASE_URL) {
    throw new ConfigError("DATABASE_URL is required when NODE_ENV=production.");
  }

  if (parsed.NODE_ENV === "production" && !parsed.REDIS_URL) {
    throw new ConfigError("REDIS_URL is required for production rate limiting.");
  }

  if (parsed.AUTH_MODE === "oidc") {
    const missingOidcFields = [
      ["OIDC_ISSUER_URL", parsed.OIDC_ISSUER_URL],
      ["OIDC_AUDIENCE", parsed.OIDC_AUDIENCE],
      ["OIDC_JWKS_URL", parsed.OIDC_JWKS_URL],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingOidcFields.length > 0) {
      throw new ConfigError(`OIDC config is incomplete: ${missingOidcFields.join(", ")}.`);
    }
  }

  const rateLimitMax = parsed.RATE_LIMIT_MAX_REQUESTS ?? parsed.RATE_LIMIT_MAX ?? 100;

  return {
    nodeEnv: parsed.NODE_ENV,
    port,
    authMode: parsed.AUTH_MODE,
    corsAllowedOrigins,
    logLevel: parsed.LOG_LEVEL,
    auditExportStepUpTtlSeconds: parsed.AUDIT_EXPORT_STEP_UP_TTL_SECONDS,
    rateLimitWindowSeconds: parsed.RATE_LIMIT_WINDOW_SECONDS,
    rateLimitMax,
    maxBodyBytes: parsed.API_MAX_BODY_BYTES,
    databaseUrl: parsed.DATABASE_URL,
    oidcAudience: parsed.OIDC_AUDIENCE,
    oidcEmailClaim: parsed.OIDC_EMAIL_CLAIM,
    oidcIssuerUrl: parsed.OIDC_ISSUER_URL,
    oidcJwksTimeoutMs: parsed.OIDC_JWKS_TIMEOUT_MS,
    oidcJwksUrl: parsed.OIDC_JWKS_URL,
    oidcRolesClaim: parsed.OIDC_ROLES_CLAIM,
    oidcSubClaim: parsed.OIDC_SUB_CLAIM,
    oidcTenantClaim: parsed.OIDC_TENANT_CLAIM,
    otelExporterOtlpEndpoint: parsed.OTEL_EXPORTER_OTLP_ENDPOINT,
    otelServiceName: parsed.OTEL_SERVICE_NAME,
    redisUrl: parsed.REDIS_URL,
    version: parsed.API_VERSION,
  };
}

export function createTestApiConfig(overrides: Partial<ApiConfig> = {}): ApiConfig {
  return {
    nodeEnv: "test",
    port: 4000,
    authMode: "dev-header",
    corsAllowedOrigins: ["http://localhost:3000"],
    logLevel: "error",
    auditExportStepUpTtlSeconds: 600,
    rateLimitWindowSeconds: 60,
    rateLimitMax: 1000,
    maxBodyBytes: 1048576,
    oidcEmailClaim: "email",
    oidcJwksTimeoutMs: 2000,
    oidcRolesClaim: "roles",
    oidcSubClaim: "sub",
    oidcTenantClaim: "tenant_id",
    otelServiceName: "polyglot-api-test",
    version: "test",
    ...overrides,
  };
}

function parseAllowedOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function emptyStringToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
