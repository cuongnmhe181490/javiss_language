"use client";

import { Volume2, User } from "lucide-react";

interface ConversationBubbleProps {
  role: "user" | "assistant";
  content: string;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

export function ConversationBubble({ role, content, onPlayAudio, isPlaying = false }: ConversationBubbleProps) {
  if (role === "assistant") {
    return (
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
          <Volume2 className="size-4 text-emerald-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 max-w-[80%]">
          <p className="text-sm text-slate-200">{content}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">AI Tutor</span>
            {onPlayAudio && (
              <button
                onClick={onPlayAudio}
                className={`flex items-center gap-1 text-xs transition ${
                  isPlaying ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
                aria-label="Nghe phát âm"
              >
                <Volume2 className="size-3" />
                {isPlaying ? "Đang phát..." : "Nghe"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-end">
      <div className="rounded-2xl rounded-tr-sm bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 max-w-[80%]">
        <p className="text-sm text-slate-200">{content}</p>
        <span className="mt-1 block text-xs text-emerald-400/70">Bạn</span>
      </div>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-700">
        <User className="size-4 text-slate-300" />
      </div>
    </div>
  );
}
