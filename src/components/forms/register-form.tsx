"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormMessage } from "@/components/forms/form-message";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { vi } from "@/i18n/dictionaries/vi";

type RegisterFormProps = {
  exams: Array<{ code: string; name: string }>;
  languages: Array<{ code: string; nativeName: string }>;
};

export function RegisterForm({ exams, languages }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferredLanguage: "en",
      targetExam: exams[0]?.code,
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể gửi đăng ký.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success(payload.data.message);
      router.push("/pending-approval");
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">{vi.auth.name}</Label>
        <Input id="name" placeholder="Nguyễn Văn A" {...register("name")} />
        <FormMessage error={errors.name?.message} />
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
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetExam">{vi.auth.targetExam}</Label>
          <Select id="targetExam" {...register("targetExam")}>
            {exams.map((exam) => (
              <option key={exam.code} value={exam.code}>
                {exam.name}
              </option>
            ))}
          </Select>
          <FormMessage error={errors.targetExam?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetScore">{vi.auth.targetScore}</Label>
          <Input id="targetScore" placeholder="7.0" {...register("targetScore")} />
          <FormMessage error={errors.targetScore?.message} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredLanguage">{vi.auth.preferredLanguage}</Label>
        <Select id="preferredLanguage" {...register("preferredLanguage")}>
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeName}
            </option>
          ))}
        </Select>
        <FormMessage error={errors.preferredLanguage?.message} />
      </div>
      <FormMessage error={errors.root?.message} />
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Đang gửi yêu cầu..." : vi.auth.submitRegister}
      </Button>
    </form>
  );
}
