import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";
import { CurriculumBrowser } from "@/components/learning/curriculum-browser";
import { LiveCourses } from "@/components/learning/live-courses";

export const metadata: Metadata = createLearningTopicMetadata("curriculum", "/curriculum");

export default function CurriculumPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Badge
            variant="secondary"
            className="rounded-md border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
          >
            Lộ trình học
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Bản đồ bài học</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Lộ trình từ A1 đến A2 với 3 module, mỗi module gồm 4–5 bài học thực tế. Học theo thứ tự
            hoặc chọn bài bạn cần.
          </p>
        </div>

        {/* Live tenant courses (only when API is connected) */}
        <LiveCourses />

        {/* Curated demo path */}
        <CurriculumBrowser />
      </div>
    </main>
  );
}
