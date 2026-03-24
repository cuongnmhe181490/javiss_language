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
import { createLessonSchema, type CreateLessonInput } from "@/features/admin/schemas";

export function CreateLessonForm({
  topics,
}: {
  topics: Array<{ id: string; name: string; packName: string; examName: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<z.input<typeof createLessonSchema>, unknown, CreateLessonInput>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      topicId: topics[0]?.id,
      status: "draft",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/admin/content/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError("root", {
          message: payload?.error?.message ?? "Không thể tạo lesson mới.",
        });
        return;
      }

      toast.success(payload.data.message);
      reset({
        topicId: topics[0]?.id,
        slug: "",
        title: "",
        summary: "",
        status: "draft",
      });
      window.location.reload();
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="topicId">Topic</Label>
        <Select id="topicId" {...register("topicId")}>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name} - {topic.packName} - {topic.examName}
            </option>
          ))}
        </Select>
        <FormMessage error={errors.topicId?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug lesson</Label>
        <Input id="slug" placeholder="ielts-writing-task-1-overview" {...register("slug")} />
        <FormMessage error={errors.slug?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề lesson</Label>
        <Input id="title" placeholder="IELTS Writing Task 1 Overview" {...register("title")} />
        <FormMessage error={errors.title?.message} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="summary">Tóm tắt</Label>
        <Textarea id="summary" rows={4} {...register("summary")} />
        <FormMessage error={errors.summary?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Trạng thái</Label>
        <Select id="status" {...register("status")}>
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
          <option value="archived">Lưu trữ</option>
        </Select>
      </div>
      <div className="md:col-span-2">
        <FormMessage error={errors.root?.message} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang tạo lesson..." : "Tạo lesson mới"}
        </Button>
      </div>
    </form>
  );
}
