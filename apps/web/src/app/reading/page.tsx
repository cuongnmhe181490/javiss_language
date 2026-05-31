import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";
import { LiveLessonsBanner } from "@/components/learning/live-lessons-banner";
import ReadingContent from "./reading-content";

export const metadata: Metadata = createLearningTopicMetadata("reading", "/reading");

export default function ReadingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Badge
            variant="secondary"
            className="rounded-md border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
          >
            Luyện đọc
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Luyện đọc tiếng Anh
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Đọc các đoạn văn ngắn trong tình huống thực tế. Tra từ vựng gợi ý và trả lời câu hỏi để
            kiểm tra hiểu bài.
          </p>
        </div>

        <LiveLessonsBanner />
        <ReadingContent />
      </div>
    </main>
  );
}
