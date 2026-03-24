"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function getFallbackMessage(reason?: string | null) {
  switch (reason) {
    case "daily_quota_reached":
      return "Gemini đã chạm quota hôm nay. Hệ thống tạm chuyển sang chế độ dự phòng.";
    case "provider_request_failed":
      return "Gemini đang lỗi tạm thời. Hệ thống đã chuyển sang chế độ dự phòng.";
    default:
      return null;
  }
}

export function AiCoachComposer({
  conversationId,
}: {
  conversationId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const trimmed = message.trim();

    if (trimmed.length < 2) {
      toast.error("Vui lòng nhập câu hỏi rõ hơn để AI Coach có thể hỗ trợ.");
      return;
    }

    startTransition(async () => {
      const endpoint = conversationId
        ? `/api/ai/conversations/${conversationId}/messages`
        : "/api/ai/conversations";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Không thể gửi câu hỏi tới AI Coach.");
        return;
      }

      const fallbackMessage = getFallbackMessage(payload?.data?.fallbackReason);

      if (fallbackMessage) {
        toast.message(fallbackMessage);
      }

      setMessage("");
      router.push(`/dashboard/ai-coach?conversationId=${payload.data.conversationId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Ví dụ: Hãy giúp tôi lên kế hoạch luyện IELTS Speaking trong 7 ngày tới."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          AI Coach sẽ trả lời bằng tiếng Việt và bám theo hồ sơ học tập hiện tại của bạn.
        </p>
        <Button disabled={isPending} onClick={handleSubmit} type="button">
          {isPending ? "Đang gửi..." : "Gửi cho AI Coach"}
        </Button>
      </div>
    </div>
  );
}
