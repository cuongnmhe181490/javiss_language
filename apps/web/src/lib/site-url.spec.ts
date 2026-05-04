import { afterEach, describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap, { publicRoutes } from "../app/sitemap";
import { absoluteUrl, resolveSiteUrl } from "./site-url";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("site URL helpers", () => {
  it("uses NEXT_PUBLIC_SITE_URL without trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    process.env.VERCEL_URL = "preview.vercel.app";

    expect(resolveSiteUrl()).toBe("https://example.com");
    expect(absoluteUrl("/login")).toBe("https://example.com/login");
  });

  it("falls back to VERCEL_URL with https", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = "preview.vercel.app";

    expect(resolveSiteUrl()).toBe("https://preview.vercel.app");
    expect(absoluteUrl("demo-speaking")).toBe("https://preview.vercel.app/demo-speaking");
  });

  it("uses localhost only for local development fallback", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;

    expect(resolveSiteUrl()).toBe("http://localhost:3000");
  });

  it("builds production-safe sitemap and robots URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://web-delta-azure-40.vercel.app";
    delete process.env.VERCEL_URL;

    const urls = sitemap().map((entry) => entry.url);
    const robotRules = robots();

    expect(urls).toHaveLength(publicRoutes.length);
    expect(urls.every((url) => url.startsWith("https://web-delta-azure-40.vercel.app"))).toBe(true);
    expect(urls.some((url) => url.includes("localhost"))).toBe(false);
    expect(robotRules.sitemap).toBe("https://web-delta-azure-40.vercel.app/sitemap.xml");
  });
});
