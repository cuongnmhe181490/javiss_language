export type Lesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "vocabulary" | "grammar" | "conversation" | "listening" | "reading" | "review";
  completed?: boolean;
};

export type Module = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  level: "A1" | "A2" | "B1" | "B2";
  lessons: Lesson[];
};

export const curriculumModules: Module[] = [
  {
    id: "mod-1",
    title: "Giao tiếp cơ bản",
    titleEn: "Basic Communication",
    description:
      "Học cách chào hỏi, giới thiệu bản thân, số đếm và nói về thời gian. Đây là nền tảng để bạn tự tin bắt đầu giao tiếp tiếng Anh.",
    level: "A1",
    lessons: [
      {
        id: "m1-l1",
        title: "Chào hỏi & Tạm biệt",
        description:
          "Hello, Hi, Good morning/afternoon/evening, Goodbye, See you later. Cách chào trong các tình huống khác nhau.",
        duration: "10 phút",
        type: "conversation",
      },
      {
        id: "m1-l2",
        title: "Giới thiệu bản thân",
        description:
          "My name is..., I'm from..., I'm ... years old. Nice to meet you. Tập giới thiệu tên, quê quán và tuổi.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m1-l3",
        title: "Số đếm 1–100",
        description:
          "Học số đếm từ 1 đến 100, cách đọc số điện thoại và giá tiền đơn giản.",
        duration: "15 phút",
        type: "vocabulary",
      },
      {
        id: "m1-l4",
        title: "Hỏi & Nói giờ",
        description:
          "What time is it? It's 3 o'clock. Half past, quarter to/past. Cách hỏi và trả lời về thời gian.",
        duration: "12 phút",
        type: "grammar",
      },
      {
        id: "m1-l5",
        title: "Ôn tập Module 1",
        description:
          "Ôn lại toàn bộ kiến thức Module 1 qua bài tập tổng hợp và hội thoại ngắn.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-2",
    title: "Cuộc sống hàng ngày",
    titleEn: "Daily Life",
    description:
      "Học cách gọi đồ ăn, mua sắm, hỏi đường và sử dụng phương tiện giao thông. Những tình huống bạn gặp mỗi ngày.",
    level: "A1",
    lessons: [
      {
        id: "m2-l1",
        title: "Gọi đồ ăn & Thức uống",
        description:
          "Can I have...? I'd like... How much is it? Từ vựng về đồ ăn, thức uống và cách gọi món.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m2-l2",
        title: "Mua sắm",
        description:
          "How much does this cost? Do you have...? I'll take this one. Từ vựng về quần áo, màu sắc và kích cỡ.",
        duration: "15 phút",
        type: "vocabulary",
      },
      {
        id: "m2-l3",
        title: "Hỏi đường & Chỉ đường",
        description:
          "Excuse me, where is...? Turn left/right. Go straight. It's next to... Cách hỏi và chỉ đường.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m2-l4",
        title: "Phương tiện giao thông",
        description:
          "I go by bus/taxi/train. How do I get to...? Từ vựng về phương tiện và cách hỏi về di chuyển.",
        duration: "10 phút",
        type: "vocabulary",
      },
      {
        id: "m2-l5",
        title: "Ôn tập Module 2",
        description:
          "Ôn lại toàn bộ kiến thức Module 2 qua roleplay mua sắm và hỏi đường.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-3",
    title: "Công việc & Xã hội",
    titleEn: "Work & Social",
    description:
      "Học cách phỏng vấn xin việc, gọi điện thoại, viết email và tham gia cuộc họp. Tiếng Anh cho môi trường làm việc.",
    level: "A2",
    lessons: [
      {
        id: "m3-l1",
        title: "Phỏng vấn xin việc",
        description:
          "Tell me about yourself. Why do you want this job? What are your strengths? Cách trả lời phỏng vấn cơ bản.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m3-l2",
        title: "Gọi điện thoại",
        description:
          "Hello, this is... May I speak to...? Can I take a message? Cách bắt đầu và kết thúc cuộc gọi.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m3-l3",
        title: "Viết email cơ bản",
        description:
          "Dear..., I am writing to... Best regards. Cấu trúc email đơn giản cho công việc.",
        duration: "15 phút",
        type: "reading",
      },
      {
        id: "m3-l4",
        title: "Tham gia cuộc họp",
        description:
          "I agree/disagree. In my opinion... Can you repeat that? Cách phát biểu và hỏi lại trong cuộc họp.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m3-l5",
        title: "Ôn tập Module 3",
        description:
          "Ôn lại toàn bộ kiến thức Module 3 qua tình huống công sở tổng hợp.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-4",
    title: "Du lịch & Khám phá",
    titleEn: "Travel & Exploration",
    description:
      "Chuẩn bị tiếng Anh cho chuyến đi nước ngoài: đặt vé, check-in khách sạn, xử lý tình huống khẩn cấp và chia sẻ trải nghiệm.",
    level: "A2",
    lessons: [
      {
        id: "m4-l1",
        title: "Đặt vé máy bay & Tàu",
        description:
          "I'd like to book a ticket to... One-way or return? Window or aisle seat? Từ vựng và mẫu câu đặt vé.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m4-l2",
        title: "Check-in khách sạn",
        description:
          "I have a reservation under... What time is checkout? Is breakfast included? Tình huống nhận phòng.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m4-l3",
        title: "Tình huống khẩn cấp",
        description:
          "I lost my passport. I need a doctor. Can you call the police? Xử lý sự cố khi đi du lịch.",
        duration: "15 phút",
        type: "vocabulary",
      },
      {
        id: "m4-l4",
        title: "Kể về chuyến đi",
        description:
          "I went to... It was amazing! The best part was... Cách kể lại trải nghiệm du lịch bằng thì quá khứ.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m4-l5",
        title: "Ôn tập Module 4",
        description:
          "Ôn lại toàn bộ kiến thức Module 4 qua roleplay tình huống du lịch.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-5",
    title: "Giao tiếp nâng cao",
    titleEn: "Intermediate Communication",
    description:
      "Phát triển khả năng thảo luận, tranh luận, đưa ra ý kiến và xử lý các tình huống phức tạp hơn trong cuộc sống và công việc.",
    level: "B1",
    lessons: [
      {
        id: "m5-l1",
        title: "Đưa ra ý kiến & Tranh luận",
        description:
          "I believe that... On the other hand... I see your point, but... Cách bày tỏ quan điểm lịch sự và phản biện.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m5-l2",
        title: "Kể chuyện & Tường thuật",
        description:
          "He said that... She told me... Reported speech cơ bản. Cách kể lại lời người khác nói.",
        duration: "15 phút",
        type: "grammar",
      },
      {
        id: "m5-l3",
        title: "Giải quyết vấn đề",
        description:
          "What if we...? How about...? The problem is... A possible solution is... Cách đề xuất giải pháp.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m5-l4",
        title: "Đọc tin tức tiếng Anh",
        description:
          "Học cách đọc hiểu bài báo ngắn, nhận biết ý chính và chi tiết quan trọng.",
        duration: "15 phút",
        type: "reading",
      },
      {
        id: "m5-l5",
        title: "Ôn tập Module 5",
        description:
          "Ôn lại kiến thức Module 5 qua thảo luận nhóm và phân tích tình huống.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-6",
    title: "Tiếng Anh công sở",
    titleEn: "Business English",
    description:
      "Nâng cao kỹ năng tiếng Anh trong môi trường doanh nghiệp: thuyết trình, đàm phán, viết báo cáo và networking.",
    level: "B1",
    lessons: [
      {
        id: "m6-l1",
        title: "Thuyết trình cơ bản",
        description:
          "Today I'd like to talk about... Let me start with... To summarize... Cấu trúc bài thuyết trình.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m6-l2",
        title: "Viết báo cáo & Tóm tắt",
        description:
          "The purpose of this report is... The data shows... In conclusion... Cách viết báo cáo ngắn gọn.",
        duration: "15 phút",
        type: "reading",
      },
      {
        id: "m6-l3",
        title: "Đàm phán & Thương lượng",
        description:
          "We'd like to propose... Could you offer a better price? Let's find a compromise. Kỹ năng đàm phán.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m6-l4",
        title: "Networking & Small talk",
        description:
          "What do you do? How long have you been in this field? It was nice meeting you. Giao tiếp xã giao.",
        duration: "12 phút",
        type: "conversation",
      },
      {
        id: "m6-l5",
        title: "Ôn tập Module 6",
        description:
          "Ôn lại kiến thức Module 6 qua mô phỏng cuộc họp kinh doanh.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-7",
    title: "Văn hóa & Xã hội",
    titleEn: "Culture & Society",
    description:
      "Thảo luận về các chủ đề xã hội, văn hóa, môi trường và công nghệ. Phát triển tư duy phản biện bằng tiếng Anh.",
    level: "B1",
    lessons: [
      {
        id: "m7-l1",
        title: "Môi trường & Biến đổi khí hậu",
        description:
          "Climate change, renewable energy, carbon footprint. Từ vựng và cách thảo luận về vấn đề môi trường.",
        duration: "15 phút",
        type: "vocabulary",
      },
      {
        id: "m7-l2",
        title: "Công nghệ trong cuộc sống",
        description:
          "Social media, artificial intelligence, digital privacy. Thảo luận về tác động của công nghệ.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m7-l3",
        title: "Sức khỏe & Lối sống",
        description:
          "Work-life balance, mental health, healthy habits. Cách nói về sức khỏe và thói quen tốt.",
        duration: "12 phút",
        type: "vocabulary",
      },
      {
        id: "m7-l4",
        title: "Giáo dục & Học tập",
        description:
          "Online learning, study abroad, lifelong learning. Thảo luận về xu hướng giáo dục hiện đại.",
        duration: "12 phút",
        type: "reading",
      },
      {
        id: "m7-l5",
        title: "Ôn tập Module 7",
        description:
          "Ôn lại kiến thức Module 7 qua debate và viết đoạn văn ngắn.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-8",
    title: "Tiếng Anh học thuật",
    titleEn: "Academic English",
    description:
      "Chuẩn bị cho môi trường học thuật: viết essay, đọc tài liệu nghiên cứu, thuyết trình học thuật và tham gia seminar.",
    level: "B2",
    lessons: [
      {
        id: "m8-l1",
        title: "Viết essay cơ bản",
        description:
          "Introduction, body paragraphs, conclusion. Thesis statement và supporting arguments. Cấu trúc bài luận.",
        duration: "20 phút",
        type: "reading",
      },
      {
        id: "m8-l2",
        title: "Đọc tài liệu học thuật",
        description:
          "Abstract, methodology, findings. Cách đọc lướt và tìm thông tin chính trong bài nghiên cứu.",
        duration: "20 phút",
        type: "reading",
      },
      {
        id: "m8-l3",
        title: "Thuyết trình học thuật",
        description:
          "According to research... The evidence suggests... Further studies are needed. Ngôn ngữ học thuật.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m8-l4",
        title: "Tham gia Seminar & Thảo luận",
        description:
          "I'd like to raise a point... Building on what you said... Could you elaborate? Kỹ năng thảo luận nhóm.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m8-l5",
        title: "Ôn tập Module 8",
        description:
          "Ôn lại kiến thức Module 8 qua viết tóm tắt nghiên cứu và thảo luận.",
        duration: "20 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-9",
    title: "Tiếng Anh chuyên nghiệp nâng cao",
    titleEn: "Advanced Professional English",
    description:
      "Kỹ năng tiếng Anh cho môi trường quốc tế: họp đa quốc gia, viết proposal, xử lý xung đột và lãnh đạo nhóm.",
    level: "B2",
    lessons: [
      {
        id: "m9-l1",
        title: "Họp quốc tế & Cross-cultural",
        description:
          "Dealing with different communication styles, time zones, cultural sensitivity. Kỹ năng họp đa văn hóa.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m9-l2",
        title: "Viết Proposal & Pitch",
        description:
          "Executive summary, problem statement, proposed solution, budget. Cách viết đề xuất dự án.",
        duration: "20 phút",
        type: "reading",
      },
      {
        id: "m9-l3",
        title: "Xử lý xung đột & Phản hồi",
        description:
          "I understand your concern... Let's find common ground... Constructive feedback. Giải quyết bất đồng.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m9-l4",
        title: "Lãnh đạo & Động viên nhóm",
        description:
          "Let's set clear goals... I appreciate your effort... How can I support you? Ngôn ngữ lãnh đạo.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m9-l5",
        title: "Ôn tập Module 9",
        description:
          "Ôn lại kiến thức Module 9 qua case study và roleplay tình huống quản lý.",
        duration: "20 phút",
        type: "review",
      },
    ],
  },
  {
    id: "mod-10",
    title: "Tổng ôn & Luyện thi",
    titleEn: "Review & Exam Preparation",
    description:
      "Ôn tập toàn diện từ A1 đến B2, luyện kỹ năng thi IELTS/TOEIC cơ bản và xây dựng chiến lược học tập dài hạn.",
    level: "B2",
    lessons: [
      {
        id: "m10-l1",
        title: "Luyện Listening cho IELTS/TOEIC",
        description:
          "Note-taking, prediction, keyword listening. Chiến lược nghe hiểu trong bài thi.",
        duration: "20 phút",
        type: "listening",
      },
      {
        id: "m10-l2",
        title: "Luyện Reading cho IELTS/TOEIC",
        description:
          "Skimming, scanning, matching headings. Chiến lược đọc hiểu nhanh và chính xác.",
        duration: "20 phút",
        type: "reading",
      },
      {
        id: "m10-l3",
        title: "Luyện Speaking",
        description:
          "Fluency, coherence, pronunciation. Cách trả lời câu hỏi dài và tự nhiên.",
        duration: "15 phút",
        type: "conversation",
      },
      {
        id: "m10-l4",
        title: "Luyện Writing",
        description:
          "Task achievement, coherence, vocabulary range. Cách viết bài luận đạt điểm cao.",
        duration: "20 phút",
        type: "reading",
      },
      {
        id: "m10-l5",
        title: "Kế hoạch học tập dài hạn",
        description:
          "Tổng kết hành trình, đánh giá tiến bộ và lập kế hoạch tiếp tục phát triển tiếng Anh.",
        duration: "15 phút",
        type: "review",
      },
    ],
  },
];
