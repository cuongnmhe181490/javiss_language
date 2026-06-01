export type VocabHint = {
  word: string;
  meaning: string;
};

export type ReadingQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  level: "A1" | "A2";
  topic: string;
  passage: string;
  vocabHints: VocabHint[];
  questions: ReadingQuestion[];
};

export const readingPassages: ReadingPassage[] = [
  {
    id: "read-1",
    title: "Email từ bạn",
    level: "A1",
    topic: "Email from a Friend",
    passage: `Hi Minh,

How are you? I'm in London now! The weather is cold but I like it here. I'm studying English at a language school. My class starts at 9 AM every day. After class, I usually go to a café with my classmates. On weekends, I visit museums and parks.

I miss Vietnamese food! The food here is OK but very different. I found a small Vietnamese restaurant near my school. Their pho is not bad!

Write back soon!
Your friend,
Lan`,
    vocabHints: [
      { word: "weather", meaning: "thời tiết" },
      { word: "language school", meaning: "trường ngoại ngữ" },
      { word: "classmates", meaning: "bạn cùng lớp" },
      { word: "museums", meaning: "bảo tàng" },
      { word: "miss", meaning: "nhớ, thiếu" },
      { word: "different", meaning: "khác biệt" },
    ],
    questions: [
      {
        question: "Lan đang ở đâu?",
        options: ["Hà Nội", "London", "Paris", "New York"],
        answer: "London",
      },
      {
        question: "Sau giờ học, Lan thường làm gì?",
        options: ["Đi mua sắm", "Đi quán cà phê", "Về nhà ngủ", "Đi bơi"],
        answer: "Đi quán cà phê",
      },
      {
        question: "Lan tìm thấy gì gần trường?",
        options: ["Siêu thị Việt Nam", "Nhà hàng Việt Nam", "Chùa Việt Nam", "Tiệm tóc"],
        answer: "Nhà hàng Việt Nam",
      },
    ],
  },
  {
    id: "read-2",
    title: "Thực đơn nhà hàng",
    level: "A1",
    topic: "Restaurant Menu",
    passage: `SUNNY CAFÉ — LUNCH MENU

Starters:
- Tomato soup — $4.50
- Garden salad — $5.00

Main courses:
- Grilled chicken with rice — $12.00
- Fish and chips — $11.50
- Vegetable pasta — $10.00

Drinks:
- Coffee / Tea — $3.00
- Fresh orange juice — $4.00
- Mineral water — $2.00

Desserts:
- Chocolate cake — $5.50
- Ice cream (vanilla/strawberry) — $4.00

Note: All main courses include a free drink. Lunch served 11:30 AM – 2:30 PM.`,
    vocabHints: [
      { word: "starters", meaning: "món khai vị" },
      { word: "main courses", meaning: "món chính" },
      { word: "grilled", meaning: "nướng" },
      { word: "include", meaning: "bao gồm" },
      { word: "served", meaning: "phục vụ" },
      { word: "desserts", meaning: "món tráng miệng" },
    ],
    questions: [
      {
        question: "Món chính rẻ nhất giá bao nhiêu?",
        options: ["$10.00", "$11.50", "$12.00", "$5.00"],
        answer: "$10.00",
      },
      {
        question: "Mua món chính được tặng gì?",
        options: ["Món tráng miệng", "Đồ uống miễn phí", "Salad", "Không có gì"],
        answer: "Đồ uống miễn phí",
      },
      {
        question: "Nhà hàng phục vụ bữa trưa đến mấy giờ?",
        options: ["2:00 PM", "2:30 PM", "3:00 PM", "1:30 PM"],
        answer: "2:30 PM",
      },
    ],
  },
  {
    id: "read-3",
    title: "Tin tuyển dụng",
    level: "A2",
    topic: "Job Posting",
    passage: `PART-TIME SALES ASSISTANT WANTED

Green Bookstore is looking for a friendly sales assistant to work weekends.

Requirements:
- Good English communication skills
- Available Saturday and Sunday (10 AM – 6 PM)
- Experience in customer service is a plus
- Must be over 18 years old

We offer:
- $15 per hour
- 20% staff discount on all books
- Friendly team environment

To apply: Send your CV and a short introduction email to jobs@greenbookstore.com before March 30.`,
    vocabHints: [
      { word: "part-time", meaning: "bán thời gian" },
      { word: "sales assistant", meaning: "nhân viên bán hàng" },
      { word: "requirements", meaning: "yêu cầu" },
      { word: "available", meaning: "có thể làm việc, rảnh" },
      { word: "experience", meaning: "kinh nghiệm" },
      { word: "discount", meaning: "giảm giá" },
      { word: "apply", meaning: "ứng tuyển" },
      { word: "CV", meaning: "sơ yếu lý lịch" },
    ],
    questions: [
      {
        question: "Công việc này làm vào ngày nào?",
        options: ["Thứ 2 đến thứ 6", "Thứ 7 và Chủ nhật", "Mỗi ngày", "Thứ 6 và thứ 7"],
        answer: "Thứ 7 và Chủ nhật",
      },
      {
        question: "Lương bao nhiêu một giờ?",
        options: ["$12", "$13", "$15", "$18"],
        answer: "$15",
      },
      {
        question: "Nhân viên được giảm giá bao nhiêu phần trăm?",
        options: ["10%", "15%", "20%", "25%"],
        answer: "20%",
      },
    ],
  },
  {
    id: "read-4",
    title: "Blog du lịch",
    level: "A2",
    topic: "Travel Blog",
    passage: `My Trip to Da Nang

Last month, I visited Da Nang for the first time. I stayed at a small hotel near My Khe Beach. The beach was beautiful — white sand and clear blue water!

On the first day, I walked along the beach and ate fresh seafood at a local restaurant. The next day, I took a taxi to the Marble Mountains. The view from the top was amazing!

My favorite part was the Dragon Bridge. At night, it lights up in many colors. On Saturday, the dragon breathes fire! I took many photos.

I want to go back next summer. Da Nang is a perfect place for a short holiday.`,
    vocabHints: [
      { word: "visited", meaning: "đã thăm, đã đến" },
      { word: "stayed", meaning: "ở lại" },
      { word: "clear", meaning: "trong (nước trong)" },
      { word: "seafood", meaning: "hải sản" },
      { word: "view", meaning: "cảnh, tầm nhìn" },
      { word: "breathes fire", meaning: "phun lửa" },
    ],
    questions: [
      {
        question: "Tác giả ở khách sạn gần đâu?",
        options: ["Cầu Rồng", "Núi Ngũ Hành Sơn", "Bãi biển Mỹ Khê", "Phố cổ Hội An"],
        answer: "Bãi biển Mỹ Khê",
      },
      {
        question: "Ngày thứ hai, tác giả đi đâu?",
        options: ["Bãi biển", "Núi Ngũ Hành Sơn", "Cầu Rồng", "Nhà hàng"],
        answer: "Núi Ngũ Hành Sơn",
      },
      {
        question: "Cầu Rồng phun lửa vào ngày nào?",
        options: ["Thứ Sáu", "Thứ Bảy", "Chủ Nhật", "Mỗi ngày"],
        answer: "Thứ Bảy",
      },
    ],
  },
  {
    id: "read-5",
    title: "Dự báo thời tiết",
    level: "A1",
    topic: "Weather Report",
    passage: `WEATHER FORECAST — Ho Chi Minh City
Week of March 10–16

Monday: Sunny, 34°C. No rain.
Tuesday: Partly cloudy, 32°C. Light wind.
Wednesday: Cloudy with afternoon showers, 30°C. Bring an umbrella!
Thursday: Heavy rain all day, 28°C. Stay dry!
Friday: Cloudy in the morning, sunny in the afternoon, 31°C.
Saturday: Sunny and hot, 35°C. Perfect for the beach!
Sunday: Thunderstorms in the evening, 33°C. Stay indoors after 6 PM.

Tip: Drink plenty of water this week. It will be very hot!`,
    vocabHints: [
      { word: "forecast", meaning: "dự báo" },
      { word: "partly cloudy", meaning: "có mây rải rác" },
      { word: "showers", meaning: "mưa rào" },
      { word: "umbrella", meaning: "ô, dù" },
      { word: "heavy rain", meaning: "mưa lớn" },
      { word: "thunderstorms", meaning: "giông bão" },
      { word: "indoors", meaning: "trong nhà" },
    ],
    questions: [
      {
        question: "Ngày nào nóng nhất trong tuần?",
        options: ["Thứ Hai", "Thứ Bảy", "Chủ Nhật", "Thứ Tư"],
        answer: "Thứ Bảy",
      },
      {
        question: "Ngày nào nên mang ô?",
        options: ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Sáu"],
        answer: "Thứ Tư",
      },
      {
        question: "Chủ Nhật có giông bão lúc nào?",
        options: ["Sáng", "Trưa", "Chiều", "Tối"],
        answer: "Tối",
      },
    ],
  },
  {
    id: "read-6",
    title: "Công thức nấu ăn đơn giản",
    level: "A2",
    topic: "Simple Recipe",
    passage: `EASY BANANA PANCAKES (Makes 8 pancakes)

Ingredients:
- 2 ripe bananas
- 2 eggs
- 1 cup flour
- 1/2 cup milk
- 1 tablespoon sugar
- A pinch of salt
- Butter for cooking

Instructions:
1. Mash the bananas in a large bowl.
2. Add eggs and mix well.
3. Add flour, milk, sugar, and salt. Stir until smooth.
4. Heat a pan and add a little butter.
5. Pour a small amount of batter into the pan.
6. Cook for 2 minutes on each side until golden brown.
7. Serve with honey or fresh fruit.

Cooking time: 20 minutes. Great for breakfast!`,
    vocabHints: [
      { word: "ripe", meaning: "chín" },
      { word: "flour", meaning: "bột mì" },
      { word: "tablespoon", meaning: "thìa canh" },
      { word: "pinch", meaning: "nhúm (một chút)" },
      { word: "mash", meaning: "nghiền" },
      { word: "stir", meaning: "khuấy" },
      { word: "batter", meaning: "bột nhão" },
      { word: "golden brown", meaning: "vàng nâu" },
    ],
    questions: [
      {
        question: "Công thức này làm được bao nhiêu bánh?",
        options: ["4 cái", "6 cái", "8 cái", "10 cái"],
        answer: "8 cái",
      },
      {
        question: "Mỗi mặt bánh nấu bao lâu?",
        options: ["1 phút", "2 phút", "3 phút", "5 phút"],
        answer: "2 phút",
      },
      {
        question: "Bước đầu tiên là gì?",
        options: ["Đánh trứng", "Nghiền chuối", "Đun nóng chảo", "Trộn bột"],
        answer: "Nghiền chuối",
      },
    ],
  },
  {
    id: "read-7",
    title: "Thông báo ở chung cư",
    level: "A1",
    topic: "Apartment Notice",
    passage: `NOTICE TO ALL RESIDENTS

Dear residents,

Please note the following changes starting next Monday (March 17):

1. The swimming pool will be closed for cleaning every Tuesday from 8 AM to 12 PM.
2. New gym hours: 6 AM – 10 PM (previously 7 AM – 9 PM).
3. Please do not park bicycles in the lobby. Use the bicycle parking area on Level B1.
4. Quiet hours are 10 PM – 7 AM. Please keep noise to a minimum.

If you have any questions, contact the management office at reception or email us at info@sunriseapt.com.

Thank you for your cooperation.
Building Management`,
    vocabHints: [
      { word: "residents", meaning: "cư dân" },
      { word: "closed for cleaning", meaning: "đóng để vệ sinh" },
      { word: "previously", meaning: "trước đây" },
      { word: "lobby", meaning: "sảnh" },
      { word: "quiet hours", meaning: "giờ yên tĩnh" },
      { word: "cooperation", meaning: "sự hợp tác" },
    ],
    questions: [
      {
        question: "Hồ bơi đóng vào ngày nào?",
        options: ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Chủ Nhật"],
        answer: "Thứ Ba",
      },
      {
        question: "Giờ mở cửa mới của phòng gym là gì?",
        options: ["7 AM – 9 PM", "6 AM – 10 PM", "6 AM – 9 PM", "7 AM – 10 PM"],
        answer: "6 AM – 10 PM",
      },
      {
        question: "Xe đạp phải để ở đâu?",
        options: ["Sảnh", "Tầng B1", "Ngoài cửa", "Tầng 1"],
        answer: "Tầng B1",
      },
    ],
  },
  {
    id: "read-8",
    title: "Tin nhắn từ đồng nghiệp",
    level: "A2",
    topic: "Message from a Colleague",
    passage: `Hi Tuan,

I hope you're doing well! I'm writing to let you know about some changes to our project meeting.

The meeting has been moved from Wednesday to Thursday at 3 PM. We'll meet in Room 205 instead of the usual meeting room because they're fixing the air conditioning.

Please bring your laptop and the sales report from last month. Our manager wants to discuss the Q1 results and plan for next quarter.

Also, there's a team lunch on Friday at 12:30. We're going to the new Italian restaurant on Le Loi Street. Let me know if you can join!

Best,
Hoa`,
    vocabHints: [
      { word: "moved", meaning: "dời, chuyển" },
      { word: "instead of", meaning: "thay vì" },
      { word: "fixing", meaning: "sửa chữa" },
      { word: "air conditioning", meaning: "điều hòa" },
      { word: "sales report", meaning: "báo cáo doanh số" },
      { word: "discuss", meaning: "thảo luận" },
      { word: "quarter", meaning: "quý (3 tháng)" },
    ],
    questions: [
      {
        question: "Cuộc họp được dời sang ngày nào?",
        options: ["Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Hai"],
        answer: "Thứ Năm",
      },
      {
        question: "Tại sao đổi phòng họp?",
        options: ["Phòng quá nhỏ", "Đang sửa điều hòa", "Có người khác dùng", "Phòng bị khóa"],
        answer: "Đang sửa điều hòa",
      },
      {
        question: "Bữa trưa nhóm vào ngày nào?",
        options: ["Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
        answer: "Thứ Sáu",
      },
    ],
  },
  {
    id: "read-9",
    title: "Thói quen buổi sáng của Mai",
    level: "A2",
    topic: "Mai's Morning Routine",
    passage: `Mai is a university student in Da Nang. She has a busy but healthy morning routine.

She wakes up at 6 o'clock every day. First, she drinks a glass of warm water and does some light exercise for fifteen minutes. Then she takes a shower and gets dressed.

For breakfast, Mai usually eats a bowl of pho or a banh mi with eggs. She loves coffee, so she always has a cup of Vietnamese iced coffee before class.

Mai leaves home at 7:15 and rides her motorbike to university. It takes about twenty minutes. Her first class starts at 8 o'clock, so she always arrives early to review her notes.`,
    vocabHints: [
      { word: "routine", meaning: "thói quen, lịch trình" },
      { word: "wakes up", meaning: "thức dậy" },
      { word: "light exercise", meaning: "tập thể dục nhẹ" },
      { word: "gets dressed", meaning: "mặc quần áo" },
      { word: "leaves home", meaning: "rời nhà" },
      { word: "review", meaning: "ôn lại" },
    ],
    questions: [
      {
        question: "Mai thức dậy lúc mấy giờ?",
        options: ["5 giờ", "6 giờ", "7 giờ", "8 giờ"],
        answer: "6 giờ",
      },
      {
        question: "Mai làm gì đầu tiên sau khi thức dậy?",
        options: ["Tắm", "Uống nước ấm và tập thể dục nhẹ", "Ăn sáng", "Đi học"],
        answer: "Uống nước ấm và tập thể dục nhẹ",
      },
      {
        question: "Mai đến trường bằng gì?",
        options: ["Xe buýt", "Xe đạp", "Xe máy", "Đi bộ"],
        answer: "Xe máy",
      },
      {
        question: "Vì sao Mai luôn đến sớm?",
        options: ["Để ăn sáng", "Để ôn lại bài", "Để gặp bạn", "Để tập thể dục"],
        answer: "Để ôn lại bài",
      },
    ],
  },
  {
    id: "read-10",
    title: "Lợi ích của việc đi bộ",
    level: "A2",
    topic: "The Benefits of Walking",
    passage: `Walking is one of the simplest and healthiest activities. You don't need any special equipment or a gym membership. You just need a pair of comfortable shoes.

Doctors say that walking for thirty minutes a day can improve your health. It makes your heart stronger, helps you sleep better, and reduces stress. Walking is also good for people who want to lose weight slowly and safely.

Many people walk in the early morning or after dinner. Walking with a friend or listening to music can make it more enjoyable. Some people use a phone app to count their steps. A common goal is 10,000 steps a day.

So next time you take a short trip, think about walking instead of driving. It's free, easy, and good for both your body and the environment.`,
    vocabHints: [
      { word: "equipment", meaning: "thiết bị, dụng cụ" },
      { word: "improve", meaning: "cải thiện" },
      { word: "reduces stress", meaning: "giảm căng thẳng" },
      { word: "lose weight", meaning: "giảm cân" },
      { word: "enjoyable", meaning: "thú vị, dễ chịu" },
      { word: "environment", meaning: "môi trường" },
    ],
    questions: [
      {
        question: "Cần gì để bắt đầu đi bộ?",
        options: ["Thẻ tập gym", "Một đôi giày thoải mái", "Thiết bị đặc biệt", "Huấn luyện viên"],
        answer: "Một đôi giày thoải mái",
      },
      {
        question: "Đi bộ 30 phút mỗi ngày KHÔNG mang lại lợi ích nào sau đây?",
        options: ["Tim khỏe hơn", "Ngủ ngon hơn", "Giảm căng thẳng", "Tăng cân nhanh"],
        answer: "Tăng cân nhanh",
      },
      {
        question: "Mục tiêu số bước phổ biến mỗi ngày là bao nhiêu?",
        options: ["5,000", "8,000", "10,000", "20,000"],
        answer: "10,000",
      },
      {
        question: "Bài viết khuyên điều gì cho chuyến đi ngắn?",
        options: ["Lái xe", "Đi bộ thay vì lái xe", "Đi xe buýt", "Ở nhà"],
        answer: "Đi bộ thay vì lái xe",
      },
    ],
  },
];
