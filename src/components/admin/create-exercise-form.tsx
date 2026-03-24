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
import { createExerciseSchema, type CreateExerciseInput } from "@/features/admin/schemas";

export function CreateExerciseForm({
  lessons,
}: {
  lessons: Array<{ id: string; title: string; topicName: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<z.input<typeof createExerciseSchema>, unknown, CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      lessonId: lessons[0]?.id,
      type: "practice",
      questionType: "speaking",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/admin/content/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError("root", {
          message: payload?.error?.message ?? "Không thể tạo bài luyện mới.",
        });
        return;
      }

      toast.success(payload.data.message);
      reset({
        lessonId: lessons[0]?.id,
        slug: "",
        title: "",
        type: "practice",
        instructions: "",
        questionType: "speaking",
        questionPrompts: "",
      });
      window.location.reload();
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="lessonId">Lesson</Label>
        <Select id="lessonId" {...register("lessonId")}>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title} - {lesson.topicName}
            </option>
          ))}
        </Select>
        <FormMessage error={errors.lessonId?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug bài luyện</Label>
        <Input id="slug" placeholder="writing-task-2-balanced-view" {...register("slug")} />
        <FormMessage error={errors.slug?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề bài luyện</Label>
        <Input id="title" placeholder="Writing Task 2 Balanced View" {...register("title")} />
        <FormMessage error={errors.title?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Loại bài luyện</Label>
        <Select id="type" {...register("type")}>
          <option value="practice">Luyện tập</option>
          <option value="mock_test">Thi thử</option>
          <option value="assessment">Đánh giá</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="questionType">Loại câu hỏi</Label>
        <Select id="questionType" {...register("questionType")}>
          <option value="speaking">Nói</option>
          <option value="essay">Viết</option>
          <option value="reading">Đọc</option>
          <option value="listening">Nghe</option>
          <option value="multiple_choice">Trắc nghiệm</option>
          <option value="short_answer">Trả lời ngắn</option>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="instructions">Hướng dẫn</Label>
        <Textarea id="instructions" rows={4} {...register("instructions")} />
        <FormMessage error={errors.instructions?.message} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="questionPrompts">Danh sách câu hỏi</Label>
        <Textarea
          id="questionPrompts"
          rows={6}
          placeholder={"Mỗi dòng là một câu hỏi mới.\nTell me about your hometown.\nWhat kind of place do you live in now?"}
          {...register("questionPrompts")}
        />
        <FormMessage error={errors.questionPrompts?.message} />
      </div>
      <div className="md:col-span-2">
        <FormMessage error={errors.root?.message} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Đang tạo bài luyện..." : "Tạo bài luyện mới"}
        </Button>
      </div>
    </form>
  );
}
