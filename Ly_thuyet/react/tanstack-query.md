---
tags: [react, state-management, server-state, tanstack-query]
related: [kien-truc-api-va-validation]
module_refs: [M6]
---

# TanStack Query (React Query)

> Thư viện quản lý trạng thái bất đồng bộ từ Server (Server State) cho React, hỗ trợ cơ chế caching, synchronization, và update dữ liệu tự động.

---

## Thiết lập QueryClient và QueryClientProvider

### Khái niệm
Để sử dụng các hooks của TanStack Query (`useQuery`, `useMutation`), ứng dụng React cần có một `QueryClient` để quản lý cache và cấu hình, đồng thời được bao bọc bởi `QueryClientProvider` ở tầng cao nhất của ứng dụng.

### Ví dụ code
Cấu hình nhà cung cấp tại `apps/web/src/app/providers.tsx`:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Khởi tạo client chứa các thiết lập cache toàn cục
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động gọi lại API khi user click chuyển tab
      staleTime: 5 * 60 * 1000,    // Dữ liệu được coi là mới (fresh) trong 5 phút
    },
  },
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

Bọc ứng dụng tại entry point `apps/web/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Providers phải bọc ngoài cùng để QueryClientContext có hiệu lực trong Router */}
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);
```

### Khi nào dùng
Bắt buộc phải thiết lập khi bắt đầu chuyển từ cơ chế fetch dữ liệu thủ công (`useState` + `useEffect`) sang quản lý dữ liệu tập trung qua server state (thường từ Module 6 trong roadmap).

---

## Lỗi No QueryClient set (Common Pitfall)

### Khái niệm
Lỗi `Uncaught Error: No QueryClient set, use QueryClientProvider to set one` xảy ra khi một component gọi hook của TanStack Query nhưng component đó nằm ngoài tầm vực (scope) của `QueryClientProvider`.

### Common pitfall
- **Đặt Provider sai vị trí**: Đặt `<QueryClientProvider>` ở bên dưới router khiến cho các trang (pages) được quản lý bởi Router không nhận được context của Query Client.
- **Nhiều instance của thư viện**: Cài đặt sai phiên bản của `@tanstack/react-query` ở nhiều nơi trong dự án monorepo (ví dụ: một phiên bản ở root, một phiên bản ở app) khiến React Context bị nhận diện nhầm.

### Cách khắc phục
- Đảm bảo thẻ `<Providers>` (hoặc `<QueryClientProvider>`) bọc ngoài cùng của ứng dụng, bao bọc cả thẻ `<RouterProvider>` ở entry point.

---

---

## Thay đổi dữ liệu với useMutation

### Khái niệm
Khác với `useQuery` (chuyên dùng để **truy vấn** dữ liệu - phương thức GET), hook **`useMutation`** được sử dụng để **thay đổi** dữ liệu trên server (thực hiện các phương thức POST, PUT, DELETE, PATCH).

Các tham số và biến cố định quan trọng của `useMutation` (TanStack Query v5):
- **`mutationFn` (Cấu hình - Cố định)**: Thuộc tính nhận vào một hàm async thực hiện HTTP request thực tế (ví dụ: gọi fetch API). Đây là tên khóa bắt buộc, không được tự ý thay đổi.
- **`mutate` (Hàm trả về - Cố định khi bóc tách)**: Hàm dùng để kích hoạt (trigger) chạy request. Bạn có thể sử dụng cú pháp alias để đổi tên nó trong file component nhằm tăng tính gợi nhớ (ví dụ: `{ mutate: login }`).
- **`isPending` (Trạng thái - Cố định)**: Biến boolean tự động chuyển sang `true` khi request bắt đầu chạy và trả về `false` khi request hoàn tất (thành công hoặc thất bại). Dùng để hiển thị trạng thái loading hoặc disable nút submit tránh click trùng lặp.

### Ví dụ code
Khai báo Custom Hook trong file API hướng feature:
```typescript
import { useMutation } from '@tanstack/react-query';

export const useLogin = () => {
  return useMutation({
    mutationFn: loginRequest, // mutationFn là tên khóa cố định
  });
};
```

