# Uncontrolled Components (sử dụng useRef hoặc FormData)

## Khái niệm
Uncontrolled Component lưu giữ trạng thái form trực tiếp trên cây DOM của trình duyệt (giống như HTML truyền thống). React chỉ truy cập dữ liệu khi cần thiết (ví dụ khi submit) thông qua `useRef` hoặc đối tượng `FormData`.

## Ví dụ code
```tsx
import { useRef } from 'react';

function UncontrolledForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lấy dữ liệu trực tiếp từ DOM ref
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    console.log({ email, password });
    
    // HOẶC sử dụng API FormData gốc của trình duyệt
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log("FormData:", data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="email"
        type="email"
        ref={emailRef}
        placeholder="Email"
        className="border p-2 rounded w-full"
      />
      <input
        name="password"
        type="password"
        ref={passwordRef}
        placeholder="Mật khẩu"
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Đăng nhập
      </button>
    </form>
  );
}
```

## Common pitfall
- Khó thực hiện validation trực tiếp (real-time validation) hoặc vô hiệu hóa nút submit (disable button) dựa trên tính hợp lệ của dữ liệu đầu vào.
- Việc cập nhật thủ công giá trị của một ô input từ code (ví dụ: nút "Đặt lại mật khẩu mặc định") đòi hỏi phải tác động trực tiếp vào DOM (`ref.current.value = ...`), vi phạm triết lý Declarative của React.

## Khi nào dùng
Dùng cho các form cực kỳ đơn giản, form có lượng lớn file tải lên (File Upload), hoặc khi cần tích hợp nhanh với các thư viện JS không thuộc hệ sinh thái React.
