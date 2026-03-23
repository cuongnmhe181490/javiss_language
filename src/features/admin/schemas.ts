import { z } from "zod";

export const rejectRegistrationSchema = z.object({
  reason: z.string().optional(),
});
