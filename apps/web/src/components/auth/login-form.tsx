"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="size-6 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center mb-1">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Tiếp tục hành trình học ngoại ngữ của bạn.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-11 rounded-xl bg-accent/50 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" placeholder="••••••••" className="h-11 rounded-xl bg-accent/50 border-border/50" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl">
            Đăng nhập
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card/50 px-2 text-muted-foreground">hoặc</span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-11 rounded-xl border-border/50">
          Đăng nhập bằng Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
