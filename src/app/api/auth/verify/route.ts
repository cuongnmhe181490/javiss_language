import { headers } from "next/headers";
import { verifySchema } from "@/features/auth/schemas";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { verifyRegistrationCode } from "@/server/services/registration.service";

function getClientIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = verifySchema.parse(body);
    const headerStore = await headers();
    const ipAddress = getClientIp(headerStore.get("x-forwarded-for"));
    const result = await verifyRegistrationCode(input, ipAddress);
    return ok(result);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      return fail("Bạn đang thao tác quá nhanh. Vui lòng thử lại sau.", 429, "RATE_LIMIT");
    }

    return fail(getErrorMessage(error), 400);
  }
}
