"use client";

import { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormMessage } from "@/components/forms/form-message";
import {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from "@/features/admin/schemas";

type SettingsFormProps = {
  defaultValues: UpdateSettingsInput;
};

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<z.input<typeof updateSettingsSchema>, unknown, UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể cập nhật cài đặt.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success(payload.data.message);
    });
  });

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="adminNotificationEmail">Email admin nhận thông báo</Label>
        <Input
          id="adminNotificationEmail"
          type="email"
          {...register("adminNotificationEmail")}
        />
        <FormMessage error={errors.adminNotificationEmail?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="verificationCodeTtlMinutes">Số phút hết hạn mã xác nhận</Label>
        <Input
          id="verificationCodeTtlMinutes"
          type="number"
          {...register("verificationCodeTtlMinutes", { valueAsNumber: true })}
        />
        <FormMessage error={errors.verificationCodeTtlMinutes?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="verificationMaxAttempts">Số lần nhập mã tối đa</Label>
        <Input
          id="verificationMaxAttempts"
          type="number"
          {...register("verificationMaxAttempts", { valueAsNumber: true })}
        />
        <FormMessage error={errors.verificationMaxAttempts?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resendCooldownSeconds">Thời gian chờ gửi lại mã</Label>
        <Input
          id="resendCooldownSeconds"
          type="number"
          {...register("resendCooldownSeconds", { valueAsNumber: true })}
        />
        <FormMessage error={errors.resendCooldownSeconds?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="openRegistration">Trạng thái nhận đăng ký mới</Label>
        <Select
          id="openRegistration"
          {...register("openRegistration", {
            setValueAs: (value) => value === "true",
          })}
        >
          <option value="true">Đang mở đăng ký</option>
          <option value="false">Tạm dừng đăng ký</option>
        </Select>
        <FormMessage error={errors.openRegistration?.message} />
      </div>
      <div className="md:col-span-2">
        <FormMessage error={errors.root?.message} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang lưu cài đặt..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}
