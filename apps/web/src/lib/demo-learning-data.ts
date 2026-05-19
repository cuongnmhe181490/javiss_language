import {
  BookOpen,
  Brain,
  CalendarDays,
  GraduationCap,
  Headphones,
  MessageCircle,
  Mic,
  NotebookText,
  PenLine,
  ShieldCheck,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type DemoSkill = {
  name: string;
  href: string;
  level: string;
  progress: number;
  status: string;
  icon: LucideIcon;
};

export type DemoAssignment = {
  title: string;
  due: string;
  status: "Ready" | "In review" | "Optional";
};

export type DemoActivity = {
  title: string;
  meta: string;
};

export type DemoPlanItem = {
  day: string;
  focus: string;
  minutes: number;
};

export const demoLearner = {
  name: "Bạn học thử",
  goal: "Tự tin hơn khi chào hỏi và hỏi thông tin cơ bản bằng tiếng Anh.",
  level: "A1 - bắt đầu giao tiếp",
  xp: 2840,
  nextLevelXp: 3200,
  streakDays: 6,
  weeklyMinutes: 142,
  weeklyGoalMinutes: 180,
  completion: 64,
};

export const continueLearning = {
  title: "Chào hỏi người mới gặp",
  track: "English A1 - bắt đầu giao tiếp",
  estimatedMinutes: 8,
  href: "/reading",
  objective: "Tập một lời chào ngắn, giới thiệu vai trò và hỏi thêm một câu lịch sự.",
};

export const nextLesson = {
  title: "Hỏi thông tin cơ bản",
  href: "/grammar",
  due: "Hôm nay",
  checkpoint: "Dùng “Can I...” và “May I...” trong câu hỏi lịch sự.",
};

export const demoSkills: DemoSkill[] = [
  {
    name: "Nghe",
    href: "/listening",
    level: "A1",
    progress: 58,
    status: "Cụm câu giao tiếp",
    icon: Headphones,
  },
  {
    name: "Nói",
    href: "/speaking",
    level: "A1",
    progress: 46,
    status: "Roleplay ngắn",
    icon: Mic,
  },
  {
    name: "Đọc",
    href: "/reading",
    level: "A1",
    progress: 71,
    status: "Ghi chú ngắn",
    icon: BookOpen,
  },
  {
    name: "Ngữ pháp",
    href: "/grammar",
    level: "A1",
    progress: 63,
    status: "Câu hỏi lịch sự",
    icon: PenLine,
  },
  {
    name: "Từ vựng",
    href: "/curriculum",
    level: "A1",
    progress: 69,
    status: "Từ vựng cơ bản",
    icon: NotebookText,
  },
];

export const demoAssignments: DemoAssignment[] = [
  { title: "Hoàn thành bài chào hỏi", due: "Hôm nay", status: "Ready" },
  { title: "Ghi lại phần luyện nói", due: "Ngày mai", status: "Optional" },
  { title: "Xem góp ý sau bài học", due: "T6", status: "In review" },
];

export const recentActivity: DemoActivity[] = [
  { title: "Hoàn thành khởi động phát âm", meta: "8 phút" },
  { title: "Ôn 12 cụm câu giao tiếp", meta: "+120 XP" },
  { title: "Bài học đang ở chế độ demo an toàn", meta: "Không lộ đáp án mẫu" },
];

export const weeklyPlan: DemoPlanItem[] = [
  { day: "T2", focus: "Nghe", minutes: 20 },
  { day: "T3", focus: "Nói", minutes: 25 },
  { day: "T4", focus: "Ngữ pháp", minutes: 20 },
  { day: "T5", focus: "Đọc", minutes: 15 },
  { day: "T6", focus: "Ôn tập", minutes: 30 },
];

export const achievements = [
  { label: "6 ngày liên tiếp", icon: Trophy },
  { label: "Nói ready", icon: Mic },
  { label: "Demo an toàn", icon: ShieldCheck },
  { label: "AI đang hỗ trợ", icon: Sparkles },
];

export const dashboardShortcuts = {
  aiTutor: {
    title: "Hỏi AI gia sư",
    copy: "Xin gợi ý ngắn theo bài đang học. Bản demo dùng nội dung mẫu tới khi API staging sẵn sàng.",
    href: "/dashboard#ai-tutor",
    icon: Brain,
  },
  speaking: {
    title: "Luyện nói",
    copy: "Mở vòng luyện nói beta để xem cảm giác feedback sau khi nói.",
    href: "/demo-speaking",
    icon: MessageCircle,
  },
  placement: {
    title: "Gợi ý trình độ",
    copy: "Xem luồng chọn mục tiêu trước khi có bài kiểm tra thật.",
    href: "/placement",
    icon: GraduationCap,
  },
  plan: {
    title: "Kế hoạch tuần",
    copy: "Giữ nhịp học nhẹ giữa nghe, nói, đọc và ngữ pháp.",
    href: "/dashboard#weekly-plan",
    icon: CalendarDays,
  },
};

export const publicLearningTopics = {
  grammar: {
    title: "Ngữ pháp dễ hiểu",
    description:
      "Học ngữ pháp qua mẫu câu ngắn, ví dụ dễ hiểu và bài kiểm tra nhỏ.",
    eyebrow: "Ngữ pháp",
    practice: ["Câu hỏi lịch sự", "Thì cơ bản", "Mẫu câu dùng ngay"],
    helps: [
      "Giải thích bằng tiếng Việt dễ hiểu",
      "Gắn ngữ pháp với tình huống thật",
      "Không lộ đáp án mẫu khi luyện tập",
    ],
    path: ["Khởi động mẫu câu", "Ví dụ có hướng dẫn", "Kiểm tra ngắn", "Nói transfer"],
  },
  speaking: {
    title: "Luyện nói",
    description:
      "Tập roleplay theo tình huống, xem transcript và gợi ý sửa lỗi ở bản beta.",
    eyebrow: "Nói",
    practice: ["Lượt hội thoại", "Mục tiêu phát âm", "Câu chữa cháy khi bí từ"],
    helps: [
      "Nêu rõ mục tiêu nói",
      "Hiện nhóm feedback dễ hiểu",
      "Chưa bật micro ở public beta",
    ],
    path: ["Chọn tình huống", "Tập cụm câu", "Hội thoại mẫu", "Xem góp ý"],
  },
  listening: {
    title: "Luyện nghe",
    description: "Luyện nhận ra cụm câu, ý chính và hội thoại ngắn.",
    eyebrow: "Nghe",
    practice: ["Nhận diện từ khóa", "Hiểu ý người nói", "Hiểu hội thoại ngắn"],
    helps: [
      "Nêu mục tiêu nghe trước",
      "Gắn âm thanh với từ vựng",
      "Nối bài nghe với luyện nói",
    ],
    path: ["Xem cụm câu", "Nghe lướt hội thoại", "Kiểm tra hiểu ý", "Lặp lại và trả lời"],
  },
  reading: {
    title: "Luyện đọc",
    description:
      "Đọc ghi chú ngắn, hướng dẫn đơn giản và đoạn văn thân thiện với người mới học.",
    eyebrow: "Đọc",
    practice: ["Ghi chú ngắn", "Đọc tìm ý chính", "Đoán nghĩa theo ngữ cảnh"],
    helps: [
      "Chia đoạn đọc thành bước nhỏ",
      "Gợi ý cụm câu hữu ích",
      "Nối bài đọc với bài luyện tập",
    ],
    path: ["Xem từ vựng trước", "Đọc lấy ý chính", "Kiểm tra chi tiết", "Dùng trong câu trả lời"],
  },
  placement: {
    title: "Gợi ý trình độ",
    description:
      "Xem cách hệ thống gợi ý điểm bắt đầu trước khi có bài kiểm tra thật.",
    eyebrow: "Placement",
    practice: ["Mục tiêu học", "Ước lượng trình độ", "Tự đánh giá kỹ năng"],
    helps: [
      "Gợi ý rõ lý do",
      "Không tự nhận điểm khi chưa đủ dữ liệu",
      "Chuẩn bị bản học thử",
    ],
    path: ["Chọn mục tiêu", "Quét kỹ năng", "Gợi ý trình độ", "Xem lại kế hoạch"],
  },
  curriculum: {
    title: "Bản đồ bài học",
    description:
      "Xem cấu trúc bài học beta: bài ngắn, luyện nói và ôn tập.",
    eyebrow: "Curriculum",
    practice: ["Thứ tự bài học", "Mục tiêu bài", "Nhịp luyện tập"],
    helps: [
      "Cho thấy các phần học nối với nhau",
      "Tách rõ demo và nội dung đã duyệt",
      "Hỗ trợ lên lộ trình học thử",
    ],
    path: ["Lộ trình nhập môn", "Bài chính", "Vòng luyện tập", "Ôn lại tiến độ"],
  },
} as const;

export type PublicLearningTopicKey = keyof typeof publicLearningTopics;
