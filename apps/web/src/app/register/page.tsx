"use client";

import { Building2, User, Mail, Lock, Globe2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800/50 bg-slate-950/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold">
            ← Về trang chủ
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-sm shadow-[0_0_80px_-20px_rgb(16_185_129/0.15)]">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                  <Building2 className="size-6 text-emerald-300" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Đăng ký tài khoản</CardTitle>
              <CardDescription className="text-center text-slate-400">
                Tạo tài khoản để bắt đầu học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold">
                  1
                </div>
                <div className="h-px w-12 bg-slate-800" />
                <div className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 text-sm font-semibold">
                  2
                </div>
                <div className="h-px w-12 bg-slate-800" />
                <div className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 text-sm font-semibold">
                  3
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="bg-slate-950/60 border-slate-800/50 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-slate-950/60 border-slate-800/50 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-slate-950/60 border-slate-800/50 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ muốn học</Label>
                <div className="relative">
                  <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
                  <Select>
                    <SelectTrigger className="bg-slate-950/60 border-slate-800/50 pl-10">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="en">Tiếng Anh</SelectItem>
                      <SelectItem value="zh">Tiếng Trung</SelectItem>
                      <SelectItem value="ja">Tiếng Nhật</SelectItem>
                      <SelectItem value="ko">Tiếng Hàn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950">
                Tạo tài khoản
              </Button>

              <p className="text-center text-sm text-slate-400">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
                  Đăng nhập
                </Link>
              </p>

              <div className="rounded-xl bg-slate-950/60 border border-slate-800/30 p-4 text-xs text-slate-400">
                <p className="font-medium text-slate-300 mb-1">⚠️ Chế độ Beta</p>
                <p>Đăng ký thật cần tenant provisioning và onboarding có kiểm soát.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <SiteFooter />
    </main>
  );
}
