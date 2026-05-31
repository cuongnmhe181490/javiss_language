import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";
import { PlacementQuiz } from "@/components/learning/placement-quiz";

export const metadata: Metadata = createLearningTopicMetadata("placement", "/placement");

export default function PlacementPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="size-4" />
            Trang chủ
          </Link>
          <span className="text-sm font-medium text-slate-300">Xếp lớp</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <Badge
            variant="secondary"
            className="rounded-md border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
          >
            Gợi ý trình độ
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Kiểm tra xếp lớp
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Làm bài kiểm tra ngắn để biết nên bắt đầu từ trình độ nào. Kết quả gợi ý lộ trình phù
            hợp với bạn.
          </p>
        </div>

        <PlacementQuiz />
      </div>
    </main>
  );
}
