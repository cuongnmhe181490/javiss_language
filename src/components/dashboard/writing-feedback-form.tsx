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

type WritingHistoryItem = {
  id: string;
  taskType: "task1" | "task2";
  prompt: string;
  wordCount: number;
  overallBand: string;
  taskBand: string;
  coherenceBand: string;
  lexicalBand: string;
  grammarBand: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  sampleRewrite: string;
  provider: "mock" | "openai" | "gemini";
  modelName: string;
  fallbackReason: string | null;
  createdAt: string;
};

type WritingSummary = {
  totalSubmissions: number;
  latestBand: string | null;
  bestBand: string | null;
  averageBand: string | null;
  task1Count: number;
  task2Count: number;
  lastSubmittedAt: string | null;
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

function getProviderLabel(provider: WritingHistoryItem["provider"] | string | null) {
  switch (provider) {
    case "gemini":
      return "Gemini";
    case "openai":
      return "OpenAI";
    case "mock":
      return "Chế độ dự phòng";
    default:
      return "Chưa có";
  }
}

function getTaskTypeLabel(taskType: WritingHistoryItem["taskType"]) {
  return taskType === "task1" ? "Task 1" : "Task 2";
}

function parseBand(value: string | null) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function truncate(value: string, maxLength = 160) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

const promptSuggestions = [
  "Some people think online learning is more effective than classroom learning. To what extent do you agree or disagree?",
  "The chart below shows changes in household spending over a 10-year period. Summarise the information by selecting and reporting the main features.",
  "In many cities, traffic congestion is getting worse. What are the causes and what solutions can be taken?",
];

export function WritingFeedbackForm({
  initialHistory,
  initialSummary,
}: {
  initialHistory: WritingHistoryItem[];
  initialSummary: WritingSummary;
}) {
  const [taskType, setTaskType] = useState<"task1" | "task2">("task2");
  const [prompt, setPrompt] = useState(promptSuggestions[0]);
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState<WritingFeedbackResult | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const [summary, setSummary] = useState(initialSummary);
  const [isPending, startTransition] = useTransition();

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  const trendPoints = [...history].slice(0, 6).reverse();

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
        setSummary(payload.data.summary);
        setHistory((current) => {
          const next = [
            payload.data.submission as WritingHistoryItem,
            ...current.filter((item) => item.id !== payload.data.submission.id),
          ];

          return next.slice(0, 8);
        });

        toast.success("Đã lưu bài viết và phản hồi mới vào lịch sử của bạn.");
      } catch {
        toast.error("Chưa thể chữa bài writing lúc này.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <CardHeader>
            <CardTitle>Gửi bài để AI chấm và sửa</CardTitle>
            <CardDescription>
              Nhập đề bài và bài viết của bạn. Hệ thống sẽ chấm band sơ bộ, chỉ ra điểm mạnh, điểm cần cải thiện và lưu lại lịch sử để bạn theo dõi tiến bộ.
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
                <span className="text-xs text-slate-500 dark:text-slate-400">{wordCount} từ</span>
              </div>
              <Textarea
                className="min-h-72"
                value={essay}
                onChange={(event) => setEssay(event.target.value)}
                placeholder="Viết hoặc dán bài của bạn tại đây. Hệ thống sẽ chấm sơ bộ và lưu lại vào lịch sử writing."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gợi ý: với Task 2, hãy viết từ 250 từ trở lên để band sơ bộ ổn định hơn.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mỗi lần gửi bài sẽ được lưu lại để bạn so sánh band, nhận xét và xu hướng tiến bộ theo thời gian.
              </p>
              <Button type="button" disabled={isPending} onClick={handleSubmit}>
                {isPending ? "Đang chấm bài..." : "Chấm bài với AI"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Kết quả lượt chấm mới nhất</CardTitle>
              {provider ? (
                <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {getProviderLabel(provider)}
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              Đây là nhận xét nhanh để bạn sửa bài ngay sau khi gửi. Lịch sử các bài cũ nằm ở phần bên dưới.
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
                      Điểm đang làm tốt
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.strengths.map((item) => (
                        <Badge
                          key={item}
                          className="bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
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
                Kết quả chữa bài sẽ xuất hiện ở đây sau khi bạn gửi bài viết đầu tiên.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử writing và xu hướng band</CardTitle>
          <CardDescription>
            Theo dõi các bài đã gửi để biết band mới nhất, band tốt nhất và tần suất luyện Task 1, Task 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              Bạn chưa có lịch sử writing. Sau lần gửi bài đầu tiên, hệ thống sẽ tự lưu lại band, nhận xét và dữ liệu tiến bộ tại đây.
            </div>
          ) : (
            <>
              <div className="grid gap-3 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Band mới nhất
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {summary.latestBand ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Band tốt nhất
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {summary.bestBand ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Band trung bình
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {summary.averageBand ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Tổng số bài
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {summary.totalSubmissions}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Tỷ lệ Task 1 / Task 2
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {summary.task1Count} / {summary.task2Count}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      Xu hướng 6 lượt gần nhất
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mỗi cột tương ứng với một lần bạn gửi bài writing.
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    {summary.lastSubmittedAt
                      ? `Cập nhật gần nhất: ${new Date(summary.lastSubmittedAt).toLocaleString("vi-VN")}`
                      : "Chưa có dữ liệu"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                  {trendPoints.map((item, index) => {
                    const height = Math.max(20, Math.round((parseBand(item.overallBand) / 9) * 160));

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex h-44 items-end justify-center rounded-2xl bg-slate-50/80 px-2 py-3 dark:bg-slate-900/50">
                          <div
                            className="flex w-full items-end justify-center rounded-2xl bg-gradient-to-t from-fuchsia-500 via-sky-400 to-cyan-300 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/20"
                            style={{ height }}
                            title={`${item.overallBand} band`}
                          >
                            <span className="pb-2">{item.overallBand}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                            Lượt {index + 1}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:border-sky-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-sky-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {getTaskTypeLabel(item.taskType)}
                          </Badge>
                          <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
                            Band {item.overallBand}
                          </Badge>
                          <Badge className="bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {getProviderLabel(item.provider)}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {truncate(item.prompt, 180)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(item.createdAt).toLocaleString("vi-VN")} · {item.wordCount} từ
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTaskType(item.taskType);
                          setPrompt(item.prompt);
                          toast.message("Đã đưa lại đề cũ vào form để bạn viết tiếp.");
                        }}
                      >
                        Dùng lại đề này
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Task
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {item.taskBand}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Coherence
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {item.coherenceBand}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Lexical
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {item.lexicalBand}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Grammar
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {item.grammarBand}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                          {item.summary}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.strengths.map((strength) => (
                            <Badge
                              key={`${item.id}-${strength}`}
                              className="bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {item.improvements.map((improvement) => (
                            <Badge
                              key={`${item.id}-${improvement}`}
                              className="bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                            >
                              {improvement}
                            </Badge>
                          ))}
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            Đoạn viết mẫu từ lượt này
                          </p>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                            {item.sampleRewrite}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
