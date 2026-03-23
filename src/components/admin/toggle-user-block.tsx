"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToggleUserBlock({
  userId,
  isBlocked,
}: {
  userId: string;
  isBlocked: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const response = await fetch(`/api/admin/users/${userId}/toggle-block`, {
            method: "POST",
          });
          const payload = await response.json();
          if (!response.ok) {
            toast.error(payload?.error?.message ?? "Không thể cập nhật trạng thái.");
            return;
          }
          toast.success(payload.data.message);
          router.refresh();
        })
      }
      type="button"
      variant={isBlocked ? "secondary" : "outline"}
    >
      {isBlocked ? "Mở khóa" : "Khóa"}
    </Button>
  );
}
