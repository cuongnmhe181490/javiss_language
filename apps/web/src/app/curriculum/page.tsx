import { LearningTopicPage } from "@/components/marketing/learning-topic-page";
import { publicLearningTopics } from "@/lib/demo-learning-data";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";

export const metadata = createLearningTopicMetadata("curriculum", "/curriculum");

export default function CurriculumPage() {
  return <LearningTopicPage topic={publicLearningTopics.curriculum} />;
}
