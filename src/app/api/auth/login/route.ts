import { loginSchema } from "@/features/auth/schemas";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { getStatusRedirect } from "@/lib/auth/status-redirect";
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
      const redirectMap: Record<string, string> = {
        PENDING_APPROVAL: getStatusRedirect("pending"),
        APPROVED_PENDING_VERIFICATION: getStatusRedirect("approved"),
        VERIFICATION_REQUIRED: getStatusRedirect("verification_sent"),
        REGISTRATION_REJECTED: getStatusRedirect("rejected"),
        ACCOUNT_BLOCKED: getStatusRedirect("blocked"),
      };

      return fail(error.message, error.statusCode, error.code ?? undefined, {
        redirectTo: error.code ? redirectMap[error.code] : undefined,
      });
    }

    return fail(getErrorMessage(error), 400);
  }
}
