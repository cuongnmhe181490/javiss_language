"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  MessageCircle,
  Headphones,
  PenLine,
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { curriculumModules, type Lesson } from "@/lib/content/curriculum-data";

const typeIcons: Record<Lesson["type"], typeof BookOpen> = {
  vocabulary: BookOpen,
  grammar: PenLine,
  conversation: MessageCircle,
  listening: Headphones,
  reading: BookOpen,
  review: RotateCcw,
};

const typeLabels: Record<Lesson["type"], string> = {
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  conversation: "Hội thoại",
  listening: "Nghe",
  reading: "Đọc",
  review: "Ôn tập",
};

/**
 * Interactive browser for the curated demo curriculum. Shown to everyone as a
 * sample learning path; live tenant courses (when the API is connected) are
 * rendered separately above this component.
 */
export function CurriculumBrowser() {
  const [expandedModules, setExpandedModules] = useState<string[]>([
    curriculumModules[0]?.id ?? "",
  ]);

  function toggleModule(id: string) {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  return (
    <>
      <div className="space-y-4">
        {curriculumModules.map((mod, modIndex) => {
          const isExpanded = expandedModules.includes(mod.id);
          return (
            <Card
              key={mod.id}
              className="overflow-hidden rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm"
            >
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-800/40 sm:p-6"
                aria-expanded={isExpanded}
                aria-controls={`module-${mod.id}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-lg font-semibold text-emerald-300 border border-emerald-500/30">
                  {modIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{mod.title}</h3>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                      {mod.level}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {mod.titleEn} · {mod.lessons.length} bài học
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="size-5 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="size-5 shrink-0 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div id={`module-${mod.id}`} className="border-t border-slate-800/50">
                  <p className="px-5 pt-4 pb-2 text-sm text-slate-400 sm:px-6">{mod.description}</p>
                  <ul className="divide-y divide-slate-800/40 px-5 pb-4 sm:px-6">
                    {mod.lessons.map((lesson, lessonIndex) => {
                      const Icon = typeIcons[lesson.type];
                      return (
                        <li key={lesson.id} className="flex items-start gap-3 py-3">
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300">
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {modIndex + 1}.{lessonIndex + 1} {lesson.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-slate-700 text-xs text-slate-500"
                              >
                                {typeLabels[lesson.type]}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                              {lesson.description}
                            </p>
                          </div>
                          <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-slate-500">
                            <Clock className="size-3" aria-hidden="true" />
                            {lesson.duration}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="mt-8 rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="flex items-center gap-4 p-5 sm:p-6">
          <GraduationCap className="size-8 shrink-0 text-emerald-400" />
          <div>
            <p className="font-medium">Tổng cộng 15 bài học</p>
            <p className="mt-0.5 text-sm text-slate-400">
              Hoàn thành lộ trình để đạt trình độ A2 — tự tin giao tiếp trong các tình huống hàng
              ngày và công việc cơ bản.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
