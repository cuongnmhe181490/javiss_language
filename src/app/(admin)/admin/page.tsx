import { LearnerRetentionCard } from "@/components/admin/learner-retention-card";
import { PublicChatAnalyticsCard } from "@/components/admin/public-chat-analytics-card";
import { RegistrationFunnelCard } from "@/components/admin/registration-funnel-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { prisma } from "@/lib/db/prisma";
import { getLearnerRetentionSummary } from "@/server/services/learner-retention-analytics.service";
import { getPublicChatAnalyticsSummary } from "@/server/services/public-chat-analytics.service";
import { getRegistrationFunnelSummary } from "@/server/services/registration-funnel-analytics.service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    pendingRegistrations,
    activeUsers,
    blockedUsers,
    totalUsers,
    publicChatSummary,
    registrationFunnel,
    learnerRetention,
  ] = await Promise.all([
    prisma.registrationRequest.count({ where: { status: "pending" } }),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "blocked" } }),
    prisma.user.count(),
    getPublicChatAnalyticsSummary(),
    getRegistrationFunnelSummary(),
    getLearnerRetentionSummary(),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Tổng quan quản trị"
        description="Theo dõi nhanh tình trạng vận hành của nền tảng, nhu cầu từ người dùng mới và hiệu quả funnel đăng ký."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Đăng ký chờ duyệt"
          value={String(pendingRegistrations)}
          description="Các yêu cầu đang chờ xử lý."
        />
        <MetricCard
          title="Người dùng đang hoạt động"
          value={String(activeUsers)}
          description="Số tài khoản đã kích hoạt."
        />
        <MetricCard
          title="Người dùng bị khóa"
          value={String(blockedUsers)}
          description="Các tài khoản đang bị hạn chế truy cập."
        />
        <MetricCard
          title="Tổng số người dùng"
          value={String(totalUsers)}
          description="Quy mô người dùng hiện tại của hệ thống."
        />
      </div>
      <RegistrationFunnelCard {...registrationFunnel} />
      <LearnerRetentionCard {...learnerRetention} />
      <PublicChatAnalyticsCard {...publicChatSummary} />
    </div>
  );
}
