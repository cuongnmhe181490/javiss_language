import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  ContentItemDetail,
  ContentItemRecord,
  ContentReviewEventRecord,
  ContentReviewQueueItem,
  ContentSourceRecord,
  ContentVersionRecord,
  PaginatedContentResult,
} from "./content-domain.js";
import type { ContentRepositories } from "./content-repositories.js";

export function createPrismaContentRepositories(prisma: PrismaClient): ContentRepositories {
  return {
    sources: {
      async approve(input) {
        const source = await prisma.contentSource.findFirst({
          where: {
            id: input.sourceId,
            tenantId: input.tenantId,
          },
        });

        if (!source) {
          return null;
        }

        return mapSource(
          await prisma.contentSource.update({
            data: {
              approvedAt: input.now,
              reviewedBy: input.reviewedBy,
              status: "approved",
              updatedAt: input.now,
            },
            where: {
              id: input.sourceId,
            },
          }),
        );
      },
      async create(tenantId, input) {
        const source = await prisma.contentSource.create({
          data: {
            tenantId,
            sourceName: input.sourceName,
            sourceType: input.sourceType,
            reference: input.reference,
            licenseType: input.licenseType,
            allowedUsage: input.allowedUsage,
            commercialAllowed: input.commercialAllowed,
            attributionRequired: input.attributionRequired,
            attributionText: input.attributionText,
            expirationDate: input.expirationDate,
            dataResidencyConstraint: input.dataResidencyConstraint,
            status: "draft",
            createdBy: input.createdBy,
            metadata: input.metadata as Prisma.InputJsonValue,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapSource(source);
      },
      async findById(tenantId, sourceId) {
        const source = await prisma.contentSource.findFirst({
          where: {
            id: sourceId,
            tenantId,
          },
        });

        return source ? mapSource(source) : null;
      },
      async listByTenant(tenantId, query) {
        const where = {
          tenantId,
          licenseType: query.licenseType,
          status: query.status,
        };
        const page = Math.max(query.page, 1);
        const pageSize = Math.min(Math.max(query.pageSize, 1), 100);
        const [total, rows] = await prisma.$transaction([
          prisma.contentSource.count({ where }),
          prisma.contentSource.findMany({
            orderBy: [{ createdAt: "desc" }, { sourceName: "asc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            where,
          }),
        ]);

        return {
          data: rows.map(mapSource),
          page,
          pageSize,
          total,
        };
      },
      async update(tenantId, sourceId, input) {
        const source = await prisma.contentSource.findFirst({
          where: {
            id: sourceId,
            tenantId,
          },
        });

        if (!source) {
          return null;
        }

        return mapSource(
          await prisma.contentSource.update({
            data: {
              ...definedUpdate(input),
              updatedAt: input.now,
            },
            where: {
              id: sourceId,
            },
          }),
        );
      },
    },
    items: {
      async create(tenantId, input) {
        const item = await prisma.contentItem.create({
          data: {
            tenantId,
            type: input.type,
            title: input.title,
            slug: input.slug,
            language: input.language,
            level: input.level,
            status: "draft",
            currentVersion: 0,
            createdBy: input.createdBy,
            metadata: input.metadata as Prisma.InputJsonValue,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapItem(item);
      },
      async findById(tenantId, itemId) {
        const item = await prisma.contentItem.findFirst({
          where: {
            id: itemId,
            tenantId,
          },
        });

        return item ? mapItem(item) : null;
      },
      async findDetailById(tenantId, itemId) {
        const item = await prisma.contentItem.findFirst({
          include: {
            versions: {
              orderBy: { version: "desc" },
            },
          },
          where: {
            id: itemId,
            tenantId,
          },
        });

        return item
          ? ({
              ...mapItem(item),
              versions: item.versions.map(mapVersion),
            } satisfies ContentItemDetail)
          : null;
      },
      async listByTenant(tenantId, query) {
        const where = {
          tenantId,
          status: query.status,
          type: query.type,
        };
        const page = Math.max(query.page, 1);
        const pageSize = Math.min(Math.max(query.pageSize, 1), 100);
        const [total, rows] = await prisma.$transaction([
          prisma.contentItem.count({ where }),
          prisma.contentItem.findMany({
            orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            where,
          }),
        ]);

        return {
          data: rows.map(mapItem),
          page,
          pageSize,
          total,
        };
      },
      async markPublished(input) {
        const item = await prisma.contentItem.findFirst({
          where: {
            id: input.itemId,
            tenantId: input.tenantId,
          },
        });

        if (!item) {
          return null;
        }

        return mapItem(
          await prisma.contentItem.update({
            data: {
              currentVersion: input.version,
              publishedAt: input.now,
              status: "published",
              updatedAt: input.now,
            },
            where: {
              id: input.itemId,
            },
          }),
        );
      },
      async updateStatus(input) {
        const item = await prisma.contentItem.findFirst({
          where: {
            id: input.itemId,
            tenantId: input.tenantId,
          },
        });

        if (!item) {
          return null;
        }

        return mapItem(
          await prisma.contentItem.update({
            data: {
              status: input.status,
              updatedAt: input.now,
            },
            where: {
              id: input.itemId,
            },
          }),
        );
      },
    },
    versions: {
      async create(tenantId, contentItemId, input) {
        const latest = await prisma.contentVersion.findFirst({
          orderBy: {
            version: "desc",
          },
          where: {
            contentItemId,
            tenantId,
          },
        });
        const version = await prisma.contentVersion.create({
          data: {
            tenantId,
            contentItemId,
            version: (latest?.version ?? 0) + 1,
            status: "draft",
            body: input.body as Prisma.InputJsonValue,
            sourceIds: input.sourceIds,
            validation: {
              license: "pending",
            },
            aiQa: {
              status: "not_run",
            },
            changeSummary: input.changeSummary,
            createdBy: input.createdBy,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapVersion(version);
      },
      async findById(tenantId, versionId) {
        const version = await prisma.contentVersion.findFirst({
          where: {
            id: versionId,
            tenantId,
          },
        });

        return version ? mapVersion(version) : null;
      },
      async latestForItem(tenantId, contentItemId) {
        const version = await prisma.contentVersion.findFirst({
          orderBy: {
            version: "desc",
          },
          where: {
            contentItemId,
            tenantId,
          },
        });

        return version ? mapVersion(version) : null;
      },
      async listReviewQueue(tenantId, query) {
        const where = {
          tenantId,
          status: "review",
        };
        const page = Math.max(query.page, 1);
        const pageSize = Math.min(Math.max(query.pageSize, 1), 100);
        const [total, rows] = await prisma.$transaction([
          prisma.contentVersion.count({ where }),
          prisma.contentVersion.findMany({
            include: {
              item: true,
            },
            orderBy: [{ updatedAt: "asc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            where,
          }),
        ]);

        return {
          data: rows.map(
            (row) =>
              ({
                ...mapVersion(row),
                item: mapItem(row.item),
              }) satisfies ContentReviewQueueItem,
          ),
          page,
          pageSize,
          total,
        };
      },
      async updateStatus(input) {
        const version = await prisma.contentVersion.findFirst({
          where: {
            id: input.versionId,
            tenantId: input.tenantId,
          },
        });

        if (!version) {
          return null;
        }

        return mapVersion(
          await prisma.contentVersion.update({
            data: {
              status: input.status,
              reviewedBy: input.reviewedBy,
              validation: input.validation as Prisma.InputJsonValue | undefined,
              aiQa: input.aiQa as Prisma.InputJsonValue | undefined,
              publishedAt: input.publishedAt,
              updatedAt: input.now,
            },
            where: {
              id: input.versionId,
            },
          }),
        );
      },
    },
    reviewEvents: {
      async append(input) {
        const event = await prisma.contentReviewEvent.create({
          data: {
            id: input.id,
            tenantId: input.tenantId,
            contentItemId: input.contentItemId,
            versionId: input.versionId,
            actorId: input.actorId,
            action: input.action,
            outcome: input.outcome,
            comments: input.comments,
            metadata: input.metadata as Prisma.InputJsonValue,
            createdAt: input.createdAt,
          },
        });

        return mapReviewEvent(event);
      },
      async listByItem(tenantId, contentItemId) {
        const rows = await prisma.contentReviewEvent.findMany({
          orderBy: {
            createdAt: "asc",
          },
          where: {
            contentItemId,
            tenantId,
          },
        });

        return rows.map(mapReviewEvent);
      },
    },
  };
}

function mapSource(source: Prisma.ContentSourceGetPayload<object>): ContentSourceRecord {
  return {
    id: source.id,
    tenantId: source.tenantId,
    sourceName: source.sourceName,
    sourceType: source.sourceType,
    reference: source.reference,
    licenseType: source.licenseType as ContentSourceRecord["licenseType"],
    allowedUsage: source.allowedUsage as ContentSourceRecord["allowedUsage"],
    commercialAllowed: source.commercialAllowed,
    attributionRequired: source.attributionRequired,
    attributionText: source.attributionText ?? undefined,
    expirationDate: source.expirationDate ?? undefined,
    dataResidencyConstraint: source.dataResidencyConstraint ?? undefined,
    status: source.status as ContentSourceRecord["status"],
    createdBy: source.createdBy ?? undefined,
    reviewedBy: source.reviewedBy ?? undefined,
    approvedAt: source.approvedAt ?? undefined,
    metadata: jsonObject(source.metadata),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function mapItem(item: Prisma.ContentItemGetPayload<object>): ContentItemRecord {
  return {
    id: item.id,
    tenantId: item.tenantId,
    type: item.type as ContentItemRecord["type"],
    title: item.title,
    slug: item.slug,
    language: item.language ?? undefined,
    level: item.level ?? undefined,
    status: item.status as ContentItemRecord["status"],
    currentVersion: item.currentVersion,
    createdBy: item.createdBy ?? undefined,
    publishedAt: item.publishedAt ?? undefined,
    metadata: jsonObject(item.metadata),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapVersion(version: Prisma.ContentVersionGetPayload<object>): ContentVersionRecord {
  return {
    id: version.id,
    tenantId: version.tenantId,
    contentItemId: version.contentItemId,
    version: version.version,
    status: version.status as ContentVersionRecord["status"],
    body: jsonObject(version.body),
    sourceIds: version.sourceIds,
    validation: jsonObject(version.validation),
    aiQa: jsonObject(version.aiQa),
    changeSummary: version.changeSummary ?? undefined,
    createdBy: version.createdBy ?? undefined,
    reviewedBy: version.reviewedBy ?? undefined,
    publishedAt: version.publishedAt ?? undefined,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
  };
}

function mapReviewEvent(
  event: Prisma.ContentReviewEventGetPayload<object>,
): ContentReviewEventRecord {
  return {
    id: event.id,
    tenantId: event.tenantId,
    contentItemId: event.contentItemId,
    versionId: event.versionId ?? undefined,
    actorId: event.actorId,
    action: event.action as ContentReviewEventRecord["action"],
    outcome: event.outcome as ContentReviewEventRecord["outcome"],
    comments: event.comments ?? undefined,
    metadata: jsonObject(event.metadata),
    createdAt: event.createdAt,
  };
}

function definedUpdate(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => key !== "now" && value !== undefined),
  );
}

function jsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
