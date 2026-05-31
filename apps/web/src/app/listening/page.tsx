import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";
import { LiveLessonsBanner } from "@/components/learning/live-lessons-banner";
import ListeningContent from "./listening-content";

export const metadata: Metadata = createLearningTopicMetadata("listening", "/listening");

export default function ListeningPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Badge
            variant="secondary"
            className="rounded-md border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
          >
            Luyện nghe
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Luyện nghe tiếng Anh
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Nghe hội thoại trong các tình huống thực tế. Đọc transcript, trả lời câu hỏi và cải
            thiện kỹ năng nghe hiểu.
          </p>
        </div>

        <LiveLessonsBanner />
        <ListeningContent />
      </div>
    </main>
  );
}
