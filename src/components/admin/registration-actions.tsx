"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RegistrationActions({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (action: "approve" | "reject") => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/registrations/${registrationId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "reject" ? { reason } : {}),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Không thể xử lý yêu cầu.");
        return;
      }

      toast.success(payload.data.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Ghi chú từ chối (không bắt buộc)"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="flex gap-3">
        <Button disabled={isPending} onClick={() => submit("approve")} type="button">
          Duyệt
        </Button>
        <Button
          disabled={isPending}
          onClick={() => submit("reject")}
          type="button"
          variant="destructive"
        >
          Từ chối
        </Button>
      </div>
    </div>
  );
}
