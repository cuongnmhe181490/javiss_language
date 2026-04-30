import type {
  AiAgentRecord,
  AiConversationDetail,
  AiConversationRecord,
  AiMessageRecord,
  PromptVersionRecord,
} from "./ai-domain.js";
import { seedAiAgents, seedPromptVersions } from "./ai-fixtures.js";

export type AiRepositories = {
  agents: AiAgentRepository;
  conversations: AiConversationRepository;
  messages: AiMessageRepository;
  prompts: PromptVersionRepository;
};

export type AiAgentRepository = {
  listActiveByTenant(tenantId: string): Promise<AiAgentRecord[]>;
  findById(tenantId: string, agentId: string): Promise<AiAgentRecord | null>;
};

export type PromptVersionRepository = {
  findByAgentVersion(input: {
    tenantId: string;
    agentId: string;
    version: string;
  }): Promise<PromptVersionRecord | null>;
};

export type AiConversationRepository = {
  create(input: {
    tenantId: string;
    userId: string;
    agentId: string;
    lessonId?: string;
    courseId?: string;
    title: string;
    now: Date;
  }): Promise<AiConversationRecord>;
  findById(tenantId: string, conversationId: string): Promise<AiConversationRecord | null>;
  findDetailById(tenantId: string, conversationId: string): Promise<AiConversationDetail | null>;
  listMine(tenantId: string, userId: string): Promise<AiConversationRecord[]>;
};

export type AiMessageRepository = {
  append(
    input: Omit<AiMessageRecord, "id" | "createdAt"> & { id?: string; createdAt: Date },
  ): Promise<AiMessageRecord>;
  listByConversation(tenantId: string, conversationId: string): Promise<AiMessageRecord[]>;
};

export function createInMemoryAiRepositories(): AiRepositories {
  const agents = [...seedAiAgents];
  const promptVersions = [...seedPromptVersions];
  const conversations: AiConversationRecord[] = [];
  const messages: AiMessageRecord[] = [];

  return {
    agents: {
      async listActiveByTenant(tenantId) {
        return agents.filter((agent) => agent.tenantId === tenantId && agent.status === "active");
      },
      async findById(tenantId, agentId) {
        return (
          agents.find(
            (agent) =>
              agent.tenantId === tenantId && agent.id === agentId && agent.status === "active",
          ) ?? null
        );
      },
    },
    prompts: {
      async findByAgentVersion(input) {
        return (
          promptVersions.find(
            (prompt) =>
              prompt.tenantId === input.tenantId &&
              prompt.agentId === input.agentId &&
              prompt.version === input.version,
          ) ?? null
        );
      },
    },
    conversations: {
      async create(input) {
        const conversation: AiConversationRecord = {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          userId: input.userId,
          agentId: input.agentId,
          lessonId: input.lessonId,
          courseId: input.courseId,
          title: input.title,
          status: "active",
          createdAt: input.now,
          updatedAt: input.now,
        };
        conversations.push(conversation);
        return conversation;
      },
      async findById(tenantId, conversationId) {
        return (
          conversations.find(
            (conversation) =>
              conversation.tenantId === tenantId && conversation.id === conversationId,
          ) ?? null
        );
      },
      async findDetailById(tenantId, conversationId) {
        const conversation = conversations.find(
          (item) => item.tenantId === tenantId && item.id === conversationId,
        );

        if (!conversation) {
          return null;
        }

        const agent = agents.find(
          (item) => item.tenantId === tenantId && item.id === conversation.agentId,
        );

        if (!agent) {
          return null;
        }

        return {
          ...conversation,
          agent,
          messages: messages
            .filter(
              (message) =>
                message.tenantId === tenantId && message.conversationId === conversationId,
            )
            .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime()),
        };
      },
      async listMine(tenantId, userId) {
        return conversations.filter(
          (conversation) => conversation.tenantId === tenantId && conversation.userId === userId,
        );
      },
    },
    messages: {
      async append(input) {
        const message: AiMessageRecord = {
          ...input,
          id: input.id ?? crypto.randomUUID(),
          createdAt: input.createdAt,
        };
        messages.push(message);
        return message;
      },
      async listByConversation(tenantId, conversationId) {
        return messages
          .filter(
            (message) => message.tenantId === tenantId && message.conversationId === conversationId,
          )
          .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
      },
    },
  };
}
