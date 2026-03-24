import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  APP_URL: z.string().url(),
  APP_NAME: z.string().min(1).default("Javiss Language"),
  DEFAULT_LOCALE: z.string().min(2).default("vi"),
  JWT_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().min(1).default("javiss_session"),
  ADMIN_NOTIFICATION_EMAIL: z.string().email(),
  MAIL_PROVIDER: z.enum(["mock", "smtp"]).default("mock"),
  MAIL_FROM: z.string().min(1),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_QUEUE_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AI_PROVIDER: z.enum(["mock", "openai", "gemini"]).default("mock"),
  AI_FALLBACK_TO_MOCK: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  AI_MESSAGE_WINDOW_LIMIT: z.coerce.number().int().min(1).default(20),
  AI_MESSAGE_WINDOW_MINUTES: z.coerce.number().int().min(1).default(10),
  AI_SPEAKING_SESSION_WINDOW_LIMIT: z.coerce.number().int().min(1).default(5),
  AI_SPEAKING_SESSION_WINDOW_MINUTES: z.coerce.number().int().min(1).default(10),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_DAILY_REQUEST_LIMIT: z.coerce.number().int().min(1).default(80),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).default(30),
  VERIFICATION_CODE_TTL_MINUTES: z.coerce.number().int().min(1).default(15),
  VERIFICATION_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(30).default(90),
  ENABLE_OPEN_REGISTRATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

const normalizedEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [
    key,
    typeof value === "string" ? value.trim() : value,
  ]),
);

const parsed = envSchema.safeParse(normalizedEnv);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
