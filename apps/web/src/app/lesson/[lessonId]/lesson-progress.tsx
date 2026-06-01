"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Status = "idle" | "started" | "completed";

/**
 * Lesson progress controls. Calls the internal API proxy which forwards to the
 * backend learning API (lesson:start / lesson:complete).
 */
export function LessonProgress({ lessonId }: { lessonId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [pending, setPending] = useState<null | "start" | "complete">(null);

  async function run(action: "start" | "complete") {
    setPending(action);
    try {
      const res = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: action === "complete" ? JSON.stringify({ score: 100 }) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Không lưu được tiến độ. Hãy thử lại.");
        return;
      }

      if (action === "start") {
        setStatus("started");
        toast.success("Đã bắt đầu bài học. Tiến độ được lưu lại.");
      } else {
        setStatus("completed");
        toast.success("Hoàn thành bài học! 🎉");
      }
    } catch {
      toast.error("Lỗi kết nối. Hãy thử lại.");
    } finally {
      setPending(null);
    }
  }

  if (status === "completed") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-300">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        Đã hoàn thành bài học
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      {status === "idle" && (
        <Button onClick={() => run("start")} disabled={pending !== null} className="h-11">
          {pending === "start" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          Bắt đầu học
        </Button>
      )}
      <Button
        onClick={() => run("complete")}
        disabled={pending !== null}
        variant={status === "started" ? "default" : "outline"}
        className="h-11 border-slate-700"
      >
        {pending === "complete" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        )}
        Đánh dấu hoàn thành
      </Button>
    </div>
  );
}
