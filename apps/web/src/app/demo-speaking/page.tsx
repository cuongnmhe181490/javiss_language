import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mic, Volume2, RotateCcw } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Luyện nói",
  description: "Demo luyện nói realtime với AI feedback.",
  alternates: { canonical: absoluteUrl("/demo-speaking") },
};

// Deterministic bar heights for the preview waveform. Using fixed values keeps
// rendering pure (no Math.random during render) and avoids hydration mismatches.
const WAVEFORM_HEIGHTS = [
  14, 22, 31, 18, 40, 27, 12, 35, 24, 44, 19, 30, 16, 38, 25, 13, 33, 21, 42, 17, 29, 15, 36, 23,
  41, 20, 28, 32, 26, 11,
];

export default function DemoSpeakingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="size-4" />
            Trang chủ
          </Link>
          <span className="text-sm font-medium text-slate-300">Luyện nói · Demo</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Scenario card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              A1
            </span>
            <span className="text-sm text-slate-400">Tình huống</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Check-in khách sạn</h1>
          <p className="text-sm text-slate-400">
            Bạn vừa đến khách sạn và cần check-in. Nhân viên lễ tân sẽ hỏi thông tin đặt phòng.
          </p>
        </div>

        {/* Conversation area */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl mb-6">
          <h2 className="text-sm font-medium text-slate-400 mb-4">Hội thoại</h2>
          <div className="space-y-4">
            {/* AI message */}
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <Volume2 className="size-4 text-emerald-400" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 max-w-[80%]">
                <p className="text-sm text-slate-200">
                  &ldquo;Good afternoon! Welcome to Grand Hotel. Do you have a reservation?&rdquo;
                </p>
                <span className="mt-1 block text-xs text-slate-500">Lễ tân</span>
              </div>
            </div>
            {/* User message */}
            <div className="flex gap-3 justify-end">
              <div className="rounded-2xl rounded-tr-sm bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 max-w-[80%]">
                <p className="text-sm text-slate-200">
                  &ldquo;Yes, I have a reservation under the name Nguyen.&rdquo;
                </p>
                <span className="mt-1 block text-xs text-emerald-400/70">Bạn</span>
              </div>
            </div>
            {/* AI response */}
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <Volume2 className="size-4 text-emerald-400" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 max-w-[80%]">
                <p className="text-sm text-slate-200">
                  &ldquo;Let me check... Yes, I found it. A double room for two nights. Could I see
                  your ID, please?&rdquo;
                </p>
                <span className="mt-1 block text-xs text-slate-500">Lễ tân</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mic + waveform area */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl mb-6">
          {/* Waveform */}
          <div className="flex items-end justify-center gap-[3px] h-12 mb-5">
            {WAVEFORM_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-emerald-400/40"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <span
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-slate-600"
              aria-hidden="true"
            >
              <RotateCcw className="size-4" />
            </span>
            <Link
              href="/speaking-practice"
              className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition"
              aria-label="Mở luyện nói thật với AI"
            >
              <Mic className="size-6" />
            </Link>
            <span
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-slate-600"
              aria-hidden="true"
            >
              <Volume2 className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Đây là bản xem trước. Nhấn mic để mở luyện nói thật với AI.
          </p>
        </div>

        {/* CTA to real practice */}
        <Link
          href="/speaking-practice"
          className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 transition hover:bg-emerald-500/15"
        >
          <div>
            <p className="text-sm font-semibold text-emerald-200">Luyện nói thật với AI</p>
            <p className="mt-0.5 text-xs text-emerald-300/70">
              Chọn tình huống, nói bằng mic và nhận phản hồi tức thì.
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-emerald-300" aria-hidden="true" />
        </Link>

        {/* AI Feedback */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-sm font-medium text-slate-400 mb-3">AI Feedback</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                ✓
              </span>
              <div>
                <p className="text-sm text-slate-200">Phát âm &ldquo;reservation&rdquo; rõ ràng</p>
                <p className="text-xs text-slate-500">Trọng âm đúng ở âm tiết thứ 3</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">
                !
              </span>
              <div>
                <p className="text-sm text-slate-200">
                  Thử nói chậm hơn ở &ldquo;under the name&rdquo;
                </p>
                <p className="text-xs text-slate-500">Nghe tự nhiên hơn khi có nhịp nghỉ nhẹ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
