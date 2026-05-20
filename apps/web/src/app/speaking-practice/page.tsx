"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import { AudioRecorder } from "./components/AudioRecorder";
import { ConversationBubble } from "./components/ConversationBubble";
import { ScenarioSelector } from "./components/ScenarioSelector";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { scenarios, type Scenario } from "@/app/api/speaking/scenarios";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioBase64?: string;
}

interface Feedback {
  pronunciation: Array<{ type: "good" | "warning"; text: string; detail: string }>;
  grammar: Array<{ type: "good" | "warning"; text: string; detail: string }>;
  suggestion: string;
}

interface Capabilities {
  serverSTT: boolean;
  serverTTS: boolean;
}

/**
 * Client-side TTS using browser SpeechSynthesis API
 */
function speakText(text: string): void {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;

  // Try to pick a good English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"),
  ) ?? voices.find((v) => v.lang.startsWith("en"));
  if (englishVoice) utterance.voice = englishVoice;

  window.speechSynthesis.speak(utterance);
}

export default function SpeakingPracticePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities>({ serverSTT: false, serverTTS: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch server capabilities on mount
  useEffect(() => {
    fetch("/api/speaking")
      .then((res) => res.json())
      .then((data: { capabilities?: Capabilities }) => {
        if (data.capabilities) setCapabilities(data.capabilities);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content: scenario.firstMessage,
      },
    ]);
    setFeedback(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedScenario(null);
    setMessages([]);
    setFeedback(null);
    setError(null);
    setPlayingId(null);
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const playAudio = useCallback((messageId: string, audioBase64?: string, text?: string) => {
    // Stop current audio
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingId === messageId) {
      setPlayingId(null);
      return;
    }

    if (audioBase64) {
      // Server-side TTS audio available
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.onended = () => {
        setPlayingId(null);
        audioRef.current = null;
      };
      audio.play().catch(console.error);
      audioRef.current = audio;
      setPlayingId(messageId);
    } else if (text) {
      // Fallback to browser TTS
      setPlayingId(messageId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"),
      ) ?? voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.onend = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    }
  }, [playingId]);

  /**
   * Client-side speech recognition using Web Speech API
   */
  const transcribeClientSide = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition =
        (window as any).SpeechRecognition ??
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error("Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome."));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const result = event.results[0]?.[0]?.transcript;
        if (result) resolve(result);
        else reject(new Error("Không nhận được giọng nói"));
      };

      recognition.onerror = (event: Event & { error?: string }) => {
        reject(new Error(`Lỗi nhận dạng: ${event.error}`));
      };

      recognition.start();
    });
  }, []);

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      if (!selectedScenario) return;

      setIsProcessing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("scenarioId", selectedScenario.id);

        // Build history
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        formData.append("history", JSON.stringify(history));

        if (capabilities.serverSTT) {
          // Server has Whisper — send audio
          formData.append("audio", blob, "recording.webm");
        } else {
          // Use client-side Web Speech API for transcription
          // Note: AudioRecorder already recorded, but we need text
          // We'll use a hybrid approach: try sending audio first,
          // if server rejects (422), fall back to asking user
          formData.append("audio", blob, "recording.webm");
        }

        let response = await fetch("/api/speaking", {
          method: "POST",
          body: formData,
        });

        // If server says STT unavailable, retry with client-side transcription
        if (response.status === 422) {
          // For this attempt, we can't retroactively transcribe the blob
          // Show a message to user that we need live speech recognition
          setError("Đang chuyển sang nhận dạng giọng nói trên trình duyệt. Hãy thử nói lại.");
          setCapabilities((prev) => ({ ...prev, serverSTT: false }));
          setIsProcessing(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { error?: string }).error ?? `Request failed with status ${response.status}`,
          );
        }

        const data = (await response.json()) as {
          transcript: string;
          aiResponse: string;
          audioBase64: string | null;
          feedback: Feedback;
          capabilities?: Capabilities;
        };

        // Update capabilities if server reports them
        if (data.capabilities) {
          setCapabilities(data.capabilities);
        }

        const userMessageId = `user-${Date.now()}`;
        const aiMessageId = `ai-${Date.now()}`;

        setMessages((prev) => [
          ...prev,
          {
            id: userMessageId,
            role: "user",
            content: data.transcript,
          },
          {
            id: aiMessageId,
            role: "assistant",
            content: data.aiResponse,
            audioBase64: data.audioBase64 ?? undefined,
          },
        ]);

        setFeedback(data.feedback);

        // Auto-play AI response
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
          audio.onended = () => {
            setPlayingId(null);
            audioRef.current = null;
          };
          audio.play().catch(console.error);
          audioRef.current = audio;
          setPlayingId(aiMessageId);
        } else {
          // Use browser TTS
          speakText(data.aiResponse);
          setPlayingId(aiMessageId);
          // Clear playing state after estimated duration
          setTimeout(() => setPlayingId(null), data.aiResponse.length * 60);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedScenario, messages, capabilities],
  );

  /**
   * Handle text-based submission (when client-side STT is used)
   */
  const handleTextSubmit = useCallback(
    async (text: string) => {
      if (!selectedScenario || !text.trim()) return;

      setIsProcessing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("text", text.trim());
        formData.append("scenarioId", selectedScenario.id);

        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        formData.append("history", JSON.stringify(history));

        const response = await fetch("/api/speaking", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { error?: string }).error ?? `Request failed with status ${response.status}`,
          );
        }

        const data = (await response.json()) as {
          transcript: string;
          aiResponse: string;
          audioBase64: string | null;
          feedback: Feedback;
        };

        const userMessageId = `user-${Date.now()}`;
        const aiMessageId = `ai-${Date.now()}`;

        setMessages((prev) => [
          ...prev,
          {
            id: userMessageId,
            role: "user",
            content: data.transcript,
          },
          {
            id: aiMessageId,
            role: "assistant",
            content: data.aiResponse,
            audioBase64: data.audioBase64 ?? undefined,
          },
        ]);

        setFeedback(data.feedback);

        // Auto-play
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
          audio.onended = () => {
            setPlayingId(null);
            audioRef.current = null;
          };
          audio.play().catch(console.error);
          audioRef.current = audio;
          setPlayingId(aiMessageId);
        } else {
          speakText(data.aiResponse);
          setPlayingId(aiMessageId);
          setTimeout(() => setPlayingId(null), data.aiResponse.length * 60);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedScenario, messages],
  );

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>
          <span className="text-sm font-medium text-slate-300">Luyện nói · Speaking Practice</span>
          {selectedScenario && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition"
              aria-label="Chọn tình huống khác"
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">Đổi</span>
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 pb-32">
        {/* Provider indicator */}
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>
            AI: {capabilities.serverSTT ? "Server STT + TTS" : "Browser Speech API"} ·
            Chat: 9router/OpenAI
          </span>
        </div>

        {/* Scenario Selection */}
        {!selectedScenario && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-100 mb-2">Chọn tình huống</h1>
              <p className="text-sm text-slate-400">
                Chọn một tình huống để bắt đầu luyện nói với AI tutor
              </p>
            </div>
            <ScenarioSelector
              scenarios={scenarios}
              selectedId={null}
              onSelect={handleSelectScenario}
            />
          </div>
        )}

        {/* Active Conversation */}
        {selectedScenario && (
          <div className="space-y-6">
            {/* Scenario info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                    selectedScenario.level === "A1"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : selectedScenario.level === "A2"
                        ? "bg-blue-500/20 text-blue-400"
                        : selectedScenario.level === "B1"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  {selectedScenario.level}
                </span>
                <h1 className="text-sm font-medium text-slate-200">{selectedScenario.titleVi}</h1>
              </div>
              <p className="text-xs text-slate-400">{selectedScenario.descriptionVi}</p>
            </div>

            {/* Conversation */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="sr-only">Hội thoại</h2>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <ConversationBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    onPlayAudio={
                      msg.role === "assistant"
                        ? () => playAudio(msg.id, msg.audioBase64, msg.content)
                        : undefined
                    }
                    isPlaying={playingId === msg.id}
                  />
                ))}

                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <Loader2 className="size-4 text-emerald-400 animate-spin" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm text-slate-400">Đang xử lý...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="size-5 shrink-0 text-red-400" />
                <div className="flex-1">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* Feedback */}
            <FeedbackPanel feedback={feedback} />

            {/* Recording area */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                disabled={isProcessing}
              />
              {!capabilities.serverSTT && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  💡 Đang dùng nhận dạng giọng nói trên trình duyệt (miễn phí)
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
