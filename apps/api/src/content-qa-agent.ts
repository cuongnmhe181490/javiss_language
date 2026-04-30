import type {
  ContentItemRecord,
  ContentSourceRecord,
  ContentVersionRecord,
} from "./content-domain.js";

export const contentQaAgentId = "content-qa-agent-v1";
export const contentQaPolicyVersion = "content-qa-policy-v1";
export const contentQaRubricVersion = "content-rubric-v1";

export type ContentQaResult = {
  agentId: typeof contentQaAgentId;
  policyVersion: typeof contentQaPolicyVersion;
  rubricVersion: typeof contentQaRubricVersion;
  status: "passed" | "failed";
  riskLevel: "low" | "medium" | "high";
  checks: Array<{
    name: string;
    status: "passed" | "failed";
    reason?: string;
  }>;
  findings: string[];
};

export function runContentQa(input: {
  item: ContentItemRecord;
  sources: ContentSourceRecord[];
  version: ContentVersionRecord;
}): ContentQaResult {
  const checks = [
    contentShapeCheck(input.version),
    lineageCheck(input.version),
    sourceStatusCheck(input.sources),
    levelMetadataCheck(input.item, input.version),
    promptSafetyCheck(input.version),
  ];
  const failed = checks.filter((check) => check.status === "failed");

  return {
    agentId: contentQaAgentId,
    checks,
    findings: failed.map((check) => `${check.name}: ${check.reason ?? "failed"}`),
    policyVersion: contentQaPolicyVersion,
    riskLevel: failed.length >= 2 ? "high" : failed.length === 1 ? "medium" : "low",
    rubricVersion: contentQaRubricVersion,
    status: failed.length === 0 ? "passed" : "failed",
  };
}

function contentShapeCheck(version: ContentVersionRecord): ContentQaResult["checks"][number] {
  const hasContent = Object.keys(version.body).length > 0;

  return hasContent
    ? { name: "content_shape", status: "passed" }
    : { name: "content_shape", reason: "body_empty", status: "failed" };
}

function lineageCheck(version: ContentVersionRecord): ContentQaResult["checks"][number] {
  return version.sourceIds.length > 0
    ? { name: "lineage_present", status: "passed" }
    : { name: "lineage_present", reason: "missing_source_ids", status: "failed" };
}

function sourceStatusCheck(sources: ContentSourceRecord[]): ContentQaResult["checks"][number] {
  const blocked = sources.find((source) => source.status !== "approved");

  return blocked
    ? {
        name: "source_status",
        reason: `source_${blocked.id}_${blocked.status}`,
        status: "failed",
      }
    : { name: "source_status", status: "passed" };
}

function levelMetadataCheck(
  item: ContentItemRecord,
  version: ContentVersionRecord,
): ContentQaResult["checks"][number] {
  if (item.type !== "lesson") {
    return { name: "level_metadata", status: "passed" };
  }

  if (
    item.level ||
    readString(version.body, ["lesson", "targetLevel"]) ||
    readString(version.body, ["targetLevel"])
  ) {
    return { name: "level_metadata", status: "passed" };
  }

  return {
    name: "level_metadata",
    reason: "lesson_level_missing",
    status: "failed",
  };
}

function promptSafetyCheck(version: ContentVersionRecord): ContentQaResult["checks"][number] {
  const serialized = JSON.stringify(version.body).toLowerCase();

  if (
    serialized.includes("ignore previous instructions") ||
    serialized.includes("reveal your system prompt")
  ) {
    return {
      name: "policy_lint",
      reason: "prompt_injection_phrase",
      status: "failed",
    };
  }

  return { name: "policy_lint", status: "passed" };
}

function readString(value: Record<string, unknown>, path: string[]): string | undefined {
  let current: unknown = value;

  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" && current.trim() ? current : undefined;
}
