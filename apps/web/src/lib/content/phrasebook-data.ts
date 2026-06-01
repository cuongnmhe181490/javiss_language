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
          { text: "Yes / No.", vi: "Vâng / Không." },
          { text: "I don't understand.", vi: "Tôi không hiểu." },
        ],
      },
      {
        id: "numbers",
        title: "Số đếm 1–10",
        phrases: [
          { text: "One, two, three", vi: "Một, hai, ba" },
          { text: "Four, five, six", vi: "Bốn, năm, sáu" },
          { text: "Seven, eight", vi: "Bảy, tám" },
          { text: "Nine, ten", vi: "Chín, mười" },
          { text: "How many?", vi: "Bao nhiêu (số lượng)?" },
        ],
      },
      {
        id: "restaurant",
        title: "Ở nhà hàng",
        phrases: [
          { text: "A table for two, please.", vi: "Cho bàn cho hai người." },
          { text: "Can I see the menu?", vi: "Cho tôi xem thực đơn được không?" },
          { text: "I'd like a coffee.", vi: "Tôi muốn một cà phê." },
          { text: "The bill, please.", vi: "Tính tiền giúp tôi." },
          { text: "It's delicious!", vi: "Ngon quá!" },
        ],
      },
      {
        id: "directions",
        title: "Hỏi đường",
        phrases: [
          { text: "Where is the station?", vi: "Nhà ga ở đâu?" },
          { text: "Go straight ahead.", vi: "Đi thẳng." },
          { text: "Turn left / right.", vi: "Rẽ trái / phải." },
          { text: "It's near here.", vi: "Nó ở gần đây." },
          { text: "How far is it?", vi: "Bao xa?" },
        ],
      },
      {
        id: "time",
        title: "Thời gian",
        phrases: [
          { text: "What time is it?", vi: "Mấy giờ rồi?" },
          { text: "It's three o'clock.", vi: "Ba giờ." },
          { text: "Today / Tomorrow", vi: "Hôm nay / Ngày mai" },
          { text: "In the morning", vi: "Vào buổi sáng" },
          { text: "See you at seven.", vi: "Gặp nhau lúc bảy giờ." },
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
          { text: "是 / 不是。", reading: "Shì / Bù shì.", vi: "Phải / Không phải." },
          { text: "我听不懂。", reading: "Wǒ tīng bu dǒng.", vi: "Tôi nghe không hiểu." },
          { text: "请再说一遍。", reading: "Qǐng zài shuō yí biàn.", vi: "Xin nói lại lần nữa." },
        ],
      },
      {
        id: "numbers",
        title: "Số đếm 1–10",
        phrases: [
          { text: "一、二、三", reading: "Yī, èr, sān", vi: "Một, hai, ba" },
          { text: "四、五、六", reading: "Sì, wǔ, liù", vi: "Bốn, năm, sáu" },
          { text: "七、八", reading: "Qī, bā", vi: "Bảy, tám" },
          { text: "九、十", reading: "Jiǔ, shí", vi: "Chín, mười" },
          { text: "多少？", reading: "Duōshao?", vi: "Bao nhiêu?" },
        ],
      },
      {
        id: "restaurant",
        title: "Ở nhà hàng",
        phrases: [
          { text: "两个人。", reading: "Liǎng ge rén.", vi: "Hai người." },
          { text: "我要看菜单。", reading: "Wǒ yào kàn càidān.", vi: "Tôi muốn xem thực đơn." },
          {
            text: "我要一杯咖啡。",
            reading: "Wǒ yào yì bēi kāfēi.",
            vi: "Tôi muốn một cốc cà phê.",
          },
          { text: "买单。", reading: "Mǎidān.", vi: "Tính tiền." },
          { text: "很好吃！", reading: "Hěn hǎochī!", vi: "Rất ngon!" },
        ],
      },
      {
        id: "shopping",
        title: "Mua sắm",
        phrases: [
          { text: "这个多少钱？", reading: "Zhège duōshao qián?", vi: "Cái này bao nhiêu tiền?" },
          { text: "太贵了。", reading: "Tài guì le.", vi: "Đắt quá." },
          { text: "便宜一点。", reading: "Piányi yìdiǎn.", vi: "Rẻ hơn chút đi." },
          { text: "我要这个。", reading: "Wǒ yào zhège.", vi: "Tôi muốn cái này." },
          { text: "可以刷卡吗？", reading: "Kěyǐ shuākǎ ma?", vi: "Quẹt thẻ được không?" },
        ],
      },
      {
        id: "directions",
        title: "Hỏi đường",
        phrases: [
          {
            text: "请问，洗手间在哪里？",
            reading: "Qǐngwèn, xǐshǒujiān zài nǎlǐ?",
            vi: "Cho hỏi, nhà vệ sinh ở đâu?",
          },
          { text: "一直走。", reading: "Yìzhí zǒu.", vi: "Đi thẳng." },
          {
            text: "往左拐 / 往右拐。",
            reading: "Wǎng zuǒ guǎi / Wǎng yòu guǎi.",
            vi: "Rẽ trái / rẽ phải.",
          },
          { text: "很近。", reading: "Hěn jìn.", vi: "Rất gần." },
          {
            text: "地铁站在哪里？",
            reading: "Dìtiě zhàn zài nǎlǐ?",
            vi: "Ga tàu điện ngầm ở đâu?",
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
          { text: "はい / いいえ。", reading: "Hai / Iie.", vi: "Vâng / Không." },
          { text: "わかりません。", reading: "Wakarimasen.", vi: "Tôi không hiểu." },
          {
            text: "もう一度お願いします。",
            reading: "Mō ichido onegai shimasu.",
            vi: "Xin nói lại lần nữa.",
          },
        ],
      },
      {
        id: "numbers",
        title: "Số đếm 1–10",
        phrases: [
          { text: "いち、に、さん", reading: "Ichi, ni, san", vi: "Một, hai, ba" },
          { text: "し、ご、ろく", reading: "Shi, go, roku", vi: "Bốn, năm, sáu" },
          { text: "なな、はち", reading: "Nana, hachi", vi: "Bảy, tám" },
          { text: "きゅう、じゅう", reading: "Kyū, jū", vi: "Chín, mười" },
          { text: "いくつですか。", reading: "Ikutsu desu ka.", vi: "Bao nhiêu cái?" },
        ],
      },
      {
        id: "restaurant",
        title: "Ở nhà hàng",
        phrases: [
          { text: "二人です。", reading: "Futari desu.", vi: "Hai người." },
          { text: "メニューをください。", reading: "Menyū o kudasai.", vi: "Cho tôi thực đơn." },
          {
            text: "コーヒーをお願いします。",
            reading: "Kōhī o onegai shimasu.",
            vi: "Cho tôi cà phê.",
          },
          {
            text: "お会計お願いします。",
            reading: "Okaikei onegai shimasu.",
            vi: "Tính tiền giúp tôi.",
          },
          { text: "おいしいです！", reading: "Oishii desu!", vi: "Ngon quá!" },
        ],
      },
      {
        id: "shopping",
        title: "Mua sắm",
        phrases: [
          {
            text: "これはいくらですか。",
            reading: "Kore wa ikura desu ka.",
            vi: "Cái này bao nhiêu tiền?",
          },
          { text: "高いです。", reading: "Takai desu.", vi: "Đắt quá." },
          { text: "これをください。", reading: "Kore o kudasai.", vi: "Cho tôi cái này." },
          {
            text: "カードで払えますか。",
            reading: "Kādo de haraemasu ka.",
            vi: "Trả bằng thẻ được không?",
          },
          { text: "袋をください。", reading: "Fukuro o kudasai.", vi: "Cho tôi cái túi." },
        ],
      },
      {
        id: "directions",
        title: "Hỏi đường",
        phrases: [
          {
            text: "トイレはどこですか。",
            reading: "Toire wa doko desu ka.",
            vi: "Nhà vệ sinh ở đâu?",
          },
          {
            text: "まっすぐ行ってください。",
            reading: "Massugu itte kudasai.",
            vi: "Đi thẳng nhé.",
          },
          {
            text: "左 / 右に曲がってください。",
            reading: "Hidari / Migi ni magatte kudasai.",
            vi: "Rẽ trái / phải.",
          },
          { text: "近いです。", reading: "Chikai desu.", vi: "Gần thôi." },
          { text: "駅はどこですか。", reading: "Eki wa doko desu ka.", vi: "Nhà ga ở đâu?" },
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
          { text: "네 / 아니요.", reading: "Ne / Aniyo.", vi: "Vâng / Không." },
          { text: "잘 모르겠어요.", reading: "Jal moreugesseoyo.", vi: "Tôi không hiểu rõ." },
          {
            text: "다시 말해 주세요.",
            reading: "Dasi malhae juseyo.",
            vi: "Xin nói lại giúp tôi.",
          },
        ],
      },
      {
        id: "numbers",
        title: "Số đếm 1–10",
        phrases: [
          { text: "하나, 둘, 셋", reading: "Hana, dul, set", vi: "Một, hai, ba" },
          { text: "넷, 다섯, 여섯", reading: "Net, daseot, yeoseot", vi: "Bốn, năm, sáu" },
          { text: "일곱, 여덟", reading: "Ilgop, yeodeol", vi: "Bảy, tám" },
          { text: "아홉, 열", reading: "Ahop, yeol", vi: "Chín, mười" },
          { text: "몇 개예요?", reading: "Myeot gaeyeyo?", vi: "Bao nhiêu cái?" },
        ],
      },
      {
        id: "restaurant",
        title: "Ở nhà hàng",
        phrases: [
          { text: "두 명이에요.", reading: "Du myeongieyo.", vi: "Hai người." },
          { text: "메뉴 좀 주세요.", reading: "Menyu jom juseyo.", vi: "Cho tôi thực đơn." },
          {
            text: "커피 한 잔 주세요.",
            reading: "Keopi han jan juseyo.",
            vi: "Cho tôi một ly cà phê.",
          },
          { text: "계산해 주세요.", reading: "Gyesanhae juseyo.", vi: "Tính tiền giúp tôi." },
          { text: "맛있어요!", reading: "Masisseoyo!", vi: "Ngon quá!" },
        ],
      },
      {
        id: "shopping",
        title: "Mua sắm",
        phrases: [
          { text: "이거 얼마예요?", reading: "Igeo eolmayeyo?", vi: "Cái này bao nhiêu tiền?" },
          { text: "너무 비싸요.", reading: "Neomu bissayo.", vi: "Đắt quá." },
          { text: "이거 주세요.", reading: "Igeo juseyo.", vi: "Cho tôi cái này." },
          { text: "카드 돼요?", reading: "Kadeu dwaeyo?", vi: "Trả thẻ được không?" },
          { text: "봉투 주세요.", reading: "Bongtu juseyo.", vi: "Cho tôi cái túi." },
        ],
      },
      {
        id: "directions",
        title: "Hỏi đường",
        phrases: [
          {
            text: "화장실이 어디예요?",
            reading: "Hwajangsiri eodiyeyo?",
            vi: "Nhà vệ sinh ở đâu?",
          },
          { text: "직진하세요.", reading: "Jikjinhaseyo.", vi: "Đi thẳng." },
          {
            text: "왼쪽 / 오른쪽으로 가세요.",
            reading: "Oenjjok / Oreunjjogeuro gaseyo.",
            vi: "Rẽ trái / phải.",
          },
          { text: "가까워요.", reading: "Gakkawoyo.", vi: "Gần thôi." },
          {
            text: "지하철역이 어디예요?",
            reading: "Jihacheollyeogi eodiyeyo?",
            vi: "Ga tàu điện ngầm ở đâu?",
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
