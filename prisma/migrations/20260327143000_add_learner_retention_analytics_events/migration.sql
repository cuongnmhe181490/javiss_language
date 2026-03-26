ALTER TYPE "AnalyticsEventType"
ADD VALUE IF NOT EXISTS 'learner_dashboard_first_visited';

ALTER TYPE "AnalyticsEventType"
ADD VALUE IF NOT EXISTS 'lesson_catalog_first_opened';

ALTER TYPE "AnalyticsEventType"
ADD VALUE IF NOT EXISTS 'speaking_mock_first_started';

ALTER TYPE "AnalyticsEventType"
ADD VALUE IF NOT EXISTS 'writing_feedback_first_completed';
