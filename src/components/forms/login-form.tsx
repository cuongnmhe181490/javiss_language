"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/forms/form-message";
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
        const message = payload?.error?.message ?? "Không thể đăng nhập.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success("Đăng nhập thành công.");
      const redirectTo = payload.data.redirectTo as string;
      router.push(redirectTo);
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
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
      <FormMessage error={errors.root?.message} />
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Đang đăng nhập..." : vi.auth.submitLogin}
      </Button>
    </form>
  );
}
