"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  evaluatePlacement,
  placementQuestions,
  type PlacementResult,
} from "@/lib/content/placement-data";

type Phase = "intro" | "quiz" | "result";

export function PlacementQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = placementQuestions.length;
  const question = placementQuestions[currentIndex];

  const correctCount = useMemo(
    () =>
      placementQuestions.reduce((count, q) => (answers[q.id] === q.answer ? count + 1 : count), 0),
    [answers],
  );

  const result: PlacementResult | null =
    phase === "result" ? evaluatePlacement(correctCount) : null;

  function handleSelect(option: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  function handleNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase("result");
    }
  }

  function handleRestart() {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers({});
  }

  if (phase === "intro") {
    return (
      <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Target className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Bài kiểm tra xếp lớp nhanh</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Trả lời {total} câu hỏi ngắn (khoảng 3 phút) để hệ thống gợi ý trình độ CEFR phù hợp.
            Đây là bài tự đánh giá, không phải bài thi chính thức.
          </p>
          <Button onClick={() => setPhase("quiz")} className="mt-6 h-11">
            Bắt đầu kiểm tra
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "result" && result) {
    return (
      <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
            Kết quả
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold">{result.title}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Bạn trả lời đúng {correctCount}/{total} câu.
          </p>
          <Progress
            value={(correctCount / total) * 100}
            aria-label="Điểm xếp lớp"
            className="mt-4 h-2"
          />
          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-slate-800/50 bg-slate-950/60 p-4">
              <p className="text-sm font-medium text-slate-200">Nhận xét</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{result.summary}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-medium text-emerald-200">Gợi ý lộ trình</p>
              <p className="mt-1 text-sm leading-6 text-emerald-300/80">{result.recommendation}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-11">
              <Link href="/curriculum">
                Xem lộ trình phù hợp
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleRestart}
              className="h-11 border-slate-800/50 bg-slate-950/60"
            >
              <RotateCcw aria-hidden="true" />
              Làm lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question) return null;

  const selected = answers[question.id];
  const answeredCount = Object.keys(answers).length;

  return (
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-400">
            Câu {currentIndex + 1}/{total}
          </span>
          <Badge variant="outline" className="border-slate-700 text-xs text-slate-400">
            {question.level}
          </Badge>
        </div>
        <Progress
          value={((currentIndex + (selected ? 1 : 0)) / total) * 100}
          aria-label="Tiến độ kiểm tra"
          className="mt-3 h-1.5"
        />

        <h2 className="mt-6 text-lg font-medium text-slate-100">{question.prompt}</h2>

        <div className="mt-5 space-y-2">
          {question.options.map((option) => {
            const isSelected = selected === option;
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800/50"
                }`}
                aria-pressed={isSelected}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Đã trả lời {answeredCount}/{total}
          </span>
          <Button onClick={handleNext} disabled={!selected} className="h-11">
            {currentIndex < total - 1 ? "Câu tiếp theo" : "Xem kết quả"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
