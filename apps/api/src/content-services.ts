import type { Actor } from "@polyglot/contracts";

import type {
  ContentItemDetail,
  ContentItemRecord,
  ContentListQuery,
  ContentReviewAction,
  ContentSourceRecord,
  ContentVersionRecord,
  CreateContentItemInput,
  CreateContentSourceInput,
  CreateContentVersionInput,
  SourceListQuery,
  SyncPublishedContentInput,
  UpdateContentSourceInput,
} from "./content-domain.js";
import { runContentQa } from "./content-qa-agent.js";
import { ApiHttpError } from "./errors.js";
import type { ContentRepositories } from "./content-repositories.js";
import type { LearningRepositories } from "./learning-repositories.js";
import type { UpdateLessonInput } from "./learning-domain.js";

export class SourceRegistryService {
  constructor(private readonly repositories: ContentRepositories) {}

  async listSources(input: { tenantId: string; query: SourceListQuery }) {
    return this.repositories.sources.listByTenant(input.tenantId, input.query);
  }

  async createSource(input: {
    actor: Actor;
    tenantId: string;
    body: CreateContentSourceInput;
    now: Date;
  }): Promise<ContentSourceRecord> {
    return this.repositories.sources.create(input.tenantId, {
      ...input.body,
      metadata: rejectSensitiveMetadata(input.body.metadata),
      createdBy: input.actor.userId,
      now: input.now,
    });
  }

  async updateSource(input: {
    tenantId: string;
    sourceId: string;
    body: UpdateContentSourceInput;
    now: Date;
  }): Promise<ContentSourceRecord> {
    const updated = await this.repositories.sources.update(input.tenantId, input.sourceId, {
      ...input.body,
      metadata: input.body.metadata ? rejectSensitiveMetadata(input.body.metadata) : undefined,
      now: input.now,
    });

    if (!updated) {
      throw new ApiHttpError(404, "source.not_found", "Source not found.");
    }

    return updated;
  }

  async approveSource(input: {
    actor: Actor;
    tenantId: string;
    sourceId: string;
    now: Date;
  }): Promise<ContentSourceRecord> {
    const source = await this.repositories.sources.findById(input.tenantId, input.sourceId);

    if (!source) {
      throw new ApiHttpError(404, "source.not_found", "Source not found.");
    }

    if (source.expirationDate && source.expirationDate <= input.now) {
      throw new ApiHttpError(400, "source.expired", "Source license is expired.", {
        expirationDate: source.expirationDate.toISOString(),
      });
    }

    const approved = await this.repositories.sources.approve({
      tenantId: input.tenantId,
      sourceId: input.sourceId,
      reviewedBy: input.actor.userId,
      now: input.now,
    });

    if (!approved) {
      throw new ApiHttpError(404, "source.not_found", "Source not found.");
    }

    return approved;
  }
}

export class ContentStudioService {
  constructor(
    private readonly repositories: ContentRepositories,
    private readonly learningRepositories?: LearningRepositories,
  ) {}

  async listContent(input: { tenantId: string; query: ContentListQuery }) {
    return this.repositories.items.listByTenant(input.tenantId, input.query);
  }

  async getContentItem(input: { tenantId: string; itemId: string }): Promise<ContentItemDetail> {
    const item = await this.repositories.items.findDetailById(input.tenantId, input.itemId);

    if (!item) {
      throw new ApiHttpError(404, "content_item.not_found", "Content item not found.");
    }

    return item;
  }

  async createItem(input: {
    actor: Actor;
    tenantId: string;
    body: CreateContentItemInput;
    now: Date;
  }): Promise<ContentItemRecord> {
    return this.repositories.items.create(input.tenantId, {
      ...input.body,
      metadata: rejectSensitiveMetadata(input.body.metadata),
      createdBy: input.actor.userId,
      now: input.now,
    });
  }

