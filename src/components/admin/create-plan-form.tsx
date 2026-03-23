"use client";

import { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPlanSchema, type CreatePlanInput } from "@/features/admin/schemas";

export function CreatePlanForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<z.input<typeof createPlanSchema>, unknown, CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      currency: "VND",
      isDefault: false,
      priceCents: 0,
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError("root", {
          message: payload?.error?.message ?? "Không thể tạo gói học.",
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
        <Label htmlFor="code">Mã plan</Label>
        <Input id="code" placeholder="starter_plus" {...register("code")} />
        <FormMessage error={errors.code?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Tên gói học</Label>
        <Input id="name" placeholder="Starter Plus" {...register("name")} />
        <FormMessage error={errors.name?.message} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceCents">Giá (đơn vị nhỏ nhất)</Label>
        <Input id="priceCents" type="number" {...register("priceCents", { valueAsNumber: true })} />
        <FormMessage error={errors.priceCents?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Tiền tệ</Label>
        <Input id="currency" placeholder="VND" {...register("currency")} />
        <FormMessage error={errors.currency?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="isDefault">Loại mặc định</Label>
        <Select
          id="isDefault"
          {...register("isDefault", {
            setValueAs: (value) => value === "true",
          })}
        >
          <option value="false">Không</option>
          <option value="true">Có</option>
        </Select>
      </div>
      <div className="md:col-span-2">
        <FormMessage error={errors.root?.message} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang tạo plan..." : "Tạo gói học"}
        </Button>
      </div>
    </form>
  );
}
