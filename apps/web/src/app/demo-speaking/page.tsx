"use client";

import { Headphones, Mic, Volume2, Pause, Play } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function DemoSpeakingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800/50 bg-slate-950/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold">
            ← Về trang chủ
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Demo Mode</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center mb-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                <Headphones className="size-8 text-emerald-300" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Luyện nói realtime</h1>
            <p className="text-lg text-slate-400">Roleplay theo tình huống, nhận feedback tức thì</p>
          </div>

          {/* Scenario Card */}
          <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Tình huống: Check-in khách sạn</CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    Bạn vừa đến khách sạn và cần làm thủ tục nhận phòng
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">A2</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/30 p-4">
                <p className="text-sm font-medium text-slate-300 mb-2">Mục tiêu:</p>
                <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                  <li>Chào hỏi lễ tân</li>
                  <li>Cung cấp thông tin đặt phòng</li>
                  <li>Hỏi về giờ ăn sáng và wifi</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recording Interface */}
          <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-sm shadow-[0_0_80px_-20px_rgb(16_185_129/0.15)]">
            <CardContent className="p-6 space-y-6">
              {/* AI Response */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Volume2 className="size-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">AI Receptionist</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
                  </Button>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/30 p-4">
                  <p className="text-slate-300">
                    "Good evening! Welcome to Grand Hotel. How may I help you today?"
                  </p>
                </div>
              </div>

              {/* Waveform Visualization */}
              <div className="rounded-2xl bg-slate-950/60 border border-emerald-500/20 p-6">
                <div className="flex items-center justify-center gap-1.5 h-24">
                  {Array.from({ length: 32 }).map((_, index) => (
                    <motion.span
                      key={index}
                      animate={
                        isRecording
                          ? {
                              height: [`${20 + (index % 5) * 8}%`, `${52 + (index % 6) * 6}%`, `${20 + (index % 5) * 8}%`],
                            }
                          : { height: "20%" }
                      }
                      transition={{ duration: 1.1 + (index % 4) * 0.1, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-full rounded-full ${isRecording ? "bg-emerald-500/70" : "bg-slate-700"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Mic Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className={`size-20 rounded-full ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  } text-slate-950`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className="size-8" />
                </Button>
              </div>

              <p className="text-center text-sm text-slate-400">
                {isRecording ? "Đang ghi âm... Nhấn để dừng" : "Nhấn để bắt đầu nói"}
              </p>
            </CardContent>
          </Card>

          {/* Transcript & Feedback */}
          <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Transcript & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/30 p-4">
                <p className="text-sm font-medium text-slate-300 mb-2">Bạn đã nói:</p>
                <p className="text-slate-400 italic">
                  "Good evening. I have a reservation under the name Nguyen."
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Phát âm</span>
                  <span className="text-sm font-semibold text-emerald-400">8.5/10</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Độ trưng</span>
                  <span className="text-sm font-semibold text-emerald-400">7.8/10</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>

              <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/20 p-4">
                <p className="text-sm font-medium text-emerald-300 mb-2">💡 Gợi ý:</p>
                <p className="text-sm text-slate-300">
                  Tốt! Thử thêm "I'd like to check in" để câu hoàn chỉnh hơn.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Beta Notice */}
          <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">
                <span className="font-medium text-slate-300">⚠️ Chế độ Demo:</span> Giao diện này
                chưa kết nối microphone hoặc AI thật. Bản production sẽ dùng WebRTC + realtime
                speech API.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-3">
            <Button variant="outline" asChild className="border-slate-800/50 bg-slate-900/60">
              <Link href="/dashboard">Về Dashboard</Link>
            </Button>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-slate-950">
              <Link href="/register">Đăng ký để dùng thật</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <SiteFooter />
    </main>
  );
}
