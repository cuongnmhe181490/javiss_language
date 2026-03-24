import Link from "next/link";
import { AiMessageRole } from "@prisma/client";
import { AiCoachComposer } from "@/components/dashboard/ai-coach-composer";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import {
  getAiCoachDashboardData,
  getAiConversationDetail,
} from "@/server/services/ai-coach.service";

export const dynamic = "force-dynamic";

export default async function DashboardAiCoachPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string }>;
}) {
  const session = await requireActiveStudentSession();
  const params = await searchParams;
  const { user, conversations, providerMode } = await getAiCoachDashboardData(session.userId);
  const selectedConversationId = params.conversationId ?? conversations[0]?.id;
  const selectedConversation = selectedConversationId
    ? await getAiConversationDetail({
        userId: session.userId,
        conversationId: selectedConversationId,
      }).catch(() => null)
    : null;

  const goal = user.goals[0];
  const weakSkills = user.profile?.weakestSkills ?? [];
  const strongSkills = user.profile?.strongestSkills ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Coach 1:1"
        description="Trao đổi riêng với trợ lý học tập để hỏi chiến lược, lộ trình và cách cải thiện kỹ năng."
      />
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan coaching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>Kỳ thi mục tiêu: {goal?.exam.name ?? "Chưa đặt"}</p>
              <p>Điểm mục tiêu: {goal?.targetScore ?? "Chưa đặt"}</p>
              <p>Trình độ hiện tại: {goal?.estimatedLevel ?? user.profile?.currentLevel ?? "Chưa có"}</p>
              <div className="space-y-2">
                <p className="font-medium text-slate-950 dark:text-white">Kỹ năng mạnh</p>
                <div className="flex flex-wrap gap-2">
                  {strongSkills.length > 0 ? (
                    strongSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)
                  ) : (
                    <p>Chưa cập nhật</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-950 dark:text-white">Kỹ năng yếu</p>
                <div className="flex flex-wrap gap-2">
                  {weakSkills.length > 0 ? (
                    weakSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)
                  ) : (
                    <p>Chưa cập nhật</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cuộc trò chuyện gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/ai-coach">
                <Button className="w-full" type="button" variant="secondary">
                  Bắt đầu cuộc trò chuyện mới
                </Button>
              </Link>
              {conversations.length === 0 ? (
                <EmptyState
                  title="Chưa có hội thoại nào"
                  description="Hãy gửi câu hỏi đầu tiên để AI Coach bắt đầu hỗ trợ bạn."
                />
              ) : (
                conversations.map((conversation) => {
                  const lastMessage = conversation.messages[0];
                  const isActive = conversation.id === selectedConversation?.id;

                  return (
                    <Link
                      key={conversation.id}
                      href={`/dashboard/ai-coach?conversationId=${conversation.id}`}
                      className={`block rounded-2xl border p-4 transition ${
                        isActive
                          ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-slate-900"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                      }`}
                    >
                      <p className="font-medium text-slate-950 dark:text-white">
                        {conversation.title}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                        {lastMessage?.content ?? "Chưa có nội dung phản hồi nào."}
                      </p>
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                        Cập nhật: {conversation.updatedAt.toLocaleString("vi-VN")}
                      </p>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>{selectedConversation?.title ?? "Bắt đầu cùng AI Coach"}</CardTitle>
              <Badge>{providerMode === "openai" ? "OpenAI" : "Chế độ demo"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {providerMode === "mock" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                AI Coach hiện đang chạy ở chế độ demo vì production chưa có `OPENAI_API_KEY`. Luồng hội thoại và lưu lịch sử đã hoạt động đầy đủ, và có thể chuyển sang OpenAI ngay khi cấu hình key.
              </div>
            ) : null}
            <div className="space-y-4">
              {selectedConversation ? (
                selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === AiMessageRole.user ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-3xl px-5 py-4 text-sm leading-7 ${
                        message.role === AiMessageRole.user
                          ? "bg-sky-600 text-white"
                          : "border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      }`}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                        {message.role === AiMessageRole.user ? "Bạn" : "AI Coach"}
                      </p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Bắt đầu cuộc trò chuyện đầu tiên"
                  description="Hãy hỏi AI Coach về lộ trình học, cách cải thiện kỹ năng hoặc chiến lược làm bài phù hợp với hồ sơ của bạn."
                />
              )}
            </div>
            <AiCoachComposer conversationId={selectedConversation?.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
