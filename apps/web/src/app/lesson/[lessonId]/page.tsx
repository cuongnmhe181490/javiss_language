import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { absoluteUrl } from "@/lib/site-url";
import { fetchLessonDetail, isApiConfigured } from "@/lib/api/client";
import { languageLabelVi } from "@/lib/format";
import type { LessonBlockRecord, ExerciseRecord } from "@/lib/api/types";
import { LessonProgress } from "./lesson-progress";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export const metadata: Metadata = {
  title: "Bài học",
  description: "Chi tiết bài học.",
  alternates: { canonical: absoluteUrl("/lesson") },
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;

  // Lesson detail requires the live backend; there is no demo equivalent.
  if (!isApiConfigured()) {
    return <LessonUnavailable reason="demo" />;
  }

  const lesson = await fetchLessonDetail(lessonId);
  if (!lesson) {
    notFound();
  }

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="size-4" />
            Góc học
          </Link>
          <span className="text-sm font-medium text-slate-300">Bài học</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
              {lesson.targetLevel}
            </Badge>
            <span className="text-sm text-slate-400">{languageLabelVi(lesson.language)}</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="size-3" aria-hidden="true" />
              {lesson.estimatedMinutes} phút
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
          {lesson.description && (
            <p className="mt-3 text-base leading-7 text-slate-400">{lesson.description}</p>
          )}
        </div>

        {lesson.objectives.length > 0 && (
          <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Target className="size-4" aria-hidden="true" />
              Mục tiêu bài học
            </h2>
            <ul className="space-y-2">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </section>
        )}

        {lesson.blocks.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-lg font-semibold">Nội dung</h2>
            {lesson.blocks
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((block) => (
                <LessonBlock key={block.id} block={block} />
              ))}
          </section>
        )}

        {lesson.exercises.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Bài tập</h2>
            {lesson.exercises
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((exercise, index) => (
                <ExerciseItem key={exercise.id} exercise={exercise} index={index} />
              ))}
          </section>
        )}

        <div className="mt-10 space-y-4">
          <LessonProgress lessonId={lesson.id} />
          <div className="flex justify-center">
            <Link
              href="/speaking-practice"
              className="rounded-xl border border-emerald-500/40 px-5 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/10"
            >
              Luyện nói tình huống này
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function LessonBlock({ block }: { block: LessonBlockRecord }) {
  const text =
    typeof block.content.text === "string"
      ? block.content.text
      : typeof block.content.body === "string"
        ? block.content.body
        : JSON.stringify(block.content, null, 2);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <span className="text-xs uppercase tracking-wider text-slate-500">{block.type}</span>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-200">{text}</p>
    </div>
  );
}

function ExerciseItem({ exercise, index }: { exercise: ExerciseRecord; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">#{index + 1}</span>
        <span className="text-xs uppercase tracking-wider text-slate-500">{exercise.type}</span>
        <span className="ml-auto text-xs text-slate-500">{exercise.points} điểm</span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-100">{exercise.prompt}</p>
      {exercise.explanation && (
        <p className="mt-2 text-xs text-slate-400">{exercise.explanation}</p>
      )}
    </div>
  );
}

function LessonUnavailable({ reason }: { reason: "demo" }) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50"
    >
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-xl font-semibold">Bài học cần kết nối hệ thống</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {reason === "demo"
            ? "Nội dung bài học chi tiết lấy từ API học tập. Hãy cấu hình NEXT_PUBLIC_API_BASE_URL để mở bài học thật, hoặc xem các phần luyện tập mẫu."
            : "Không tải được bài học."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/curriculum"
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          >
            Xem lộ trình
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Về góc học
          </Link>
        </div>
      </div>
    </main>
  );
}
