import { env } from "@/config/env";

export function renderAdminRegistrationEmail(input: {
  name: string;
  email: string;
  targetExam: string;
  targetScore: string;
  preferredLanguage: string;
}) {
  const adminUrl = `${env.APP_URL}/admin/registrations`;
  return {
    subject: "Có yêu cầu đăng ký mới",
    text: `Có yêu cầu đăng ký mới từ ${input.name} (${input.email}). Kỳ thi mục tiêu: ${input.targetExam}. Điểm mục tiêu: ${input.targetScore}. Ngôn ngữ mong muốn: ${input.preferredLanguage}. Truy cập ${adminUrl} để duyệt.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Có yêu cầu đăng ký mới</h2>
        <p><strong>Họ tên:</strong> ${input.name}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Kỳ thi mục tiêu:</strong> ${input.targetExam}</p>
        <p><strong>Điểm mục tiêu:</strong> ${input.targetScore}</p>
        <p><strong>Ngôn ngữ mong muốn:</strong> ${input.preferredLanguage}</p>
        <p><a href="${adminUrl}">Mở trang quản trị để duyệt</a></p>
      </div>
    `,
  };
}

export function renderVerificationEmail(input: {
  name: string;
  code: string;
  expiresInMinutes: number;
}) {
  const verifyUrl = `${env.APP_URL}/verify`;
  return {
    subject: "Mã xác nhận tài khoản của bạn",
    text: `Xin chào ${input.name}, mã xác nhận của bạn là ${input.code}. Mã có hiệu lực trong ${input.expiresInMinutes} phút. Vui lòng truy cập ${verifyUrl} để xác nhận tài khoản.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Mã xác nhận tài khoản của bạn</h2>
        <p>Xin chào ${input.name},</p>
        <p>Mã xác nhận của bạn là:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${input.code}</p>
        <p>Mã có hiệu lực trong ${input.expiresInMinutes} phút.</p>
        <p><a href="${verifyUrl}">Mở trang xác nhận tài khoản</a></p>
        <p>Nếu bạn cần hỗ trợ, vui lòng phản hồi email này hoặc liên hệ quản trị viên.</p>
      </div>
    `,
  };
}

export function renderRejectionEmail(input: { name: string }) {
  return {
    subject: "Yêu cầu đăng ký của bạn chưa được phê duyệt",
    text: `Xin chào ${input.name}, rất tiếc yêu cầu đăng ký của bạn hiện chưa được phê duyệt. Bạn có thể liên hệ quản trị viên để biết thêm chi tiết.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Yêu cầu đăng ký của bạn chưa được phê duyệt</h2>
        <p>Xin chào ${input.name},</p>
        <p>Rất tiếc, yêu cầu đăng ký của bạn hiện chưa được phê duyệt.</p>
        <p>Bạn có thể liên hệ quản trị viên để biết thêm chi tiết.</p>
      </div>
    `,
  };
}

export function renderPasswordResetEmail(input: {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  return {
    subject: "Đặt lại mật khẩu tài khoản của bạn",
    text: `Xin chào ${input.name}, bạn vừa yêu cầu đặt lại mật khẩu. Liên kết này có hiệu lực trong ${input.expiresInMinutes} phút: ${input.resetUrl}. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Đặt lại mật khẩu tài khoản của bạn</h2>
        <p>Xin chào ${input.name},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Javiss Language.</p>
        <p>Liên kết dưới đây có hiệu lực trong ${input.expiresInMinutes} phút:</p>
        <p><a href="${input.resetUrl}">Mở trang đặt lại mật khẩu</a></p>
        <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
      </div>
    `,
  };
}
