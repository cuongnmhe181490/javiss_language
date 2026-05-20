export type ListeningQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export type ListeningExercise = {
  id: string;
  title: string;
  level: "A1" | "A2";
  context: string;
  transcript: string[];
  questions: ListeningQuestion[];
};

export const listeningExercises: ListeningExercise[] = [
  {
    id: "lis-1",
    title: "Gọi đồ uống ở quán cà phê",
    level: "A1",
    context: "Bạn đang ở một quán cà phê. Nghe đoạn hội thoại giữa khách hàng và nhân viên.",
    transcript: [
      "Staff: Hi! What can I get for you?",
      "Customer: Can I have a latte, please?",
      "Staff: Sure. What size? Small, medium, or large?",
      "Customer: Medium, please.",
      "Staff: Would you like anything else?",
      "Customer: Yes, a chocolate muffin.",
      "Staff: That's $7.50 altogether.",
      "Customer: Here you go. Thank you!",
    ],
    questions: [
      {
        question: "Khách hàng gọi đồ uống gì?",
        options: ["Cappuccino", "Latte", "Americano", "Tea"],
        answer: "Latte",
      },
      {
        question: "Khách chọn size nào?",
        options: ["Small", "Medium", "Large"],
        answer: "Medium",
      },
      {
        question: "Tổng tiền là bao nhiêu?",
        options: ["$5.50", "$7.50", "$6.50", "$8.00"],
        answer: "$7.50",
      },
    ],
  },
  {
    id: "lis-2",
    title: "Hỏi đường đến bưu điện",
    level: "A1",
    context: "Một du khách đang hỏi đường trên phố. Nghe và trả lời câu hỏi.",
    transcript: [
      "Tourist: Excuse me, is there a post office near here?",
      "Local: Yes, there is. Go straight for two blocks.",
      "Tourist: Two blocks. OK.",
      "Local: Then turn left at the traffic lights.",
      "Tourist: Turn left at the traffic lights.",
      "Local: Yes. The post office is on your right, next to the bank.",
      "Tourist: Next to the bank. Got it. Thank you so much!",
      "Local: You're welcome!",
    ],
    questions: [
      {
        question: "Du khách muốn đến đâu?",
        options: ["Ngân hàng", "Bưu điện", "Bệnh viện", "Nhà hàng"],
        answer: "Bưu điện",
      },
      {
        question: "Đi thẳng bao nhiêu block?",
        options: ["1 block", "2 blocks", "3 blocks"],
        answer: "2 blocks",
      },
      {
        question: "Bưu điện ở cạnh đâu?",
        options: ["Siêu thị", "Trường học", "Ngân hàng", "Công viên"],
        answer: "Ngân hàng",
      },
    ],
  },
  {
    id: "lis-3",
    title: "Gọi điện đặt lịch hẹn",
    level: "A2",
    context: "Một người gọi điện đến phòng khám nha khoa để đặt lịch. Nghe cuộc gọi.",
    transcript: [
      "Receptionist: Good morning, City Dental Clinic. How can I help you?",
      "Patient: Hi, I'd like to make an appointment, please.",
      "Receptionist: Sure. Is it for a check-up or a specific problem?",
      "Patient: Just a regular check-up.",
      "Receptionist: OK. We have Thursday at 2 PM or Friday at 10 AM.",
      "Patient: Friday at 10 works for me.",
      "Receptionist: Great. Can I have your name, please?",
      "Patient: It's Minh Nguyen.",
    ],
    questions: [
      {
        question: "Bệnh nhân gọi đến đâu?",
        options: ["Bệnh viện", "Phòng khám nha khoa", "Phòng khám mắt"],
        answer: "Phòng khám nha khoa",
      },
      {
        question: "Bệnh nhân muốn khám gì?",
        options: ["Đau răng", "Kiểm tra định kỳ", "Niềng răng"],
        answer: "Kiểm tra định kỳ",
      },
      {
        question: "Bệnh nhân chọn lịch nào?",
        options: ["Thứ Năm 2 PM", "Thứ Sáu 10 AM", "Thứ Hai 9 AM"],
        answer: "Thứ Sáu 10 AM",
      },
    ],
  },
  {
    id: "lis-4",
    title: "Đặt phòng khách sạn",
    level: "A2",
    context: "Một khách du lịch gọi điện đặt phòng khách sạn. Nghe và trả lời câu hỏi.",
    transcript: [
      "Receptionist: Sunshine Hotel, good afternoon. How may I help you?",
      "Guest: Hello, I'd like to book a room for two nights.",
      "Receptionist: Certainly. When would you like to check in?",
      "Guest: This Saturday, March 15th.",
      "Receptionist: Would you prefer a single or double room?",
      "Guest: A double room, please. Does it include breakfast?",
      "Receptionist: Yes, breakfast is included. The rate is $85 per night.",
      "Guest: That sounds good. I'll take it.",
    ],
    questions: [
      {
        question: "Khách muốn ở bao nhiêu đêm?",
        options: ["1 đêm", "2 đêm", "3 đêm", "1 tuần"],
        answer: "2 đêm",
      },
      {
        question: "Khách chọn loại phòng nào?",
        options: ["Phòng đơn", "Phòng đôi", "Phòng gia đình"],
        answer: "Phòng đôi",
      },
      {
        question: "Giá phòng mỗi đêm là bao nhiêu?",
        options: ["$75", "$80", "$85", "$90"],
        answer: "$85",
      },
    ],
  },
  {
    id: "lis-5",
    title: "Đi khám bệnh",
    level: "A2",
    context: "Bệnh nhân đang nói chuyện với bác sĩ. Nghe đoạn hội thoại.",
    transcript: [
      "Doctor: Hello, what seems to be the problem?",
      "Patient: I've had a headache for three days.",
      "Doctor: I see. Do you have any other symptoms?",
      "Patient: Yes, I feel tired and my throat is sore.",
      "Doctor: Let me check your temperature... It's 37.8. You have a mild fever.",
      "Patient: Is it serious?",
      "Doctor: No, it's just a cold. Get plenty of rest and drink lots of water.",
      "Patient: Should I take any medicine?",
      "Doctor: I'll prescribe some paracetamol. Take it twice a day after meals.",
    ],
    questions: [
      {
        question: "Bệnh nhân bị đau đầu bao lâu rồi?",
        options: ["1 ngày", "2 ngày", "3 ngày", "1 tuần"],
        answer: "3 ngày",
      },
      {
        question: "Bác sĩ chẩn đoán bệnh gì?",
        options: ["Cúm nặng", "Cảm lạnh", "Viêm phổi", "Dị ứng"],
        answer: "Cảm lạnh",
      },
      {
        question: "Uống thuốc mấy lần một ngày?",
        options: ["1 lần", "2 lần", "3 lần"],
        answer: "2 lần",
      },
    ],
  },
  {
    id: "lis-6",
    title: "Mua sắm quần áo",
    level: "A1",
    context: "Một khách hàng đang mua áo ở cửa hàng. Nghe đoạn hội thoại.",
    transcript: [
      "Customer: Excuse me, do you have this shirt in blue?",
      "Staff: Let me check... Yes, we do. What size do you need?",
      "Customer: Medium, please.",
      "Staff: Here you are. Would you like to try it on?",
      "Customer: Yes, please. Where's the fitting room?",
      "Staff: It's over there, on the left.",
      "Customer: (comes back) It fits perfectly. How much is it?",
      "Staff: It's $25. Would you like to pay by cash or card?",
      "Customer: Card, please.",
    ],
    questions: [
      {
        question: "Khách muốn mua áo màu gì?",
        options: ["Đỏ", "Xanh dương", "Trắng", "Đen"],
        answer: "Xanh dương",
      },
      {
        question: "Phòng thử đồ ở đâu?",
        options: ["Bên phải", "Bên trái", "Phía trước", "Tầng 2"],
        answer: "Bên trái",
      },
      {
        question: "Khách thanh toán bằng gì?",
        options: ["Tiền mặt", "Thẻ", "Chuyển khoản"],
        answer: "Thẻ",
      },
    ],
  },
  {
    id: "lis-7",
    title: "Đặt bàn nhà hàng qua điện thoại",
    level: "A2",
    context: "Một người gọi điện đặt bàn ở nhà hàng cho bữa tối. Nghe cuộc gọi.",
    transcript: [
      "Staff: Good evening, Bella Italia. How can I help?",
      "Caller: Hi, I'd like to reserve a table for tonight.",
      "Staff: Of course. How many people?",
      "Caller: Four people.",
      "Staff: And what time would you like?",
      "Caller: Around 7:30, if possible.",
      "Staff: Let me check... Yes, we have a table available at 7:30.",
      "Caller: Great! The name is Tran.",
      "Staff: Perfect. A table for four at 7:30 under Tran. See you tonight!",
    ],
    questions: [
      {
        question: "Đặt bàn cho mấy người?",
        options: ["2 người", "3 người", "4 người", "5 người"],
        answer: "4 người",
      },
      {
        question: "Đặt bàn lúc mấy giờ?",
        options: ["7:00", "7:30", "8:00", "8:30"],
        answer: "7:30",
      },
      {
        question: "Nhà hàng tên gì?",
        options: ["Bella Roma", "Bella Italia", "Bella Vista"],
        answer: "Bella Italia",
      },
    ],
  },
];
