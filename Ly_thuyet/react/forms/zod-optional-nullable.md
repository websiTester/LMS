# Zod: Xử lý Optional, Nullable và Chuỗi rỗng

## Khái niệm
Khi khai báo schema với Zod, đôi khi bạn cần một trường không bắt buộc (optional) nhưng lại cho phép giá trị `null` (thường gặp khi form submit hoặc API trả về). Zod cung cấp 3 phương thức để xử lý:
- `.optional()`: Chỉ cho phép `undefined`.
- `.nullable()`: Chỉ cho phép `null`.
- `.nullish()`: Cho phép CẢ `null` và `undefined`. Đây là cách an toàn và gọn nhất khi làm việc với các trường không bắt buộc trong Form.

## Ví dụ code
```typescript
import * as z from 'zod';

const schema = z.object({
  // 1. Chỉ chấp nhận string hoặc undefined
  description: z.string().optional(),
  
  // 2. Chỉ chấp nhận string hoặc null
  level: z.string().nullable(),
  
  // 3. Chấp nhận string, null, hoặc undefined (Khuyên dùng)
  thumbnail: z.string().url('URL không hợp lệ').nullish(),
});
```

## Common pitfall
- **Vấn đề chuỗi rỗng (Empty string) trong Form:** Khi người dùng để trống thẻ `<input />`, giá trị mặc định form thu được thường là chuỗi rỗng `""`. Các quy tắc kiểm tra định dạng (như `.url()` hay `.email()`) sẽ báo lỗi với chuỗi rỗng này ngay cả khi bạn có đặt `.nullish()`.
- **Cách khắc phục:** Kết hợp với `.or(z.literal(''))` để cho phép chuỗi rỗng lọt qua vòng kiểm tra định dạng.
  ```typescript
  // Cho phép URL hợp lệ, HOẶC chuỗi rỗng, HOẶC null/undefined
  avatarUrl: z.string().url().or(z.literal('')).nullish(),
  ```
