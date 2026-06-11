# Hiển thị lỗi validation từ Zod trong React Hook Form

## Khái niệm
Trong quá trình validate form sử dụng `react-hook-form` và `zod`, khi xảy ra lỗi validation, các thông báo lỗi sẽ được lưu trữ trong object `errors` (được lấy từ `formState`). Việc hiển thị đúng vị trí các thông báo lỗi này lên UI (ví dụ dưới ô input) là rất quan trọng để có một trải nghiệm người dùng tốt.
Đặc biệt đối với các lỗi phát sinh từ hàm `.refine()` (như kiểm tra 2 mật khẩu có khớp nhau không), chúng ta cần chỉ định trường bị lỗi thông qua thuộc tính `path`.

## Các hiển thị lỗi cho trường đơn (Field Errors)
Zod sẽ tự động map lỗi vào đúng key của field tương ứng trong object `errors`.

```tsx
// Trong khai báo component:
const { register, formState: { errors } } = useForm<RegisterFormData>({ ... });

// Trong render:
<div>
  <input type="email" {...register('email')} />
  {/* Hiển thị lỗi ngay bên dưới thẻ input */}
  {errors.email && (
    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
  )}
</div>
```

## Hiển thị lỗi từ .refine() (như Xác nhận mật khẩu)
Mặc định, các lỗi xảy ra ở level object (dùng `.refine()`) sẽ bị ném vào root error (vì Zod không biết lỗi thuộc về field nào). 
Để Zod gán lỗi này vào một field cụ thể, ta **bắt buộc phải sử dụng thuộc tính `path`**.

```typescript
// 1. Khai báo Schema
const registerSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'] // <--- Chỉ định lỗi được gán vào field confirm_password
});

// 2. Render UI (Xử lý giống hệt như lỗi thông thường)
<div>
  <input type="password" {...register('confirm_password')} />
  {errors.confirm_password && (
    <p className="mt-1 text-sm text-red-500">{errors.confirm_password.message}</p>
  )}
</div>
```

## Common pitfall
- **Không hiển thị lỗi ra UI (Silent fail):** Khi validation thất bại, `handleSubmit` chặn gọi hàm `onSubmit`, nhưng nếu lập trình viên không viết code hiển thị `errors` ra giao diện, người dùng sẽ nhấp nút Submit mà không thấy có gì xảy ra.
- **Sử dụng sai biến để hiển thị:** Hiển thị nhầm biến lỗi API (`apiError`) trong khi đáng lẽ phải hiển thị biến validation error (`errors.email`, `errors.password`).
- **Không truyền `path` trong `.refine()`:** Làm cho lỗi không được map vào một field cụ thể nào, dẫn đến việc phải lấy lỗi ra từ `errors.root.message` (hoặc `errors[""].message`), làm UI bị hạn chế (thường phải báo lỗi tít ở phía dưới cùng màn hình thay vì ngay dưới input).
