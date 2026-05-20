"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  readingPassages,
  type ReadingQuestion,
} from "@/lib/content/reading-data";

export default function ReadingPage() {
  const [expandedPassage, setExpandedPassage] = useState<string | null>(null);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-950 text-slate-50"
    >
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
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
            Đọc các đoạn văn ngắn trong tình huống thực tế. Tra từ vựng gợi ý
            và trả lời câu hỏi để kiểm tra hiểu bài.
          </p>
        </div>

        {/* Passages */}
        <div className="space-y-3">
          {readingPassages.map((passage) => {
            const isExpanded = expandedPassage === passage.id;
            return (
              <Card
                key={passage.id}
                className="overflow-hidden rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm"
              >
                <button
                  onClick={() =>
                    setExpandedPassage(isExpanded ? null : passage.id)
                  }
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-800/40"
                  aria-expanded={isExpanded}
                  aria-controls={`reading-${passage.id}`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <BookOpen className="size-4 text-emerald-300" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold">{passage.title}</h2>
                      <Badge
                        variant="outline"
                        className="border-slate-700 text-xs text-slate-400"
                      >
                        {passage.level}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {passage.topic}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="size-5 shrink-0 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div
                    id={`reading-${passage.id}`}
                    className="border-t border-slate-800/50 p-5"
                  >
                    {/* Passage text */}
                    <div className="rounded-md bg-slate-800/60 p-4 mb-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                        Bài đọc
                      </h3>
                      <div className="whitespace-pre-line text-sm leading-7 text-slate-200">
                        {passage.passage}
                      </div>
                    </div>

                    {/* Vocabulary hints */}
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-emerald-300 mb-3">
                        📚 Từ vựng gợi ý
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {passage.vocabHints.map((hint) => (
                          <VocabChip key={hint.word} word={hint.word} meaning={hint.meaning} />
                        ))}
                      </div>
                    </div>

                    {/* Questions */}
                    <ReadingQuestionsSection questions={passage.questions} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function VocabChip({ word, meaning }: { word: string; meaning: string }) {
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <button
      onClick={() => setShowMeaning(!showMeaning)}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs transition-colors hover:border-emerald-500/50"
    >
      <span className="font-medium text-slate-200">{word}</span>
      {showMeaning && (
        <span className="text-emerald-300">= {meaning}</span>
      )}
      {!showMeaning && (
        <span className="text-slate-500">?</span>
      )}
    </button>
  );
}

function ReadingQuestionsSection({
  questions,
}: {
  questions: ReadingQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  function handleSelect(qIndex: number, option: string) {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  }

  function handleCheck() {
    setShowResults(true);
  }

  function handleReset() {
    setAnswers({});
    setShowResults(false);
  }

  const allAnswered = Object.keys(answers).length === questions.length;
  const correctCount = questions.filter(
    (q, i) => answers[i] === q.answer
  ).length;

  return (
    <div>
      <h3 className="text-sm font-semibold text-emerald-300 mb-3">
        🎯 Câu hỏi đọc hiểu
      </h3>
      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-md bg-slate-800/40 p-4">
            <p className="text-sm font-medium mb-2">
              <span className="text-slate-500 mr-1">{qIndex + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((option) => {
                let optionClass =
                  "w-full text-left rounded-md border border-slate-700 px-3 py-2 text-sm transition-colors hover:border-emerald-500/50 hover:bg-slate-700/50";

                if (answers[qIndex] === option && !showResults) {
                  optionClass =
                    "w-full text-left rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300";
                }

                if (showResults) {
                  if (option === q.answer) {
                    optionClass =
                      "w-full text-left rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300";
                  } else if (
                    option === answers[qIndex] &&
                    answers[qIndex] !== q.answer
                  ) {
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
                    onClick={() => handleSelect(qIndex, option)}
                    disabled={showResults}
                    className={optionClass}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {!showResults ? (
          <Button
            onClick={handleCheck}
            disabled={!allAnswered}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            Kiểm tra đáp án
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {correctCount === questions.length ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <XCircle className="size-5 text-amber-400" />
              )}
              <span className="text-sm text-slate-300">
                {correctCount}/{questions.length} câu đúng
              </span>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300"
            >
              Làm lại
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
