import { resetPasswordSchema } from "@/features/auth/schemas";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { resetPassword } from "@/server/services/password-reset.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);
    const result = await resetPassword(input);
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
