import { NextResponse, type NextRequest } from "next/server";

import { completeLesson, isApiConfigured, startLesson } from "@/lib/api/client";

export const runtime = "nodejs";

/**
 * Proxies lesson progress mutations (start/complete) to the backend learning
 * API using server-side dev-header auth. Keeps credentials off the client and
 * avoids CORS. Returns 503 when no backend is configured (demo mode).
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string; action: string }> },
): Promise<NextResponse> {
  const { lessonId, action } = await context.params;

  if (!isApiConfigured()) {
    return NextResponse.json(
      { ok: false, error: "API chưa được cấu hình (chế độ demo)." },
      { status: 503 },
    );
  }

  if (action === "start") {
    const ok = await startLesson(lessonId);
    return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
  }

  if (action === "complete") {
    let score: number | undefined;
    try {
      const body = (await request.json()) as { score?: number };
      if (typeof body?.score === "number") score = body.score;
    } catch {
      // no body provided
    }
    const ok = await completeLesson(lessonId, score);
    return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
  }

  return NextResponse.json({ ok: false, error: "Hành động không hợp lệ." }, { status: 400 });
}
