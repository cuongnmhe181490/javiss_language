"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminSchema,
  type CreateAdminInput,
} from "@/features/admin/schemas";

export function CreateAdminForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/admin/users/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError("root", {
          message: payload?.error?.message ?? "Không thể tạo admin mới.",
        });
        return;
      }

      toast.success(payload.data.message);
      reset();
      window.location.reload();
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ tên admin</Label>
        <Input id="fullName" {...register("fullName")} />
        <FormMessage error={errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email admin</Label>
        <Input id="email" type="email" {...register("email")} />
        <FormMessage error={errors.email?.message} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="password">Mật khẩu khởi tạo</Label>
        <Input id="password" type="password" {...register("password")} />
        <FormMessage error={errors.password?.message} />
      </div>
      <div className="md:col-span-2">
        <FormMessage error={errors.root?.message} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang tạo admin..." : "Tạo admin mới"}
        </Button>
      </div>
    </form>
  );
}
