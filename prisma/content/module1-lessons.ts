// Module 1: A1 - Giao tiếp cơ bản
// 8 Complete Lessons for English for Vietnamese Speakers

export interface VocabItem {
  term: string;
  meaning: string; // Vietnamese translation
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

export interface GrammarPointData {
  title: string;
  pattern: string;
  explanation: string; // in Vietnamese
  examples: { text: string; translation: string }[];
}

export interface ExerciseData {
  type: "multiple_choice" | "fill_in_blank" | "speaking";
  prompt: string;
  promptTranslation: string;
  content: Record<string, unknown>;
  answerKey: Record<string, unknown>;
  explanation: string;
  points: number;
}

export interface LessonBlockData {
  type: "text" | "vocabulary" | "dialogue" | "grammar" | "exercise";
  content: Record<string, unknown>;
}

export interface LessonData {
  title: string;
  slug: string;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  blocks: LessonBlockData[];
  vocabulary: VocabItem[];
  grammar: GrammarPointData[];
  exercises: ExerciseData[];
}


export const MODULE1_TITLE = "A1 - Giao tiếp cơ bản";
export const MODULE1_DESCRIPTION = "Module cơ bản giúp bạn tự tin giao tiếp tiếng Anh trong các tình huống hàng ngày: chào hỏi, giới thiệu bản thân, nói về gia đình, công việc và sở thích.";

export const lesson1: LessonData = {
  title: "Chào hỏi & Giới thiệu bản thân",
  slug: "chao-hoi-gioi-thieu-ban-than",
  description: "Học cách chào hỏi và giới thiệu bản thân bằng tiếng Anh trong các tình huống gặp gỡ lần đầu.",
  estimatedMinutes: 12,
  objectives: [
    "Chào hỏi lịch sự trong các thời điểm khác nhau trong ngày",
    "Giới thiệu tên và quê quán",
    "Hỏi thăm người khác bằng câu đơn giản",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Trong bài học này, bạn sẽ học cách chào hỏi và giới thiệu bản thân bằng tiếng Anh. Đây là những câu đầu tiên bạn cần khi gặp ai đó lần đầu — tại quán cà phê, nơi làm việc, hay bất kỳ đâu. Hãy luyện tập nói to để quen miệng nhé!",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "hello", "hi", "good morning", "good afternoon", "good evening",
          "my name is", "nice to meet you", "I'm from", "how are you", "fine", "good", "great",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Tại một quán cà phê, hai người gặp nhau lần đầu.",
        lines: [
          { speaker: "Anna", text: "Hi! I'm Anna. Nice to meet you.", translation: "Xin chào! Mình là Anna. Rất vui được gặp bạn." },
          { speaker: "Minh", text: "Hello, Anna. My name is Minh. Nice to meet you too.", translation: "Xin chào, Anna. Mình tên là Minh. Rất vui được gặp bạn." },
          { speaker: "Anna", text: "Where are you from, Minh?", translation: "Bạn đến từ đâu vậy, Minh?" },
          { speaker: "Minh", text: "I'm from Vietnam. And you?", translation: "Mình đến từ Việt Nam. Còn bạn?" },
          { speaker: "Anna", text: "I'm from Australia. How are you today?", translation: "Mình đến từ Úc. Hôm nay bạn thế nào?" },
          { speaker: "Minh", text: "I'm great, thank you! And you?", translation: "Mình rất tốt, cảm ơn bạn! Còn bạn?" },
          { speaker: "Anna", text: "I'm good, thanks!", translation: "Mình ổn, cảm ơn!" },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "Subject + be (I am, You are, He/She is)",
        pattern: "Subject + am/is/are + ...",
        explanation: "Động từ 'be' thay đổi theo chủ ngữ: I am (I'm), You are (You're), He/She is (He's/She's). Đây là cấu trúc cơ bản nhất trong tiếng Anh.",
        examples: [
          { text: "I am Minh.", translation: "Tôi là Minh." },
          { text: "You are my friend.", translation: "Bạn là bạn của tôi." },
          { text: "She is from Japan.", translation: "Cô ấy đến từ Nhật Bản." },
          { text: "He is a teacher.", translation: "Anh ấy là giáo viên." },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "hello", meaning: "xin chào", partOfSpeech: "interjection", exampleSentence: "Hello, how are you?", exampleTranslation: "Xin chào, bạn khỏe không?" },
    { term: "hi", meaning: "chào (thân mật)", partOfSpeech: "interjection", exampleSentence: "Hi! I'm Anna.", exampleTranslation: "Chào! Mình là Anna." },
    { term: "good morning", meaning: "chào buổi sáng", partOfSpeech: "phrase", exampleSentence: "Good morning, everyone!", exampleTranslation: "Chào buổi sáng mọi người!" },
    { term: "good afternoon", meaning: "chào buổi chiều", partOfSpeech: "phrase", exampleSentence: "Good afternoon, Mr. Lee.", exampleTranslation: "Chào buổi chiều, ông Lee." },
    { term: "good evening", meaning: "chào buổi tối", partOfSpeech: "phrase", exampleSentence: "Good evening! Welcome to the restaurant.", exampleTranslation: "Chào buổi tối! Chào mừng đến nhà hàng." },
    { term: "my name is", meaning: "tên tôi là", partOfSpeech: "phrase", exampleSentence: "My name is Minh.", exampleTranslation: "Tên tôi là Minh." },
    { term: "nice to meet you", meaning: "rất vui được gặp bạn", partOfSpeech: "phrase", exampleSentence: "Nice to meet you, Anna!", exampleTranslation: "Rất vui được gặp bạn, Anna!" },
    { term: "I'm from", meaning: "tôi đến từ", partOfSpeech: "phrase", exampleSentence: "I'm from Ho Chi Minh City.", exampleTranslation: "Tôi đến từ Thành phố Hồ Chí Minh." },
    { term: "how are you", meaning: "bạn khỏe không", partOfSpeech: "phrase", exampleSentence: "How are you today?", exampleTranslation: "Hôm nay bạn thế nào?" },
    { term: "fine", meaning: "ổn, khỏe", partOfSpeech: "adjective", exampleSentence: "I'm fine, thank you.", exampleTranslation: "Tôi ổn, cảm ơn." },
    { term: "good", meaning: "tốt, khỏe", partOfSpeech: "adjective", exampleSentence: "I'm good, thanks!", exampleTranslation: "Tôi khỏe, cảm ơn!" },
    { term: "great", meaning: "tuyệt vời, rất tốt", partOfSpeech: "adjective", exampleSentence: "I'm great today!", exampleTranslation: "Hôm nay tôi rất tốt!" },
  ],
  grammar: [
    {
      title: "Subject + be (I am, You are, He/She is)",
      pattern: "Subject + am/is/are + complement",
      explanation: "Động từ 'be' là động từ quan trọng nhất trong tiếng Anh. Nó thay đổi theo chủ ngữ: I → am, You/We/They → are, He/She/It → is. Dùng để giới thiệu tên, quê quán, nghề nghiệp.",
      examples: [
        { text: "I am a student.", translation: "Tôi là sinh viên." },
        { text: "You are very kind.", translation: "Bạn rất tốt bụng." },
        { text: "He is from Hanoi.", translation: "Anh ấy đến từ Hà Nội." },
        { text: "She is my teacher.", translation: "Cô ấy là giáo viên của tôi." },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "What is the correct greeting in the morning?",
      promptTranslation: "Câu chào nào đúng vào buổi sáng?",
      content: { options: ["Good evening", "Good morning", "Good night", "Goodbye"] },
      answerKey: { correctIndex: 1 },
      explanation: "'Good morning' dùng để chào vào buổi sáng (từ khi thức dậy đến trưa).",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Choose the correct sentence: 'My name ___ Minh.'",
      promptTranslation: "Chọn câu đúng: 'My name ___ Minh.'",
      content: { options: ["am", "is", "are", "be"] },
      answerKey: { correctIndex: 1 },
      explanation: "'Name' là ngôi thứ 3 số ít nên dùng 'is'. My name is Minh.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "How do you respond to 'Nice to meet you'?",
      promptTranslation: "Bạn trả lời thế nào khi ai đó nói 'Nice to meet you'?",
      content: { options: ["I'm fine", "Nice to meet you too", "Goodbye", "Thank you"] },
      answerKey: { correctIndex: 1 },
      explanation: "Khi ai đó nói 'Nice to meet you', ta đáp lại 'Nice to meet you too' (Rất vui được gặp bạn).",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I ___ from Vietnam.'",
      promptTranslation: "Điền vào chỗ trống: 'I ___ from Vietnam.'",
      content: { sentence: "I ___ from Vietnam.", blank: "___" },
      answerKey: { correctAnswer: "am", acceptableAnswers: ["am", "'m"] },
      explanation: "Với chủ ngữ 'I', ta dùng 'am'. I am from Vietnam = Tôi đến từ Việt Nam.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'How ___ you?'",
      promptTranslation: "Điền vào chỗ trống: 'How ___ you?'",
      content: { sentence: "How ___ you?", blank: "___" },
      answerKey: { correctAnswer: "are", acceptableAnswers: ["are"] },
      explanation: "Với chủ ngữ 'you', ta dùng 'are'. How are you? = Bạn khỏe không?",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Introduce yourself: Say your name and where you are from.",
      promptTranslation: "Giới thiệu bản thân: Nói tên bạn và bạn đến từ đâu.",
      content: { hint: "Hello! My name is ___. I'm from ___. Nice to meet you!" },
      answerKey: { sampleAnswer: "Hello! My name is [your name]. I'm from Vietnam. Nice to meet you!" },
      explanation: "Hãy nói to và rõ ràng. Dùng cấu trúc: Hello! My name is + tên. I'm from + nơi đến.",
      points: 15,
    },
  ],
};

export const lesson2: LessonData = {
  title: "Hỏi thăm sức khỏe & Cảm xúc",
  slug: "hoi-tham-suc-khoe-cam-xuc",
  description: "Học cách hỏi thăm sức khỏe và diễn tả cảm xúc, trạng thái của bản thân bằng tiếng Anh.",
  estimatedMinutes: 12,
  objectives: [
    "Hỏi thăm sức khỏe người khác",
    "Diễn tả cảm xúc và trạng thái cơ bản",
    "Sử dụng tính từ chỉ cảm xúc",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Sau khi biết cách chào hỏi, bước tiếp theo là hỏi thăm sức khỏe và chia sẻ cảm xúc. Bài này giúp bạn diễn tả trạng thái của mình — vui, buồn, mệt, đói — những điều bạn cần nói mỗi ngày.",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "how are you", "I'm fine", "tired", "happy", "sad",
          "hungry", "thirsty", "sick", "excited", "nervous",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Hai người bạn gặp nhau ở công ty vào buổi sáng.",
        lines: [
          { speaker: "Lan", text: "Good morning, Tom! How are you today?", translation: "Chào buổi sáng, Tom! Hôm nay bạn thế nào?" },
          { speaker: "Tom", text: "Hi Lan! I'm a bit tired today. I didn't sleep well.", translation: "Chào Lan! Hôm nay mình hơi mệt. Mình ngủ không ngon." },
          { speaker: "Lan", text: "Oh, I'm sorry to hear that. Are you sick?", translation: "Ồ, mình tiếc khi nghe vậy. Bạn bị ốm à?" },
          { speaker: "Tom", text: "No, I'm not sick. Just tired. How about you?", translation: "Không, mình không ốm. Chỉ mệt thôi. Còn bạn thì sao?" },
          { speaker: "Lan", text: "I'm happy today! I'm excited about the weekend.", translation: "Hôm nay mình vui! Mình háo hức về cuối tuần." },
          { speaker: "Tom", text: "That's great! I'm a little hungry. Let's get coffee.", translation: "Tuyệt! Mình hơi đói. Đi uống cà phê đi." },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "How + be + subject? / I feel + adjective",
        pattern: "How + am/is/are + subject? | Subject + feel(s) + adjective",
        explanation: "Để hỏi thăm sức khỏe, dùng 'How are you?' hoặc 'How is he/she?'. Để diễn tả cảm xúc, dùng 'I feel + tính từ' hoặc 'I am + tính từ'.",
        examples: [
          { text: "How are you feeling?", translation: "Bạn cảm thấy thế nào?" },
          { text: "I feel tired.", translation: "Tôi cảm thấy mệt." },
          { text: "She is happy today.", translation: "Hôm nay cô ấy vui." },
          { text: "How is your mother?", translation: "Mẹ bạn thế nào?" },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "how are you", meaning: "bạn khỏe không / bạn thế nào", partOfSpeech: "phrase", exampleSentence: "How are you doing today?", exampleTranslation: "Hôm nay bạn thế nào?" },
    { term: "I'm fine", meaning: "tôi ổn / tôi khỏe", partOfSpeech: "phrase", exampleSentence: "I'm fine, thank you for asking.", exampleTranslation: "Tôi ổn, cảm ơn bạn đã hỏi." },
    { term: "tired", meaning: "mệt mỏi", partOfSpeech: "adjective", exampleSentence: "I'm very tired after work.", exampleTranslation: "Tôi rất mệt sau giờ làm." },
    { term: "happy", meaning: "vui vẻ, hạnh phúc", partOfSpeech: "adjective", exampleSentence: "I'm happy to see you!", exampleTranslation: "Tôi vui khi gặp bạn!" },
    { term: "sad", meaning: "buồn", partOfSpeech: "adjective", exampleSentence: "She is sad because her cat is sick.", exampleTranslation: "Cô ấy buồn vì con mèo bị ốm." },
    { term: "hungry", meaning: "đói", partOfSpeech: "adjective", exampleSentence: "I'm hungry. Let's eat!", exampleTranslation: "Tôi đói. Đi ăn thôi!" },
    { term: "thirsty", meaning: "khát", partOfSpeech: "adjective", exampleSentence: "Are you thirsty? Do you want water?", exampleTranslation: "Bạn khát không? Bạn muốn uống nước không?" },
    { term: "sick", meaning: "ốm, bệnh", partOfSpeech: "adjective", exampleSentence: "He is sick. He has a fever.", exampleTranslation: "Anh ấy bị ốm. Anh ấy bị sốt." },
    { term: "excited", meaning: "háo hức, phấn khích", partOfSpeech: "adjective", exampleSentence: "I'm excited about my vacation!", exampleTranslation: "Tôi háo hức về kỳ nghỉ!" },
    { term: "nervous", meaning: "lo lắng, hồi hộp", partOfSpeech: "adjective", exampleSentence: "I'm nervous about the exam.", exampleTranslation: "Tôi lo lắng về bài thi." },
  ],
  grammar: [
    {
      title: "How + be + subject? / I feel + adjective",
      pattern: "How + am/is/are + subject? | Subject + feel(s) + adjective",
      explanation: "Cấu trúc hỏi thăm: 'How are you?' (Bạn thế nào?). Cấu trúc diễn tả cảm xúc: 'I feel + tính từ' hoặc 'I am + tính từ'. Cả hai cách đều phổ biến và tự nhiên.",
      examples: [
        { text: "How are you?", translation: "Bạn khỏe không?" },
        { text: "I feel happy.", translation: "Tôi cảm thấy vui." },
        { text: "He is tired.", translation: "Anh ấy mệt." },
        { text: "How is she feeling?", translation: "Cô ấy cảm thấy thế nào?" },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "Someone asks 'How are you?' — which is a good answer?",
      promptTranslation: "Ai đó hỏi 'How are you?' — câu trả lời nào phù hợp?",
      content: { options: ["I'm from Vietnam", "I'm fine, thanks", "My name is Lan", "Nice to meet you"] },
      answerKey: { correctIndex: 1 },
      explanation: "'I'm fine, thanks' là câu trả lời phù hợp khi được hỏi 'How are you?'",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Which word means 'đói' in English?",
      promptTranslation: "Từ nào có nghĩa là 'đói' trong tiếng Anh?",
      content: { options: ["thirsty", "tired", "hungry", "nervous"] },
      answerKey: { correctIndex: 2 },
      explanation: "'Hungry' = đói. 'Thirsty' = khát. 'Tired' = mệt. 'Nervous' = lo lắng.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Which sentence is correct?",
      promptTranslation: "Câu nào đúng ngữ pháp?",
      content: { options: ["I feel happily", "I feel happy", "I feel am happy", "I happy feel"] },
      answerKey: { correctIndex: 1 },
      explanation: "Sau 'feel' dùng tính từ (adjective), không dùng trạng từ. I feel happy = Tôi cảm thấy vui.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I'm very ___ . I want to sleep.' (mệt)",
      promptTranslation: "Điền vào chỗ trống: 'I'm very ___ . I want to sleep.' (mệt)",
      content: { sentence: "I'm very ___ . I want to sleep.", blank: "___" },
      answerKey: { correctAnswer: "tired", acceptableAnswers: ["tired"] },
      explanation: "'Tired' = mệt. Khi bạn muốn ngủ, bạn cảm thấy 'tired'.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'How ___ your sister today?'",
      promptTranslation: "Điền vào chỗ trống: 'How ___ your sister today?'",
      content: { sentence: "How ___ your sister today?", blank: "___" },
      answerKey: { correctAnswer: "is", acceptableAnswers: ["is"] },
      explanation: "'Your sister' là ngôi thứ 3 số ít nên dùng 'is'. How is your sister?",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Tell your friend how you feel today and ask how they are.",
      promptTranslation: "Nói cho bạn biết hôm nay bạn cảm thấy thế nào và hỏi thăm họ.",
      content: { hint: "Hi! I feel ___ today. How are you?" },
      answerKey: { sampleAnswer: "Hi! I feel happy today. How are you?" },
      explanation: "Dùng 'I feel + tính từ' hoặc 'I'm + tính từ' để diễn tả cảm xúc.",
      points: 15,
    },
  ],
};

export const lesson3: LessonData = {
  title: "Số đếm, Ngày tháng & Thời gian",
  slug: "so-dem-ngay-thang-thoi-gian",
  description: "Học số đếm từ 1-100, các ngày trong tuần, tháng và cách nói giờ bằng tiếng Anh.",
  estimatedMinutes: 15,
  objectives: [
    "Đếm số từ 1 đến 100",
    "Nói các ngày trong tuần và tháng trong năm",
    "Hỏi và trả lời về thời gian",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Số đếm, ngày tháng và thời gian là những thứ bạn dùng hàng ngày. Bài này giúp bạn tự tin khi hẹn gặp, đặt lịch, hay đơn giản là hỏi 'Mấy giờ rồi?' bằng tiếng Anh.",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "one", "ten", "twenty", "fifty", "one hundred",
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
          "January", "February", "March",
          "what time is it", "o'clock", "half past",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Minh gọi điện đặt lịch hẹn với phòng khám nha khoa.",
        lines: [
          { speaker: "Receptionist", text: "Good morning! How can I help you?", translation: "Chào buổi sáng! Tôi có thể giúp gì cho bạn?" },
          { speaker: "Minh", text: "Hi, I'd like to make an appointment, please.", translation: "Xin chào, tôi muốn đặt lịch hẹn." },
          { speaker: "Receptionist", text: "Sure. What day is good for you?", translation: "Được ạ. Ngày nào tiện cho bạn?" },
          { speaker: "Minh", text: "Is Wednesday okay?", translation: "Thứ Tư được không?" },
          { speaker: "Receptionist", text: "Yes! What time? We have 9 o'clock or half past two.", translation: "Được! Mấy giờ? Chúng tôi có 9 giờ hoặc 2 giờ rưỡi." },
          { speaker: "Minh", text: "Half past two, please.", translation: "2 giờ rưỡi, làm ơn." },
          { speaker: "Receptionist", text: "Perfect. Wednesday, March 15th, at half past two. See you then!", translation: "Hoàn hảo. Thứ Tư, ngày 15 tháng 3, lúc 2 giờ rưỡi. Hẹn gặp bạn!" },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "It is + time / On + day / In + month",
        pattern: "It is + time | On + day of week | In + month/year",
        explanation: "Nói giờ: 'It is + giờ' (It is 3 o'clock). Nói ngày: dùng 'on' (on Monday). Nói tháng/năm: dùng 'in' (in March, in 2026).",
        examples: [
          { text: "It is ten o'clock.", translation: "Bây giờ là 10 giờ." },
          { text: "The meeting is on Friday.", translation: "Cuộc họp vào thứ Sáu." },
          { text: "My birthday is in July.", translation: "Sinh nhật tôi vào tháng Bảy." },
          { text: "It is half past three.", translation: "Bây giờ là 3 giờ rưỡi." },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "one", meaning: "một (1)", partOfSpeech: "number", exampleSentence: "I have one brother.", exampleTranslation: "Tôi có một anh trai." },
    { term: "ten", meaning: "mười (10)", partOfSpeech: "number", exampleSentence: "There are ten students in the class.", exampleTranslation: "Có mười học sinh trong lớp." },
    { term: "twenty", meaning: "hai mươi (20)", partOfSpeech: "number", exampleSentence: "She is twenty years old.", exampleTranslation: "Cô ấy hai mươi tuổi." },
    { term: "fifty", meaning: "năm mươi (50)", partOfSpeech: "number", exampleSentence: "The book costs fifty dollars.", exampleTranslation: "Cuốn sách giá năm mươi đô la." },
    { term: "one hundred", meaning: "một trăm (100)", partOfSpeech: "number", exampleSentence: "There are one hundred pages.", exampleTranslation: "Có một trăm trang." },
    { term: "Monday", meaning: "Thứ Hai", partOfSpeech: "noun", exampleSentence: "I start work on Monday.", exampleTranslation: "Tôi bắt đầu làm việc vào thứ Hai." },
    { term: "Friday", meaning: "Thứ Sáu", partOfSpeech: "noun", exampleSentence: "We have a party on Friday.", exampleTranslation: "Chúng tôi có tiệc vào thứ Sáu." },
    { term: "Sunday", meaning: "Chủ Nhật", partOfSpeech: "noun", exampleSentence: "I rest on Sunday.", exampleTranslation: "Tôi nghỉ ngơi vào Chủ Nhật." },
    { term: "January", meaning: "Tháng Một", partOfSpeech: "noun", exampleSentence: "The new year starts in January.", exampleTranslation: "Năm mới bắt đầu vào tháng Một." },
    { term: "what time is it", meaning: "mấy giờ rồi", partOfSpeech: "phrase", exampleSentence: "Excuse me, what time is it?", exampleTranslation: "Xin lỗi, mấy giờ rồi?" },
    { term: "o'clock", meaning: "giờ (đúng)", partOfSpeech: "adverb", exampleSentence: "It's three o'clock.", exampleTranslation: "Bây giờ là 3 giờ đúng." },
    { term: "half past", meaning: "rưỡi (giờ)", partOfSpeech: "phrase", exampleSentence: "It's half past seven.", exampleTranslation: "Bây giờ là 7 giờ rưỡi." },
  ],
  grammar: [
    {
      title: "It is + time / On + day / In + month",
      pattern: "It is + time | On + day | In + month/year",
      explanation: "Giới từ thời gian: 'at' cho giờ cụ thể (at 3 o'clock), 'on' cho ngày (on Monday, on March 5th), 'in' cho tháng/năm (in March, in 2026). Hỏi giờ: 'What time is it?' Trả lời: 'It is + giờ'.",
      examples: [
        { text: "What time is it? It is 9 o'clock.", translation: "Mấy giờ rồi? 9 giờ đúng." },
        { text: "The class is on Tuesday.", translation: "Lớp học vào thứ Ba." },
        { text: "I was born in December.", translation: "Tôi sinh vào tháng Mười Hai." },
        { text: "The meeting is at half past ten.", translation: "Cuộc họp lúc 10 giờ rưỡi." },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "What time is it? (3:00)",
      promptTranslation: "Mấy giờ rồi? (3:00)",
      content: { options: ["It is three o'clock", "It is half past three", "It is three half", "It is o'clock three"] },
      answerKey: { correctIndex: 0 },
      explanation: "3:00 = three o'clock. 'O'clock' dùng cho giờ đúng.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Which preposition is correct? 'The party is ___ Saturday.'",
      promptTranslation: "Giới từ nào đúng? 'The party is ___ Saturday.'",
      content: { options: ["in", "at", "on", "to"] },
      answerKey: { correctIndex: 2 },
      explanation: "Dùng 'on' trước ngày trong tuần: on Saturday, on Monday, on Friday.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "What comes after twenty-nine?",
      promptTranslation: "Số nào đứng sau twenty-nine (29)?",
      content: { options: ["twenty-ten", "thirty", "twenty-eleven", "thirteen"] },
      answerKey: { correctIndex: 1 },
      explanation: "29 + 1 = 30 = thirty.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'My birthday is ___ June.' (tháng Sáu)",
      promptTranslation: "Điền vào chỗ trống: 'My birthday is ___ June.'",
      content: { sentence: "My birthday is ___ June.", blank: "___" },
      answerKey: { correctAnswer: "in", acceptableAnswers: ["in"] },
      explanation: "Dùng 'in' trước tháng: in June, in January, in December.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'It is half ___ eight.' (8:30)",
      promptTranslation: "Điền vào chỗ trống: 'It is half ___ eight.' (8:30)",
      content: { sentence: "It is half ___ eight.", blank: "___" },
      answerKey: { correctAnswer: "past", acceptableAnswers: ["past"] },
      explanation: "'Half past + giờ' = giờ rưỡi. Half past eight = 8 giờ rưỡi.",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Tell someone what day and time your English class is.",
      promptTranslation: "Nói cho ai đó biết lớp tiếng Anh của bạn vào ngày nào và mấy giờ.",
      content: { hint: "My English class is on ___ at ___ o'clock." },
      answerKey: { sampleAnswer: "My English class is on Monday at nine o'clock." },
      explanation: "Dùng 'on + ngày' và 'at + giờ' để nói lịch.",
      points: 15,
    },
  ],
};

export const lesson4: LessonData = {
  title: "Gia đình & Mối quan hệ",
  slug: "gia-dinh-moi-quan-he",
  description: "Học từ vựng về gia đình và cách giới thiệu các thành viên trong gia đình bằng tiếng Anh.",
  estimatedMinutes: 12,
  objectives: [
    "Gọi tên các thành viên trong gia đình",
    "Sử dụng tính từ sở hữu (my, your, his, her)",
    "Giới thiệu gia đình cho người khác",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Gia đình là chủ đề quen thuộc khi trò chuyện. Bài này giúp bạn giới thiệu bố mẹ, anh chị em và bạn bè bằng tiếng Anh một cách tự nhiên.",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "mother", "father", "sister", "brother", "husband",
          "wife", "son", "daughter", "friend", "colleague",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Lan giới thiệu gia đình mình cho đồng nghiệp mới tại bữa tiệc công ty.",
        lines: [
          { speaker: "David", text: "Lan, is this your family in the photo?", translation: "Lan, đây là gia đình bạn trong ảnh à?" },
          { speaker: "Lan", text: "Yes! This is my mother. Her name is Hoa.", translation: "Đúng rồi! Đây là mẹ mình. Tên bà ấy là Hoa." },
          { speaker: "David", text: "She looks very kind. And this man?", translation: "Bà ấy trông rất hiền. Còn người đàn ông này?" },
          { speaker: "Lan", text: "That's my father. His name is Tuan. He is a doctor.", translation: "Đó là bố mình. Tên ông ấy là Tuấn. Ông ấy là bác sĩ." },
          { speaker: "David", text: "Do you have brothers or sisters?", translation: "Bạn có anh chị em không?" },
          { speaker: "Lan", text: "Yes, I have one brother. His name is Nam. He is a student.", translation: "Có, mình có một anh trai. Tên anh ấy là Nam. Anh ấy là sinh viên." },
          { speaker: "David", text: "Nice! My sister is a student too.", translation: "Hay! Chị gái mình cũng là sinh viên." },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "Possessive adjectives (my, your, his, her) / This is my...",
        pattern: "Possessive + noun | This is + possessive + noun",
        explanation: "Tính từ sở hữu đứng trước danh từ: my (của tôi), your (của bạn), his (của anh ấy), her (của cô ấy), our (của chúng tôi), their (của họ). Dùng 'This is my...' để giới thiệu.",
        examples: [
          { text: "This is my mother.", translation: "Đây là mẹ tôi." },
          { text: "Her name is Hoa.", translation: "Tên cô ấy là Hoa." },
          { text: "His brother is tall.", translation: "Anh trai anh ấy cao." },
          { text: "Our family is small.", translation: "Gia đình chúng tôi nhỏ." },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "mother", meaning: "mẹ", partOfSpeech: "noun", exampleSentence: "My mother is a teacher.", exampleTranslation: "Mẹ tôi là giáo viên." },
    { term: "father", meaning: "bố, cha", partOfSpeech: "noun", exampleSentence: "His father works at a hospital.", exampleTranslation: "Bố anh ấy làm việc ở bệnh viện." },
    { term: "sister", meaning: "chị/em gái", partOfSpeech: "noun", exampleSentence: "I have two sisters.", exampleTranslation: "Tôi có hai chị em gái." },
    { term: "brother", meaning: "anh/em trai", partOfSpeech: "noun", exampleSentence: "My brother is older than me.", exampleTranslation: "Anh trai tôi lớn hơn tôi." },
    { term: "husband", meaning: "chồng", partOfSpeech: "noun", exampleSentence: "Her husband is very funny.", exampleTranslation: "Chồng cô ấy rất hài hước." },
    { term: "wife", meaning: "vợ", partOfSpeech: "noun", exampleSentence: "His wife is a nurse.", exampleTranslation: "Vợ anh ấy là y tá." },
    { term: "son", meaning: "con trai", partOfSpeech: "noun", exampleSentence: "Their son is five years old.", exampleTranslation: "Con trai họ năm tuổi." },
    { term: "daughter", meaning: "con gái", partOfSpeech: "noun", exampleSentence: "My daughter loves music.", exampleTranslation: "Con gái tôi yêu âm nhạc." },
    { term: "friend", meaning: "bạn bè", partOfSpeech: "noun", exampleSentence: "She is my best friend.", exampleTranslation: "Cô ấy là bạn thân nhất của tôi." },
    { term: "colleague", meaning: "đồng nghiệp", partOfSpeech: "noun", exampleSentence: "This is my colleague, David.", exampleTranslation: "Đây là đồng nghiệp của tôi, David." },
  ],
  grammar: [
    {
      title: "Possessive adjectives (my, your, his, her)",
      pattern: "my/your/his/her/our/their + noun",
      explanation: "Tính từ sở hữu cho biết ai sở hữu: my (của tôi), your (của bạn), his (của anh ấy), her (của cô ấy), its (của nó), our (của chúng tôi), their (của họ). Luôn đứng trước danh từ.",
      examples: [
        { text: "This is my family.", translation: "Đây là gia đình tôi." },
        { text: "What is your name?", translation: "Tên bạn là gì?" },
        { text: "His mother is kind.", translation: "Mẹ anh ấy tốt bụng." },
        { text: "Their house is big.", translation: "Nhà họ to." },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "Choose the correct possessive: '___ name is Lan.' (she)",
      promptTranslation: "Chọn tính từ sở hữu đúng: '___ name is Lan.' (cô ấy)",
      content: { options: ["She", "His", "Her", "My"] },
      answerKey: { correctIndex: 2 },
      explanation: "'Her' là tính từ sở hữu của 'she'. Her name = tên cô ấy.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "What is the English word for 'chồng'?",
      promptTranslation: "Từ tiếng Anh nào có nghĩa là 'chồng'?",
      content: { options: ["brother", "father", "husband", "son"] },
      answerKey: { correctIndex: 2 },
      explanation: "'Husband' = chồng. 'Brother' = anh/em trai. 'Father' = bố. 'Son' = con trai.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "'This is ___ brother. He is a student.' (I)",
      promptTranslation: "Điền: 'This is ___ brother. He is a student.' (tôi)",
      content: { options: ["I", "me", "my", "mine"] },
      answerKey: { correctIndex: 2 },
      explanation: "Trước danh từ 'brother' cần tính từ sở hữu 'my' (không phải 'I' hay 'me').",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'This is ___ wife. She is a doctor.' (he)",
      promptTranslation: "Điền: 'This is ___ wife. She is a doctor.' (anh ấy)",
      content: { sentence: "This is ___ wife. She is a doctor.", blank: "___" },
      answerKey: { correctAnswer: "his", acceptableAnswers: ["his"] },
      explanation: "'His' là tính từ sở hữu của 'he'. His wife = vợ anh ấy.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I have one ___ and two sisters.' (anh/em trai)",
      promptTranslation: "Điền: 'I have one ___ and two sisters.'",
      content: { sentence: "I have one ___ and two sisters.", blank: "___" },
      answerKey: { correctAnswer: "brother", acceptableAnswers: ["brother"] },
      explanation: "'Brother' = anh/em trai. 'Sister' = chị/em gái.",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Introduce your family: Tell about your parents and siblings.",
      promptTranslation: "Giới thiệu gia đình bạn: Nói về bố mẹ và anh chị em.",
      content: { hint: "This is my family. My mother's name is ___. My father is ___. I have ___ brother(s)/sister(s)." },
      answerKey: { sampleAnswer: "This is my family. My mother's name is Hoa. My father is a teacher. I have one brother and one sister." },
      explanation: "Dùng 'This is my...' để giới thiệu và tính từ sở hữu trước mỗi thành viên.",
      points: 15,
    },
  ],
};

export const lesson5: LessonData = {
  title: "Nghề nghiệp & Nơi làm việc",
  slug: "nghe-nghiep-noi-lam-viec",
  description: "Học cách nói về nghề nghiệp và nơi làm việc bằng tiếng Anh.",
  estimatedMinutes: 12,
  objectives: [
    "Nói tên các nghề nghiệp phổ biến",
    "Hỏi và trả lời về công việc",
    "Mô tả nơi làm việc",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Khi gặp ai đó lần đầu, một trong những câu hỏi phổ biến nhất là 'What do you do?' (Bạn làm nghề gì?). Bài này giúp bạn tự tin nói về công việc của mình.",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "teacher", "doctor", "engineer", "student", "office",
          "hospital", "school", "company", "work", "job",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Tại một bữa tiệc, hai người mới quen nói chuyện về công việc.",
        lines: [
          { speaker: "Sarah", text: "So, what do you do, Minh?", translation: "Vậy, bạn làm nghề gì, Minh?" },
          { speaker: "Minh", text: "I work as an engineer. I work at a tech company.", translation: "Mình làm kỹ sư. Mình làm việc ở một công ty công nghệ." },
          { speaker: "Sarah", text: "That sounds interesting! Do you like your job?", translation: "Nghe thú vị! Bạn có thích công việc không?" },
          { speaker: "Minh", text: "Yes, I love it! How about you? What do you do?", translation: "Có, mình rất thích! Còn bạn? Bạn làm nghề gì?" },
          { speaker: "Sarah", text: "I'm a teacher. I teach English at a school.", translation: "Mình là giáo viên. Mình dạy tiếng Anh ở một trường học." },
          { speaker: "Minh", text: "Oh, that's great! Where is your school?", translation: "Ồ, tuyệt! Trường bạn ở đâu?" },
          { speaker: "Sarah", text: "It's near the hospital, in the city center.", translation: "Nó gần bệnh viện, ở trung tâm thành phố." },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "What do you do? / I work as a... / I work at...",
        pattern: "What do you do? | I work as + a/an + job | I work at + place",
        explanation: "Hỏi nghề: 'What do you do?' (không phải 'What is your job?' - quá trực tiếp). Trả lời: 'I work as a/an + nghề' hoặc 'I'm a/an + nghề'. Nơi làm việc: 'I work at + nơi'.",
        examples: [
          { text: "What do you do?", translation: "Bạn làm nghề gì?" },
          { text: "I work as a doctor.", translation: "Tôi làm bác sĩ." },
          { text: "I'm an engineer.", translation: "Tôi là kỹ sư." },
          { text: "I work at a hospital.", translation: "Tôi làm việc ở bệnh viện." },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "teacher", meaning: "giáo viên", partOfSpeech: "noun", exampleSentence: "My mother is a teacher.", exampleTranslation: "Mẹ tôi là giáo viên." },
    { term: "doctor", meaning: "bác sĩ", partOfSpeech: "noun", exampleSentence: "The doctor works at the hospital.", exampleTranslation: "Bác sĩ làm việc ở bệnh viện." },
    { term: "engineer", meaning: "kỹ sư", partOfSpeech: "noun", exampleSentence: "He is an engineer at a big company.", exampleTranslation: "Anh ấy là kỹ sư ở một công ty lớn." },
    { term: "student", meaning: "sinh viên, học sinh", partOfSpeech: "noun", exampleSentence: "She is a student at the university.", exampleTranslation: "Cô ấy là sinh viên đại học." },
    { term: "office", meaning: "văn phòng", partOfSpeech: "noun", exampleSentence: "I go to the office every day.", exampleTranslation: "Tôi đến văn phòng mỗi ngày." },
    { term: "hospital", meaning: "bệnh viện", partOfSpeech: "noun", exampleSentence: "The hospital is very big.", exampleTranslation: "Bệnh viện rất lớn." },
    { term: "school", meaning: "trường học", partOfSpeech: "noun", exampleSentence: "The children go to school at 7 o'clock.", exampleTranslation: "Bọn trẻ đi học lúc 7 giờ." },
    { term: "company", meaning: "công ty", partOfSpeech: "noun", exampleSentence: "I work at a small company.", exampleTranslation: "Tôi làm việc ở một công ty nhỏ." },
    { term: "work", meaning: "làm việc", partOfSpeech: "verb", exampleSentence: "I work from Monday to Friday.", exampleTranslation: "Tôi làm việc từ thứ Hai đến thứ Sáu." },
    { term: "job", meaning: "công việc, nghề", partOfSpeech: "noun", exampleSentence: "I love my job!", exampleTranslation: "Tôi yêu công việc của mình!" },
  ],
  grammar: [
    {
      title: "What do you do? / I work as a... / I work at...",
      pattern: "What do you do? | I work as a/an + job | I work at + place",
      explanation: "'What do you do?' là cách hỏi nghề nghiệp lịch sự nhất. Trả lời bằng 'I work as a/an...' (tôi làm nghề...) hoặc 'I'm a/an...' (tôi là...). Dùng 'a' trước phụ âm, 'an' trước nguyên âm (an engineer, a teacher).",
      examples: [
        { text: "What do you do?", translation: "Bạn làm nghề gì?" },
        { text: "I'm a nurse.", translation: "Tôi là y tá." },
        { text: "She works as an accountant.", translation: "Cô ấy làm kế toán." },
        { text: "He works at a bank.", translation: "Anh ấy làm việc ở ngân hàng." },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "How do you politely ask about someone's job?",
      promptTranslation: "Cách hỏi nghề nghiệp lịch sự là gì?",
      content: { options: ["What is your job?", "What do you do?", "What you work?", "Where is your work?"] },
      answerKey: { correctIndex: 1 },
      explanation: "'What do you do?' là cách hỏi nghề nghiệp lịch sự và tự nhiên nhất trong tiếng Anh.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Choose the correct article: 'She is ___ engineer.'",
      promptTranslation: "Chọn mạo từ đúng: 'She is ___ engineer.'",
      content: { options: ["a", "an", "the", "no article"] },
      answerKey: { correctIndex: 1 },
      explanation: "Dùng 'an' trước từ bắt đầu bằng nguyên âm (a, e, i, o, u). Engineer bắt đầu bằng 'e' → an engineer.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Where does a doctor usually work?",
      promptTranslation: "Bác sĩ thường làm việc ở đâu?",
      content: { options: ["at a school", "at a hospital", "at a restaurant", "at a bank"] },
      answerKey: { correctIndex: 1 },
      explanation: "Doctor (bác sĩ) làm việc ở hospital (bệnh viện).",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I work ___ a teacher.' (làm nghề)",
      promptTranslation: "Điền: 'I work ___ a teacher.'",
      content: { sentence: "I work ___ a teacher.", blank: "___" },
      answerKey: { correctAnswer: "as", acceptableAnswers: ["as"] },
      explanation: "'Work as + nghề' = làm nghề gì đó. I work as a teacher = Tôi làm giáo viên.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'He works ___ a big company.' (ở)",
      promptTranslation: "Điền: 'He works ___ a big company.'",
      content: { sentence: "He works ___ a big company.", blank: "___" },
      answerKey: { correctAnswer: "at", acceptableAnswers: ["at", "for"] },
      explanation: "'Work at + nơi' = làm việc ở đâu. 'Work for + công ty' cũng đúng.",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Tell someone about your job: what you do and where you work.",
      promptTranslation: "Nói cho ai đó về công việc của bạn: bạn làm gì và làm ở đâu.",
      content: { hint: "I work as a ___. I work at ___. I like my job because ___." },
      answerKey: { sampleAnswer: "I work as an engineer. I work at a tech company. I like my job because it is interesting." },
      explanation: "Dùng 'I work as a/an...' cho nghề và 'I work at...' cho nơi làm việc.",
      points: 15,
    },
  ],
};

export const lesson6: LessonData = {
  title: "Sở thích & Thời gian rảnh",
  slug: "so-thich-thoi-gian-ranh",
  description: "Học cách nói về sở thích và hoạt động trong thời gian rảnh bằng tiếng Anh.",
  estimatedMinutes: 12,
  objectives: [
    "Nói về sở thích cá nhân",
    "Hỏi người khác về sở thích",
    "Sử dụng cấu trúc like + V-ing",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Nói về sở thích là cách tuyệt vời để kết bạn và tạo cuộc trò chuyện thú vị. Bài này giúp bạn chia sẻ những gì bạn thích làm trong thời gian rảnh.",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "like", "love", "enjoy", "hobby", "reading",
          "cooking", "swimming", "traveling", "music", "movie",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Hai người bạn mới quen nói chuyện về sở thích tại quán cà phê.",
        lines: [
          { speaker: "Tom", text: "What do you like to do in your free time, Hoa?", translation: "Bạn thích làm gì trong thời gian rảnh, Hoa?" },
          { speaker: "Hoa", text: "I love reading books and cooking. How about you?", translation: "Mình thích đọc sách và nấu ăn. Còn bạn?" },
          { speaker: "Tom", text: "I enjoy swimming and listening to music.", translation: "Mình thích bơi và nghe nhạc." },
          { speaker: "Hoa", text: "Oh, what kind of music do you like?", translation: "Ồ, bạn thích loại nhạc nào?" },
          { speaker: "Tom", text: "I like pop music and jazz. Do you like music too?", translation: "Mình thích nhạc pop và jazz. Bạn cũng thích nhạc không?" },
          { speaker: "Hoa", text: "Yes! I love Vietnamese music. I also enjoy watching movies.", translation: "Có! Mình thích nhạc Việt. Mình cũng thích xem phim." },
          { speaker: "Tom", text: "Me too! Maybe we can watch a movie together sometime.", translation: "Mình cũng vậy! Có lẽ chúng ta có thể xem phim cùng nhau lúc nào đó." },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "I like + V-ing / Do you like...? / What do you like to do?",
        pattern: "Subject + like/love/enjoy + V-ing | Do you like + V-ing?",
        explanation: "Sau 'like', 'love', 'enjoy' dùng V-ing (động từ thêm -ing): I like reading, She loves cooking. Hỏi: 'Do you like + V-ing?' hoặc 'What do you like to do?'",
        examples: [
          { text: "I like reading books.", translation: "Tôi thích đọc sách." },
          { text: "She loves cooking Vietnamese food.", translation: "Cô ấy thích nấu món Việt." },
          { text: "Do you enjoy traveling?", translation: "Bạn có thích du lịch không?" },
          { text: "What do you like to do on weekends?", translation: "Bạn thích làm gì vào cuối tuần?" },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "like", meaning: "thích", partOfSpeech: "verb", exampleSentence: "I like playing football.", exampleTranslation: "Tôi thích chơi bóng đá." },
    { term: "love", meaning: "yêu thích, rất thích", partOfSpeech: "verb", exampleSentence: "She loves dancing.", exampleTranslation: "Cô ấy rất thích nhảy." },
    { term: "enjoy", meaning: "tận hưởng, thích thú", partOfSpeech: "verb", exampleSentence: "We enjoy traveling together.", exampleTranslation: "Chúng tôi thích du lịch cùng nhau." },
    { term: "hobby", meaning: "sở thích", partOfSpeech: "noun", exampleSentence: "My hobby is painting.", exampleTranslation: "Sở thích của tôi là vẽ." },
    { term: "reading", meaning: "đọc sách", partOfSpeech: "gerund", exampleSentence: "Reading is my favorite hobby.", exampleTranslation: "Đọc sách là sở thích yêu thích của tôi." },
    { term: "cooking", meaning: "nấu ăn", partOfSpeech: "gerund", exampleSentence: "I enjoy cooking on weekends.", exampleTranslation: "Tôi thích nấu ăn vào cuối tuần." },
    { term: "swimming", meaning: "bơi lội", partOfSpeech: "gerund", exampleSentence: "Swimming is good exercise.", exampleTranslation: "Bơi lội là bài tập tốt." },
    { term: "traveling", meaning: "du lịch", partOfSpeech: "gerund", exampleSentence: "I love traveling to new countries.", exampleTranslation: "Tôi thích du lịch đến các nước mới." },
    { term: "music", meaning: "âm nhạc", partOfSpeech: "noun", exampleSentence: "I listen to music every day.", exampleTranslation: "Tôi nghe nhạc mỗi ngày." },
    { term: "movie", meaning: "phim", partOfSpeech: "noun", exampleSentence: "Let's watch a movie tonight!", exampleTranslation: "Tối nay xem phim đi!" },
  ],
  grammar: [
    {
      title: "I like + V-ing / Do you like...? / What do you like to do?",
      pattern: "Subject + like/love/enjoy + V-ing",
      explanation: "Khi nói về sở thích, dùng 'like/love/enjoy + V-ing'. V-ing là động từ thêm đuôi -ing (read → reading, cook → cooking, swim → swimming). Cả 'like to + V' và 'like + V-ing' đều đúng, nhưng V-ing phổ biến hơn khi nói về sở thích.",
      examples: [
        { text: "I like watching movies.", translation: "Tôi thích xem phim." },
        { text: "Do you enjoy cooking?", translation: "Bạn có thích nấu ăn không?" },
        { text: "He loves playing guitar.", translation: "Anh ấy thích chơi guitar." },
        { text: "What do you like to do for fun?", translation: "Bạn thích làm gì cho vui?" },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "Which sentence is correct?",
      promptTranslation: "Câu nào đúng ngữ pháp?",
      content: { options: ["I like swim", "I like swimming", "I like to swimming", "I liking swim"] },
      answerKey: { correctIndex: 1 },
      explanation: "Sau 'like' dùng V-ing: I like swimming. Hoặc 'like to + V nguyên mẫu': I like to swim.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "How do you ask about someone's hobbies?",
      promptTranslation: "Cách hỏi về sở thích của ai đó?",
      content: { options: ["What is your hobby do?", "What do you like to do?", "What you like?", "Do what you like?"] },
      answerKey: { correctIndex: 1 },
      explanation: "'What do you like to do?' hoặc 'What are your hobbies?' là cách hỏi đúng.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "'She ___ cooking Vietnamese food.' (rất thích)",
      promptTranslation: "Điền: 'She ___ cooking Vietnamese food.' (rất thích)",
      content: { options: ["love", "loves", "loving", "is love"] },
      answerKey: { correctIndex: 1 },
      explanation: "Chủ ngữ 'She' (ngôi 3 số ít) → động từ thêm 's': She loves cooking.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I enjoy ___ to music.' (nghe - listen)",
      promptTranslation: "Điền: 'I enjoy ___ to music.'",
      content: { sentence: "I enjoy ___ to music.", blank: "___" },
      answerKey: { correctAnswer: "listening", acceptableAnswers: ["listening"] },
      explanation: "Sau 'enjoy' dùng V-ing: enjoy listening, enjoy reading, enjoy cooking.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'Do you like ___ books?' (đọc - read)",
      promptTranslation: "Điền: 'Do you like ___ books?'",
      content: { sentence: "Do you like ___ books?", blank: "___" },
      answerKey: { correctAnswer: "reading", acceptableAnswers: ["reading"] },
      explanation: "Sau 'like' dùng V-ing khi nói về sở thích: like reading = thích đọc.",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Talk about your hobbies: What do you like to do in your free time?",
      promptTranslation: "Nói về sở thích: Bạn thích làm gì trong thời gian rảnh?",
      content: { hint: "In my free time, I like ___. I also enjoy ___. My favorite hobby is ___." },
      answerKey: { sampleAnswer: "In my free time, I like reading books. I also enjoy cooking. My favorite hobby is traveling." },
      explanation: "Dùng 'I like/love/enjoy + V-ing' để nói về sở thích.",
      points: 15,
    },
  ],
};

export const lesson7: LessonData = {
  title: "Đồ ăn & Thức uống",
  slug: "do-an-thuc-uong",
  description: "Học từ vựng về đồ ăn, thức uống và cách gọi món tại nhà hàng bằng tiếng Anh.",
  estimatedMinutes: 13,
  objectives: [
    "Gọi tên các món ăn và thức uống phổ biến",
    "Gọi món tại nhà hàng",
    "Hỏi giá tiền",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Đi ăn nhà hàng hay gọi đồ uống là tình huống bạn sẽ gặp rất thường xuyên khi dùng tiếng Anh. Bài này giúp bạn tự tin gọi món và hỏi giá.",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "water", "coffee", "tea", "rice", "chicken",
          "fish", "vegetables", "fruit", "delicious", "spicy",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Minh và bạn đang gọi món tại một nhà hàng.",
        lines: [
          { speaker: "Waiter", text: "Good evening! Are you ready to order?", translation: "Chào buổi tối! Quý khách sẵn sàng gọi món chưa?" },
          { speaker: "Minh", text: "Yes, please. I'd like chicken with rice.", translation: "Vâng. Tôi muốn gà với cơm." },
          { speaker: "Waiter", text: "Would you like it spicy?", translation: "Quý khách muốn cay không?" },
          { speaker: "Minh", text: "A little spicy, please. And can I have some water?", translation: "Hơi cay thôi. Và cho tôi nước lọc được không?" },
          { speaker: "Waiter", text: "Of course! And for you, ma'am?", translation: "Tất nhiên! Còn quý cô?" },
          { speaker: "Lan", text: "I'd like fish with vegetables, please. And a coffee.", translation: "Tôi muốn cá với rau. Và một ly cà phê." },
          { speaker: "Waiter", text: "Great choices! Anything else?", translation: "Lựa chọn tuyệt vời! Còn gì nữa không?" },
          { speaker: "Minh", text: "How much is the chicken rice?", translation: "Cơm gà giá bao nhiêu?" },
          { speaker: "Waiter", text: "It's twelve dollars. The fish is fifteen dollars.", translation: "Mười hai đô la. Cá là mười lăm đô la." },
          { speaker: "Minh", text: "That's fine. Thank you!", translation: "Được. Cảm ơn!" },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "I'd like... / Can I have...? / How much is...?",
        pattern: "I'd like + noun | Can I have + noun? | How much is + noun?",
        explanation: "'I'd like' (= I would like) là cách gọi món lịch sự. 'Can I have...?' cũng dùng để yêu cầu. 'How much is...?' để hỏi giá.",
        examples: [
          { text: "I'd like a coffee, please.", translation: "Tôi muốn một ly cà phê." },
          { text: "Can I have the menu?", translation: "Cho tôi xem thực đơn được không?" },
          { text: "How much is this?", translation: "Cái này giá bao nhiêu?" },
          { text: "I'd like some water, please.", translation: "Cho tôi nước lọc." },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Luyện tập" },
    },
  ],
  vocabulary: [
    { term: "water", meaning: "nước", partOfSpeech: "noun", exampleSentence: "Can I have some water, please?", exampleTranslation: "Cho tôi nước được không?" },
    { term: "coffee", meaning: "cà phê", partOfSpeech: "noun", exampleSentence: "I drink coffee every morning.", exampleTranslation: "Tôi uống cà phê mỗi sáng." },
    { term: "tea", meaning: "trà", partOfSpeech: "noun", exampleSentence: "Would you like some tea?", exampleTranslation: "Bạn muốn uống trà không?" },
    { term: "rice", meaning: "cơm, gạo", partOfSpeech: "noun", exampleSentence: "I eat rice every day.", exampleTranslation: "Tôi ăn cơm mỗi ngày." },
    { term: "chicken", meaning: "gà, thịt gà", partOfSpeech: "noun", exampleSentence: "The chicken is delicious!", exampleTranslation: "Gà ngon quá!" },
    { term: "fish", meaning: "cá", partOfSpeech: "noun", exampleSentence: "I'd like grilled fish, please.", exampleTranslation: "Cho tôi cá nướng." },
    { term: "vegetables", meaning: "rau", partOfSpeech: "noun", exampleSentence: "Eat more vegetables! They're healthy.", exampleTranslation: "Ăn nhiều rau hơn! Rau tốt cho sức khỏe." },
    { term: "fruit", meaning: "trái cây", partOfSpeech: "noun", exampleSentence: "I like tropical fruit.", exampleTranslation: "Tôi thích trái cây nhiệt đới." },
    { term: "delicious", meaning: "ngon", partOfSpeech: "adjective", exampleSentence: "This food is delicious!", exampleTranslation: "Món này ngon quá!" },
    { term: "spicy", meaning: "cay", partOfSpeech: "adjective", exampleSentence: "Vietnamese food is often spicy.", exampleTranslation: "Đồ ăn Việt Nam thường cay." },
  ],
  grammar: [
    {
      title: "I'd like... / Can I have...? / How much is...?",
      pattern: "I'd like + noun | Can I have + noun? | How much is/are + noun?",
      explanation: "'I'd like' = 'I would like' — cách nói lịch sự khi muốn gì đó (đặc biệt khi gọi món). 'Can I have...?' cũng lịch sự. 'How much is...?' để hỏi giá (số ít), 'How much are...?' (số nhiều).",
      examples: [
        { text: "I'd like a glass of water.", translation: "Tôi muốn một ly nước." },
        { text: "Can I have the bill, please?", translation: "Cho tôi hóa đơn được không?" },
        { text: "How much is the coffee?", translation: "Cà phê giá bao nhiêu?" },
        { text: "How much are the vegetables?", translation: "Rau giá bao nhiêu?" },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "What is the polite way to order food?",
      promptTranslation: "Cách gọi món lịch sự là gì?",
      content: { options: ["Give me chicken!", "I want chicken now", "I'd like chicken, please", "Chicken!"] },
      answerKey: { correctIndex: 2 },
      explanation: "'I'd like..., please' là cách gọi món lịch sự nhất. Tránh dùng 'Give me' hoặc ra lệnh.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "How do you ask the price?",
      promptTranslation: "Cách hỏi giá là gì?",
      content: { options: ["What price?", "How much is it?", "How many money?", "What cost?"] },
      answerKey: { correctIndex: 1 },
      explanation: "'How much is it?' là cách hỏi giá đúng. 'How much' dùng cho giá tiền và số lượng không đếm được.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Which word means 'cay' in English?",
      promptTranslation: "Từ nào có nghĩa là 'cay'?",
      content: { options: ["salty", "sweet", "spicy", "sour"] },
      answerKey: { correctIndex: 2 },
      explanation: "'Spicy' = cay. 'Salty' = mặn. 'Sweet' = ngọt. 'Sour' = chua.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I'd ___ a coffee, please.' (muốn)",
      promptTranslation: "Điền: 'I'd ___ a coffee, please.'",
      content: { sentence: "I'd ___ a coffee, please.", blank: "___" },
      answerKey: { correctAnswer: "like", acceptableAnswers: ["like"] },
      explanation: "'I'd like' = 'I would like' = tôi muốn (lịch sự). Dùng khi gọi món.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'How ___ is the fish?' (bao nhiêu)",
      promptTranslation: "Điền: 'How ___ is the fish?'",
      content: { sentence: "How ___ is the fish?", blank: "___" },
      answerKey: { correctAnswer: "much", acceptableAnswers: ["much"] },
      explanation: "'How much is...?' = giá bao nhiêu. Dùng 'how much' cho giá tiền.",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "You are at a restaurant. Order a meal and a drink, then ask for the price.",
      promptTranslation: "Bạn đang ở nhà hàng. Gọi một món ăn và một thức uống, rồi hỏi giá.",
      content: { hint: "I'd like ___, please. Can I also have ___? How much is ___?" },
      answerKey: { sampleAnswer: "I'd like chicken with rice, please. Can I also have a coffee? How much is the chicken rice?" },
      explanation: "Dùng 'I'd like...' để gọi món, 'Can I have...?' để yêu cầu thêm, 'How much...?' để hỏi giá.",
      points: 15,
    },
  ],
};

export const lesson8: LessonData = {
  title: "Ôn tập Module 1",
  slug: "on-tap-module-1",
  description: "Ôn tập toàn bộ từ vựng và ngữ pháp đã học trong Module 1 với bài tập tổng hợp.",
  estimatedMinutes: 18,
  objectives: [
    "Ôn tập từ vựng từ tất cả 7 bài trước",
    "Luyện tập tổng hợp các điểm ngữ pháp",
    "Thực hành tình huống giao tiếp hoàn chỉnh",
  ],
  blocks: [
    {
      type: "text",
      content: {
        body: "Chúc mừng bạn đã hoàn thành 7 bài học đầu tiên! Bài ôn tập này giúp bạn củng cố tất cả những gì đã học: chào hỏi, giới thiệu bản thân, nói về gia đình, công việc, sở thích và gọi món ăn. Hãy làm hết các bài tập để kiểm tra xem bạn nhớ được bao nhiêu!",
      },
    },
    {
      type: "vocabulary",
      content: {
        terms: [
          "hello", "how are you", "tired", "happy", "Monday", "o'clock",
          "mother", "brother", "teacher", "company",
          "like", "enjoy", "coffee", "delicious", "I'd like",
        ],
      },
    },
    {
      type: "dialogue",
      content: {
        setting: "Minh gặp một người bạn mới tên là Emma tại quán cà phê. Họ giới thiệu bản thân, nói về công việc, sở thích và gọi đồ uống.",
        lines: [
          { speaker: "Minh", text: "Hi! My name is Minh. Nice to meet you!", translation: "Xin chào! Mình tên là Minh. Rất vui được gặp bạn!" },
          { speaker: "Emma", text: "Nice to meet you too, Minh! I'm Emma. I'm from England.", translation: "Rất vui được gặp bạn, Minh! Mình là Emma. Mình đến từ Anh." },
          { speaker: "Minh", text: "How are you today, Emma?", translation: "Hôm nay bạn thế nào, Emma?" },
          { speaker: "Emma", text: "I'm great, thanks! A little hungry though. What do you do, Minh?", translation: "Mình rất tốt, cảm ơn! Hơi đói. Bạn làm nghề gì, Minh?" },
          { speaker: "Minh", text: "I work as an engineer at a tech company. How about you?", translation: "Mình làm kỹ sư ở một công ty công nghệ. Còn bạn?" },
          { speaker: "Emma", text: "I'm a teacher. I teach at an international school.", translation: "Mình là giáo viên. Mình dạy ở một trường quốc tế." },
          { speaker: "Minh", text: "That's great! What do you like to do in your free time?", translation: "Tuyệt! Bạn thích làm gì trong thời gian rảnh?" },
          { speaker: "Emma", text: "I love cooking and traveling. Do you like cooking?", translation: "Mình thích nấu ăn và du lịch. Bạn có thích nấu ăn không?" },
          { speaker: "Minh", text: "Not really, but I enjoy eating! I'd like a coffee, please.", translation: "Không hẳn, nhưng mình thích ăn! Cho mình một ly cà phê." },
          { speaker: "Emma", text: "Me too! Can I have a tea and some fruit, please?", translation: "Mình cũng vậy! Cho mình một ly trà và trái cây." },
          { speaker: "Minh", text: "This café is delicious! Let's meet again on Saturday.", translation: "Quán này ngon! Hẹn gặp lại vào thứ Bảy nhé." },
          { speaker: "Emma", text: "Sure! Saturday at half past two. See you then!", translation: "Được! Thứ Bảy lúc 2 giờ rưỡi. Hẹn gặp lại!" },
        ],
      },
    },
    {
      type: "grammar",
      content: {
        title: "Tổng hợp ngữ pháp Module 1",
        pattern: "Review: be, possessives, like + V-ing, I'd like, How much, prepositions of time",
        explanation: "Ôn tập các điểm ngữ pháp chính: (1) Subject + be: I am, You are, He/She is. (2) Possessives: my, your, his, her. (3) Like/love/enjoy + V-ing. (4) I'd like + noun (gọi món). (5) How much is...? (hỏi giá). (6) Giới từ thời gian: at + giờ, on + ngày, in + tháng.",
        examples: [
          { text: "I am happy. She is my sister.", translation: "Tôi vui. Cô ấy là chị tôi." },
          { text: "I like swimming. He enjoys reading.", translation: "Tôi thích bơi. Anh ấy thích đọc." },
          { text: "I'd like a coffee, please. How much is it?", translation: "Cho tôi cà phê. Giá bao nhiêu?" },
          { text: "The meeting is on Monday at nine o'clock.", translation: "Cuộc họp vào thứ Hai lúc 9 giờ." },
        ],
      },
    },
    {
      type: "exercise",
      content: { label: "Bài tập tổng hợp" },
    },
  ],
  vocabulary: [
    { term: "hello", meaning: "xin chào", partOfSpeech: "interjection", exampleSentence: "Hello! Nice to meet you.", exampleTranslation: "Xin chào! Rất vui được gặp bạn." },
    { term: "how are you", meaning: "bạn khỏe không", partOfSpeech: "phrase", exampleSentence: "How are you today?", exampleTranslation: "Hôm nay bạn thế nào?" },
    { term: "tired", meaning: "mệt", partOfSpeech: "adjective", exampleSentence: "I'm tired after work.", exampleTranslation: "Tôi mệt sau giờ làm." },
    { term: "happy", meaning: "vui", partOfSpeech: "adjective", exampleSentence: "I'm happy to be here.", exampleTranslation: "Tôi vui khi ở đây." },
    { term: "Monday", meaning: "Thứ Hai", partOfSpeech: "noun", exampleSentence: "See you on Monday!", exampleTranslation: "Hẹn gặp vào thứ Hai!" },
    { term: "mother", meaning: "mẹ", partOfSpeech: "noun", exampleSentence: "My mother is kind.", exampleTranslation: "Mẹ tôi tốt bụng." },
    { term: "teacher", meaning: "giáo viên", partOfSpeech: "noun", exampleSentence: "She is a great teacher.", exampleTranslation: "Cô ấy là giáo viên giỏi." },
    { term: "like", meaning: "thích", partOfSpeech: "verb", exampleSentence: "I like reading.", exampleTranslation: "Tôi thích đọc sách." },
    { term: "coffee", meaning: "cà phê", partOfSpeech: "noun", exampleSentence: "I'd like a coffee.", exampleTranslation: "Cho tôi cà phê." },
    { term: "delicious", meaning: "ngon", partOfSpeech: "adjective", exampleSentence: "The food is delicious!", exampleTranslation: "Đồ ăn ngon quá!" },
  ],
  grammar: [
    {
      title: "Tổng hợp ngữ pháp Module 1",
      pattern: "All patterns from Lessons 1-7",
      explanation: "Module 1 bao gồm: (1) Động từ be (am/is/are), (2) Tính từ sở hữu (my/your/his/her), (3) Like/love/enjoy + V-ing, (4) I'd like + danh từ, (5) How much is/are...?, (6) Giới từ thời gian (at/on/in), (7) What do you do? Hãy nhớ các cấu trúc này — chúng là nền tảng cho mọi giao tiếp tiếng Anh.",
      examples: [
        { text: "I am from Vietnam. My name is Minh.", translation: "Tôi đến từ Việt Nam. Tên tôi là Minh." },
        { text: "What do you do? I work as a doctor.", translation: "Bạn làm nghề gì? Tôi làm bác sĩ." },
        { text: "I enjoy cooking. She loves traveling.", translation: "Tôi thích nấu ăn. Cô ấy thích du lịch." },
        { text: "I'd like some water. How much is it?", translation: "Cho tôi nước. Giá bao nhiêu?" },
      ],
    },
  ],
  exercises: [
    {
      type: "multiple_choice",
      prompt: "Choose the correct form: 'She ___ a doctor.'",
      promptTranslation: "Chọn dạng đúng: 'She ___ a doctor.'",
      content: { options: ["am", "is", "are", "be"] },
      answerKey: { correctIndex: 1 },
      explanation: "She → is. I → am. You/We/They → are.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "'___ brother is an engineer.' (he)",
      promptTranslation: "Điền: '___ brother is an engineer.' (anh ấy)",
      content: { options: ["He", "Him", "His", "Her"] },
      answerKey: { correctIndex: 2 },
      explanation: "'His' là tính từ sở hữu của 'he'. His brother = anh trai của anh ấy.",
      points: 10,
    },
    {
      type: "multiple_choice",
      prompt: "Which is the polite way to order at a restaurant?",
      promptTranslation: "Cách gọi món lịch sự là gì?",
      content: { options: ["Give me food!", "I'd like some rice, please.", "I want eat now.", "Food please quick!"] },
      answerKey: { correctIndex: 1 },
      explanation: "'I'd like..., please' là cách gọi món lịch sự nhất.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'I ___ swimming and cooking.' (thích)",
      promptTranslation: "Điền: 'I ___ swimming and cooking.'",
      content: { sentence: "I ___ swimming and cooking.", blank: "___" },
      answerKey: { correctAnswer: "like", acceptableAnswers: ["like", "enjoy", "love"] },
      explanation: "Like/love/enjoy + V-ing để nói về sở thích.",
      points: 10,
    },
    {
      type: "fill_in_blank",
      prompt: "Complete: 'The class is ___ Wednesday ___ 10 o'clock.'",
      promptTranslation: "Điền: 'The class is ___ Wednesday ___ 10 o'clock.'",
      content: { sentence: "The class is ___ Wednesday ___ 10 o'clock.", blank: "___" },
      answerKey: { correctAnswer: "on, at", acceptableAnswers: ["on, at"] },
      explanation: "On + ngày (on Wednesday), at + giờ (at 10 o'clock).",
      points: 10,
    },
    {
      type: "speaking",
      prompt: "Full self-introduction: Greet someone, introduce yourself (name, country, job, family, hobbies), then order food at a café.",
      promptTranslation: "Giới thiệu bản thân đầy đủ: Chào hỏi, giới thiệu (tên, quê, nghề, gia đình, sở thích), rồi gọi món tại quán.",
      content: { hint: "Hello! My name is ___. I'm from ___. I work as ___. I have ___ (family). I like ___ (hobbies). I'd like ___, please. How much is it?" },
      answerKey: { sampleAnswer: "Hello! My name is Minh. I'm from Vietnam. I work as an engineer at a tech company. I have one brother and one sister. My mother is a teacher. I like swimming and traveling. I'd like a coffee and chicken rice, please. How much is it?" },
      explanation: "Kết hợp tất cả cấu trúc đã học: be, possessives, like + V-ing, I'd like, How much.",
      points: 20,
    },
  ],
};

export const module1Lessons: LessonData[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
];
