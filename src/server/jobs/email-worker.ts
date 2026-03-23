import { Worker } from "bullmq";
import { env } from "@/config/env";
import { getEmailProvider } from "@/lib/email/providers";

export function createEmailWorker() {
  return new Worker(
    "email",
    async (job) => {
      await getEmailProvider().send(job.data);
    },
    {
      connection: { url: env.REDIS_URL },
    },
  );
}
