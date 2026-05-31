export type PlacementQuestion = {
  id: string;
  /** CEFR level this question probes. */
  level: "A1" | "A2" | "B1" | "B2";
  prompt: string;
  options: string[];
  answer: string;
};

/**
 * A short adaptive-style placement quiz. Questions are ordered by difficulty
 * (A1 → B2). The result maps the number of correct answers to a recommended
 * starting CEFR level. This is a self-assessment, not an official test.
 */
export const placementQuestions: PlacementQuestion[] = [
  {
    id: "q1",
    level: "A1",
    prompt: "Choose the correct greeting: “___ morning! How are you?”",
    options: ["Good", "Well", "Nice", "Fine"],
    answer: "Good",
  },
  {
    id: "q2",
    level: "A1",
    prompt: "She ___ a teacher.",
    options: ["am", "is", "are", "be"],
    answer: "is",
  },
  {
    id: "q3",
    level: "A2",
    prompt: "Yesterday I ___ to the market.",
    options: ["go", "going", "went", "goes"],
    answer: "went",
  },
  {
    id: "q4",
    level: "A2",
    prompt: "There ___ any milk in the fridge.",
    options: ["isn't", "aren't", "wasn't many", "don't"],
    answer: "isn't",
  },
  {
    id: "q5",
    level: "B1",
    prompt: "If it rains tomorrow, we ___ stay home.",
    options: ["will", "would", "are", "have"],
    answer: "will",
  },
  {
    id: "q6",
    level: "B1",
    prompt: "I’m used to ___ early on weekdays.",
    options: ["wake up", "waking up", "woke up", "wakes up"],
    answer: "waking up",
  },
  {
    id: "q7",
    level: "B2",
    prompt: "By the time we arrived, the show ___.",
    options: ["already started", "had already started", "has started", "starts"],
    answer: "had already started",
  },
  {
    id: "q8",
    level: "B2",
    prompt: "She spoke to me as if she ___ me for years.",
    options: ["knows", "has known", "had known", "knew"],
    answer: "had known",
  },
];

export type PlacementResult = {
  level: "A1" | "A2" | "B1" | "B2";
  title: string;
  summary: string;
  recommendation: string;
};

export function evaluatePlacement(correctCount: number): PlacementResult {
  if (correctCount <= 2) {
    return {
      level: "A1",
      title: "A1 — Khởi đầu",
      summary: "Bạn đang xây nền tảng giao tiếp cơ bản.",
      recommendation: "Bắt đầu với module Giao tiếp cơ bản: chào hỏi, giới thiệu bản thân, số đếm.",
    };
  }
  if (correctCount <= 4) {
    return {
      level: "A2",
      title: "A2 — Sơ cấp",
      summary: "Bạn dùng được câu đơn giản trong tình huống quen thuộc.",
      recommendation: "Luyện thì quá khứ, câu hỏi lịch sự và hội thoại hằng ngày.",
    };
  }
  if (correctCount <= 6) {
    return {
      level: "B1",
      title: "B1 — Trung cấp",
      summary: "Bạn xử lý được hầu hết tình huống khi đi du lịch và làm việc cơ bản.",
      recommendation: "Tập câu điều kiện, cách diễn đạt ý kiến và hội thoại dài hơn.",
    };
  }
  return {
    level: "B2",
    title: "B2 — Trung cao cấp",
    summary: "Bạn diễn đạt trôi chảy và hiểu văn bản phức tạp.",
    recommendation: "Tập trung vào sắc thái ngữ pháp, từ vựng học thuật và phản xạ nói.",
  };
}
