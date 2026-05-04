import { LearningTopicPage } from "@/components/marketing/learning-topic-page";
import { publicLearningTopics } from "@/lib/demo-learning-data";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";

export const metadata = createLearningTopicMetadata("placement", "/placement");

export default function PlacementPage() {
  return <LearningTopicPage topic={publicLearningTopics.placement} />;
}
