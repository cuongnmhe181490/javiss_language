# Javiss Language

Nền tảng luyện thi ngôn ngữ bằng AI với kiến trúc sẵn sàng mở rộng từ IELTS sang HSK, JLPT, TOPIK.

## Công nghệ

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI structure
- PostgreSQL
- Prisma ORM
- Redis + BullMQ
- Zod

## Tính năng đã có trong giai đoạn này

- Đăng ký tài khoản theo flow chờ admin duyệt
- Gửi thông báo email cho admin khi có đăng ký mới
- Admin duyệt hoặc từ chối yêu cầu đăng ký
- Sinh mã xác thực, lưu hash mã, kiểm tra hạn dùng và số lần thử
- Xác thực tài khoản qua email + mã
- Đăng nhập bằng session cookie JWT
- RBAC với `super_admin`, `admin`, `teacher`, `student`
- Dashboard cho học viên
- Dashboard quản trị cho đăng ký, người dùng, gói học, nhật ký, cài đặt
- Nền dữ liệu exam pack cho IELTS và mở rộng đa ngôn ngữ
- Dictionary UI tiếng Việt và cấu trúc i18n mặc định `vi`
- Mock email provider để chạy local

## Cấu trúc thư mục

```text
src/
  app/
    (public)/
    (auth)/
    (dashboard)/
    (admin)/
    api/
  components/
    ui/
    shared/
    forms/
    dashboard/
    admin/
  features/
    auth/
    registration/
    verification/
    admin/
    users/
    learning/
    exams/
    plans/
  lib/
    db/
    auth/
    email/
    security/
    rate-limit/
    logger/
    utils/
  server/
    services/
    repositories/
    policies/
    jobs/
  i18n/
  config/
prisma/
```

## Chuẩn bị môi trường

1. Cài PostgreSQL và Redis local.
2. Copy biến môi trường:

```bash
cp .env.example .env
```

3. Cập nhật các biến sau trong `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `ADMIN_NOTIFICATION_EMAIL`
- `MAIL_PROVIDER`

## Chạy local

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Tài khoản seed mặc định

- Email: giá trị của `SEED_SUPER_ADMIN_EMAIL`
- Mật khẩu: giá trị của `SEED_SUPER_ADMIN_PASSWORD`

Mặc định trong `.env.example`:

- `superadmin@javiss.local`
- `Admin@123456`

## Email provider

- `MAIL_PROVIDER=mock`: ghi log email ra console
- `MAIL_PROVIDER=smtp`: gửi thật qua SMTP

## Queue

- Email đang dùng BullMQ queue với fallback inline nếu Redis queue chưa sẵn sàng.
- Có sẵn worker tại `src/server/jobs/email-worker.ts` để tách riêng ở giai đoạn deploy tiếp theo.

## Ghi chú triển khai

- Build hiện đã pass.
- `prisma validate` và `prisma generate` đã pass.
- Chưa chạy `prisma migrate dev` và `prisma db seed` trong workspace hiện tại vì local chưa có PostgreSQL running trên `localhost:5432`.
