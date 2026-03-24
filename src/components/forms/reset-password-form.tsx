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
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schemas";
import { vi } from "@/i18n/dictionaries/vi";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể cập nhật mật khẩu mới.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success(payload.data.message);
      router.push("/login");
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <input type="hidden" {...register("token")} />
      <div className="space-y-2">
        <Label htmlFor="password">{vi.auth.newPassword}</Label>
        <Input id="password" type="password" {...register("password")} />
        <FormMessage error={errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{vi.auth.confirmPassword}</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        <FormMessage error={errors.confirmPassword?.message} />
      </div>
      <FormMessage error={errors.root?.message} />
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Đang cập nhật..." : vi.auth.submitResetPassword}
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
