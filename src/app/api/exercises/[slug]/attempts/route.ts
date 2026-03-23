import { submitExerciseAttemptSchema } from "@/features/learning/schemas";
import { getSession } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { saveExerciseAttempt } from "@/server/services/learning.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Vui lòng đăng nhập.", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const input = submitExerciseAttemptSchema.parse(body);
    const { slug } = await params;
    const result = await saveExerciseAttempt({
      userId: session.userId,
      slug,
      values: input,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    return fail(getErrorMessage(error), 400);
  }
}
