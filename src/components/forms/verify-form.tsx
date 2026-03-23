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
import {
  resendCodeSchema,
  verifySchema,
  type ResendCodeInput,
  type VerifyInput,
} from "@/features/auth/schemas";
import { vi } from "@/i18n/dictionaries/vi";

export function VerifyForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResending, startResending] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
  } = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: defaultEmail,
      code: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể xác thực tài khoản.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success(payload.data.message);
      router.push("/login");
    });
  });

  const handleResend = () => {
    const data = resendCodeSchema.safeParse({
      email: getValues("email"),
    } satisfies ResendCodeInput);

    if (!data.success) {
      setError("email", { message: data.error.issues[0]?.message });
      return;
    }

    startResending(async () => {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.data),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể gửi lại mã.";
        toast.error(message);
        return;
      }

      toast.success(payload.data.message);
    });
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">{vi.auth.email}</Label>
        <Input id="email" type="email" placeholder="ban@vidu.com" {...register("email")} />
        <FormMessage error={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">{vi.auth.code}</Label>
        <Input id="code" inputMode="numeric" placeholder="123456" {...register("code")} />
        <FormMessage error={errors.code?.message} />
      </div>
      <FormMessage error={errors.root?.message} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang xác nhận..." : vi.auth.submitVerify}
        </Button>
        <Button disabled={isResending} onClick={handleResend} type="button" variant="secondary">
          {isResending ? "Đang gửi lại..." : vi.auth.resendCode}
        </Button>
      </div>
    </form>
  );
}
