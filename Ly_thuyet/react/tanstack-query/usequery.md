# Truy vấn dữ liệu với useQuery

## Khái niệm
`useQuery` dùng để **đọc (GET) dữ liệu** từ server. Khác với `useMutation` (phải gọi `mutate()` thủ công), `useQuery` **tự động fetch khi component mount** và quản lý cache.

## Các tham số chính
| Tham số | Ý nghĩa |
|---|---|
| `queryKey` | Mảng định danh duy nhất cho query — TanStack dùng key này để cache và invalidate |
| `queryFn` | Hàm async thực hiện HTTP request — return data |
| `staleTime` | Bao lâu data được coi là "fresh" — không refetch trong khoảng này (mặc định `0`) |
| `enabled` | Boolean — `false` sẽ disable query, không fetch (hữu ích khi chờ điều kiện) |

## Các giá trị trả về
| Giá trị | Ý nghĩa |
|---|---|
| `data` | Dữ liệu trả về từ `queryFn` — `undefined` khi chưa có |
| `isPending` | `true` khi đang fetch lần đầu (chưa có data trong cache) |
| `isError` | `true` khi request lỗi |
| `error` | Object lỗi (khi `isError === true`) |
| `isFetching` | `true` khi đang fetch (kể cả background refetch) |
| `refetch` | Hàm gọi thủ công để fetch lại |

## Ví dụ code

**Custom hook trong file API:**

```typescript
// features/course/api.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../shared/lib/api-client";

// 1. Hàm request thuần — chỉ fetch data, không liên quan React
const getAllCoursesRequest = async (): Promise<CourseRead[]> => {
  return apiClient('courses/allCourses', { method: 'GET' });
};

// 2. Custom hook wrap useQuery
export const useGetAllCourses = () => {
  return useQuery({
    queryKey: ['courses'],            // cache key — unique cho query này
    queryFn: getAllCoursesRequest,     // hàm fetch thực tế
  });
};
```

**Sử dụng trong component:**

```tsx
export default function CourseList() {
  // Không cần useState, không cần useEffect
  // useQuery tự fetch khi mount, tự cache, tự refetch khi stale
  const { data: courses = [], isPending, isError, error } = useGetAllCourses();

  if (isPending) return <CourseSkeleton />;
  if (isError) return <p>Lỗi: {error.message}</p>;
  if (courses.length === 0) return <EmptyState />;

  return (
    <div>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

## `queryKey` — cache key quan trọng
`queryKey` quyết định cách TanStack Query **cache và refetch**:

```typescript
// Key đơn giản
useQuery({ queryKey: ['courses'], queryFn: ... })

// Key có tham số — mỗi page là 1 cache entry riêng
useQuery({ queryKey: ['courses', { page: 2 }], queryFn: ... })

// Key phụ thuộc biến — thay đổi page → query mới → tự refetch
const { data } = useQuery({
  queryKey: ['courses', { page, language, level }],
  queryFn: () => fetchCourses({ page, language, level }),
});
```

**Rule:** Mọi biến ảnh hưởng tới kết quả query đều phải nằm trong `queryKey`. Nếu không, thay đổi filter nhưng data không đổi (vì cache hit key cũ).

## `enabled` — fetch có điều kiện

```typescript
// Chỉ fetch course detail khi có slug
const { data: course } = useQuery({
  queryKey: ['course', slug],
  queryFn: () => getCourseBySlug(slug),
  enabled: !!slug,  // ← false nếu slug là undefined → không fetch
});
```

## So sánh: `useEffect + useState` vs `useQuery`

| Vấn đề | `useEffect + useState` | `useQuery` |
|---|---|---|
| Loading/Error state | Tự quản lý 3 state | Có sẵn `isPending`, `isError` |
| Cache | Không có — mỗi lần mount fetch lại | Tự cache theo `queryKey` |
| Navigate đi rồi quay lại | Fetch lại từ đầu | Trả cache ngay, background refetch |
| Race condition | Phải tự xử lý cleanup | Đã handle sẵn |
| Retry khi lỗi | Tự viết | Tự retry 3 lần (configurable) |
| Code lines | ~10-15 lines | ~3-5 lines |
