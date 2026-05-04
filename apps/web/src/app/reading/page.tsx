import { LearningTopicPage } from "@/components/marketing/learning-topic-page";
import { publicLearningTopics } from "@/lib/demo-learning-data";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";

export const metadata = createLearningTopicMetadata("reading", "/reading");

export default function ReadingPage() {
  return <LearningTopicPage topic={publicLearningTopics.reading} />;
}
