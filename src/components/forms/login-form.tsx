"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { vi } from "@/i18n/dictionaries/vi";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể đăng nhập lúc này.";
        const redirectTo = payload?.error?.details?.redirectTo as string | undefined;
        setError("root", { message });
        toast.error(message);

        if (redirectTo) {
          router.push(
            redirectTo.includes("/verify")
              ? `${redirectTo}?email=${encodeURIComponent(values.email)}`
              : redirectTo,
          );
        }
        return;
      }

      toast.success("Đăng nhập thành công.");
      router.push(payload.data.redirectTo as string);
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          Lưu ý trước khi đăng nhập
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
          Chỉ những tài khoản đã được phê duyệt và đã xác thực email mới truy cập được khu vực học
          tập.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{vi.auth.email}</Label>
        <Input id="email" placeholder="ban@vidu.com" type="email" {...register("email")} />
        <FormMessage error={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{vi.auth.password}</Label>
        <Input id="password" type="password" {...register("password")} />
        <FormMessage error={errors.password?.message} />
      </div>

      <div className="text-right">
        <Link
          className="text-sm text-sky-600 hover:underline dark:text-sky-400"
          href="/forgot-password"
        >
          {vi.auth.forgotPassword}
        </Link>
      </div>

      <FormMessage error={errors.root?.message} />

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Đang đăng nhập..." : vi.auth.submitLogin}
      </Button>
    </form>
  );
}
