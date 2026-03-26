ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'public_chat_widget_opened';
ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'public_chat_message_requested';
ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'public_chat_message_completed';
ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'public_chat_fallback_used';
ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'public_chat_action_clicked';
ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'landing_cta_clicked';
