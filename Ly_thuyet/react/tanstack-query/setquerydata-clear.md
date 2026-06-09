# Vai trò của queryClient.setQueryData và queryClient.clear

## Khái niệm
Mặc dù đôi khi việc xóa hai lệnh này không gây ra lỗi ngay lập tức, chúng đóng vai trò cực kỳ quan trọng về **Hiệu năng (Performance)** và **Bảo mật (Security)** trong ứng dụng SPA.

## `queryClient.setQueryData` (Dùng khi Login)
Khi đăng nhập thành công, server trả về thông tin user. Thay vì để component Dashboard tự gọi API lần nữa qua `useQuery(['currentUser'])`, ta ép dữ liệu vào cache ngay lập tức:
```typescript
queryClient.setQueryData(['currentUser'], result)
```
- **Tác dụng:** Component sẽ lấy data từ Cache dùng luôn (Zero-loading state) → Trải nghiệm mượt mà, tiết kiệm 1 request thừa lên server.

## `queryClient.clear()` (Dùng khi Logout)
Khi user bấm đăng xuất, bắt buộc phải xóa sạch Cache:
```typescript
queryClient.clear()
```
- **Tác dụng:** Tránh rò rỉ dữ liệu (Data Leakage). Nếu không clear, người dùng B đăng nhập vào cùng trình duyệt (mà không hard-reload) có thể nhìn thấy dữ liệu nhạy cảm (khóa học đã mua, thẻ tín dụng...) của người dùng A lưu trong Cache.

---

## Các Use-Case Nâng Cao của `setQueryData`

Mặc dù `useQuery` tự động lưu cache, `setQueryData` là công cụ bắt buộc phải dùng khi bạn muốn **chèn dữ liệu vào Cache bằng tay mà KHÔNG cần gọi API**.

### 1. Tiết kiệm 1 vòng gọi API sau khi Update (Mutation)
Thay vì dùng `invalidateQueries` để ép `useQuery` gọi lại GET API sau khi vừa cập nhật thành công (tốn 2 lượt API: 1 PUT, 1 GET), bạn có thể chèn trực tiếp response của lệnh PUT vào cache:

```tsx
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCourseRequest, // Trả về Course object mới nhất
    onSuccess: (updatedCourse) => {
      // Nhét thẳng data mới vào Cache thay vì gọi lại API
      queryClient.setQueryData(['course', updatedCourse.id], updatedCourse);
    }
  });
}
```

### 2. Optimistic Updates (Cập nhật lạc quan)
Sử dụng cho các thao tác cần UX tức thời (VD: Bấm Like thả tim, Đánh dấu hoàn thành bài học).
Ý tưởng: Ngay khi user bấm nút, dùng `setQueryData` sửa ngay UI (giả vờ là đã thành công) trước cả khi API gọi xong. Nếu API báo lỗi, mới rollback (trả về) số cũ.

```tsx
onMutate: async (newCourseData) => {
  // Dừng mọi request đang fetch đè
  await queryClient.cancelQueries({ queryKey: ['course', newCourseData.id] });
  
  // Lưu lại data cũ để phòng hờ lỗi
  const previousCourse = queryClient.getQueryData(['course', newCourseData.id]);
  
  // Lạc quan chèn data mới vào Cache ngay lập tức để UI cập nhật tức thì
  queryClient.setQueryData(['course', newCourseData.id], newCourseData);
  
  return { previousCourse }; // Truyền data cũ xuống cho onError
},
onError: (err, newCourseData, context) => {
  // Nếu API báo lỗi, rollback lại data cũ đã lưu
  queryClient.setQueryData(['course', newCourseData.id], context.previousCourse);
}
```
