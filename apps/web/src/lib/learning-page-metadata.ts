import type { Metadata } from "next";

import { publicLearningTopics, type PublicLearningTopicKey } from "@/lib/demo-learning-data";
import { absoluteUrl } from "@/lib/site-url";

export function createLearningTopicMetadata(key: PublicLearningTopicKey, path: string): Metadata {
  const topic = publicLearningTopics[key];

  return {
    title: topic.title,
    description: topic.description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title: `${topic.title} | Polyglot AI Academy`,
      description: topic.description,
      url: absoluteUrl(path),
      images: ["/og-image.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.title} | Polyglot AI Academy`,
      description: topic.description,
      images: ["/og-image.svg"],
    },
  };
}
