import { loginSchema } from "@/features/auth/schemas";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { setSessionCookie } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { loginUser } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(input);
    await setSessionCookie(result.token);
    const roles = result.user.roles.map((item) => item.role.code);

    return ok({
      redirectTo: getPostLoginRedirect(roles),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    return fail(getErrorMessage(error), 400);
  }
}