  async createVersion(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    body: CreateContentVersionInput;
    now: Date;
  }): Promise<ContentVersionRecord> {
    const item = await this.requireItem(input.tenantId, input.itemId);
    void item;
    await this.requireSourcesExist(input.tenantId, input.body.sourceIds);

    return this.repositories.versions.create(input.tenantId, input.itemId, {
      ...input.body,
      body: rejectSensitiveMetadata(input.body.body),
      createdBy: input.actor.userId,
      now: input.now,
    });
  }

  async submitReview(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    comments?: string;
    now: Date;
  }): Promise<ContentVersionRecord> {
    await this.requireItem(input.tenantId, input.itemId);
    const version = await this.requireVersionForItem(input.tenantId, input.itemId, input.versionId);

    if (version.status !== "draft" && version.status !== "rejected") {
      throw new ApiHttpError(400, "content_version.invalid_state", "Version cannot enter review.", {
        status: version.status,
      });
    }

    const aiQa = await this.evaluateContentQa({
      tenantId: input.tenantId,
      itemId: input.itemId,
      version,
    });
    const updated = await this.repositories.versions.updateStatus({
      tenantId: input.tenantId,
      versionId: input.versionId,
      status: "review",
      validation: buildDraftValidation(version),
      aiQa,
      now: input.now,
    });

    if (!updated) {
      throw new ApiHttpError(404, "content_version.not_found", "Content version not found.");
    }

    await this.repositories.items.updateStatus({
      tenantId: input.tenantId,
      itemId: input.itemId,
      status: "review",
      now: input.now,
    });
    await this.appendReviewEvent({
      actor: input.actor,
      tenantId: input.tenantId,
      itemId: input.itemId,
      versionId: input.versionId,
      action: "submit_review",
      comments: input.comments,
      metadata: {
        validation: updated.validation,
        aiQa: updated.aiQa,
      },
      now: input.now,
    });

    return updated;
  }

  async approveVersion(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    comments?: string;
    now: Date;
  }): Promise<ContentVersionRecord> {
    const version = await this.requireVersionForItem(input.tenantId, input.itemId, input.versionId);

    if (version.status !== "review") {
      throw new ApiHttpError(
        400,
        "content_version.invalid_state",
        "Only review versions can be approved.",
        {
          status: version.status,
        },
      );
    }

    if (version.aiQa.status !== "passed") {
      throw new ApiHttpError(
        400,
        "content_qa.not_passed",
        "Content QA must pass before approval.",
        {
          aiQa: version.aiQa,
        },
      );
    }

    const updated = await this.repositories.versions.updateStatus({
      tenantId: input.tenantId,
      versionId: input.versionId,
      status: "approved",
      reviewedBy: input.actor.userId,
      now: input.now,
    });

    if (!updated) {
      throw new ApiHttpError(404, "content_version.not_found", "Content version not found.");
    }

    await this.appendReviewEvent({
      actor: input.actor,
      tenantId: input.tenantId,
      itemId: input.itemId,
      versionId: input.versionId,
      action: "approve",
      comments: input.comments,
      metadata: {
        status: "approved",
      },
      now: input.now,
    });

    return updated;
  }

  async publishVersion(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    comments?: string;
    now: Date;
  }): Promise<{ item: ContentItemRecord; version: ContentVersionRecord }> {
    const version = await this.requireVersionForItem(input.tenantId, input.itemId, input.versionId);

    if (version.status !== "approved" && version.status !== "review") {
      throw new ApiHttpError(400, "content_version.invalid_state", "Version cannot be published.", {
        status: version.status,
      });
    }

    if (version.aiQa.status !== "passed") {
      throw new ApiHttpError(400, "content_qa.not_passed", "Content QA must pass before publish.", {
        aiQa: version.aiQa,
      });
    }

    const licenseValidation = await this.validateLicenses({
      tenantId: input.tenantId,
      sourceIds: version.sourceIds,
      now: input.now,
    });
    const publishedVersion = await this.repositories.versions.updateStatus({
      tenantId: input.tenantId,
      versionId: input.versionId,
      status: "published",
      reviewedBy: input.actor.userId,
      validation: {
        ...version.validation,
        license: "passed",
        licenseValidation,
      },
      publishedAt: input.now,
      now: input.now,
    });

    if (!publishedVersion) {
      throw new ApiHttpError(404, "content_version.not_found", "Content version not found.");
    }

    const item = await this.repositories.items.markPublished({
      tenantId: input.tenantId,
      itemId: input.itemId,
      version: publishedVersion.version,
      now: input.now,
    });

    if (!item) {
      throw new ApiHttpError(404, "content_item.not_found", "Content item not found.");
    }

    await this.appendReviewEvent({
      actor: input.actor,
      tenantId: input.tenantId,
      itemId: input.itemId,
      versionId: input.versionId,
      action: "publish",
      comments: input.comments,
      metadata: {
        version: publishedVersion.version,
        sourceIds: publishedVersion.sourceIds,
      },
      now: input.now,
    });

    return {
      item,
      version: publishedVersion,
    };
  }

  async rollbackVersion(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    comments?: string;
    now: Date;
  }): Promise<{ item: ContentItemRecord; version: ContentVersionRecord }> {
    const targetVersion = await this.requireVersionForItem(
      input.tenantId,
      input.itemId,
      input.versionId,
    );
    await this.validateLicenses({
      tenantId: input.tenantId,
      sourceIds: targetVersion.sourceIds,
      now: input.now,
    });

    const updatedVersion = await this.repositories.versions.updateStatus({
      tenantId: input.tenantId,
      versionId: targetVersion.id,
      status: "published",
      publishedAt: input.now,
      now: input.now,
    });
    const item = await this.repositories.items.markPublished({
      tenantId: input.tenantId,
      itemId: input.itemId,
      version: targetVersion.version,
      now: input.now,
    });

    if (!updatedVersion || !item) {
      throw new ApiHttpError(404, "content_item.not_found", "Content item not found.");
    }

    await this.appendReviewEvent({
      actor: input.actor,
      tenantId: input.tenantId,
      itemId: input.itemId,
      versionId: input.versionId,
      action: "rollback",
      comments: input.comments,
      metadata: {
        version: targetVersion.version,
      },
      now: input.now,
    });

    return {
      item,
      version: updatedVersion,
    };
  }

  async runQa(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    now: Date;
  }): Promise<ContentVersionRecord> {
    await this.requireItem(input.tenantId, input.itemId);
    const version = await this.requireVersionForItem(input.tenantId, input.itemId, input.versionId);
    const aiQa = await this.evaluateContentQa({
      tenantId: input.tenantId,
      itemId: input.itemId,
      version,
    });
    const updated = await this.repositories.versions.updateStatus({
      tenantId: input.tenantId,
      versionId: input.versionId,
      status: version.status,
      aiQa,
      now: input.now,
    });

    if (!updated) {
      throw new ApiHttpError(404, "content_version.not_found", "Content version not found.");
    }

    await this.appendReviewEvent({
      actor: input.actor,
      tenantId: input.tenantId,
      itemId: input.itemId,
      versionId: input.versionId,
      action: "ai_qa",
      metadata: {
        aiQa,
      },
      now: input.now,
    });

    return updated;
  }

  async syncPublishedVersionToLearning(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    body: SyncPublishedContentInput;
    now: Date;
  }) {
    if (!this.learningRepositories) {
      throw new ApiHttpError(
        500,
        "content_sync.not_configured",
        "Learning repositories are not configured.",
      );
    }

    const item = await this.requireItem(input.tenantId, input.itemId);
    const version = await this.requireVersionForItem(input.tenantId, input.itemId, input.versionId);

    if (item.type !== "lesson") {
      throw new ApiHttpError(
        400,
        "content_sync.unsupported_type",
        "Only lesson sync is supported.",
        {
          type: item.type,
        },
      );
    }

    if (version.status !== "published") {
      throw new ApiHttpError(
        400,
        "content_sync.not_published",
        "Only published versions can sync.",
        {
          status: version.status,
        },
      );
    }

    const lessonId =
      input.body.lessonId ??
      readString(item.metadata, ["runtimeLessonId"]) ??
      readString(version.body, ["runtimeSync", "lessonId"]);

    if (!lessonId) {
      throw new ApiHttpError(
        400,
        "content_sync.lesson_target_required",
        "Lesson target is required.",
      );
    }

    const lesson = await this.learningRepositories.lessons.findById(input.tenantId, lessonId);

    if (!lesson) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const update = buildLessonUpdate(version.body, input.body.publishLesson);

    if (Object.keys(update).length === 0) {
      throw new ApiHttpError(
        400,
        "content_sync.no_lesson_fields",
        "Content version has no supported lesson fields.",
      );
    }

    const syncedLesson = await this.learningRepositories.lessons.update(input.tenantId, lessonId, {
      ...update,
      now: input.now,
    });
    const syncedVersion = await this.repositories.versions.updateStatus({
      tenantId: input.tenantId,
      versionId: input.versionId,
      status: "published",
      validation: {
        ...version.validation,
        runtimeSync: {
          lessonId,
          status: "synced",
          syncedAt: input.now.toISOString(),
        },
      },
      now: input.now,
    });

    if (!syncedLesson || !syncedVersion) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    await this.appendReviewEvent({
      actor: input.actor,
      tenantId: input.tenantId,
      itemId: input.itemId,
      versionId: input.versionId,
      action: "sync_learning",
      metadata: {
        lessonId,
        version: version.version,
      },
      now: input.now,
    });

    return {
      lesson: syncedLesson,
      version: syncedVersion,
    };
  }

  async listReviewQueue(input: {
    tenantId: string;
    query: Pick<ContentListQuery, "page" | "pageSize">;
  }) {
    return this.repositories.versions.listReviewQueue(input.tenantId, input.query);
  }

  private async requireItem(tenantId: string, itemId: string): Promise<ContentItemRecord> {
    const item = await this.repositories.items.findById(tenantId, itemId);

    if (!item) {
      throw new ApiHttpError(404, "content_item.not_found", "Content item not found.");
    }

    return item;
  }

  private async requireVersionForItem(
    tenantId: string,
    itemId: string,
    versionId: string,
  ): Promise<ContentVersionRecord> {
    const version = await this.repositories.versions.findById(tenantId, versionId);

    if (!version || version.contentItemId !== itemId) {
      throw new ApiHttpError(404, "content_version.not_found", "Content version not found.");
    }

    return version;
  }

  private async requireSourcesExist(tenantId: string, sourceIds: string[]): Promise<void> {
    for (const sourceId of sourceIds) {
      const source = await this.repositories.sources.findById(tenantId, sourceId);

      if (!source) {
        throw new ApiHttpError(404, "source.not_found", "Source not found.", {
          sourceId,
        });
      }
    }
  }

  private async evaluateContentQa(input: {
    tenantId: string;
    itemId: string;
    version: ContentVersionRecord;
  }) {
    const item = await this.requireItem(input.tenantId, input.itemId);
    const sources: ContentSourceRecord[] = [];

    for (const sourceId of input.version.sourceIds) {
      const source = await this.repositories.sources.findById(input.tenantId, sourceId);

      if (source) {
        sources.push(source);
      }
    }

    return runContentQa({
      item,
      sources,
      version: input.version,
    });
  }

  private async validateLicenses(input: { tenantId: string; sourceIds: string[]; now: Date }) {
    const checkedSources: Array<{ sourceId: string; licenseType: string }> = [];

    for (const sourceId of input.sourceIds) {
      const source = await this.repositories.sources.findById(input.tenantId, sourceId);

      if (!source) {
        throw new ApiHttpError(400, "content_license.source_missing", "Source is missing.", {
          sourceId,
        });
      }

      if (source.status !== "approved") {
        throw new ApiHttpError(
          400,
          "content_license.source_not_approved",
          "Source must be approved before publish.",
          {
            sourceId,
            status: source.status,
          },
        );
      }

      if (!source.commercialAllowed) {
        throw new ApiHttpError(
          400,
          "content_license.commercial_not_allowed",
          "Source is not cleared for commercial use.",
          {
            sourceId,
          },
        );
      }

      if (source.expirationDate && source.expirationDate <= input.now) {
        throw new ApiHttpError(400, "content_license.expired", "Source license is expired.", {
          sourceId,
          expirationDate: source.expirationDate.toISOString(),
        });
      }

      if (!source.allowedUsage.includes("display") && !source.allowedUsage.includes("reference")) {
        throw new ApiHttpError(
          400,
          "content_license.usage_not_allowed",
          "Source usage does not permit display or reference.",
          {
            sourceId,
          },
        );
      }

      checkedSources.push({
        sourceId,
        licenseType: source.licenseType,
      });
    }

    return {
      checkedSources,
      status: "passed",
    };
  }

  private async appendReviewEvent(input: {
    actor: Actor;
    tenantId: string;
    itemId: string;
    versionId: string;
    action: ContentReviewAction;
    comments?: string;
    metadata: Record<string, unknown>;
    now: Date;
  }): Promise<void> {
    await this.repositories.reviewEvents.append({
      tenantId: input.tenantId,
      contentItemId: input.itemId,
      versionId: input.versionId,
      actorId: input.actor.userId,
      action: input.action,
      outcome: "success",
      comments: input.comments,
      metadata: input.metadata,
      createdAt: input.now,
    });
  }
}

