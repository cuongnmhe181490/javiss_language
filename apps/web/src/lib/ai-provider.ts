import OpenAI from "openai";

/**
 * Multi-provider AI client.
 * Priority: 9ROUTER (local, free) → OpenAI (paid, higher quality)
 *
 * For chat completions: uses 9router by default
 * For STT/TTS: requires OpenAI key (otherwise client-side Web Speech API is used)
 */

export interface AIProviderConfig {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  provider: "9router" | "openai";
}

function getProviderConfig(): AIProviderConfig {
  const nineRouterUrl = process.env.NINE_ROUTER_BASE_URL;
  const nineRouterKey = process.env.NINE_ROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 9router takes priority for chat completions (free, local)
  if (nineRouterUrl && nineRouterKey && nineRouterKey !== "sk-PLACEHOLDER") {
    return {
      baseUrl: nineRouterUrl,
      apiKey: nineRouterKey,
      chatModel: process.env.NINE_ROUTER_CHAT_MODEL ?? "cx/gpt-5.2",
      provider: "9router",
    };
  }

  // Fallback to OpenAI
  if (openaiKey && openaiKey !== "sk-PLACEHOLDER") {
    return {
      baseUrl: "https://api.openai.com/v1",
      apiKey: openaiKey,
      chatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      provider: "openai",
    };
  }

  throw new Error(
    "No AI provider configured. Set NINE_ROUTER_BASE_URL + NINE_ROUTER_API_KEY or OPENAI_API_KEY.",
  );
}

let cachedClient: OpenAI | null = null;
let cachedConfig: AIProviderConfig | null = null;

/**
 * Get the AI client (OpenAI SDK compatible — works with both 9router and OpenAI)
 */
export function getAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const config = getProviderConfig();
  cachedClient = new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
  });
  cachedConfig = config;
  return cachedClient;
}

/**
 * Get current provider config
 */
export function getAIConfig(): AIProviderConfig {
  if (cachedConfig) return cachedConfig;
  cachedConfig = getProviderConfig();
  return cachedConfig;
}

/**
 * Check if OpenAI-specific features (Whisper STT, TTS) are available
 */
export function hasOpenAIFeatures(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key !== "sk-PLACEHOLDER");
}

/**
 * Get OpenAI client specifically for STT/TTS (only available with OpenAI key)
 */
export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "sk-PLACEHOLDER") return null;

  return new OpenAI({ apiKey: key });
}
