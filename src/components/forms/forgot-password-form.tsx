"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas";
import { vi } from "@/i18n/dictionaries/vi";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message =
          payload?.error?.message ?? "Không thể gửi liên kết đặt lại mật khẩu lúc này.";
        setSuccessMessage(null);
        setError("root", { message });
        toast.error(message);
        return;
      }

      reset();
      setSuccessMessage(payload.data.message);
      toast.success(payload.data.message);
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          Khi nào email của bạn hợp lệ?
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
          Email cần thuộc về một tài khoản đã được kích hoạt trước đó. Nếu email hợp lệ, hệ thống sẽ
          gửi liên kết đặt lại mật khẩu đến hộp thư của bạn.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{vi.auth.email}</Label>
        <Input id="email" type="email" placeholder="ban@vidu.com" {...register("email")} />
        <FormMessage error={errors.email?.message} />
      </div>

      <FormMessage error={errors.root?.message} message={successMessage ?? undefined} />

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Đang gửi liên kết..." : vi.auth.submitForgotPassword}
      </Button>

      <Link
        className="block text-center text-sm text-sky-600 hover:underline dark:text-sky-400"
        href="/login"
      >
        {vi.common.backToLogin}
      </Link>
    </form>
  );
}
