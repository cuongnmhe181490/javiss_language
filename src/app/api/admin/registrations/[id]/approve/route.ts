import { headers } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/utils/app-error";
import { fail, ok } from "@/lib/utils/response";
import { assertHasRole } from "@/server/policies/rbac";
import { approveRegistration } from "@/server/services/registration.service";

function getClientIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || null;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Vui lòng đăng nhập.", 401, "UNAUTHORIZED");
    }

    assertHasRole(session.roles, ["super_admin", "admin"]);
    const { id } = await params;
    const headerStore = await headers();
    const ipAddress = getClientIp(headerStore.get("x-forwarded-for"));
    const result = await approveRegistration({
      registrationId: id,
      actorId: session.userId,
      ipAddress,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.statusCode, error.code);
    }

    return fail(getErrorMessage(error), 400);
  }
}
