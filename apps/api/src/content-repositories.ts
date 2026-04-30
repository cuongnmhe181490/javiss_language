import type {
  ContentItemDetail,
  ContentItemRecord,
  ContentListQuery,
  ContentReviewEventRecord,
  ContentReviewQueueItem,
  ContentSourceRecord,
  ContentVersionRecord,
  CreateContentItemInput,
  CreateContentSourceInput,
  CreateContentVersionInput,
  PaginatedContentResult,
  SourceListQuery,
  UpdateContentSourceInput,
} from "./content-domain.js";
import { seedContentItems, seedContentSources, seedContentVersions } from "./content-fixtures.js";

export type ContentRepositories = {
  items: ContentItemRepository;
  reviewEvents: ContentReviewEventRepository;
  sources: ContentSourceRepository;
  versions: ContentVersionRepository;
};

export type ContentSourceRepository = {
  approve(input: {
    tenantId: string;
    sourceId: string;
    reviewedBy: string;
    now: Date;
  }): Promise<ContentSourceRecord | null>;
  create(
    tenantId: string,
    input: CreateContentSourceInput & { createdBy: string; now: Date },
  ): Promise<ContentSourceRecord>;
  findById(tenantId: string, sourceId: string): Promise<ContentSourceRecord | null>;
  listByTenant(
    tenantId: string,
    query: SourceListQuery,
  ): Promise<PaginatedContentResult<ContentSourceRecord>>;
  update(
    tenantId: string,
    sourceId: string,
    input: UpdateContentSourceInput & { now: Date },
  ): Promise<ContentSourceRecord | null>;
};

export type ContentItemRepository = {
  create(
    tenantId: string,
    input: CreateContentItemInput & { createdBy: string; now: Date },
  ): Promise<ContentItemRecord>;
  findById(tenantId: string, itemId: string): Promise<ContentItemRecord | null>;
  findDetailById(tenantId: string, itemId: string): Promise<ContentItemDetail | null>;
  listByTenant(
    tenantId: string,
    query: ContentListQuery,
  ): Promise<PaginatedContentResult<ContentItemRecord>>;
  markPublished(input: {
    tenantId: string;
    itemId: string;
    version: number;
    now: Date;
  }): Promise<ContentItemRecord | null>;
  updateStatus(input: {
    tenantId: string;
    itemId: string;
    status: ContentItemRecord["status"];
    now: Date;
  }): Promise<ContentItemRecord | null>;
};

export type ContentVersionRepository = {
  create(
    tenantId: string,
    contentItemId: string,
    input: CreateContentVersionInput & { createdBy: string; now: Date },
  ): Promise<ContentVersionRecord>;
  findById(tenantId: string, versionId: string): Promise<ContentVersionRecord | null>;
  latestForItem(tenantId: string, contentItemId: string): Promise<ContentVersionRecord | null>;
  listReviewQueue(
    tenantId: string,
    query: Pick<ContentListQuery, "page" | "pageSize">,
  ): Promise<PaginatedContentResult<ContentReviewQueueItem>>;
  updateStatus(input: {
    tenantId: string;
    versionId: string;
    status: ContentVersionRecord["status"];
    reviewedBy?: string;
    validation?: Record<string, unknown>;
    aiQa?: Record<string, unknown>;
    publishedAt?: Date;
    now: Date;
  }): Promise<ContentVersionRecord | null>;
};

export type ContentReviewEventRepository = {
  append(
    input: Omit<ContentReviewEventRecord, "id"> & { id?: string },
  ): Promise<ContentReviewEventRecord>;
  listByItem(tenantId: string, contentItemId: string): Promise<ContentReviewEventRecord[]>;
};

