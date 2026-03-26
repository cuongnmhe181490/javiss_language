"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type WritingFeedbackResult = {
  overallBand: string;
  taskBand: string;
  coherenceBand: string;
  lexicalBand: string;
  grammarBand: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  sampleRewrite: string;
};

function getFallbackMessage(reason?: string | null) {
  switch (reason) {
    case "daily_quota_reached":
      return "AI đã chạm quota hôm nay. Hệ thống tạm chuyển sang chế độ dự phòng.";
    case "provider_request_failed":
      return "AI đang lỗi tạm thời. Hệ thống đã chuyển sang chế độ dự phòng.";
    default:
      return null;
  }
}

const promptSuggestions = [
  "Some people think online learning is more effective than classroom learning. To what extent do you agree or disagree?",
  "The chart below shows changes in household spending over a 10-year period. Summarise the information by selecting and reporting the main features.",
  "In many cities, traffic congestion is getting worse. What are the causes and what solutions can be taken?",
];

export function WritingFeedbackForm() {
  const [taskType, setTaskType] = useState<"task1" | "task2">("task2");
  const [prompt, setPrompt] = useState(promptSuggestions[0]);
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState<WritingFeedbackResult | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/ai/writing-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskType,
            prompt,
            essay,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          toast.error(payload?.error?.message ?? "Chưa thể chữa bài writing lúc này.");
          return;
        }

        const fallbackMessage = getFallbackMessage(payload?.data?.fallbackReason);

        if (fallbackMessage) {
          toast.message(fallbackMessage);
        }

        setResult(payload.data.feedback);
        setProvider(payload.data.provider);
      } catch {
        toast.error("Chưa thể chữa bài writing lúc này.");
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Gửi bài để AI chữa</CardTitle>
          <CardDescription>
            Nhập đề bài và bài viết của bạn. AI sẽ chấm band sơ bộ, chỉ ra điểm mạnh và gợi ý cách viết tốt hơn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Dạng bài
              </label>
              <Select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value as "task1" | "task2")}
              >
                <option value="task1">IELTS Writing Task 1</option>
                <option value="task2">IELTS Writing Task 2</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Gợi ý đề nhanh
              </label>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPrompt(item)}
                  >
                    Chọn đề
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Đề bài
            </label>
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Dán đề IELTS Writing vào đây"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Bài viết của bạn
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {wordCount} từ
              </span>
            </div>
            <Textarea
              className="min-h-72"
              value={essay}
              onChange={(event) => setEssay(event.target.value)}
              placeholder="Viết bài của bạn tại đây. AI sẽ chấm sơ bộ và gợi ý cách sửa."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gợi ý: với Task 2, hãy viết từ 250 từ trở lên để feedback ổn định hơn.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI sẽ trả band sơ bộ, điểm mạnh, điểm cần cải thiện và một đoạn viết mẫu tốt hơn.
            </p>
            <Button type="button" disabled={isPending} onClick={handleSubmit}>
              {isPending ? "Đang chữa bài..." : "Chữa bài với AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Kết quả chữa bài</CardTitle>
            {provider ? (
              <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {provider === "gemini" ? "Gemini" : provider === "openai" ? "OpenAI" : "Chế độ demo"}
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Đây là nhận xét nhanh để bạn sửa bài và viết lại tốt hơn ở lượt tiếp theo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {result ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Band tổng
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {result.overallBand}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Task
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {result.taskBand}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Coherence
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {result.coherenceBand}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Lexical / Grammar
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {result.lexicalBand} / {result.grammarBand}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                {result.summary}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Điểm tốt hiện tại
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.strengths.map((item) => (
                      <Badge key={item} className="bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Cần cải thiện tiếp
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.improvements.map((item) => (
                      <Badge
                        key={item}
                        className="bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Đoạn viết mẫu tốt hơn
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {result.sampleRewrite}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              Kết quả chữa bài sẽ xuất hiện ở đây sau khi bạn gửi bài viết.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
