import { env } from "@/config/env";
import {
  renderAdminRegistrationEmail,
  renderRejectionEmail,
  renderVerificationEmail,
} from "@/lib/email/templates";
import { enqueueEmail } from "@/server/jobs/email-queue";

export async function notifyAdminsOfRegistration(input: {
  name: string;
  email: string;
  targetExam: string;
  targetScore: string;
  preferredLanguage: string;
}) {
  const message = renderAdminRegistrationEmail(input);
  await enqueueEmail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    ...message,
  });
}

export async function sendVerificationCodeEmail(input: {
  email: string;
  name: string;
  code: string;
}) {
  const message = renderVerificationEmail({
    name: input.name,
    code: input.code,
    expiresInMinutes: env.VERIFICATION_CODE_TTL_MINUTES,
  });
  await enqueueEmail({
    to: input.email,
    ...message,
  });
}

export async function sendRejectionEmail(input: { email: string; name: string }) {
  const message = renderRejectionEmail({ name: input.name });
  await enqueueEmail({
    to: input.email,
    ...message,
  });
}
