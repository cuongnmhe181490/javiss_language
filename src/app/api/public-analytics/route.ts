import { headers } from "next/headers";
import { publicAnalyticsEventSchema } from "@/features/public-chat/schemas";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { trackPublicAnalyticsEvent } from "@/server/services/public-chat-analytics.service";

function getClientIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = publicAnalyticsEventSchema.parse(body);
    const headerStore = await headers();
    const ipAddress = getClientIp(headerStore.get("x-forwarded-for"));

    await trackPublicAnalyticsEvent({
      values: input,
      ipAddress,
    });

    return ok({ tracked: true });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    return fail(getErrorMessage(error), 400);
  }
}
