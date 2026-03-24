import Link from "next/link";
import { AiConversationKind, AiMessageRole, AiProvider } from "@prisma/client";
import { AiCoachComposer } from "@/components/dashboard/ai-coach-composer";
import { AiSpeakingSessionPanel } from "@/components/dashboard/ai-speaking-session-panel";
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

function getProviderLabel(provider: AiProvider | "mock" | "openai" | "gemini") {
  switch (provider) {
    case AiProvider.openai:
    case "openai":
      return "OpenAI";
    case AiProvider.gemini:
    case "gemini":
      return "Gemini";
    default:
      return "Chế độ demo";
  }
}

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
  const latestAssistantMessage = selectedConversation?.messages
    .slice()
    .reverse()
    .find((message) => message.role === AiMessageRole.assistant)?.content;
  const activeProvider = selectedConversation?.provider ?? providerMode;
  const isFallbackConversation =
    selectedConversation?.provider === AiProvider.mock && providerMode !== "mock";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Coach 1:1"
        description="Trao đổi riêng với trợ lý học tập để hỏi chiến lược, lộ trình, đồng thời mở phiên speaking mock để luyện nói trực tiếp theo kiểu giám khảo hỏi từng lượt."
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
                  Bắt đầu chat coaching mới
                </Button>
              </Link>
              {conversations.length === 0 ? (
                <EmptyState
                  title="Chưa có hội thoại nào"
                  description="Hãy gửi câu hỏi đầu tiên hoặc mở một phiên speaking mock để AI bắt đầu hỗ trợ bạn."
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950 dark:text-white">
                          {conversation.title}
                        </p>
                        {conversation.kind === AiConversationKind.speaking_mock ? (
                          <Badge>Speaking mock</Badge>
                        ) : null}
                        <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {getProviderLabel(conversation.provider)}
                        </Badge>
                      </div>
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
              <Badge>{getProviderLabel(activeProvider)}</Badge>
              {selectedConversation?.kind === AiConversationKind.speaking_mock ? (
                <Badge>Speaking mock</Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {providerMode === "mock" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                AI Coach hiện đang chạy ở chế độ demo vì production chưa có key cho OpenAI hoặc Gemini. Luồng chat, speaking mock và lưu lịch sử đã hoạt động đầy đủ; chỉ cần bổ sung key là có thể chuyển sang AI thật.
              </div>
            ) : null}

            {isFallbackConversation ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                Hội thoại này đang chạy bằng chế độ dự phòng do Gemini gặp giới hạn quota hoặc lỗi tạm thời. Bạn vẫn có thể tiếp tục dùng bình thường.
              </div>
            ) : null}

            {selectedConversation?.kind === AiConversationKind.speaking_mock ? (
              <AiSpeakingSessionPanel
                conversationId={selectedConversation.id}
                scenario={selectedConversation.scenario}
                latestAssistantMessage={latestAssistantMessage}
              />
            ) : (
              <AiSpeakingSessionPanel />
            )}

            {selectedConversation?.kind === AiConversationKind.speaking_mock &&
            selectedConversation.speakingEstimatedBand ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                    Chấm band speaking sơ bộ
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Band {selectedConversation.speakingEstimatedBand}
                  </Badge>
                  {selectedConversation.speakingLastAssessedAt ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Cập nhật: {selectedConversation.speakingLastAssessedAt.toLocaleString("vi-VN")}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fluency</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                      {selectedConversation.speakingFluencyBand ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lexical</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                      {selectedConversation.speakingLexicalBand ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Grammar</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                      {selectedConversation.speakingGrammarBand ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pronunciation</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                      {selectedConversation.speakingPronunciationBand ?? "-"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {selectedConversation.speakingAssessmentSummary}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      Điểm tốt hiện tại
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedConversation.speakingStrengths.length > 0 ? (
                        selectedConversation.speakingStrengths.map((item) => (
                          <Badge key={item} className="bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có dữ liệu.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      Cần cải thiện tiếp
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedConversation.speakingImprovements.length > 0 ? (
                        selectedConversation.speakingImprovements.map((item) => (
                          <Badge
                            key={item}
                            className="bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                          >
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có dữ liệu.</p>
                      )}
                    </div>
                  </div>
                </div>
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
                        {message.role === AiMessageRole.user
                          ? "Bạn"
                          : selectedConversation.kind === AiConversationKind.speaking_mock
                            ? "Giám khảo AI"
                            : "AI Coach"}
                      </p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Bắt đầu cuộc trò chuyện đầu tiên"
                  description="Bạn có thể chat với AI Coach để xin lộ trình học, hoặc mở speaking mock để luyện trả lời trực tiếp như một buổi phỏng vấn speaking rút gọn."
                />
              )}
            </div>

            {selectedConversation?.kind === AiConversationKind.speaking_mock ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hãy trả lời bằng tiếng Anh. Nếu muốn giám khảo nhận xét, bạn có thể nói hoặc nhập:
                “Please give me feedback”.
              </p>
            ) : (
              <AiCoachComposer conversationId={selectedConversation?.id} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
