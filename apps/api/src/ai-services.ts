import type { Actor } from "@polyglot/contracts";
import { hasPermission } from "@polyglot/authz";

import { ApiHttpError } from "./errors.js";
import type {
  AiAgentRecord,
  AiConversationDetail,
  AiConversationRecord,
  AiMessageRecord,
  CreateAiConversationInput,
  CreateAiMessageInput,
} from "./ai-domain.js";
import type { AiOrchestrator } from "./ai-orchestration-domain.js";
import type { CourseRecord, LessonRecord } from "./learning-domain.js";
import type { AiRepositories } from "./ai-repositories.js";
import type { LearningRepositories } from "./learning-repositories.js";

export class AiTutorService {
  constructor(
    private readonly aiRepositories: AiRepositories,
    private readonly learningRepositories: LearningRepositories,
    private readonly orchestrator: AiOrchestrator,
  ) {}

  async listAgents(tenantId: string): Promise<AiAgentRecord[]> {
    return this.aiRepositories.agents.listActiveByTenant(tenantId);
  }

  async createConversation(input: {
    actor: Actor;
    tenantId: string;
    body: CreateAiConversationInput;
    now: Date;
  }): Promise<AiConversationRecord> {
    const agent = await this.aiRepositories.agents.findById(input.tenantId, input.body.agentId);

    if (!agent) {
      throw new ApiHttpError(404, "ai_agent.not_found", "AI agent not found.");
    }

    if (agent.scope !== "tutor_coach") {
      throw new ApiHttpError(400, "ai_agent.unsupported_scope", "Agent scope is not chat-enabled.");
    }

    const lesson = input.body.lessonId
      ? await this.requirePublishedLesson(input.tenantId, input.body.lessonId)
      : undefined;
    const courseId = input.body.courseId ?? lesson?.courseId;

    if (courseId) {
      const course = await this.requirePublishedCourse(input.tenantId, courseId);

      if (lesson && lesson.courseId !== course.id) {
        throw new ApiHttpError(
          400,
          "ai_context.lesson_course_mismatch",
          "Lesson does not belong to course.",
        );
      }
    }

    return this.aiRepositories.conversations.create({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      agentId: agent.id,
      lessonId: input.body.lessonId,
      courseId,
      title: input.body.title ?? "AI tutor chat",
      now: input.now,
    });
  }

  async getConversation(input: {
    actor: Actor;
    tenantId: string;
    conversationId: string;
  }): Promise<AiConversationDetail> {
    const conversation = await this.aiRepositories.conversations.findDetailById(
      input.tenantId,
      input.conversationId,
    );

    if (!conversation) {
      throw new ApiHttpError(404, "ai_conversation.not_found", "Conversation not found.");
    }

    assertCanReadConversation(input.actor, conversation);
    return conversation;
  }

  async sendMessage(input: {
    actor: Actor;
    tenantId: string;
    conversationId: string;
    body: CreateAiMessageInput;
    now: Date;
    requestId?: string;
    traceId?: string;
  }): Promise<{ userMessage: AiMessageRecord; assistantMessage: AiMessageRecord }> {
    const conversation = await this.aiRepositories.conversations.findDetailById(
      input.tenantId,
      input.conversationId,
    );

    if (!conversation) {
      throw new ApiHttpError(404, "ai_conversation.not_found", "Conversation not found.");
    }

    assertCanReadConversation(input.actor, conversation);

    const prompt = await this.aiRepositories.prompts.findByAgentVersion({
      tenantId: input.tenantId,
      agentId: conversation.agent.id,
      version: conversation.agent.promptVersion,
    });

    if (!prompt || prompt.evalStatus !== "approved") {
      throw new ApiHttpError(500, "ai_prompt.not_ready", "AI prompt is not approved.");
    }

    const lesson = conversation.lessonId
      ? ((await this.learningRepositories.lessons.findDetailById(
          input.tenantId,
          conversation.lessonId,
        )) ?? undefined)
      : undefined;
    const userMessage = await this.aiRepositories.messages.append({
      tenantId: input.tenantId,
      conversationId: conversation.id,
      role: "user",
      content: input.body.content,
      citations: [],
      safetyFlags: {
        policyVersion: conversation.agent.policyVersion,
      },
      provider: "user",
      modelId: "human",
      promptVersion: conversation.agent.promptVersion,
      policyVersion: conversation.agent.policyVersion,
      inputTokens: 0,
      outputTokens: estimateTokens(input.body.content),
      costEstimate: 0,
      createdAt: input.now,
    });
    const generated = await this.orchestrator.generateTutorReply({
      actor: input.actor,
      agent: conversation.agent,
      message: input.body.content,
      lesson,
      prompt,
      requestId: input.requestId,
      tenantId: input.tenantId,
      traceId: input.traceId,
    });
    const assistantMessage = await this.aiRepositories.messages.append({
      tenantId: input.tenantId,
      conversationId: conversation.id,
      role: "assistant",
      content: generated.content,
      citations: generated.citations,
      safetyFlags: generated.safetyFlags,
      provider: generated.provider,
      modelId: generated.modelId,
      promptVersion: conversation.agent.promptVersion,
      policyVersion: conversation.agent.policyVersion,
      inputTokens: generated.inputTokens,
      outputTokens: generated.outputTokens,
      costEstimate: generated.costEstimate,
      createdAt: new Date(input.now.getTime() + 1),
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  private async requirePublishedLesson(tenantId: string, lessonId: string): Promise<LessonRecord> {
    const lesson = await this.learningRepositories.lessons.findById(tenantId, lessonId);

    if (!lesson || lesson.status !== "published") {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const course = await this.learningRepositories.courses.findById(tenantId, lesson.courseId);

    if (!course || course.status !== "published") {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    return lesson;
  }

  private async requirePublishedCourse(tenantId: string, courseId: string): Promise<CourseRecord> {
    const course = await this.learningRepositories.courses.findById(tenantId, courseId);

    if (!course || course.status !== "published") {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    return course;
  }
}

export function createAiServices(input: {
  aiRepositories: AiRepositories;
  learningRepositories: LearningRepositories;
  orchestrator: AiOrchestrator;
}) {
  return {
    tutor: new AiTutorService(input.aiRepositories, input.learningRepositories, input.orchestrator),
  };
}

function assertCanReadConversation(
  actor: Actor,
  conversation: AiConversationDetail | AiConversationRecord,
): void {
  if (conversation.userId === actor.userId) {
    return;
  }

  if (hasPermission(actor, "ai_conversation:manage")) {
    return;
  }

  throw new ApiHttpError(403, "ai_conversation.not_owner", "Access denied.", {
    reason: "conversation_not_owned_by_actor",
  });
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.trim().split(/\s+/).length * 1.3));
}
