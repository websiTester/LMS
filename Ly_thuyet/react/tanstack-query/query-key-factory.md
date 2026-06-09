# Quản lý Query Key với Query Key Factory

> Tránh sai sót chính tả và tái sử dụng Query Key hiệu quả trong dự án lớn.

---

## Vấn đề gặp phải

Khi sử dụng `useQuery` và `useMutation`, ta thường viết Query Key thủ công dưới dạng mảng (VD: `['course', courseId]`).

Cách làm này có nhược điểm:
1. **Dễ sai chính tả (Typo):** Khi invalidate, có thể bạn gõ thiếu chữ 's' (`['courses']` thành `['course']`), làm cache không bị xóa.
2. **Khó bảo trì:** Khi đổi tên key, bạn phải đi tìm (Search) thủ công trên toàn bộ dự án.
3. **Khó nhớ cấu trúc:** Có quá nhiều biến thể như List, Detail, Search, Filter...

---

## Giải pháp: Query Key Factory (Chuẩn Enterprise)

Thay vì gõ chuỗi tay ở nhiều nơi, hãy tạo một Object trung tâm đóng vai trò là "nhà máy" chuyên cung cấp các Query Key, và tận dụng tính năng TypeScript Autocomplete.

### 1. Invalidate theo Prefix (Cơ chế của TanStack Query)
Trước khi dùng Factory, bạn cần biết TanStack Query hỗ trợ xóa theo cấp bậc họ hàng (Prefix).
Ví dụ bạn gọi hàm invalidate mảng chứa đúng 1 chữ `['courses']`:
```tsx
queryClient.invalidateQueries({ queryKey: ['courses'] })
```
Nó sẽ dọn sạch toàn bộ các key có chứa `courses` đứng đầu trong Cache:
- `['courses']` (Danh sách khóa học)
- `['courses', 1]` (Khóa học ID 1)
- `['courses', { search: 'React' }]` (Khóa học có filter)

### 2. Triển khai Query Key Factory

Dựa trên cơ chế Prefix đó, ta tạo một Object chia cấp bậc (để riêng hoặc để chung trong file API):

```typescript
// queryKeys.ts
export const courseKeys = {
  // Key gốc (dùng khi muốn invalidate TẤT CẢ mọi thứ liên quan đến course)
  all: ['courses'] as const,
  
  // Danh sách
  lists: () => [...courseKeys.all, 'list'] as const,
  listFiltered: (filters: string) => [...courseKeys.lists(), { filters }] as const,
  
  // Chi tiết (Detail)
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
}
```

### 3. Cách sử dụng

**Trong hàm lấy data (`useQuery`):**
```tsx
export const useGetCourseById = (courseId: number) => {
  return useQuery({
    // Sử dụng Object thay vì tự gõ mảng
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourseByIdRequest(courseId),
  })
}
```

**Trong hàm cập nhật data (`useMutation`):**
```tsx
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCourseRequest,
    onSuccess: (data, variables) => {
      // Invalidate toàn bộ danh sách
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      
      // Invalidate đúng cái detail vừa update
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      
      // Hoặc lười hơn, xóa sách mọi thứ liên quan khóa học:
      // queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}
```

Làm theo mô hình này, IDE của bạn sẽ tự động **gợi ý code (Autocomplete)**, loại bỏ hoàn toàn rủi ro sai chính tả do gõ tay String.

---

## Giải thích chuyên sâu (Deep Dive) về Cấu trúc Factory

Dưới đây là lời giải thích cho 2 quyết định thiết kế quan trọng trong cấu trúc Factory trên:

### 1. Tại sao lưu tham số (params/filters) vào Object `{ filters }` mà không truyền thẳng mảng String?

Nếu dùng mảng: `['courses', 'list', 'active', 2, 'price']`
- **Nhược điểm:** TanStack Query phân biệt thứ tự mảng rất khắt khe. Mảng `['active', 2]` bị coi là **khác hoàn toàn** mảng `[2, 'active']`. Nó sẽ sinh ra 2 bộ cache đệm riêng biệt, gây rác bộ nhớ và lỗi hiển thị nếu thứ tự truyền vào bị đảo lộn.

Nếu dùng Object: `['courses', 'list', { status: 'active', page: 2 }]`
- **Ưu điểm:** TanStack Query được lập trình để **không quan tâm đến thứ tự thuộc tính trong Object**.
- Hai mảng `['courses', 'list', { status: 'active', page: 2 }]` và `['courses', 'list', { page: 2, status: 'active' }]` được coi là **Cùng một Query Key**. Điều này triệt tiêu hoàn toàn rủi ro truyền sai thứ tự tham số.
- Ngoài ra, nhìn vào cửa sổ DevTools, thấy `{ filters: 'active' }` sẽ tự mô tả code (self-documenting) tốt hơn nhiều so với việc chỉ thấy một chữ `'active'` trơ trọi.

### 2. Tại sao đẻ ra thêm cấp trung gian `details` thay vì gắn thẳng `id`?

Cách đơn giản nhất thường dùng là `['courses', id]`. Nhưng ở Enterprise, một thực thể (Course) thường kéo theo rất nhiều module con:
1. `['courses', 'list']` (Danh sách)
2. `['courses', 'detail', 1]` (Chi tiết khóa học)
3. `['courses', 'comments', 1]` (Bình luận của khóa học)
4. `['courses', 'analytics', 1]` (Thống kê khóa học)

Việc nhét thêm cấp trung gian `details` chính là tạo ra một "Thư mục mẹ" để gom nhóm tất cả các "Chi tiết khóa học" lại.
**Mục đích:** Phục vụ cho việc Invalidate (xóa cache) diện rộng mà không ném vỡ bình hoa (ảnh hưởng module khác).

- Nếu bạn muốn xóa cache của **toàn bộ các trang chi tiết** (sau khi thay đổi cấu trúc bảng Course), nhưng không muốn đụng chạm đến trang `list` hay `comments` -> Chỉ cần gọi 1 lệnh:
  `queryClient.invalidateQueries({ queryKey: courseKeys.details() })` 
  Lập tức toàn bộ cache chi tiết của khóa 1, khóa 2, khóa 99 bốc hơi hết, nhưng `list` và `comments` vẫn sống khỏe ru. Nếu không có cấp trung gian `details`, bạn sẽ không thể làm được việc này vì điểm chung duy nhất là chữ `courses` (xóa là mất hết).
