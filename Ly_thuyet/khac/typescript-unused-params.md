# Xử lý cảnh báo biến chưa sử dụng trong TypeScript

> Cách xử lý quy chuẩn khi TypeScript cảnh báo: `'variable' is declared but its value is never read.ts(6133)`.

---

## 1. Vấn đề

Trong JavaScript/TypeScript, thứ tự của các tham số trong hàm callback là cố định. Nếu bạn cần sử dụng tham số thứ 2 hoặc thứ 3, bạn bắt buộc phải khai báo các tham số đứng trước nó, ngay cả khi bạn không cần dùng tới.

Ví dụ trong hàm callback `onSuccess` của TanStack Query:
```tsx
onSuccess: (data, variables) => {
  // Bạn chỉ cần dùng biến `variables`, nhưng bắt buộc phải khai báo `data`
  console.log(variables.courseId);
}
```
Khi đó, TypeScript và các công cụ linter (như ESLint) sẽ cảnh báo: `'data' is declared but its value is never read` (Biến đã được khai báo nhưng không bao giờ dùng tới).

---

## 2. Cách giải quyết chuẩn Convention

Để giải quyết tình huống này một cách chuyên nghiệp, cộng đồng TypeScript có chung một quy ước: **Sử dụng dấu gạch dưới (`_`)**.

### Cách 1: Thay thế hoàn toàn bằng `_` (Khuyên dùng nhất)
Nếu bạn không quan tâm tham số đó là gì, hãy đổi tên nó thành một dấu gạch dưới `_`. TypeScript mặc định sẽ bỏ qua việc kiểm tra "chưa sử dụng" đối với biến mang tên này.

```tsx
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) }); 
}
```

Nếu có nhiều tham số rác đứng trước, bạn có thể tăng số lượng gạch dưới (Dù cách này nhìn hơi buồn cười nhưng vẫn được coi là hợp lệ):
```tsx
const myCallback = (_, __, thirdParam) => {
  console.log(thirdParam);
}
```

### Cách 2: Thêm tiền tố `_` vào trước tên biến
Nếu bạn vẫn muốn giữ lại tên biến để sau này dễ đọc code (tự nhắc nhở bản thân rằng tham số đó chứa gì), hãy thêm dấu `_` lên đầu tên biến. Hầu hết các cấu hình TS/ESLint đều bỏ qua các biến bắt đầu bằng `_`.

```tsx
// Bỏ qua cảnh báo nhưng vẫn giữ được tính gợi nhớ của chữ data
onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) }); 
}
```
