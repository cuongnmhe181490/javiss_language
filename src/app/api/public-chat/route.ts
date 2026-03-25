import { headers } from "next/headers";
import { publicChatMessageSchema } from "@/features/public-chat/schemas";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { sendPublicChatMessage } from "@/server/services/public-chat.service";

function getClientIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = publicChatMessageSchema.parse(body);
    const headerStore = await headers();
    const ipAddress = getClientIp(headerStore.get("x-forwarded-for"));
    const result = await sendPublicChatMessage({
      values: input,
      ipAddress,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      return fail("Bạn đang gửi câu hỏi quá nhanh. Vui lòng chờ một chút rồi thử lại.", 429, "RATE_LIMIT");
    }

    return fail(getErrorMessage(error), 400);
  }
}
