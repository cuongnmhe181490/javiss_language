"use client";

import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface FeedbackItem {
  type: "good" | "warning";
  text: string;
  detail: string;
}

interface FeedbackData {
  pronunciation: FeedbackItem[];
  grammar: FeedbackItem[];
  suggestion: string;
}

interface FeedbackPanelProps {
  feedback: FeedbackData | null;
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  if (!feedback) {
    return null;
  }

  const allItems = [...feedback.pronunciation, ...feedback.grammar];

  if (allItems.length === 0 && !feedback.suggestion) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-sm font-medium text-slate-400 mb-4">AI Feedback</h2>

      <div className="space-y-3">
        {allItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            {item.type === "good" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            )}
            <div>
              <p className="text-sm text-slate-200">{item.text}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          </div>
        ))}

        {feedback.suggestion && (
          <div className="flex items-start gap-3 pt-2 border-t border-white/5">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-400" />
            <div>
              <p className="text-sm text-slate-200">{feedback.suggestion}</p>
              <p className="text-xs text-slate-500">Gợi ý cải thiện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
