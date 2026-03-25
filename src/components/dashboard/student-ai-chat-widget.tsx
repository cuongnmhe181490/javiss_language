"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type StudentChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type StudentAiChatWidgetProps = {
  initialData?: {
    conversationId: string;
    title: string;
    messages: StudentChatMessage[];
  } | null;
};

const STORAGE_KEY = "javiss_student_ai_widget_messages";
const CONVERSATION_STORAGE_KEY = "javiss_student_ai_widget_conversation_id";

const suggestionPrompts = [
  "Hãy gợi ý cho tôi kế hoạch học trong 7 ngày tới.",
  "Tôi nên cải thiện kỹ năng speaking theo cách nào trước?",
  "Dựa vào hồ sơ hiện tại, hôm nay tôi nên học gì?",
];

const initialMessages: StudentChatMessage[] = [
  {
    id: "student-widget-welcome",
    role: "assistant",
    content:
      "Chào bạn, đây là AI Coach nhanh. Bạn có thể hỏi ngay về lộ trình học, chiến lược luyện speaking hoặc bước tiếp theo nên làm hôm nay.",
  },
];

function getFallbackNotice(reason?: string | null) {
  switch (reason) {
    case "daily_quota_reached":
      return "AI đang chạm giới hạn lượt dùng trong hôm nay nên hệ thống đã chuyển sang chế độ dự phòng.";
    case "provider_request_failed":
      return "AI đang bận tạm thời nên hệ thống đã chuyển sang chế độ dự phòng.";
    default:
      return null;
  }
}

function getStoredMessages() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StudentChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function getStoredConversationId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(CONVERSATION_STORAGE_KEY);
}

export function StudentAiChatWidget({ initialData }: StudentAiChatWidgetProps) {
  const pathname = usePathname();
  const serverMessages = initialData?.messages?.length ? initialData.messages : initialMessages;
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<StudentChatMessage[]>(
    () => getStoredMessages() ?? serverMessages,
  );
  const [conversationId, setConversationId] = useState<string | null>(
    () => getStoredConversationId() ?? initialData?.conversationId ?? null,
  );
  const messageCounterRef = useRef(messages.length);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-16)));
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (conversationId) {
      window.sessionStorage.setItem(CONVERSATION_STORAGE_KEY, conversationId);
      return;
    }

    window.sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
  }, [conversationId]);

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  if (pathname?.startsWith("/dashboard/ai-coach")) {
    return null;
  }

  const resetConversation = () => {
    setMessages(initialMessages);
    setConversationId(null);
    messageCounterRef.current = initialMessages.length;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessages));
      window.sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
  };

  const submitMessage = (message: string) => {
    const trimmed = message.trim();

    if (trimmed.length < 2) {
      toast.error("Vui lòng nhập câu hỏi rõ hơn để AI Coach có thể hỗ trợ.");
      return;
    }

    messageCounterRef.current += 1;
    const userMessage: StudentChatMessage = {
      id: `student-user-${messageCounterRef.current}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue("");

    startTransition(async () => {
      try {
        const endpoint = conversationId
          ? `/api/ai/conversations/${conversationId}/messages`
          : "/api/ai/conversations";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          toast.error(payload?.error?.message ?? "AI Coach chưa thể phản hồi lúc này.");
          setMessages((current) => current.filter((item) => item.id !== userMessage.id));
          return;
        }

        const fallbackNotice = getFallbackNotice(payload?.data?.fallbackReason);

        if (fallbackNotice) {
          toast.message(fallbackNotice);
        }

        if (payload?.data?.conversationId) {
          setConversationId(payload.data.conversationId);
        }

        messageCounterRef.current += 1;
        setMessages((current) => [
          ...current,
          {
            id: `student-assistant-${messageCounterRef.current}`,
            role: "assistant",
            content:
              payload?.data?.message?.content ??
              "AI Coach chưa tạo được phản hồi phù hợp. Bạn vui lòng thử lại sau ít phút.",
          },
        ]);
      } catch {
        toast.error("AI Coach chưa thể phản hồi lúc này. Vui lòng thử lại sau ít phút.");
        setMessages((current) => current.filter((item) => item.id !== userMessage.id));
      }
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[min(92vw,25rem)] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                AI Coach nhanh
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỏi nhanh về lộ trình học, speaking và bước tiếp theo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" type="button" variant="ghost" onClick={resetConversation}>
                Làm mới
              </Button>
              <Button size="sm" type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Thu gọn
              </Button>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-7",
                    message.role === "assistant"
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      : "ml-8 bg-sky-600 text-white",
                  )}
                >
                  {message.content}
                </div>
              ))}

              {isPending ? (
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  AI Coach đang soạn phản hồi...
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Cần màn hình đầy đủ?
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mở AI Coach để xem toàn bộ lịch sử và speaking mock.
                  </p>
                </div>
                <Link href={conversationId ? `/dashboard/ai-coach?conversationId=${conversationId}` : "/dashboard/ai-coach"}>
                  <Button size="sm" type="button" variant="outline">
                    Mở AI Coach
                  </Button>
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/dashboard/ai-coach">
                  <Button size="sm" type="button">
                    Luyện speaking ngay
                  </Button>
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vào màn hình đầy đủ để mở speaking mock và xem toàn bộ lịch sử.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Gợi ý nhanh
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestionPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs leading-5 text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:text-sky-300"
                    onClick={() => submitMessage(prompt)}
                    disabled={isPending}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage(inputValue);
              }}
            >
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-sky-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="Ví dụ: Hãy giúp tôi lên kế hoạch luyện speaking trong tuần này."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={isPending}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lastAssistantMessage
                    ? "AI Coach sẽ bám theo hồ sơ học tập và mục tiêu hiện tại của bạn."
                    : null}
                </p>
                <Button disabled={isPending} type="submit">
                  {isPending ? "Đang gửi..." : "Gửi cho AI Coach"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="rounded-full px-5 shadow-lg shadow-sky-500/20"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? "Ẩn AI Coach" : "Hỏi AI Coach"}
      </Button>
    </div>
  );
}
