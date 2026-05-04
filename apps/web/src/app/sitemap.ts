import type { MetadataRoute } from "next";

import { absoluteUrl } from "../lib/site-url";

export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/demo-speaking",
  "/dashboard",
  "/grammar",
  "/speaking",
  "/listening",
  "/reading",
  "/placement",
  "/curriculum",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/dashboard" ? 0.8 : 0.7,
  }));
}
