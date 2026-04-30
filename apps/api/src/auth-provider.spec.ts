import { afterEach, describe, expect, it, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

import { DevHeaderAuthProvider, mapOidcClaimsToActor, OidcAuthProvider } from "./auth-provider.js";
import { createTestApiConfig } from "./config.js";
import { ApiHttpError } from "./errors.js";
import { adminUserId, tenantAlphaId } from "./fixtures.js";

describe("auth providers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a dev actor from valid development headers", async () => {
    const provider = new DevHeaderAuthProvider();
    const actor = await provider.authenticate(
      new Request("http://api.test/v1/tenants/1", {
        headers: {
          "x-dev-user-id": adminUserId,
          "x-dev-tenant-id": tenantAlphaId,
          "x-dev-roles": "tenant_admin",
        },
      }),
    );

    expect(actor).toMatchObject({
      userId: adminUserId,
      tenantId: tenantAlphaId,
      roles: ["tenant_admin"],
    });
  });

  it("returns null when dev auth headers are absent", async () => {
    await expect(
      new DevHeaderAuthProvider().authenticate(new Request("http://api.test")),
    ).resolves.toBeNull();
  });

  it("throws a typed error for partial dev auth headers", async () => {
    await expect(
      new DevHeaderAuthProvider().authenticate(
        new Request("http://api.test", {
          headers: {
            "x-dev-user-id": adminUserId,
            "x-dev-roles": "tenant_admin",
          },
        }),
      ),
    ).rejects.toThrow(ApiHttpError);
  });

  it("returns null for OIDC when a bearer token is missing", async () => {
    await expect(
      new OidcAuthProvider(
        createTestApiConfig({
          authMode: "oidc",
          oidcAudience: "polyglot-api",
          oidcIssuerUrl: "https://issuer.example.com",
          oidcJwksUrl: "https://issuer.example.com/.well-known/jwks.json",
        }),
      ).authenticate(new Request("http://api.test")),
    ).resolves.toBeNull();
  });

  it("maps OIDC claims into actor context", () => {
    expect(
      mapOidcClaimsToActor(
        {
          email: "admin@example.test",
          roles: ["tenant_admin"],
          sub: adminUserId,
          tenant_id: tenantAlphaId,
        },
        createTestApiConfig(),
      ),
    ).toMatchObject({
      roles: ["tenant_admin"],
      tenantId: tenantAlphaId,
      userId: adminUserId,
    });
  });

  it("rejects invalid OIDC claim mappings without exposing token material", () => {
    expect(() =>
      mapOidcClaimsToActor(
        {
          roles: ["tenant_admin"],
          sub: "not-a-uuid",
          tenant_id: tenantAlphaId,
        },
        createTestApiConfig(),
      ),
    ).toThrow(ApiHttpError);
  });

  it("validates a signed OIDC token with a mocked JWKS and maps actor claims", async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const publicJwk = await exportJWK(publicKey);
    publicJwk.kid = "test-key";
    const issuer = "https://issuer.example.com";
    const audience = "polyglot-api";
    const token = await new SignJWT({
      roles: ["tenant_admin"],
      tenant_id: tenantAlphaId,
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setSubject(adminUserId)
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime("10m")
      .sign(privateKey);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(JSON.stringify({ keys: [publicJwk] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        });
      }),
    );

    const actor = await new OidcAuthProvider(
      createTestApiConfig({
        authMode: "oidc",
        oidcAudience: audience,
        oidcIssuerUrl: issuer,
        oidcJwksUrl: "https://issuer.example.com/.well-known/jwks.json",
      }),
    ).authenticate(
      new Request("http://api.test", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(actor).toMatchObject({
      roles: ["tenant_admin"],
      tenantId: tenantAlphaId,
      userId: adminUserId,
    });
  });

  it("rejects wrong issuer or audience as invalid token", async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const publicJwk = await exportJWK(publicKey);
    publicJwk.kid = "test-key";
    const token = await new SignJWT({
      roles: ["tenant_admin"],
      tenant_id: tenantAlphaId,
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setSubject(adminUserId)
      .setIssuer("https://wrong.example.com")
      .setAudience("wrong-audience")
      .setExpirationTime("10m")
      .sign(privateKey);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(JSON.stringify({ keys: [publicJwk] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        });
      }),
    );

    await expect(
      new OidcAuthProvider(
        createTestApiConfig({
          authMode: "oidc",
          oidcAudience: "polyglot-api",
          oidcIssuerUrl: "https://issuer.example.com",
          oidcJwksUrl: "https://issuer.example.com/.well-known/jwks.json",
        }),
      ).authenticate(
        new Request("http://api.test", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      ),
    ).rejects.toMatchObject({
      code: "AUTH_INVALID_TOKEN",
    });
  });
});