Sử dụng trong component UI (áp dụng đổi tên `mutate` bằng alias):
```tsx
const { mutate: login, isPending } = useLogin();

const onSubmit = (data: LoginFormData) => {
  // Kích hoạt request bằng hàm đã được đổi tên
  login(data, {
    onSuccess: (result) => {
      console.log("Đăng nhập thành công", result);
    },
    onError: (error) => {
      console.error("Đăng nhập thất bại", error.message);
    }
  });
};

return (
  <button type="submit" disabled={isPending}>
    {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
  </button>
);
```

### Sự khác biệt giữa `onSuccess`, `onError` và `onSettled`

Khi xử lý kết quả của một Mutation, TanStack Query cung cấp 3 callback chính. Việc chọn sai callback có thể dẫn đến lỗi logic nghiêm trọng (đặc biệt trong các luồng như Đăng xuất).

| Callback | Khi nào chạy? | Ứng dụng thực tế |
|---|---|---|
| **`onSuccess`** | Chỉ chạy khi API thành công (Status 2xx). | Hiển thị thông báo "Cập nhật thành công", đóng Modal, chuyển hướng sang trang chi tiết. |
| **`onError`** | Chỉ chạy khi API thất bại (Lỗi mạng, 4xx, 5xx). | Hiển thị thông báo lỗi "Mật khẩu sai", "Mất kết nối mạng". |
| **`onSettled`** | **Luôn luôn chạy cuối cùng**, bất kể thành công hay thất bại (giống khối `finally` trong `try/catch`). | Dọn dẹp State rác, ẩn trạng thái Loading toàn cục, hoặc **Đăng xuất (Logout)**. |

**🚨 Ví dụ: Tại sao Đăng xuất (Logout) bắt buộc phải dùng `onSettled`?**
Nếu bạn dùng `onSuccess` để xóa thông tin User và đá về trang `/login` sau khi gọi API `/logout`:
- Nếu người dùng bị rớt mạng, API `/logout` thất bại.
- Hàm `onSuccess` sẽ **không bao giờ được chạy**.
- Người dùng bị kẹt lại trong hệ thống, bấm nút Đăng xuất bao nhiêu lần cũng không thoát ra được vì không có mạng!

**✅ Cách viết Đăng xuất chuẩn với `onSettled`:**
```tsx
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient('users/logout', { method: 'POST' }),
        onSettled: () => {
            // Bất kể API có gọi được hay không (thành công hay rớt mạng), 
            // Vẫn phải xóa dữ liệu nội bộ và đá văng người dùng ra ngoài.
            useAuthStore.getState().logout();
            queryClient.clear(); // Xóa sạch bộ nhớ đệm cache
            window.location.href = '/login'; // Ép tải lại trang (Hard Reload)
        }
    });
};
```

---

## Truy vấn dữ liệu với useQuery

### Khái niệm

`useQuery` dùng để **đọc (GET) dữ liệu** từ server. Khác với `useMutation` (phải gọi `mutate()` thủ công), `useQuery` **tự động fetch khi component mount** và quản lý cache.

### Các tham số chính

| Tham số | Ý nghĩa |
|---|---|
| `queryKey` | Mảng định danh duy nhất cho query — TanStack dùng key này để cache và invalidate |
| `queryFn` | Hàm async thực hiện HTTP request — return data |
| `staleTime` | Bao lâu data được coi là "fresh" — không refetch trong khoảng này (mặc định `0`) |
| `enabled` | Boolean — `false` sẽ disable query, không fetch (hữu ích khi chờ điều kiện) |

### Các giá trị trả về

| Giá trị | Ý nghĩa |
|---|---|
| `data` | Dữ liệu trả về từ `queryFn` — `undefined` khi chưa có |
| `isPending` | `true` khi đang fetch lần đầu (chưa có data trong cache) |
| `isError` | `true` khi request lỗi |
| `error` | Object lỗi (khi `isError === true`) |
| `isFetching` | `true` khi đang fetch (kể cả background refetch) |
| `refetch` | Hàm gọi thủ công để fetch lại |

### Ví dụ code

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

### `queryKey` — cache key quan trọng

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

### `enabled` — fetch có điều kiện

```typescript
// Chỉ fetch course detail khi có slug
const { data: course } = useQuery({
  queryKey: ['course', slug],
  queryFn: () => getCourseBySlug(slug),
  enabled: !!slug,  // ← false nếu slug là undefined → không fetch
});
```

