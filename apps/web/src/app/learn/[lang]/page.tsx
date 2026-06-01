import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/site-url";
import { Phrasebook } from "@/components/learning/phrasebook";
import { languageCourses, type LanguageCode } from "@/lib/content/phrasebook-data";

const VALID: LanguageCode[] = ["en", "zh", "ja", "ko"];

interface LangPageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return VALID.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const { lang } = await params;
  const course = VALID.includes(lang as LanguageCode)
    ? languageCourses[lang as LanguageCode]
    : null;

  if (!course) {
    return { title: "Khóa học ngôn ngữ" };
  }

  return {
    title: `${course.name} (${course.nativeName})`,
    description: course.blurb,
    alternates: { canonical: absoluteUrl(`/learn/${lang}`) },
  };
}

export default async function LanguagePage({ params }: LangPageProps) {
  const { lang } = await params;

  if (!VALID.includes(lang as LanguageCode)) {
    notFound();
  }

  const course = languageCourses[lang as LanguageCode];

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
          >
            <ArrowLeft className="size-4" />
            Trang chủ
          </Link>
          <span className="text-sm font-medium text-slate-300">{course.name}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl" aria-hidden="true">
              {course.flag}
            </span>
            <Badge
              variant="secondary"
              className="rounded-md border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
            >
              {course.framework}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {course.name} <span className="text-slate-500">· {course.nativeName}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">{course.blurb}</p>
        </div>

        <Card className="mb-8 rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <BookOpen className="size-4" aria-hidden="true" />
              Tổng quan
            </h2>
            <ul className="space-y-2">
              {course.facts.map((fact) => (
                <li key={fact} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  {fact}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <h2 className="mb-1 text-xl font-semibold">Cụm câu khởi đầu</h2>
        <p className="mb-6 text-sm text-slate-400">
          Nhấn nút loa để nghe phát âm. Có phiên âm và nghĩa tiếng Việt cho từng câu.
        </p>

        <Phrasebook lang={course.code} topics={course.topics} />

        <div className="mt-10 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-11">
            <Link href="/placement">
              Kiểm tra trình độ
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 border-slate-700">
            <Link href="/curriculum">Xem lộ trình</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
