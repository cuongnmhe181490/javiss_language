import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { absoluteUrl } from "@/lib/site-url";
import { fetchCourseDetail, isApiConfigured } from "@/lib/api/client";
import { languageLabelVi } from "@/lib/format";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Chi tiết khóa học.",
  alternates: { canonical: absoluteUrl("/course") },
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;

  if (!isApiConfigured()) {
    notFound();
  }

  const course = await fetchCourseDetail(courseId);
  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/curriculum"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="size-4" />
            Lộ trình
          </Link>
          <span className="text-sm font-medium text-slate-300">Khóa học</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
              {course.targetLevel}
            </Badge>
            <span className="text-sm text-slate-400">{languageLabelVi(course.language)}</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <BookOpen className="size-3" aria-hidden="true" />
              {totalLessons} bài học
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-400">{course.description}</p>
        </div>

        <div className="space-y-6">
          {course.modules
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((mod, modIndex) => (
              <section key={mod.id}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-sm font-semibold text-emerald-300">
                    {modIndex + 1}
                  </span>
                  <h2 className="font-semibold">{mod.title}</h2>
                </div>
                {mod.description && (
                  <p className="mb-3 pl-11 text-sm text-slate-400">{mod.description}</p>
                )}
                <ul className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/lesson/${lesson.id}`}
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-500/40 hover:bg-white/10"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-100">{lesson.title}</p>
                          {lesson.description && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500">
                          <Clock className="size-3" aria-hidden="true" />
                          {lesson.estimatedMinutes}p
                        </span>
                        <ArrowRight
                          className="size-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </main>
  );
}
