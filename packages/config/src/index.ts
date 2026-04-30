import { z } from "zod";

const publicWebEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000/v1"),
});

const serverEnvSchema = z.object({
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
});

type EnvRecord = Record<string, string | undefined>;

export function parsePublicWebEnv(env: EnvRecord) {
  return publicWebEnvSchema.parse(env);
}

export function parseServerEnv(env: EnvRecord) {
  return serverEnvSchema.parse(env);
}

export type PublicWebEnv = z.infer<typeof publicWebEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
