import { LearningTopicPage } from "@/components/marketing/learning-topic-page";
import { publicLearningTopics } from "@/lib/demo-learning-data";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";

export const metadata = createLearningTopicMetadata("speaking", "/speaking");

export default function SpeakingPage() {
  return <LearningTopicPage topic={publicLearningTopics.speaking} />;
}