### So sánh: `useEffect + useState` vs `useQuery`

```tsx
// ❌ Pattern cũ — phải tự quản lý mọi thứ
const [courses, setCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetchCourses()
    .then(data => setCourses(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, [page]);

// ✅ useQuery — tất cả được quản lý sẵn
const { data: courses = [], isPending, isError, error } = useGetAllCourses();
```

| Vấn đề | `useEffect + useState` | `useQuery` |
|---|---|---|
| Loading/Error state | Tự quản lý 3 state | Có sẵn `isPending`, `isError` |
| Cache | Không có — mỗi lần mount fetch lại | Tự cache theo `queryKey` |
| Navigate đi rồi quay lại | Fetch lại từ đầu | Trả cache ngay, background refetch |
| Race condition | Phải tự xử lý cleanup | Đã handle sẵn |
| Retry khi lỗi | Tự viết | Tự retry 3 lần (configurable) |
| Code lines | ~10-15 lines | ~3-5 lines |

---

## useQuery vs useMutation — Khi nào dùng cái nào

| | `useQuery` | `useMutation` |
|---|---|---|
| **Mục đích** | **Đọc** data (GET) | **Thay đổi** data (POST/PUT/DELETE) |
| **Tự fetch khi mount** | ✅ Có | ❌ Không — phải gọi `mutate()` |
| **Cache** | ✅ Có (theo `queryKey`) | ❌ Không |
| **Ví dụ** | Lấy danh sách course, lấy user info | Login, tạo course, xóa course |
| **Trigger** | Tự động | Thủ công (gọi `mutate()`) |

### Lỗi thường gặp: dùng `useMutation` để GET data

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

### Quy tắc quyết định nhanh

```
User click → gửi data lên server → thay đổi state server
  → useMutation (login, signup, create course, delete, update)

Component mount → cần hiển thị data từ server → đọc
  → useQuery (list courses, course detail, user profile)
```

---

## Vai trò của queryClient.setQueryData và queryClient.clear

Mặc dù đôi khi việc xóa hai lệnh này không gây ra lỗi ngay lập tức (đặc biệt khi dùng `window.location.href` để hard-reload trang), chúng đóng vai trò cực kỳ quan trọng về **Hiệu năng (Performance)** và **Bảo mật (Security)** trong ứng dụng SPA.

### `queryClient.setQueryData` (Dùng khi Login)
Khi đăng nhập thành công, server trả về thông tin user. Thay vì để component Dashboard tự gọi API lần nữa qua `useQuery(['currentUser'])`, ta ép dữ liệu vào cache ngay lập tức:
```typescript
queryClient.setQueryData(['currentUser'], result)
```
- **Tác dụng:** Component sẽ lấy data từ Cache dùng luôn (Zero-loading state) → Trải nghiệm mượt mà, tiết kiệm 1 request thừa lên server.

### `queryClient.clear()` (Dùng khi Logout)
Khi user bấm đăng xuất, bắt buộc phải xóa sạch Cache:
```typescript
queryClient.clear()
```
- **Tác dụng:** Tránh rò rỉ dữ liệu (Data Leakage). Nếu không clear, người dùng B đăng nhập vào cùng trình duyệt (mà không hard-reload) có thể nhìn thấy dữ liệu nhạy cảm (khóa học đã mua, thẻ tín dụng...) của người dùng A lưu trong Cache.

---

## Thứ tự viết `queryKey` và `queryFn`

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

**Tại sao convention luôn là viết `queryKey` trước?**
- Vì lý do **Clean Code & Readability**. 
- `queryKey` đóng vai trò là "Định danh / Tên gọi" (Cái này là cái gì?), còn `queryFn` là "Hành động" (Làm sao để lấy được nó?). Tư duy đọc code tự nhiên là đọc Tên trước rồi mới xem Cách thức hoạt động sau, giúp code dễ bảo trì hơn.

---

## 🔗 References
- [TanStack Query Official Documentation](https://tanstack.com/query/v5)
- [Practical React Query — TkDodo blog series](https://tkdodo.eu/blog/practical-react-query)
- [useQuery API reference](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery)
- Related notes: [[kien-truc-api-va-validation]]
- Module liên quan: M6 (migrate sang TanStack Query)

