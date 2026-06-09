# useQuery vs useMutation — Khi nào dùng cái nào

## Khái niệm

| | `useQuery` | `useMutation` |
|---|---|---|
| **Mục đích** | **Đọc** data (GET) | **Thay đổi** data (POST/PUT/DELETE) |
| **Tự fetch khi mount** | ✅ Có | ❌ Không — phải gọi `mutate()` |
| **Cache** | ✅ Có (theo `queryKey`) | ❌ Không |
| **Ví dụ** | Lấy danh sách course, lấy user info | Login, tạo course, xóa course |
| **Trigger** | Tự động | Thủ công (gọi `mutate()`) |

## Lỗi thường gặp: dùng `useMutation` để GET data

```typescript
// ❌ SAI — dùng mutation cho việc đọc
const { mutate: fetchCourses } = useMutation({ mutationFn: getAllCourses });

useEffect(() => {
  fetchCourses(undefined, { onSuccess: (data) => setCourses(data) });
  //                        ^ phải truyền onSuccess vào slot thứ 2
  //                        ^ phải tự setCourses thủ công
  //                        ^ không có cache
}, []);

// ✅ ĐÚNG — dùng useQuery cho việc đọc
const { data: courses = [] } = useQuery({
  queryKey: ['courses'],
  queryFn: getAllCourses,
});
// Xong. Không cần useState, useEffect, onSuccess, setCourses.
```

## Quy tắc quyết định nhanh

```
User click → gửi data lên server → thay đổi state server
  → useMutation (login, signup, create course, delete, update)

Component mount → cần hiển thị data từ server → đọc
  → useQuery (list courses, course detail, user profile)
```
