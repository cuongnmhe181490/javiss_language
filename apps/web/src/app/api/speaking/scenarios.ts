export interface Scenario {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  level: "A1" | "A2" | "B1" | "B2";
  systemPrompt: string;
  firstMessage: string;
}

export const scenarios: Scenario[] = [
  {
    id: "hotel-checkin",
    title: "Hotel Check-in",
    titleVi: "Check-in khách sạn",
    description:
      "You just arrived at a hotel and need to check in. The receptionist will ask for your reservation details.",
    descriptionVi:
      "Bạn vừa đến khách sạn và cần check-in. Nhân viên lễ tân sẽ hỏi thông tin đặt phòng.",
    level: "A1",
    systemPrompt:
      "You are a friendly hotel receptionist. Greet the guest, ask for their reservation name, confirm details (room type, number of nights), and ask for ID. Keep responses short (1-2 sentences). Speak naturally like a real receptionist.",
    firstMessage: "Good afternoon! Welcome to Grand Hotel. Do you have a reservation?",
  },
  {
    id: "restaurant-ordering",
    title: "Restaurant Ordering",
    titleVi: "Gọi món nhà hàng",
    description:
      "You're at a restaurant and want to order food. The waiter will help you with the menu.",
    descriptionVi:
      "Bạn đang ở nhà hàng và muốn gọi món. Nhân viên phục vụ sẽ giúp bạn với thực đơn.",
    level: "A1",
    systemPrompt:
      "You are a friendly restaurant waiter. Help the customer order food and drinks. Suggest specials, ask about preferences and allergies. Keep responses short (1-2 sentences). Be warm and professional.",
    firstMessage:
      "Hi there! Welcome to Bella's Kitchen. Can I start you off with something to drink?",
  },
  {
    id: "asking-directions",
    title: "Asking for Directions",
    titleVi: "Hỏi đường",
    description:
      "You're lost in a new city and need to ask a local for directions to a famous landmark.",
    descriptionVi: "Bạn bị lạc ở thành phố mới và cần hỏi đường đến một địa điểm nổi tiếng.",
    level: "A2",
    systemPrompt:
      "You are a helpful local who knows the city well. Give clear, simple directions using landmarks. If the person seems confused, offer to walk them part of the way. Keep responses short (2-3 sentences).",
    firstMessage: "Oh, you look a bit lost! Can I help you find something?",
  },
  {
    id: "job-interview",
    title: "Job Interview",
    titleVi: "Phỏng vấn xin việc",
    description:
      "You're in a job interview for a marketing position. The interviewer will ask about your experience.",
    descriptionVi:
      "Bạn đang phỏng vấn cho vị trí marketing. Người phỏng vấn sẽ hỏi về kinh nghiệm của bạn.",
    level: "B1",
    systemPrompt:
      "You are a professional but friendly interviewer for a marketing position. Ask about experience, strengths, why they want this job, and situational questions. Give brief acknowledgments before the next question. Keep responses short (1-2 sentences).",
    firstMessage:
      "Thanks for coming in today. Let's start — could you tell me a little about yourself and your background in marketing?",
  },
  {
    id: "shopping",
    title: "Shopping for Clothes",
    titleVi: "Mua sắm quần áo",
    description:
      "You're at a clothing store looking for an outfit for a special occasion. The shop assistant will help.",
    descriptionVi:
      "Bạn đang ở cửa hàng quần áo tìm trang phục cho dịp đặc biệt. Nhân viên sẽ giúp bạn.",
    level: "A2",
    systemPrompt:
      "You are a helpful clothing store assistant. Ask what occasion they're shopping for, suggest items, offer different sizes/colors, and comment on how things look. Keep responses short (1-2 sentences). Be enthusiastic but not pushy.",
    firstMessage:
      "Hi! Welcome to Style Studio. Are you looking for something specific today, or just browsing?",
  },
  {
    id: "doctor-visit",
    title: "Doctor Visit",
    titleVi: "Khám bệnh",
    description:
      "You're visiting a doctor because you haven't been feeling well. Describe your symptoms.",
    descriptionVi: "Bạn đi khám bệnh vì không khỏe. Hãy mô tả triệu chứng của bạn.",
    level: "B1",
    systemPrompt:
      "You are a caring doctor. Ask about symptoms, duration, severity, and any medications they're taking. Give simple advice and suggest next steps. Keep responses short (2-3 sentences). Be reassuring.",
    firstMessage: "Hello! Please have a seat. What brings you in today? How have you been feeling?",
  },
  {
    id: "airport",
    title: "At the Airport",
    titleVi: "Ở sân bay",
    description:
      "You're at the airport check-in counter. The agent will help you with your boarding pass and luggage.",
    descriptionVi:
      "Bạn đang ở quầy check-in sân bay. Nhân viên sẽ giúp bạn với thẻ lên máy bay và hành lý.",
    level: "A2",
    systemPrompt:
      "You are an airport check-in agent. Ask for passport and booking reference, confirm destination, ask about luggage (checked bags, carry-on), assign a seat, and hand over the boarding pass. Keep responses short (1-2 sentences). Be efficient and polite.",
    firstMessage: "Good morning! May I see your passport and booking confirmation, please?",
  },
  {
    id: "making-friends",
    title: "Making Friends",
    titleVi: "Kết bạn mới",
    description: "You're at a social event and want to make conversation with someone new.",
    descriptionVi: "Bạn đang ở sự kiện xã hội và muốn trò chuyện với người mới quen.",
    level: "A1",
    systemPrompt:
      "You are a friendly person at a social event (a meetup or party). Make casual conversation — ask about hobbies, work, where they're from, what they like about the city. Share a bit about yourself too. Keep responses short (1-2 sentences). Be warm and curious.",
    firstMessage:
      "Hey! I don't think we've met. I'm Alex. Are you new here too, or do you come to these events often?",
  },
  {
    id: "phone-complaint",
    title: "Phone Complaint",
    titleVi: "Khiếu nại qua điện thoại",
    description:
      "You're calling customer service to complain about a product that arrived damaged.",
    descriptionVi: "Bạn gọi điện cho bộ phận chăm sóc khách hàng để khiếu nại sản phẩm bị hỏng.",
    level: "B2",
    systemPrompt:
      "You are a customer service representative. Listen to the complaint, apologize, ask for order details, and offer solutions (replacement, refund, discount). Keep responses short (1-2 sentences). Be empathetic and solution-oriented.",
    firstMessage:
      "Thank you for calling TechMart customer support. My name is Jordan. How can I help you today?",
  },
  {
    id: "renting-apartment",
    title: "Renting an Apartment",
    titleVi: "Thuê căn hộ",
    description: "You're viewing an apartment and asking the landlord questions about the lease.",
    descriptionVi: "Bạn đang xem căn hộ và hỏi chủ nhà về hợp đồng thuê.",
    level: "B2",
    systemPrompt:
      "You are a landlord showing an apartment. Answer questions about rent, utilities, lease terms, pet policy, parking, and neighborhood. Point out features of the apartment. Keep responses short (2-3 sentences). Be informative and slightly persuasive.",
    firstMessage:
      "Come on in! So this is the living room — nice natural light from those big windows. What would you like to know about the place?",
  },
];
