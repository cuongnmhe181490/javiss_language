import { aiCoachMessageSchema } from "@/features/ai/schemas";
import { getSession } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { assertHasRole } from "@/server/policies/rbac";
import { sendAiCoachMessage } from "@/server/services/ai-coach.service";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Vui lòng đăng nhập.", 401, "UNAUTHORIZED");
    }

    assertHasRole(session.roles, ["student"]);

    const body = await request.json();
    const input = aiCoachMessageSchema.parse(body);
    const result = await sendAiCoachMessage({
      userId: session.userId,
      values: input,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      return fail("Bạn đang nhắn quá nhanh. Vui lòng chờ một chút rồi thử lại.", 429, "RATE_LIMIT");
    }

    return fail(getErrorMessage(error), 400);
  }
}
