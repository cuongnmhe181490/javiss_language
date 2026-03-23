import nodemailer from "nodemailer";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import type { EmailMessage, EmailProvider } from "@/lib/email/types";

class MockEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    logger.info("mock_email_sent", message);
  }
}

class SmtpEmailProvider implements EmailProvider {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  async send(message: EmailMessage) {
    await this.transporter.sendMail({
      from: env.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}

export function getEmailProvider(): EmailProvider {
  if (env.MAIL_PROVIDER === "smtp") {
    return new SmtpEmailProvider();
  }

  return new MockEmailProvider();
}
