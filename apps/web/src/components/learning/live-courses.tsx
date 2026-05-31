import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { fetchCourses } from "@/lib/api/client";
import { languageLabelVi } from "@/lib/format";

/**
 * Server component that renders the tenant's published courses from the backend
 * API. Returns null when the API is not configured or has no courses, so the
 * curriculum page falls back to the curated demo path alone.
 */
export async function LiveCourses() {
  const result = await fetchCourses();
  const courses = result?.data ?? [];

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Layers className="size-5 text-emerald-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Khóa học của bạn</h2>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
          Trực tiếp
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/course/${course.id}`}
            className="group rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
                {course.targetLevel}
              </Badge>
              <span className="text-xs text-slate-400">{languageLabelVi(course.language)}</span>
            </div>
            <h3 className="mt-3 font-semibold text-slate-100">{course.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">{course.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-300">
              Vào học
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
