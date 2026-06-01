export type LanguageCode = "en" | "zh" | "ja" | "ko";

export type Phrase = {
  /** Text in the target language (native script). */
  text: string;
  /** Romanization / reading aid (pinyin, romaji, romaja). Empty for English. */
  reading?: string;
  /** Vietnamese meaning. */
  vi: string;
};

export type PhraseTopic = {
  id: string;
  title: string;
  phrases: Phrase[];
};

export type LanguageCourse = {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  framework: string;
  blurb: string;
  /** Quick facts shown on the language page. */
  facts: string[];
  topics: PhraseTopic[];
};

export const languageCourses: Record<LanguageCode, LanguageCourse> = {
  en: {
    code: "en",
    name: "Tiếng Anh",
    nativeName: "English",
    flag: "🇬🇧",
    framework: "CEFR A1–C2",
    blurb: "Giao tiếp, công việc và luyện thi IELTS/TOEIC với lộ trình theo khung CEFR.",
    facts: [
      "Khung tham chiếu: CEFR (A1 đến C2).",
      "Ngôn ngữ phổ biến nhất cho công việc và du học.",
      "Trọng tâm beta: giao tiếp A1–A2 hằng ngày.",
    ],
    topics: [
      {
        id: "greetings",
        title: "Chào hỏi",
        phrases: [
          { text: "Hello!", vi: "Xin chào!" },
          { text: "Good morning.", vi: "Chào buổi sáng." },
          { text: "How are you?", vi: "Bạn khỏe không?" },
          { text: "Nice to meet you.", vi: "Rất vui được gặp bạn." },
          { text: "See you later.", vi: "Hẹn gặp lại." },
        ],
      },
      {
        id: "basics",
        title: "Câu cơ bản",
        phrases: [
          { text: "Thank you.", vi: "Cảm ơn." },
          { text: "I'm sorry.", vi: "Tôi xin lỗi." },
          { text: "Excuse me.", vi: "Xin lỗi (gây chú ý)." },
          { text: "How much is this?", vi: "Cái này giá bao nhiêu?" },
          { text: "I don't understand.", vi: "Tôi không hiểu." },
        ],
      },
    ],
  },
  zh: {
    code: "zh",
    name: "Tiếng Trung",
    nativeName: "中文",
    flag: "🇨🇳",
    framework: "HSK 1–6",
    blurb: "Pinyin, thanh điệu và câu giao tiếp hằng ngày theo khung HSK.",
    facts: [
      "Khung tham chiếu: HSK (1 đến 6).",
      "Có thanh điệu (4 thanh) — luyện nghe rất quan trọng.",
      "Học pinyin trước khi nhớ mặt chữ Hán.",
    ],
    topics: [
      {
        id: "greetings",
        title: "Chào hỏi",
        phrases: [
          { text: "你好！", reading: "Nǐ hǎo!", vi: "Xin chào!" },
          { text: "早上好。", reading: "Zǎoshang hǎo.", vi: "Chào buổi sáng." },
          { text: "你好吗？", reading: "Nǐ hǎo ma?", vi: "Bạn khỏe không?" },
          {
            text: "很高兴认识你。",
            reading: "Hěn gāoxìng rènshi nǐ.",
            vi: "Rất vui được gặp bạn.",
          },
          { text: "再见！", reading: "Zàijiàn!", vi: "Tạm biệt!" },
        ],
      },
      {
        id: "basics",
        title: "Câu cơ bản",
        phrases: [
          { text: "谢谢。", reading: "Xièxie.", vi: "Cảm ơn." },
          { text: "对不起。", reading: "Duìbuqǐ.", vi: "Xin lỗi." },
          { text: "这个多少钱？", reading: "Zhège duōshao qián?", vi: "Cái này bao nhiêu tiền?" },
          { text: "我听不懂。", reading: "Wǒ tīng bu dǒng.", vi: "Tôi nghe không hiểu." },
          {
            text: "请问，洗手间在哪里？",
            reading: "Qǐngwèn, xǐshǒujiān zài nǎlǐ?",
            vi: "Cho hỏi, nhà vệ sinh ở đâu?",
          },
        ],
      },
    ],
  },
  ja: {
    code: "ja",
    name: "Tiếng Nhật",
    nativeName: "日本語",
    flag: "🇯🇵",
    framework: "JLPT N5–N1",
    blurb: "Kana, kanji cơ bản và mẫu câu lịch sự theo khung JLPT.",
    facts: [
      "Khung tham chiếu: JLPT (N5 đến N1).",
      "Ba bộ chữ: hiragana, katakana, kanji.",
      "Trọng tâm beta: hội thoại lịch sự N5.",
    ],
    topics: [
      {
        id: "greetings",
        title: "Chào hỏi",
        phrases: [
          { text: "こんにちは。", reading: "Konnichiwa.", vi: "Xin chào (ban ngày)." },
          { text: "おはようございます。", reading: "Ohayō gozaimasu.", vi: "Chào buổi sáng." },
          { text: "お元気ですか。", reading: "Ogenki desu ka.", vi: "Bạn khỏe không?" },
          { text: "はじめまして。", reading: "Hajimemashite.", vi: "Rất vui được gặp." },
          { text: "さようなら。", reading: "Sayōnara.", vi: "Tạm biệt." },
        ],
      },
      {
        id: "basics",
        title: "Câu cơ bản",
        phrases: [
          { text: "ありがとうございます。", reading: "Arigatō gozaimasu.", vi: "Cảm ơn." },
          { text: "すみません。", reading: "Sumimasen.", vi: "Xin lỗi / cho hỏi." },
          {
            text: "これはいくらですか。",
            reading: "Kore wa ikura desu ka.",
            vi: "Cái này bao nhiêu tiền?",
          },
          { text: "わかりません。", reading: "Wakarimasen.", vi: "Tôi không hiểu." },
          {
            text: "トイレはどこですか。",
            reading: "Toire wa doko desu ka.",
            vi: "Nhà vệ sinh ở đâu?",
          },
        ],
      },
    ],
  },
  ko: {
    code: "ko",
    name: "Tiếng Hàn",
    nativeName: "한국어",
    flag: "🇰🇷",
    framework: "TOPIK 1–6",
    blurb: "Hangul, trợ từ và hội thoại nhập môn theo khung TOPIK.",
    facts: [
      "Khung tham chiếu: TOPIK (cấp 1 đến 6).",
      "Bảng chữ Hangul rất dễ học (24 ký tự cơ bản).",
      "Có kính ngữ — chú ý mức độ lịch sự.",
    ],
    topics: [
      {
        id: "greetings",
        title: "Chào hỏi",
        phrases: [
          { text: "안녕하세요.", reading: "Annyeonghaseyo.", vi: "Xin chào." },
          { text: "좋은 아침이에요.", reading: "Joeun achimieyo.", vi: "Chào buổi sáng." },
          { text: "잘 지내세요?", reading: "Jal jinaeseyo?", vi: "Bạn khỏe không?" },
          {
            text: "만나서 반갑습니다.",
            reading: "Mannaseo bangapseumnida.",
            vi: "Rất vui được gặp.",
          },
          { text: "안녕히 가세요.", reading: "Annyeonghi gaseyo.", vi: "Tạm biệt (với người đi)." },
        ],
      },
      {
        id: "basics",
        title: "Câu cơ bản",
        phrases: [
          { text: "감사합니다.", reading: "Gamsahamnida.", vi: "Cảm ơn." },
          { text: "죄송합니다.", reading: "Joesonghamnida.", vi: "Xin lỗi." },
          { text: "이거 얼마예요?", reading: "Igeo eolmayeyo?", vi: "Cái này bao nhiêu tiền?" },
          { text: "잘 모르겠어요.", reading: "Jal moreugesseoyo.", vi: "Tôi không hiểu rõ." },
          {
            text: "화장실이 어디예요?",
            reading: "Hwajangsiri eodiyeyo?",
            vi: "Nhà vệ sinh ở đâu?",
          },
        ],
      },
    ],
  },
};

export const languageCourseList: LanguageCourse[] = [
  languageCourses.en,
  languageCourses.zh,
  languageCourses.ja,
  languageCourses.ko,
];
