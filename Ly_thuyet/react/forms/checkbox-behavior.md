# Hành vi của Checkbox trong React (`e.target.checked`)

## Bản chất của sự kiện `onChange` ở Checkbox
Nguyên lý hoạt động cơ bản: **Chỉ SAU KHI trình duyệt tự động lật ngược trạng thái (toggle) của checkbox trên DOM, sự kiện `onChange` mới được phát ra.**

Quy trình diễn ra khi user click vào `<input type="checkbox" />`:
1. Trình duyệt bắt được cú click chuột.
2. Trình duyệt **tự động** thay đổi trạng thái gốc của thẻ input (đánh dấu hoặc bỏ đánh dấu).
3. Trình duyệt gọi hàm `onChange`.
4. Bên trong hàm `onChange`, biến `e.target.checked` sẽ mang **trạng thái mới nhất** (sau khi đã tự động thay đổi) chứ không phải là một giá trị cố định.

## Ví dụ code (Mô hình Controlled Component)
```tsx
import { useState } from 'react';

function CheckboxExample() {
  const [isFree, setIsFree] = useState(false);

  return (
    // LUÔN LUÔN phải truyền state ngược lại vào thuộc tính `checked`
    <input 
      type="checkbox" 
      checked={isFree} 
      onChange={(e) => setIsFree(e.target.checked)} 
    />
  );
}
```

## Common pitfall
- **Nhầm lẫn `value` và `checked`:** Đối với thẻ `<input type="text">`, chúng ta dùng `e.target.value` để lấy chữ user gõ vào. Nhưng với Checkbox (hoặc Radio), **BẮT BUỘC phải dùng `e.target.checked`** (trả về kiểu Boolean) để biết nó đang bật hay tắt.
- **Quên truyền `checked={state}`:** Nếu bạn dùng `onChange` để cập nhật biến state nhưng lại không truyền biến state đó vào thuộc tính `checked`, React sẽ mất quyền kiểm soát hiển thị của ô checkbox đó. Hậu quả là nếu bạn thay đổi state ở một nơi khác (VD: Bấm nút "Clear Form"), giao diện ô checkbox sẽ không cập nhật theo.
