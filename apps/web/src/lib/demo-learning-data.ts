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
  name: "Pilot learner",
  goal: "Reach confident workplace English for guest conversations.",
  level: "A1 Workplace Starter",
  xp: 2840,
  nextLevelXp: 3200,
  streakDays: 6,
  weeklyMinutes: 142,
  weeklyGoalMinutes: 180,
  completion: 64,
};

export const continueLearning = {
  title: "Greeting a guest",
  track: "English A1 Workplace Starter",
  estimatedMinutes: 8,
  href: "/reading",
  objective: "Practice a short welcome, a role introduction, and one polite follow-up question.",
};

export const nextLesson = {
  title: "Asking for basic information",
  href: "/grammar",
  due: "Today",
  checkpoint: "Use can I and may I in service questions.",
};

export const demoSkills: DemoSkill[] = [
  {
    name: "Listening",
    href: "/listening",
    level: "A1",
    progress: 58,
    status: "Service phrases",
    icon: Headphones,
  },
  {
    name: "Speaking",
    href: "/speaking",
    level: "A1",
    progress: 46,
    status: "Roleplay loop",
    icon: Mic,
  },
  {
    name: "Reading",
    href: "/reading",
    level: "A1",
    progress: 71,
    status: "Short workplace notes",
    icon: BookOpen,
  },
  {
    name: "Grammar",
    href: "/grammar",
    level: "A1",
    progress: 63,
    status: "Polite questions",
    icon: PenLine,
  },
  {
    name: "Vocabulary",
    href: "/curriculum",
    level: "A1",
    progress: 69,
    status: "Hospitality core",
    icon: NotebookText,
  },
];

export const demoAssignments: DemoAssignment[] = [
  { title: "Finish greeting checkpoint", due: "Today", status: "Ready" },
  { title: "Record speaking reflection", due: "Tomorrow", status: "Optional" },
  { title: "Manager feedback review", due: "Fri", status: "In review" },
];

export const recentActivity: DemoActivity[] = [
  { title: "Completed pronunciation warm-up", meta: "8 minutes" },
  { title: "Reviewed 12 workplace phrases", meta: "+120 XP" },
  { title: "Passed lesson safety check", meta: "No answer key exposed" },
];

export const weeklyPlan: DemoPlanItem[] = [
  { day: "Mon", focus: "Listening", minutes: 20 },
  { day: "Tue", focus: "Speaking", minutes: 25 },
  { day: "Wed", focus: "Grammar", minutes: 20 },
  { day: "Thu", focus: "Reading", minutes: 15 },
  { day: "Fri", focus: "Review", minutes: 30 },
];

export const achievements = [
  { label: "6 day streak", icon: Trophy },
  { label: "Speaking ready", icon: Mic },
  { label: "Policy safe", icon: ShieldCheck },
  { label: "Coach active", icon: Sparkles },
];

export const dashboardShortcuts = {
  aiTutor: {
    title: "AI tutor shortcut",
    copy: "Ask for a hint grounded in the current lesson. Demo mode uses static copy until API staging is public.",
    href: "/dashboard#ai-tutor",
    icon: Brain,
  },
  speaking: {
    title: "Speaking practice",
    copy: "Open the beta speaking loop and review how realtime feedback will feel.",
    href: "/demo-speaking",
    icon: MessageCircle,
  },
  placement: {
    title: "Placement path",
    copy: "Preview the placement route before a real assessment is connected.",
    href: "/placement",
    icon: GraduationCap,
  },
  plan: {
    title: "Weekly plan",
    copy: "Keep a balanced practice mix across listening, speaking, reading, and grammar.",
    href: "/dashboard#weekly-plan",
    icon: CalendarDays,
  },
};

export const publicLearningTopics = {
  grammar: {
    title: "Grammar Coaching",
    description:
      "Build practical grammar through workplace patterns, short checks, and tutor-ready explanations.",
    eyebrow: "Grammar",
    practice: ["Polite questions", "Simple tense control", "Service-ready sentence patterns"],
    helps: [
      "Explains the rule in plain language",
      "Connects grammar to lesson context",
      "Keeps answer keys out of learner views",
    ],
    path: ["Warm-up pattern", "Guided example", "Short checkpoint", "Speaking transfer"],
  },
  speaking: {
    title: "Speaking Practice",
    description:
      "Practice roleplay scenarios with a beta-safe preview of transcript, feedback, and fluency goals.",
    eyebrow: "Speaking",
    practice: ["Roleplay turns", "Pronunciation targets", "Conversation recovery phrases"],
    helps: [
      "Frames each speaking goal",
      "Shows feedback categories",
      "Keeps microphone access disabled in public beta",
    ],
    path: ["Scenario setup", "Phrase rehearsal", "Mock conversation", "Feedback review"],
  },
  listening: {
    title: "Listening Studio",
    description: "Train recognition of workplace phrases, intent, and short service conversations.",
    eyebrow: "Listening",
    practice: ["Keyword recognition", "Intent detection", "Short dialogue comprehension"],
    helps: [
      "Previews listening goals",
      "Pairs audio concepts with vocabulary",
      "Links listening to speaking follow-up",
    ],
    path: ["Phrase preview", "Dialogue scan", "Comprehension check", "Repeat and respond"],
  },
  reading: {
    title: "Reading Practice",
    description:
      "Read short workplace notes, service instructions, and learner-friendly lesson text.",
    eyebrow: "Reading",
    practice: ["Short notes", "Instruction scanning", "Context clues"],
    helps: [
      "Breaks text into tasks",
      "Highlights useful phrases",
      "Connects reading to assignments",
    ],
    path: ["Preview vocabulary", "Read for meaning", "Check details", "Apply in a reply"],
  },
  placement: {
    title: "Placement Preview",
    description:
      "Understand how learners will be placed into a level before a real assessment is enabled.",
    eyebrow: "Placement",
    practice: ["Goal intake", "Level estimate", "Skill confidence check"],
    helps: [
      "Keeps placement transparent",
      "Avoids unsupported score claims",
      "Prepares tenant pilot setup",
    ],
    path: ["Profile goal", "Skill scan", "Recommended level", "Pilot review"],
  },
  curriculum: {
    title: "Curriculum Map",
    description:
      "Explore the beta curriculum shape across lessons, assignments, speaking loops, and review moments.",
    eyebrow: "Curriculum",
    practice: ["Course sequence", "Lesson objectives", "Assignment cadence"],
    helps: [
      "Shows how learning pieces connect",
      "Separates published and draft concepts",
      "Supports tenant-specific pilot planning",
    ],
    path: ["Starter track", "Core lessons", "Practice loop", "Manager review"],
  },
} as const;

export type PublicLearningTopicKey = keyof typeof publicLearningTopics;
