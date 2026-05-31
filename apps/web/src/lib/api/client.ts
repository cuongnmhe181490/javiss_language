import "server-only";

import { resolveApiBaseUrl } from "@/lib/api-base-url";
import type {
  AssignmentRecord,
  CourseDetail,
  CourseRecord,
  DashboardData,
  LessonDetail,
  PaginatedResult,
} from "./types";

/**
 * Server-side client for the backend learning API (apps/api).
 *
 * Calls run server-to-server from Next.js (Server Components / Route Handlers),
 * which keeps the dev-header credentials off the browser and sidesteps CORS
 * preflight entirely. When the API is not configured or is unreachable, callers
 * receive `null`/empty results so the UI can fall back to demo content.
 */

export interface ApiActor {
  userId: string;
  tenantId: string;
  roles: string[];
}

const SEED_LEARNER: ApiActor = {
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  tenantId: "11111111-1111-4111-8111-111111111111",
  roles: ["learner"],
};

/**
 * Whether the web app is configured to talk to the backend API. We treat the
 * presence of an explicit base URL or dev-actor override as the signal to go
 * live; otherwise the app stays in demo mode.
 */
export function isApiConfigured(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim()) ||
    process.env.API_LIVE === "1" ||
    Boolean(process.env.API_DEV_USER_ID?.trim())
  );
}

/**
 * Resolve the dev-header actor used for server-to-server calls. Defaults to the
 * seeded learner so a freshly seeded database works out of the box. Override
 * via API_DEV_USER_ID / API_DEV_TENANT_ID / API_DEV_ROLES.
 */
function resolveActor(): ApiActor {
  const userId = process.env.API_DEV_USER_ID?.trim();
  const tenantId = process.env.API_DEV_TENANT_ID?.trim();
  const roles = process.env.API_DEV_ROLES?.trim();

  if (!userId && !tenantId && !roles) {
    return SEED_LEARNER;
  }

  return {
    userId: userId || SEED_LEARNER.userId,
    tenantId: tenantId || SEED_LEARNER.tenantId,
    roles: roles
      ? roles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : SEED_LEARNER.roles,
  };
}

interface RequestOptions {
  /** Revalidation window in seconds for Next.js fetch caching. */
  revalidate?: number;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  if (!isApiConfigured()) {
    return null;
  }

  const actor = resolveActor();
  const url = `${resolveApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-dev-user-id": actor.userId,
        "x-dev-tenant-id": actor.tenantId,
        "x-dev-roles": actor.roles.join(","),
      },
      next: { revalidate: options.revalidate ?? 30 },
    });

    if (!response.ok) {
      console.error(`API ${path} responded ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API ${path} request failed:`, error);
    return null;
  }
}

export async function fetchCourses(params?: {
  language?: string;
  level?: string;
}): Promise<PaginatedResult<CourseRecord> | null> {
  const search = new URLSearchParams({ pageSize: "50" });
  if (params?.language) search.set("language", params.language);
  if (params?.level) search.set("level", params.level);
  return apiFetch<PaginatedResult<CourseRecord>>(`/v1/courses?${search.toString()}`);
}

export async function fetchCourseDetail(courseId: string): Promise<CourseDetail | null> {
  const result = await apiFetch<{ data: CourseDetail }>(
    `/v1/courses/${encodeURIComponent(courseId)}`,
  );
  return result?.data ?? null;
}

export async function fetchLessonDetail(lessonId: string): Promise<LessonDetail | null> {
  const result = await apiFetch<{ data: LessonDetail }>(
    `/v1/lessons/${encodeURIComponent(lessonId)}`,
  );
  return result?.data ?? null;
}

export async function fetchDashboard(): Promise<DashboardData | null> {
  const result = await apiFetch<{ data: DashboardData }>(`/v1/progress/me`, { revalidate: 0 });
  return result?.data ?? null;
}

export async function fetchAssignments(): Promise<AssignmentRecord[] | null> {
  const result = await apiFetch<{ data: AssignmentRecord[] }>(`/v1/assignments/me`, {
    revalidate: 0,
  });
  return result?.data ?? null;
}
