import type { MetadataRoute } from "next";

import { absoluteUrl } from "../lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Polyglot AI Academy",
    short_name: "Polyglot AI",
    description:
      "AI language learning beta for tutor chat, speaking practice, and verified learning progress.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    lang: "en",
    icons: [
      {
        src: absoluteUrl("/icon.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
