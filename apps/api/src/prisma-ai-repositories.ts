import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  AiAgentRecord,
  AiConversationRecord,
  AiMessageRecord,
  PromptVersionRecord,
} from "./ai-domain.js";
import type { AiRepositories } from "./ai-repositories.js";

export function createPrismaAiRepositories(prisma: PrismaClient): AiRepositories {
  return {
    agents: {
      async listActiveByTenant(tenantId) {
        const rows = await prisma.aIAgent.findMany({
          orderBy: { createdAt: "asc" },
          where: {
            tenantId,
            status: "active",
          },
        });

        return rows.map(mapAgent);
      },
      async findById(tenantId, agentId) {
        const agent = await prisma.aIAgent.findFirst({
          where: {
            id: agentId,
            tenantId,
            status: "active",
          },
        });

        return agent ? mapAgent(agent) : null;
      },
    },
    prompts: {
      async findByAgentVersion(input) {
        const prompt = await prisma.promptVersion.findFirst({
          where: input,
        });

        return prompt ? mapPrompt(prompt) : null;
      },
    },
    conversations: {
      async create(input) {
        const conversation = await prisma.aIConversation.create({
          data: {
            tenantId: input.tenantId,
            userId: input.userId,
            agentId: input.agentId,
            lessonId: input.lessonId,
            courseId: input.courseId,
            title: input.title,
            status: "active",
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapConversation(conversation);
      },
      async findById(tenantId, conversationId) {
        const conversation = await prisma.aIConversation.findFirst({
          where: {
            id: conversationId,
            tenantId,
          },
        });

        return conversation ? mapConversation(conversation) : null;
      },
      async findDetailById(tenantId, conversationId) {
        const conversation = await prisma.aIConversation.findFirst({
          include: {
            agent: true,
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
          where: {
            id: conversationId,
            tenantId,
          },
        });

        return conversation
          ? {
              ...mapConversation(conversation),
              agent: mapAgent(conversation.agent),
              messages: conversation.messages.map(mapMessage),
            }
          : null;
      },
      async listMine(tenantId, userId) {
        const rows = await prisma.aIConversation.findMany({
          orderBy: { updatedAt: "desc" },
          where: {
            tenantId,
            userId,
          },
        });

        return rows.map(mapConversation);
      },
    },
    messages: {
      async append(input) {
        const message = await prisma.aIMessage.create({
          data: {
            id: input.id,
            tenantId: input.tenantId,
            conversationId: input.conversationId,
            role: input.role,
            content: input.content,
            citations: input.citations as unknown as Prisma.InputJsonValue,
            safetyFlags: input.safetyFlags as unknown as Prisma.InputJsonValue,
            provider: input.provider,
            modelId: input.modelId,
            promptVersion: input.promptVersion,
            policyVersion: input.policyVersion,
            inputTokens: input.inputTokens,
            outputTokens: input.outputTokens,
            costEstimate: input.costEstimate,
            createdAt: input.createdAt,
          },
        });

        return mapMessage(message);
      },
      async listByConversation(tenantId, conversationId) {
        const rows = await prisma.aIMessage.findMany({
          orderBy: { createdAt: "asc" },
          where: {
            conversationId,
            tenantId,
          },
        });

        return rows.map(mapMessage);
      },
    },
  };
}

function mapAgent(agent: Prisma.AIAgentGetPayload<object>): AiAgentRecord {
  return {
    id: agent.id,
    tenantId: agent.tenantId,
    name: agent.name,
    scope: agent.scope as AiAgentRecord["scope"],
    allowedTools: agent.allowedTools,
    promptVersion: agent.promptVersion,
    policyVersion: agent.policyVersion,
    status: agent.status as AiAgentRecord["status"],
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}

function mapPrompt(prompt: Prisma.PromptVersionGetPayload<object>): PromptVersionRecord {
  return {
    id: prompt.id,
    tenantId: prompt.tenantId,
    agentId: prompt.agentId,
    version: prompt.version,
    purpose: prompt.purpose,
    promptText: prompt.promptText,
    inputSchema: jsonObject(prompt.inputSchema),
    outputSchema: jsonObject(prompt.outputSchema),
    safetyRules: jsonObject(prompt.safetyRules),
    evalStatus: prompt.evalStatus as PromptVersionRecord["evalStatus"],
    createdBy: prompt.createdBy ?? undefined,
    approvedBy: prompt.approvedBy ?? undefined,
    createdAt: prompt.createdAt,
  };
}

function mapConversation(
  conversation: Prisma.AIConversationGetPayload<object>,
): AiConversationRecord {
  return {
    id: conversation.id,
    tenantId: conversation.tenantId,
    userId: conversation.userId,
    agentId: conversation.agentId,
    lessonId: conversation.lessonId ?? undefined,
    courseId: conversation.courseId ?? undefined,
    title: conversation.title,
    status: conversation.status as AiConversationRecord["status"],
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function mapMessage(message: Prisma.AIMessageGetPayload<object>): AiMessageRecord {
  return {
    id: message.id,
    tenantId: message.tenantId,
    conversationId: message.conversationId,
    role: message.role as AiMessageRecord["role"],
    content: message.content,
    citations: Array.isArray(message.citations)
      ? (message.citations as AiMessageRecord["citations"])
      : [],
    safetyFlags: jsonObject(message.safetyFlags) as AiMessageRecord["safetyFlags"],
    provider: message.provider,
    modelId: message.modelId,
    promptVersion: message.promptVersion ?? undefined,
    policyVersion: message.policyVersion ?? undefined,
    inputTokens: message.inputTokens,
    outputTokens: message.outputTokens,
    costEstimate: message.costEstimate,
    createdAt: message.createdAt,
  };
}

function jsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
