"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/features/auth/schemas";

export function ProfileForm({ defaultValues }: { defaultValues: UpdateProfileInput }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError("root", {
          message: payload?.error?.message ?? "Không thể cập nhật hồ sơ học tập.",
        });
        return;
      }

      toast.success(payload.data.message);
      window.location.reload();
    });
  });

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input id="fullName" {...register("fullName")} />
        <FormMessage error={errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentLevel">Trình độ hiện tại</Label>
        <Input id="currentLevel" placeholder="Ví dụ: B1" {...register("currentLevel")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetScore">Điểm mục tiêu</Label>
        <Input id="targetScore" placeholder="Ví dụ: 7.0" {...register("targetScore")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estimatedLevel">Trình độ ước lượng</Label>
        <Input id="estimatedLevel" placeholder="Ví dụ: 5.5 IELTS" {...register("estimatedLevel")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredStudyWindow">Khung giờ học mong muốn</Label>
        <Input id="preferredStudyWindow" placeholder="Ví dụ: 20:00 - 22:00" {...register("preferredStudyWindow")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredSchedule">Lịch học mong muốn</Label>
        <Input id="preferredSchedule" placeholder="Ví dụ: Thứ 2,4,6" {...register("preferredSchedule")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetExamDate">Ngày thi dự kiến</Label>
        <Input id="targetExamDate" type="date" {...register("targetExamDate")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="strongestSkills">Kỹ năng mạnh</Label>
        <Input id="strongestSkills" placeholder="speaking, reading" {...register("strongestSkills")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="weakestSkills">Kỹ năng yếu</Label>
        <Input id="weakestSkills" placeholder="writing, listening" {...register("weakestSkills")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="onboardingNotes">Ghi chú onboarding</Label>
        <Textarea id="onboardingNotes" {...register("onboardingNotes")} />
      </div>
      <div className="md:col-span-2">
        <FormMessage error={errors.root?.message} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
        </Button>
      </div>
    </form>
  );
}
