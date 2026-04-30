import type { Actor } from "@polyglot/contracts";
import { actorSchema } from "@polyglot/contracts";
import { createRemoteJWKSet, errors as joseErrors, jwtVerify, type JWTPayload } from "jose";

import type { ApiConfig } from "./config.js";
import { ApiHttpError } from "./errors.js";

export type AuthProvider = {
  readonly name: "dev-header" | "oidc";
  authenticate(request: Request): Promise<Actor | null>;
};

export function createAuthProvider(config: ApiConfig): AuthProvider {
  if (config.authMode === "dev-header") {
    return new DevHeaderAuthProvider();
  }

  return new OidcAuthProvider(config);
}

export class DevHeaderAuthProvider implements AuthProvider {
  readonly name = "dev-header" as const;

  async authenticate(request: Request): Promise<Actor | null> {
    const headers = request.headers;
    const userId = headers.get("x-dev-user-id");
    const tenantId = headers.get("x-dev-tenant-id");
    const roles = parseCsv(headers.get("x-dev-roles"));
    const hasAnyDevAuthHeader = Boolean(userId || tenantId || roles.length > 0);

    if (!hasAnyDevAuthHeader) {
      return null;
    }

    const parsed = actorSchema.safeParse({
      userId,
      tenantId,
      roles,
      groupIds: parseCsv(headers.get("x-dev-groups")),
      mfaVerifiedAt: headers.get("x-dev-mfa-verified-at") ?? undefined,
    });

    if (!parsed.success) {
      throw new ApiHttpError(401, "auth.invalid_dev_actor", "Invalid development actor headers.", {
        fields: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return parsed.data;
  }
}

export class OidcAuthProvider implements AuthProvider {
  readonly name = "oidc" as const;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: ApiConfig) {
    if (!config.oidcJwksUrl || !config.oidcIssuerUrl || !config.oidcAudience) {
      throw new ApiHttpError(500, "auth.oidc_config_invalid", "OIDC provider is not configured.");
    }

    this.jwks = createRemoteJWKSet(new URL(config.oidcJwksUrl), {
      timeoutDuration: config.oidcJwksTimeoutMs,
    });
  }

  async authenticate(request: Request): Promise<Actor | null> {
    const token = extractBearerToken(request.headers.get("authorization"));

    if (!token) {
      return null;
    }

    try {
      const result = await jwtVerify(token, this.jwks, {
        audience: this.config.oidcAudience,
        issuer: this.config.oidcIssuerUrl,
      });

      return mapOidcClaimsToActor(result.payload, this.config);
    } catch (error) {
      if (error instanceof joseErrors.JWTExpired) {
        throw new ApiHttpError(401, "AUTH_EXPIRED_TOKEN", "Authentication token expired.");
      }

      throw new ApiHttpError(401, "AUTH_INVALID_TOKEN", "Authentication token is invalid.");
    }
  }
}

export function mapOidcClaimsToActor(claims: JWTPayload, config: ApiConfig): Actor {
  const rolesClaim = claims[config.oidcRolesClaim];
  const roles = Array.isArray(rolesClaim)
    ? rolesClaim.map(String)
    : typeof rolesClaim === "string"
      ? parseCsv(rolesClaim)
      : [];
  const userId = claimAsString(claims[config.oidcSubClaim]);
  const tenantId = claimAsString(claims[config.oidcTenantClaim]);

  const parsed = actorSchema.safeParse({
    userId,
    tenantId,
    roles,
    groupIds: [],
  });

  if (!parsed.success) {
    throw new ApiHttpError(401, "AUTH_INVALID_TOKEN", "Authentication token claims are invalid.", {
      fields: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return parsed.data;
}

function extractBearerToken(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(value.trim());

  return match?.[1] ?? null;
}

function claimAsString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseCsv(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
