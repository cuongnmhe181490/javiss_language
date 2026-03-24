"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal?: boolean;
  length: number;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

function getFallbackMessage(reason?: string | null) {
  switch (reason) {
    case "daily_quota_reached":
      return "Gemini đã chạm quota hôm nay. Hệ thống tạm chuyển phần hỏi đáp sang chế độ dự phòng.";
    case "provider_request_failed":
      return "Gemini đang lỗi tạm thời. Hệ thống đã chuyển phần hỏi đáp sang chế độ dự phòng.";
    default:
      return null;
  }
}

export function AiSpeakingSessionPanel({
  conversationId,
  scenario,
  latestAssistantMessage,
}: {
  conversationId?: string;
  scenario?: string | null;
  latestAssistantMessage?: string | null;
}) {
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [part, setPart] = useState("part1");
  const [topic, setTopic] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(false);

  useEffect(() => {
    setIsMicSupported(Boolean(getSpeechRecognitionConstructor()));

    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const speakAssistantMessage = () => {
    if (!latestAssistantMessage || typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Trình duyệt hiện chưa hỗ trợ đọc câu hỏi bằng giọng máy.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestAssistantMessage);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartSession = async () => {
    setIsStartingSession(true);

    try {
      const response = await fetch("/api/ai/speaking/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          part,
          topic: topic.trim() || undefined,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Không thể khởi tạo phiên speaking lúc này.");
        return;
      }

      router.push(`/dashboard/ai-coach?conversationId=${payload.data.conversationId}`);
      router.refresh();
    } catch {
      toast.error("Không thể khởi tạo phiên speaking lúc này.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleStartListening = () => {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      toast.error("Trình duyệt này chưa hỗ trợ nhận giọng nói. Bạn vẫn có thể nhập câu trả lời bằng tay.");
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setTranscript(nextTranscript);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(
        event.error === "not-allowed"
          ? "Bạn cần cấp quyền microphone để luyện speaking."
          : "Không thể nhận giọng nói ở lượt này. Bạn có thể thử lại hoặc nhập bằng tay.",
      );
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const handleStopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSubmitAnswer = async () => {
    const trimmed = transcript.trim();

    if (!conversationId) {
      toast.error("Hãy bắt đầu một phiên speaking trước.");
      return;
    }

    if (trimmed.length < 2) {
      toast.error("Vui lòng nói hoặc nhập câu trả lời rõ hơn trước khi gửi.");
      return;
    }

    setIsSubmittingAnswer(true);

    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
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
        toast.error(payload?.error?.message ?? "Không thể gửi phần trả lời tới giám khảo AI.");
        return;
      }

      const fallbackMessage = getFallbackMessage(payload?.data?.fallbackReason);

      if (fallbackMessage) {
        toast.message(fallbackMessage);
      }

      setTranscript("");
      router.push(`/dashboard/ai-coach?conversationId=${payload.data.conversationId}`);
      router.refresh();
    } catch {
      toast.error("Không thể gửi phần trả lời tới giám khảo AI.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              Mở phiên speaking mock
            </h3>
            <Badge>Beta</Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Giám khảo AI sẽ hỏi bằng tiếng Anh. Bạn có thể trả lời bằng micro hoặc nhập tay,
            phù hợp để luyện speaking ngay cả khi chưa bật Live API.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Phần thi
            </label>
            <Select value={part} onChange={(event) => setPart(event.target.value)}>
              <option value="part1">IELTS Speaking Part 1</option>
              <option value="part2">IELTS Speaking Part 2</option>
              <option value="part3">IELTS Speaking Part 3</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Chủ đề gợi ý
            </label>
            <Input
              placeholder="Ví dụ: hometown, travel, technology"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gợi ý: dùng Chrome hoặc Edge để nhận giọng nói ổn định hơn.
          </p>
          <Button disabled={isStartingSession} onClick={handleStartSession} type="button">
            {isStartingSession ? "Đang tạo phiên..." : "Bắt đầu speaking mock"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              Speaking mock đang chạy
            </h3>
            <Badge
              className={
                isMicSupported
                  ? undefined
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }
            >
              {isMicSupported ? "Microphone sẵn sàng" : "Microphone chưa hỗ trợ"}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {scenario ?? "IELTS Speaking mock"}
          </p>
        </div>
        <Button
          disabled={!latestAssistantMessage}
          onClick={speakAssistantMessage}
          type="button"
          variant="secondary"
        >
          Đọc câu hỏi gần nhất
        </Button>
      </div>
      <Textarea
        placeholder="Phần trả lời của bạn sẽ hiện ở đây. Bạn có thể nói bằng tiếng Anh hoặc nhập tay."
        value={transcript}
        onChange={(event) => setTranscript(event.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!isMicSupported || isListening}
          onClick={handleStartListening}
          type="button"
          variant="outline"
        >
          Bắt đầu nói
        </Button>
        <Button
          disabled={!isListening}
          onClick={handleStopListening}
          type="button"
          variant="outline"
        >
          Dừng ghi
        </Button>
        <Button disabled={isSubmittingAnswer} onClick={handleSubmitAnswer} type="button">
          {isSubmittingAnswer ? "Đang gửi..." : "Gửi phần trả lời"}
        </Button>
      </div>
      <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
        Mẹo: nếu trình duyệt chưa hỗ trợ micro, bạn vẫn có thể nhập tay để tiếp tục mock
        speaking. Khi bật Gemini hoặc Live API sau này, phần speaking này vẫn giữ nguyên luồng
        UI.
      </p>
    </div>
  );
}
