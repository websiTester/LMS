---
tags: [vite, env, configuration, frontend, typescript]
related: [bien-moi-truong-python]
module_refs: [M1, M26]
---

# Biến Môi Trường Trong Vite (Environment Variables)

> Hướng dẫn cách thiết lập, bảo mật và sử dụng biến môi trường (`.env`) trong frontend React sử dụng build tool Vite.

---

## Đối Tượng `import.meta.env`

### Khái niệm
Vite sử dụng đối tượng **`import.meta.env`** để cung cấp các biến môi trường thay vì dùng `process.env` như các build tool cũ (Webpack, Create React App). `import.meta` là tính năng tiêu chuẩn của trình duyệt khi chạy các ES Modules (ESM).

Vite tích hợp sẵn một số biến môi trường mặc định:
- `import.meta.env.MODE` (string): Chế độ chạy hiện tại (ví dụ: `development`, `production`).
- `import.meta.env.BASE_URL` (string): URL cơ sở của ứng dụng (thường cấu hình qua `base` trong `vite.config.ts`).
- `import.meta.env.PROD` (boolean): `true` nếu ứng dụng chạy ở production mode.
- `import.meta.env.DEV` (boolean): `true` nếu ứng dụng chạy ở development mode.

---

## Tiền Tố `VITE_` và Tính Bảo Mật

### Khái niệm
Để tránh việc vô tình rò rỉ (leak) các biến môi trường nhạy cảm của hệ thống hoặc backend (ví dụ: mật khẩu cơ sở dữ liệu, private key) lên phía client (trình duyệt có thể đọc được), Vite chỉ hiển thị các biến có tiền tố **`VITE_`**.

Mọi biến môi trường không bắt đầu bằng `VITE_` sẽ bị bỏ qua và trả về `undefined` khi gọi từ frontend.

### Ví dụ code
Khai báo trong file `.env` ở root folder của frontend:
```env
# Biến này TRUY CẬP ĐƯỢC ở frontend
VITE_API_BASE_URL=http://localhost:8000

# Biến này BỊ ẨN (trả về undefined) vì thiếu tiền tố VITE_
DATABASE_PASSWORD=secret_password_123
```

Sử dụng trong component React:
```typescript
const apiEndpoint = import.meta.env.VITE_API_BASE_URL; // "http://localhost:8000"
const dbPassword = import.meta.env.DATABASE_PASSWORD;  // undefined
```

---

## Hỗ Trợ TypeScript Gợi Ý Code (IntelliSense)

### Khái niệm
Mặc định, TypeScript sẽ không tự động nhận biết được các biến tùy chỉnh trong `import.meta.env` và có thể báo lỗi hoặc gợi ý kiểu dữ liệu là `any`. Cần khai báo kiểu dữ liệu trong file declaration của dự án.

### Ví dụ code
Cập nhật file `src/vite-env.d.ts` hoặc `src/env.d.ts`:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Định nghĩa kiểu dữ liệu readonly cho các biến tùy chỉnh
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Thứ Tự Ưu Tiên Load File `.env`

### Khái niệm
Vite sẽ load các file `.env` theo thứ tự ưu tiên nhất định. Các file nằm sau sẽ đè lên (override) giá trị của các file nằm trước:

1. `.env` (áp dụng cho mọi chế độ chạy)
2. `.env.local` (áp dụng cho mọi chế độ, nhưng bị Git ignore - chỉ dùng dưới máy cá nhân)
3. `.env.[mode]` (ví dụ: `.env.development`, `.env.production`)
4. `.env.[mode].local` (độ ưu tiên cao nhất, bị Git ignore)

---

## 🔗 References
- [Vite Official Docs - Env Variables and Modes](https://vite.dev/guide/env-and-mode)
- Related notes: [[bien-moi-truong-python]]
