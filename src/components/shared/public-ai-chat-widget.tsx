"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ChatAction = {
  label: string;
  href: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  actions?: ChatAction[];
};

const STORAGE_KEY = "javiss_public_chat_messages";

const suggestionPrompts = [
  "Quy trình đăng ký và kích hoạt tài khoản diễn ra như thế nào?",
  "Tôi chưa đăng nhập được thì nên kiểm tra trạng thái nào?",
  "Sau khi được duyệt, tôi sẽ học được gì trên nền tảng này?",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Chào bạn, tôi là trợ lý tư vấn của Javiss Language. Tôi có thể giúp bạn hiểu cách đăng ký, xác thực tài khoản và các tính năng học tập hiện có.",
    actions: [
      { label: "Đăng ký ngay", href: "/register" },
      { label: "Đăng nhập", href: "/login" },
    ],
  },
];

function getFallbackNotice(reason?: string | null) {
  switch (reason) {
    case "daily_quota_reached":
      return "AI đang chạm giới hạn trong hôm nay nên chatbot đã chuyển sang chế độ dự phòng.";
    case "provider_request_failed":
      return "AI đang bận tạm thời nên chatbot đã chuyển sang chế độ dự phòng.";
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
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function PublicAiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredMessages() ?? initialMessages);
  const messageCounterRef = useRef(messages.length);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-12)));
  }, [messages]);

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  const resetConversation = () => {
    setMessages(initialMessages);
    messageCounterRef.current = initialMessages.length;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessages));
    }
  };

  const submitMessage = (message: string) => {
    const trimmed = message.trim();

    if (trimmed.length < 2) {
      toast.error("Vui lòng nhập câu hỏi rõ hơn để chatbot có thể hỗ trợ.");
      return;
    }

    messageCounterRef.current += 1;
    const userMessage: ChatMessage = {
      id: `user-${messageCounterRef.current}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/public-chat", {
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
          toast.error(payload?.error?.message ?? "Chatbot chưa thể trả lời lúc này.");
          setMessages((current) => current.filter((item) => item.id !== userMessage.id));
          return;
        }

        const fallbackNotice = getFallbackNotice(payload?.data?.fallbackReason);
        if (fallbackNotice) {
          toast.message(fallbackNotice);
        }

        messageCounterRef.current += 1;
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${messageCounterRef.current}`,
            role: "assistant",
            content: payload.data.reply,
            actions: payload.data.actions,
          },
        ]);
      } catch {
        toast.error("Chatbot chưa thể trả lời lúc này. Vui lòng thử lại sau ít phút.");
        setMessages((current) => current.filter((item) => item.id !== userMessage.id));
      }
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[min(92vw,24rem)] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Chatbot tư vấn
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỏi nhanh về đăng ký, xác thực và cách sử dụng nền tảng
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
                <div key={message.id} className="space-y-2">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-7",
                      message.role === "assistant"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        : "ml-8 bg-sky-600 text-white",
                    )}
                  >
                    {message.content}
                  </div>

                  {message.role === "assistant" && message.actions && message.actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Link key={`${message.id}-${action.href}`} href={action.href}>
                          <Button size="sm" type="button" variant="outline">
                            {action.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              {isPending ? (
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Chatbot đang soạn câu trả lời...
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Câu hỏi gợi ý
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestionPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs leading-5 text-slate-600 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:text-sky-300"
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
                placeholder="Ví dụ: Tôi đăng ký xong thì khi nào mới dùng được tài khoản?"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={isPending}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lastAssistantMessage?.role === "assistant"
                    ? "Chatbot chỉ hỗ trợ thông tin về nền tảng và quy trình sử dụng."
                    : null}
                </p>
                <Button disabled={isPending} type="submit">
                  {isPending ? "Đang gửi..." : "Gửi câu hỏi"}
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
        {isOpen ? "Ẩn chatbot" : "Hỏi chatbot AI"}
      </Button>
    </div>
  );
}
