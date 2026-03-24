export type AiCoachContext = {
  fullName: string;
  email: string;
  preferredLocale: string;
  examName?: string;
  targetScore?: string;
  estimatedLevel?: string;
  preferredLanguage?: string;
  strongestSkills: string[];
  weakestSkills: string[];
  preferredStudyWindow?: string;
  preferredSchedule?: string;
  nextAction?: string;
  latestProgress?: {
    overall: number;
    speaking: number;
    writing: number;
    reading: number;
    listening: number;
  } | null;
};

export type AiConversationMode = "coach" | "speaking_mock";

export type AiConversationHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiCoachReplyInput = {
  message: string;
  previousResponseId?: string | null;
  context: AiCoachContext;
  mode?: AiConversationMode;
  scenario?: string | null;
  history: AiConversationHistoryMessage[];
};

export type AiCoachReplyOutput = {
  text: string;
  provider: "mock" | "openai" | "gemini";
  modelName: string;
  providerResponseId?: string | null;
};

export interface AiCoachProvider {
  generateReply(input: AiCoachReplyInput): Promise<AiCoachReplyOutput>;
}
