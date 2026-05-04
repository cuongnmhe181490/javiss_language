import { LearningTopicPage } from "@/components/marketing/learning-topic-page";
import { publicLearningTopics } from "@/lib/demo-learning-data";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";

export const metadata = createLearningTopicMetadata("listening", "/listening");

export default function ListeningPage() {
  return <LearningTopicPage topic={publicLearningTopics.listening} />;
}
