# Thứ tự viết queryKey và queryFn

## Khái niệm
Trong JavaScript, thứ tự các thuộc tính (keys) truyền vào một Object `{}` không hề ảnh hưởng đến logic thực thi. Việc viết `queryKey` trước hay sau `queryFn` đều cho kết quả giống hệt nhau.

```typescript
// Viết queryKey trước hay sau đều chạy y hệt nhau
export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],  // Viết trước
        queryFn: getCurrentUserRequest, // Viết sau
    })
}
```

## Tại sao convention luôn là viết `queryKey` trước?
- Vì lý do **Clean Code & Readability**. 
- `queryKey` đóng vai trò là "Định danh / Tên gọi" (Cái này là cái gì?), còn `queryFn` là "Hành động" (Làm sao để lấy được nó?). Tư duy đọc code tự nhiên là đọc Tên trước rồi mới xem Cách thức hoạt động sau, giúp code dễ bảo trì hơn.