export function createInMemoryContentRepositories(): ContentRepositories {
  const sources = [...seedContentSources];
  const items = [...seedContentItems];
  const versions = [...seedContentVersions];
  const reviewEvents: ContentReviewEventRecord[] = [];

  return {
    sources: {
      async approve(input) {
        const source = sources.find(
          (item) => item.tenantId === input.tenantId && item.id === input.sourceId,
        );

        if (!source) {
          return null;
        }

        source.status = "approved";
        source.reviewedBy = input.reviewedBy;
        source.approvedAt = input.now;
        source.updatedAt = input.now;
        return source;
      },
      async create(tenantId, input) {
        const source: ContentSourceRecord = {
          id: crypto.randomUUID(),
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
          metadata: input.metadata,
          createdAt: input.now,
          updatedAt: input.now,
        };
        sources.push(source);
        return source;
      },
      async findById(tenantId, sourceId) {
        return (
          sources.find((source) => source.tenantId === tenantId && source.id === sourceId) ?? null
        );
      },
      async listByTenant(tenantId, query) {
        return paginate(
          sources.filter(
            (source) =>
              source.tenantId === tenantId &&
              (!query.status || source.status === query.status) &&
              (!query.licenseType || source.licenseType === query.licenseType),
          ),
          query.page,
          query.pageSize,
        );
      },
      async update(tenantId, sourceId, input) {
        const source = sources.find((item) => item.tenantId === tenantId && item.id === sourceId);

        if (!source) {
          return null;
        }

        Object.assign(source, {
          ...input,
          updatedAt: input.now,
        });
        return source;
      },
    },
    items: {
      async create(tenantId, input) {
        const item: ContentItemRecord = {
          id: crypto.randomUUID(),
          tenantId,
          type: input.type,
          title: input.title,
          slug: input.slug,
          language: input.language,
          level: input.level,
          status: "draft",
          currentVersion: 0,
          createdBy: input.createdBy,
          metadata: input.metadata,
          createdAt: input.now,
          updatedAt: input.now,
        };
        items.push(item);
        return item;
      },
      async findById(tenantId, itemId) {
        return items.find((item) => item.tenantId === tenantId && item.id === itemId) ?? null;
      },
      async findDetailById(tenantId, itemId) {
        const item = items.find((row) => row.tenantId === tenantId && row.id === itemId);

        if (!item) {
          return null;
        }

        return {
          ...item,
          versions: versions
            .filter((version) => version.tenantId === tenantId && version.contentItemId === itemId)
            .sort((left, right) => right.version - left.version),
        };
      },
      async listByTenant(tenantId, query) {
        return paginate(
          items.filter(
            (item) =>
              item.tenantId === tenantId &&
              (!query.status || item.status === query.status) &&
              (!query.type || item.type === query.type),
          ),
          query.page,
          query.pageSize,
        );
      },
      async markPublished(input) {
        const item = items.find(
          (row) => row.tenantId === input.tenantId && row.id === input.itemId,
        );

        if (!item) {
          return null;
        }

        item.status = "published";
        item.currentVersion = input.version;
        item.publishedAt = input.now;
        item.updatedAt = input.now;
        return item;
      },
      async updateStatus(input) {
        const item = items.find(
          (row) => row.tenantId === input.tenantId && row.id === input.itemId,
        );

        if (!item) {
          return null;
        }

        item.status = input.status;
        item.updatedAt = input.now;
        return item;
      },
    },
    versions: {
      async create(tenantId, contentItemId, input) {
        const latestVersion = Math.max(
          0,
          ...versions
            .filter(
              (version) => version.tenantId === tenantId && version.contentItemId === contentItemId,
            )
            .map((version) => version.version),
        );
        const version: ContentVersionRecord = {
          id: crypto.randomUUID(),
          tenantId,
          contentItemId,
          version: latestVersion + 1,
          status: "draft",
          body: input.body,
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
        };
        versions.push(version);
        return version;
      },
      async findById(tenantId, versionId) {
        return (
          versions.find((version) => version.tenantId === tenantId && version.id === versionId) ??
          null
        );
      },
      async latestForItem(tenantId, contentItemId) {
        return (
          versions
            .filter(
              (version) => version.tenantId === tenantId && version.contentItemId === contentItemId,
            )
            .sort((left, right) => right.version - left.version)[0] ?? null
        );
      },
      async listReviewQueue(tenantId, query) {
        const rows = versions
          .filter((version) => version.tenantId === tenantId && version.status === "review")
          .map((version) => ({
            ...version,
            item: items.find(
              (item) => item.tenantId === tenantId && item.id === version.contentItemId,
            )!,
          }))
          .filter((version) => Boolean(version.item));

        return paginate(rows, query.page, query.pageSize);
      },
      async updateStatus(input) {
        const version = versions.find(
          (row) => row.tenantId === input.tenantId && row.id === input.versionId,
        );

        if (!version) {
          return null;
        }

        version.status = input.status;
        version.reviewedBy = input.reviewedBy ?? version.reviewedBy;
        version.validation = input.validation ?? version.validation;
        version.aiQa = input.aiQa ?? version.aiQa;
        version.publishedAt = input.publishedAt ?? version.publishedAt;
        version.updatedAt = input.now;
        return version;
      },
    },
    reviewEvents: {
      async append(input) {
        const event: ContentReviewEventRecord = {
          ...input,
          id: input.id ?? crypto.randomUUID(),
        };
        reviewEvents.push(event);
        return event;
      },
      async listByItem(tenantId, contentItemId) {
        return reviewEvents.filter(
          (event) => event.tenantId === tenantId && event.contentItemId === contentItemId,
        );
      },
    },
  };
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedContentResult<T> {
  const normalizedPage = Math.max(page, 1);
  const normalizedPageSize = Math.min(Math.max(pageSize, 1), 100);
  const start = (normalizedPage - 1) * normalizedPageSize;

  return {
    data: items.slice(start, start + normalizedPageSize),
    page: normalizedPage,
    pageSize: normalizedPageSize,
    total: items.length,
  };
}