export function createContentServices(
  repositories: ContentRepositories,
  learningRepositories?: LearningRepositories,
) {
  return {
    content: new ContentStudioService(repositories, learningRepositories),
    sources: new SourceRegistryService(repositories),
  };
}

function buildDraftValidation(version: ContentVersionRecord): Record<string, unknown> {
  return {
    license: version.sourceIds.length > 0 ? "pending_publish_check" : "no_sources",
    lineage: version.sourceIds,
    schema: "passed",
  };
}

function rejectSensitiveMetadata(value: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeyPattern =
    /authorization|cookie|set-cookie|token|secret|password|rawaudio|raw_audio|rawtranscript|raw_transcript|apikey|api_key/i;

  for (const key of Object.keys(value)) {
    if (sensitiveKeyPattern.test(key)) {
      throw new ApiHttpError(
        400,
        "content.metadata_sensitive",
        "Metadata contains sensitive keys.",
        {
          key,
        },
      );
    }
  }

  return value;
}

function buildLessonUpdate(
  body: Record<string, unknown>,
  publishLesson: boolean,
): Partial<UpdateLessonInput> {
  const lessonBody = readObject(body, ["lesson"]) ?? body;
  const update: Partial<UpdateLessonInput> = {};
  const title = readString(lessonBody, ["title"]);
  const description = readString(lessonBody, ["description"]);
  const language = readString(lessonBody, ["language"]);
  const targetLevel = readString(lessonBody, ["targetLevel"]);
  const estimatedMinutes = readNumber(lessonBody, ["estimatedMinutes"]);
  const objectives = readStringArray(lessonBody, ["objectives"]);

  if (title) {
    update.title = title;
  }

  if (description) {
    update.description = description;
  }

  if (language === "en" || language === "zh" || language === "ja" || language === "ko") {
    update.language = language;
  }

  if (targetLevel) {
    update.targetLevel = targetLevel;
  }

  if (estimatedMinutes !== undefined) {
    update.estimatedMinutes = Math.min(Math.max(Math.round(estimatedMinutes), 1), 240);
  }

  if (objectives) {
    update.objectives = objectives;
  }

  if (publishLesson) {
    update.status = "published";
  }

  return update;
}

function readObject(
  value: Record<string, unknown>,
  path: string[],
): Record<string, unknown> | undefined {
  const current = readUnknown(value, path);
  return current && typeof current === "object" && !Array.isArray(current)
    ? (current as Record<string, unknown>)
    : undefined;
}

function readString(value: Record<string, unknown>, path: string[]): string | undefined {
  const current = readUnknown(value, path);
  return typeof current === "string" && current.trim() ? current : undefined;
}

function readNumber(value: Record<string, unknown>, path: string[]): number | undefined {
  const current = readUnknown(value, path);
  return typeof current === "number" && Number.isFinite(current) ? current : undefined;
}

function readStringArray(value: Record<string, unknown>, path: string[]): string[] | undefined {
  const current = readUnknown(value, path);

  if (!Array.isArray(current) || current.some((item) => typeof item !== "string")) {
    return undefined;
  }

  return current.map(String);
}

function readUnknown(value: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = value;

  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}
