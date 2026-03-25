"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { vi } from "@/i18n/dictionaries/vi";

type RegisterFormProps = {
  exams: Array<{ code: string; name: string }>;
  languages: Array<{ code: string; nativeName: string }>;
};

const languageLabels: Record<string, string> = {
  en: "Tiếng Anh",
  zh: "Tiếng Trung",
  ja: "Tiếng Nhật",
  ko: "Tiếng Hàn",
};

const languageOrder = ["en", "zh", "ja", "ko"];

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

  const languageOptions = languageOrder
    .map((code) => languages.find((language) => language.code === code))
    .filter((language): language is { code: string; nativeName: string } => Boolean(language))
    .map((language) => ({
      code: language.code,
      label: languageLabels[language.code] ?? language.nativeName,
    }));

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error?.message ?? "Không thể gửi yêu cầu đăng ký lúc này.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success(payload.data.message);
      router.push(`/pending-approval?submitted=1&email=${encodeURIComponent(values.email)}`);
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="rounded-3xl border border-sky-200 bg-sky-50/80 p-5 dark:border-sky-900/60 dark:bg-sky-950/20">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          Quy trình kích hoạt tài khoản
        </p>
        <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
          <p>1. Bạn gửi yêu cầu đăng ký cùng mục tiêu học tập.</p>
          <p>2. Đội ngũ sẽ xem xét và phê duyệt hồ sơ.</p>
          <p>3. Nếu được duyệt, bạn nhận mã xác thực qua email.</p>
          <p>4. Nhập mã để kích hoạt tài khoản và bắt đầu học.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">{vi.auth.name}</Label>
        <Input id="name" placeholder="Ví dụ: Nguyễn Minh An" {...register("name")} />
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Hãy dùng tên thật hoặc tên bạn muốn hiển thị trong hồ sơ học tập.
        </p>
        <FormMessage error={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{vi.auth.email}</Label>
        <Input id="email" placeholder="ban@vidu.com" type="email" {...register("email")} />
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Email này sẽ dùng để nhận thông báo phê duyệt và mã kích hoạt tài khoản.
        </p>
        <FormMessage error={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{vi.auth.password}</Label>
        <Input id="password" type="password" {...register("password")} />
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Mật khẩu nên có ít nhất 8 ký tự, gồm chữ in hoa và số để bảo mật tốt hơn.
        </p>
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
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Chọn đúng kỳ thi bạn đang hướng tới để hệ thống chuẩn bị lộ trình phù hợp.
          </p>
          <FormMessage error={errors.targetExam?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetScore">{vi.auth.targetScore}</Label>
          <Input id="targetScore" placeholder="Ví dụ: 6.5 hoặc N3" {...register("targetScore")} />
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Mục tiêu càng rõ thì dashboard và gợi ý học càng sát với nhu cầu của bạn.
          </p>
          <FormMessage error={errors.targetScore?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredLanguage">{vi.auth.preferredLanguage}</Label>
        <Select id="preferredLanguage" {...register("preferredLanguage")}>
          {languageOptions.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </Select>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Đây là ngôn ngữ bạn muốn tập trung học trong giai đoạn hiện tại.
        </p>
        <FormMessage error={errors.preferredLanguage?.message} />
      </div>

      <FormMessage error={errors.root?.message} />

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Đang gửi yêu cầu..." : vi.auth.submitRegister}
      </Button>
    </form>
  );
}
