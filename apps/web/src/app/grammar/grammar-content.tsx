"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { grammarLessons, type GrammarExercise } from "@/lib/content/grammar-data";

export default function GrammarContent() {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {grammarLessons.map((lesson) => {
        const isExpanded = expandedLesson === lesson.id;
        return (
          <Card
            key={lesson.id}
            className="overflow-hidden rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm"
          >
            <button
              onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
              className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-800/40"
              aria-expanded={isExpanded}
              aria-controls={`grammar-${lesson.id}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <BookOpen className="size-4 text-emerald-300" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold">{lesson.title}</h2>
                  <Badge variant="outline" className="border-slate-700 text-xs text-slate-400">
                    {lesson.level}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-400">{lesson.englishTitle}</p>
              </div>
              {isExpanded ? (
                <ChevronDown className="size-5 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <div id={`grammar-${lesson.id}`} className="border-t border-slate-800/50 p-5">
                {/* Explanation */}
                <div className="rounded-md bg-slate-800/60 p-4">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-2">📖 Giải thích</h3>
                  <p className="text-sm leading-6 text-slate-300">{lesson.explanation}</p>
                </div>

                {/* Examples */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-3">💡 Ví dụ</h3>
                  <ul className="space-y-2">
                    {lesson.examples.map((ex, i) => (
                      <li key={i} className="rounded-md bg-slate-800/40 p-3">
                        <p className="text-sm font-medium">{ex.english}</p>
                        <p className="mt-0.5 text-xs text-slate-400">→ {ex.vietnamese}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exercises */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-3">✏️ Bài tập</h3>
                  <div className="space-y-3">
                    {lesson.exercises.map((exercise, i) => (
                      <ExerciseCard key={i} exercise={exercise} index={i} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: GrammarExercise; index: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const isCorrect = selected === exercise.answer;

  function handleSelect(option: string) {
    if (showAnswer) return;
    setSelected(option);
    setShowAnswer(true);
  }

  function handleReset() {
    setSelected(null);
    setShowAnswer(false);
  }

  return (
    <div className="rounded-md bg-slate-800/40 p-4">
      <p className="text-sm font-medium mb-3">
        <span className="text-slate-500 mr-1">#{index + 1}</span>
        {exercise.question}
      </p>

      {exercise.type === "multiple-choice" && exercise.options ? (
        <div className="space-y-2">
          {exercise.options.map((option) => {
            let optionClass =
              "w-full text-left rounded-md border border-slate-700 px-3 py-2 text-sm transition-colors hover:border-emerald-500/50 hover:bg-slate-700/50";
            if (showAnswer) {
              if (option === exercise.answer) {
                optionClass =
                  "w-full text-left rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300";
              } else if (option === selected && !isCorrect) {
                optionClass =
                  "w-full text-left rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-300";
              } else {
                optionClass =
                  "w-full text-left rounded-md border border-slate-700/50 px-3 py-2 text-sm text-slate-500";
              }
            }
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={showAnswer}
                className={optionClass}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          {!showAnswer ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswer(true)}
              className="border-slate-700 text-slate-300"
            >
              Xem đáp án
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">{exercise.answer}</span>
            </div>
          )}
        </div>
      )}

      {showAnswer && (
        <div className="mt-3 flex items-start gap-2">
          {isCorrect || exercise.type === "fill-in-blank" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
          )}
          <p className="text-xs text-slate-400">{exercise.explanation}</p>
          <button
            onClick={handleReset}
            className="ml-auto shrink-0 text-xs text-slate-500 hover:text-slate-300"
          >
            Làm lại
          </button>
        </div>
      )}
    </div>
  );
}
