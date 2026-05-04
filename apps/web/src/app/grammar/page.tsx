import { LearningTopicPage } from "@/components/marketing/learning-topic-page";
import { publicLearningTopics } from "@/lib/demo-learning-data";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";

export const metadata = createLearningTopicMetadata("grammar", "/grammar");

export default function GrammarPage() {
  return <LearningTopicPage topic={publicLearningTopics.grammar} />;
}
