"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Headphones,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listeningExercises, type ListeningQuestion } from "@/lib/content/listening-data";

export default function ListeningContent() {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {listeningExercises.map((exercise) => {
        const isExpanded = expandedExercise === exercise.id;
        return (
          <Card
            key={exercise.id}
            className="overflow-hidden rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm"
          >
            <button
              onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
              className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-800/40"
              aria-expanded={isExpanded}
              aria-controls={`listening-${exercise.id}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Headphones className="size-4 text-emerald-300" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold">{exercise.title}</h2>
                  <Badge variant="outline" className="border-slate-700 text-xs text-slate-400">
                    {exercise.level}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-400">{exercise.context}</p>
              </div>
              {isExpanded ? (
                <ChevronDown className="size-5 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <div id={`listening-${exercise.id}`} className="border-t border-slate-800/50 p-5">
                <TranscriptSection transcript={exercise.transcript} />
                <QuestionsSection questions={exercise.questions} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function TranscriptSection({ transcript }: { transcript: string[] }) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="mb-5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTranscript(!showTranscript)}
        className="border-slate-700 text-slate-300 mb-3"
      >
        {showTranscript ? (
          <>
            <EyeOff className="mr-1.5 size-3.5" />
            Ẩn transcript
          </>
        ) : (
          <>
            <Eye className="mr-1.5 size-3.5" />
            Xem transcript
          </>
        )}
      </Button>

      {showTranscript && (
        <div className="rounded-md bg-slate-800/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Transcript
          </h3>
          <div className="space-y-1.5">
            {transcript.map((line, i) => {
              const colonIndex = line.indexOf(":");
              const speaker = colonIndex > -1 ? line.slice(0, colonIndex) : null;
              const text = colonIndex > -1 ? line.slice(colonIndex + 1).trim() : line;
              return (
                <p key={i} className="text-sm leading-6">
                  {speaker && <span className="font-medium text-emerald-300">{speaker}: </span>}
                  <span className="text-slate-300">{text}</span>
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionsSection({ questions }: { questions: ListeningQuestion[] }) {
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
  const correctCount = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div>
      <h3 className="text-sm font-semibold text-emerald-300 mb-3">🎯 Câu hỏi</h3>
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
                  } else if (option === answers[qIndex] && answers[qIndex] !== q.answer) {
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
