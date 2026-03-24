import { getSession } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { assertHasRole } from "@/server/policies/rbac";
import { completeAiSpeakingSession } from "@/server/services/ai-coach.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Vui lòng đăng nhập.", 401, "UNAUTHORIZED");
    }

    assertHasRole(session.roles, ["student"]);

    const { id } = await params;
    const result = await completeAiSpeakingSession({
      userId: session.userId,
      conversationId: id,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    return fail(getErrorMessage(error), 400);
  }
}
