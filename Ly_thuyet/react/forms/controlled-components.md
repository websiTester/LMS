# Controlled Components (sử dụng useState)

## Khái niệm
Controlled Component là cách quản lý form truyền thống của React, trong đó mọi dữ liệu nhập vào ô Input đều được liên kết trực tiếp với State của component. Trạng thái của Form trở thành nguồn dữ liệu tin cậy duy nhất ("Single Source of Truth").

## Ví dụ code
```tsx
import { useState } from 'react';

function ControlledForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mật khẩu"
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Đăng nhập
      </button>
    </form>
  );
}
```

## Common pitfall
- **Vấn đề Hiệu năng (Performance):** Mỗi ký tự người dùng gõ vào ô Input sẽ kích hoạt cập nhật State, dẫn đến toàn bộ Component và các con của nó bị re-render liên tục. Đối với các form lớn có hàng chục trường, điều này có thể gây giật lag.
- **Boilerplate Code:** Cần khai báo quá nhiều hàm xử lý `onChange` và biến `useState` cho từng trường.

## Khi nào dùng
Dùng cho các Form cực kỳ đơn giản (1-2 trường) như ô tìm kiếm (Search Box), Đăng nhập cơ bản, hoặc khi cần can thiệp xử lý dữ liệu nhập vào tức thời (ví dụ: viết hoa toàn bộ ký tự khi đang gõ).
