import { Queue } from "bullmq";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { getEmailProvider } from "@/lib/email/providers";
import type { EmailMessage } from "@/lib/email/types";

let queue: Queue<EmailMessage> | null = null;

function getQueue() {
  if (!env.EMAIL_QUEUE_ENABLED) {
    return null;
  }

  if (!queue) {
    try {
      queue = new Queue<EmailMessage>("email", {
        connection: { url: env.REDIS_URL },
      });
    } catch (error) {
      logger.warn("email_queue_unavailable", {
        error: error instanceof Error ? error.message : "unknown",
      });
      queue = null;
    }
  }

  return queue;
}

export async function enqueueEmail(message: EmailMessage) {
  const emailQueue = getQueue();

  if (!emailQueue) {
    await getEmailProvider().send(message);
    return;
  }

  try {
    await emailQueue.add("send", message, {
      removeOnComplete: true,
      removeOnFail: 50,
    });
  } catch (error) {
    logger.warn("email_queue_fallback_inline", {
      error: error instanceof Error ? error.message : "unknown",
    });
    await getEmailProvider().send(message);
  }
}
