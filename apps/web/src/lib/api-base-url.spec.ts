import { afterEach, describe, expect, it } from "vitest";
import { apiUrl, hasConfiguredApiBaseUrl, resolveApiBaseUrl } from "./api-base-url";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("API base URL helpers", () => {
  it("uses NEXT_PUBLIC_API_BASE_URL without trailing slash", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api-staging.example.com/";

    expect(resolveApiBaseUrl()).toBe("https://api-staging.example.com");
    expect(apiUrl("/health/ready")).toBe("https://api-staging.example.com/health/ready");
    expect(hasConfiguredApiBaseUrl()).toBe(true);
  });

  it("uses local API fallback only when no public API base URL is configured", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    expect(resolveApiBaseUrl()).toBe("http://localhost:4000");
    expect(apiUrl("v1/tenants/demo/courses")).toBe("http://localhost:4000/v1/tenants/demo/courses");
    expect(hasConfiguredApiBaseUrl()).toBe(false);
  });
});
