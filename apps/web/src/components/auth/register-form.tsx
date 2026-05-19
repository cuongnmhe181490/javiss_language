"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RegisterForm() {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center mb-1">Tạo tài khoản</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Bắt đầu học miễn phí, không cần thẻ.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input id="name" type="text" placeholder="Tên của bạn" className="h-11 rounded-xl bg-accent/50 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-11 rounded-xl bg-accent/50 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" placeholder="Tối thiểu 8 ký tự" className="h-11 rounded-xl bg-accent/50 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Ngôn ngữ muốn học</Label>
            <Select>
              <SelectTrigger id="language" className="h-11 rounded-xl bg-accent/50 border-border/50">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">Tiếng Anh</SelectItem>
                <SelectItem value="zh">Tiếng Trung</SelectItem>
                <SelectItem value="ja">Tiếng Nhật</SelectItem>
                <SelectItem value="ko">Tiếng Hàn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl">
            Đăng ký
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
