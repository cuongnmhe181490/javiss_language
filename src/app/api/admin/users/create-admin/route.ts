import { createAdminSchema } from "@/features/admin/schemas";
import { getSession } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { createAdminAccount } from "@/server/services/user-management.service";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Vui lòng đăng nhập.", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const input = createAdminSchema.parse(body);
    const result = await createAdminAccount({
      actorId: session.userId,
      actorRoles: session.roles,
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
