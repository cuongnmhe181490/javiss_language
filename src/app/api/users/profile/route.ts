import { updateProfileSchema } from "@/features/auth/schemas";
import { getSession } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { assertHasRole } from "@/server/policies/rbac";
import { updateStudentProfile } from "@/server/services/user-management.service";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Vui lòng đăng nhập.", 401, "UNAUTHORIZED");
    }

    assertHasRole(session.roles, ["student"]);

    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const result = await updateStudentProfile({
      actorId: session.userId,
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
