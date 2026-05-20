export type GrammarExample = {
  english: string;
  vietnamese: string;
};

export type GrammarExercise = {
  type: "fill-in-blank" | "multiple-choice";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export type GrammarLesson = {
  id: string;
  title: string;
  englishTitle: string;
  level: "A1" | "A2";
  explanation: string;
  examples: GrammarExample[];
  exercises: GrammarExercise[];
};

export const grammarLessons: GrammarLesson[] = [
  {
    id: "gr-1",
    title: "Thì hiện tại đơn",
    englishTitle: "Present Simple",
    level: "A1",
    explanation:
      "Thì hiện tại đơn dùng để nói về thói quen, sự thật chung và lịch trình cố định. Với chủ ngữ he/she/it, động từ thêm -s hoặc -es. Với I/you/we/they, động từ giữ nguyên.",
    examples: [
      { english: "I work in an office.", vietnamese: "Tôi làm việc ở văn phòng." },
      { english: "She drinks coffee every morning.", vietnamese: "Cô ấy uống cà phê mỗi sáng." },
      { english: "They don't eat meat.", vietnamese: "Họ không ăn thịt." },
      { english: "Does he speak English?", vietnamese: "Anh ấy có nói tiếng Anh không?" },
    ],
    exercises: [
      {
        type: "fill-in-blank",
        question: "She ___ (go) to school every day.",
        answer: "goes",
        explanation: "Với chủ ngữ 'she', động từ 'go' thêm -es thành 'goes'.",
      },
      {
        type: "multiple-choice",
        question: "Which sentence is correct?",
        options: ["He don't like fish.", "He doesn't like fish.", "He not like fish."],
        answer: "He doesn't like fish.",
        explanation: "Phủ định với he/she/it dùng 'doesn't' + động từ nguyên mẫu.",
      },
      {
        type: "fill-in-blank",
        question: "They ___ (not/watch) TV in the morning.",
        answer: "don't watch",
        explanation: "Phủ định với they dùng 'don't' + động từ nguyên mẫu.",
      },
    ],
  },
  {
    id: "gr-2",
    title: "Thì hiện tại tiếp diễn",
    englishTitle: "Present Continuous",
    level: "A1",
    explanation:
      "Thì hiện tại tiếp diễn dùng để nói về hành động đang xảy ra ngay lúc nói hoặc kế hoạch trong tương lai gần. Cấu trúc: am/is/are + V-ing.",
    examples: [
      { english: "I am studying English now.", vietnamese: "Tôi đang học tiếng Anh." },
      { english: "She is cooking dinner.", vietnamese: "Cô ấy đang nấu bữa tối." },
      { english: "They are not working today.", vietnamese: "Hôm nay họ không làm việc." },
      { english: "Are you listening to me?", vietnamese: "Bạn đang nghe tôi nói không?" },
    ],
    exercises: [
      {
        type: "fill-in-blank",
        question: "Look! The baby ___ (sleep).",
        answer: "is sleeping",
        explanation: "'The baby' là ngôi thứ ba số ít nên dùng 'is' + V-ing.",
      },
      {
        type: "multiple-choice",
        question: "What ___ you doing right now?",
        options: ["is", "are", "am"],
        answer: "are",
        explanation: "Với 'you' luôn dùng 'are'.",
      },
      {
        type: "fill-in-blank",
        question: "We ___ (have) lunch at the moment.",
        answer: "are having",
        explanation: "'We' dùng 'are' + V-ing. 'Have' bỏ -e thêm -ing thành 'having'.",
      },
    ],
  },
  {
    id: "gr-3",
    title: "Can và Could",
    englishTitle: "Can / Could",
    level: "A1",
    explanation:
      "Can dùng để nói về khả năng hoặc xin phép ở hiện tại. Could dùng để xin phép lịch sự hơn hoặc nói về khả năng trong quá khứ. Sau can/could luôn là động từ nguyên mẫu (không chia).",
    examples: [
      { english: "I can swim.", vietnamese: "Tôi biết bơi." },
      { english: "Can you help me?", vietnamese: "Bạn có thể giúp tôi không?" },
      { english: "Could I use your phone?", vietnamese: "Tôi có thể dùng điện thoại của bạn không? (lịch sự)" },
      { english: "She couldn't come yesterday.", vietnamese: "Hôm qua cô ấy không thể đến." },
    ],
    exercises: [
      {
        type: "multiple-choice",
        question: "Which is more polite?",
        options: ["Can I sit here?", "Could I sit here?", "I sit here."],
        answer: "Could I sit here?",
        explanation: "'Could' lịch sự hơn 'can' khi xin phép.",
      },
      {
        type: "fill-in-blank",
        question: "He ___ speak three languages. (khả năng hiện tại)",
        answer: "can",
        explanation: "Nói về khả năng hiện tại dùng 'can'.",
      },
      {
        type: "fill-in-blank",
        question: "When I was young, I ___ run very fast.",
        answer: "could",
        explanation: "Nói về khả năng trong quá khứ dùng 'could'.",
      },
    ],
  },
  {
    id: "gr-4",
    title: "Câu hỏi Wh-",
    englishTitle: "Wh- Questions",
    level: "A1",
    explanation:
      "Câu hỏi Wh- bắt đầu bằng What, Where, When, Who, Why, How. Cấu trúc: Wh- + trợ động từ (do/does/is/are) + chủ ngữ + động từ. Dùng để hỏi thông tin cụ thể, không trả lời Yes/No.",
    examples: [
      { english: "What is your name?", vietnamese: "Tên bạn là gì?" },
      { english: "Where do you live?", vietnamese: "Bạn sống ở đâu?" },
      { english: "When does the class start?", vietnamese: "Lớp học bắt đầu khi nào?" },
      { english: "How do you go to work?", vietnamese: "Bạn đi làm bằng cách nào?" },
    ],
    exercises: [
      {
        type: "multiple-choice",
        question: "___ do you wake up? — At 7 AM.",
        options: ["What time", "Where", "Who"],
        answer: "What time",
        explanation: "Hỏi về thời gian cụ thể dùng 'What time'.",
      },
      {
        type: "fill-in-blank",
        question: "___ is your favorite color? — Blue.",
        answer: "What",
        explanation: "Hỏi về sự vật/thông tin dùng 'What'.",
      },
      {
        type: "fill-in-blank",
        question: "___ does she work? — In a hospital.",
        answer: "Where",
        explanation: "Hỏi về địa điểm dùng 'Where'.",
      },
    ],
  },
  {
    id: "gr-5",
    title: "There is / There are",
    englishTitle: "There is / There are",
    level: "A1",
    explanation:
      "Dùng 'There is' với danh từ số ít hoặc không đếm được. Dùng 'There are' với danh từ số nhiều. Cấu trúc này dùng để nói về sự tồn tại của ai/cái gì ở đâu đó.",
    examples: [
      { english: "There is a book on the table.", vietnamese: "Có một quyển sách trên bàn." },
      { english: "There are three cats in the garden.", vietnamese: "Có ba con mèo trong vườn." },
      { english: "Is there a bank near here?", vietnamese: "Có ngân hàng nào gần đây không?" },
      { english: "There aren't any chairs.", vietnamese: "Không có cái ghế nào." },
    ],
    exercises: [
      {
        type: "fill-in-blank",
        question: "There ___ a supermarket on this street.",
        answer: "is",
        explanation: "'A supermarket' là danh từ số ít nên dùng 'There is'.",
      },
      {
        type: "multiple-choice",
        question: "There ___ many students in the class.",
        options: ["is", "are", "has"],
        answer: "are",
        explanation: "'Many students' là số nhiều nên dùng 'There are'.",
      },
      {
        type: "fill-in-blank",
        question: "___ there any milk in the fridge?",
        answer: "Is",
        explanation: "'Milk' là danh từ không đếm được nên dùng 'Is there'.",
      },
    ],
  },
  {
    id: "gr-6",
    title: "Giới từ chỉ nơi chốn & thời gian",
    englishTitle: "Prepositions of Place & Time",
    level: "A1",
    explanation:
      "Giới từ chỉ nơi chốn: in (bên trong), on (trên bề mặt), at (tại một điểm), next to (bên cạnh), between (ở giữa). Giới từ chỉ thời gian: at (giờ), on (ngày/thứ), in (tháng/năm/mùa).",
    examples: [
      { english: "The keys are in my bag.", vietnamese: "Chìa khóa ở trong túi tôi." },
      { english: "The meeting is on Monday.", vietnamese: "Cuộc họp vào thứ Hai." },
      { english: "I wake up at 6 AM.", vietnamese: "Tôi thức dậy lúc 6 giờ sáng." },
      { english: "She was born in 1995.", vietnamese: "Cô ấy sinh năm 1995." },
    ],
    exercises: [
      {
        type: "multiple-choice",
        question: "The cat is ___ the table.",
        options: ["in", "on", "at"],
        answer: "on",
        explanation: "Con mèo ở trên bề mặt bàn nên dùng 'on'.",
      },
      {
        type: "fill-in-blank",
        question: "I have a meeting ___ 3 o'clock.",
        answer: "at",
        explanation: "Với giờ cụ thể dùng 'at'.",
      },
      {
        type: "fill-in-blank",
        question: "My birthday is ___ March.",
        answer: "in",
        explanation: "Với tháng dùng 'in'.",
      },
    ],
  },
  {
    id: "gr-7",
    title: "Thì quá khứ đơn",
    englishTitle: "Past Simple",
    level: "A2",
    explanation:
      "Thì quá khứ đơn dùng để nói về hành động đã hoàn thành trong quá khứ. Động từ có quy tắc thêm -ed (worked, played). Động từ bất quy tắc phải học thuộc (went, had, saw). Phủ định và câu hỏi dùng did/didn't.",
    examples: [
      { english: "I visited my grandmother last week.", vietnamese: "Tuần trước tôi đã thăm bà." },
      { english: "She went to the market yesterday.", vietnamese: "Hôm qua cô ấy đi chợ." },
      { english: "Did you eat breakfast?", vietnamese: "Bạn đã ăn sáng chưa?" },
      { english: "They didn't watch the movie.", vietnamese: "Họ đã không xem phim." },
    ],
    exercises: [
      {
        type: "fill-in-blank",
        question: "I ___ (buy) a new phone last month.",
        answer: "bought",
        explanation: "'Buy' là động từ bất quy tắc, quá khứ là 'bought'.",
      },
      {
        type: "multiple-choice",
        question: "She ___ to school yesterday.",
        options: ["didn't went", "didn't go", "not go"],
        answer: "didn't go",
        explanation: "Phủ định quá khứ: didn't + động từ nguyên mẫu.",
      },
      {
        type: "fill-in-blank",
        question: "___ you ___ (see) the news last night?",
        answer: "Did ... see",
        explanation: "Câu hỏi quá khứ: Did + chủ ngữ + động từ nguyên mẫu.",
      },
    ],
  },
  {
    id: "gr-8",
    title: "Tương lai với Will và Going to",
    englishTitle: "Future with Will / Going to",
    level: "A2",
    explanation:
      "Dùng 'will' cho quyết định tại chỗ, lời hứa, dự đoán không có bằng chứng. Dùng 'be going to' cho kế hoạch đã quyết định trước hoặc dự đoán có bằng chứng rõ ràng.",
    examples: [
      { english: "I'll help you with that.", vietnamese: "Tôi sẽ giúp bạn việc đó. (quyết định ngay)" },
      { english: "I'm going to study abroad next year.", vietnamese: "Năm sau tôi sẽ đi du học. (kế hoạch)" },
      { english: "Look at those clouds! It's going to rain.", vietnamese: "Nhìn mây kìa! Trời sắp mưa. (có bằng chứng)" },
      { english: "I think she will pass the exam.", vietnamese: "Tôi nghĩ cô ấy sẽ đậu. (dự đoán)" },
    ],
    exercises: [
      {
        type: "multiple-choice",
        question: "The phone is ringing. I ___ answer it.",
        options: ["will", "am going to", "going to"],
        answer: "will",
        explanation: "Quyết định ngay lúc nói dùng 'will'.",
      },
      {
        type: "fill-in-blank",
        question: "We ___ (visit) our parents this weekend. (kế hoạch đã định)",
        answer: "are going to visit",
        explanation: "Kế hoạch đã quyết định trước dùng 'be going to'.",
      },
      {
        type: "multiple-choice",
        question: "She's studied very hard. She ___ pass the test.",
        options: ["is going to", "will", "Both are correct"],
        answer: "is going to",
        explanation: "Có bằng chứng (đã học chăm) nên dùng 'is going to' để dự đoán.",
      },
    ],
  },
  {
    id: "gr-9",
    title: "So sánh hơn và nhất",
    englishTitle: "Comparatives & Superlatives",
    level: "A2",
    explanation:
      "So sánh hơn: tính từ ngắn + -er + than (taller than), more + tính từ dài + than (more expensive than). So sánh nhất: the + tính từ ngắn + -est (the tallest), the most + tính từ dài (the most expensive).",
    examples: [
      { english: "This book is cheaper than that one.", vietnamese: "Quyển sách này rẻ hơn quyển kia." },
      { english: "She is the tallest in the class.", vietnamese: "Cô ấy cao nhất lớp." },
      { english: "English is more difficult than I thought.", vietnamese: "Tiếng Anh khó hơn tôi nghĩ." },
    ],
    exercises: [
      {
        type: "fill-in-blank",
        question: "Summer is ___ (hot) than spring.",
        answer: "hotter",
        explanation: "'Hot' là tính từ ngắn 1 âm tiết, gấp đôi phụ âm cuối + -er.",
      },
      {
        type: "multiple-choice",
        question: "This is ___ restaurant in the city.",
        options: ["the most expensive", "more expensive", "expensiver"],
        answer: "the most expensive",
        explanation: "'Expensive' là tính từ dài, so sánh nhất dùng 'the most + adj'.",
      },
      {
        type: "fill-in-blank",
        question: "My sister is ___ (old) than me.",
        answer: "older",
        explanation: "'Old' là tính từ ngắn, thêm -er thành 'older'.",
      },
    ],
  },
  {
    id: "gr-10",
    title: "Động từ khuyết thiếu: Should & Must",
    englishTitle: "Should / Must",
    level: "A2",
    explanation:
      "Dùng 'should' để đưa ra lời khuyên (nên làm gì). Dùng 'must' để nói về nghĩa vụ, bắt buộc hoặc suy luận chắc chắn. 'Mustn't' = cấm. 'Don't have to' = không cần thiết (khác mustn't).",
    examples: [
      { english: "You should drink more water.", vietnamese: "Bạn nên uống nhiều nước hơn." },
      { english: "You must wear a seatbelt.", vietnamese: "Bạn phải thắt dây an toàn." },
      { english: "You mustn't park here.", vietnamese: "Bạn không được đỗ xe ở đây." },
      { english: "You don't have to come early.", vietnamese: "Bạn không cần đến sớm." },
    ],
    exercises: [
      {
        type: "multiple-choice",
        question: "You look tired. You ___ go to bed early.",
        options: ["should", "must", "mustn't"],
        answer: "should",
        explanation: "Đưa ra lời khuyên dùng 'should'.",
      },
      {
        type: "fill-in-blank",
        question: "Students ___ cheat in exams. It's against the rules.",
        answer: "mustn't",
        explanation: "Nói về điều bị cấm dùng 'mustn't'.",
      },
      {
        type: "multiple-choice",
        question: "Tomorrow is a holiday. You ___ go to work.",
        options: ["mustn't", "don't have to", "shouldn't"],
        answer: "don't have to",
        explanation: "Không bắt buộc (không cần thiết) dùng 'don't have to'.",
      },
    ],
  },
];
