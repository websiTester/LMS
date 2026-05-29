---
tags: [auth, jwt, state, zustand, react-query]
module_refs: [M2]
---

# Xác thực người dùng khi khởi tạo ứng dụng (Strict & Secure Flow)

> Hướng dẫn thiết lập luồng kiểm tra trạng thái đăng nhập (gọi API `/users/me`) ngay khi React khởi chạy, giúp đảm bảo tính bảo mật và đồng bộ 100% với Backend.

---

## Vấn đề cần giải quyết

Khi sử dụng **HttpOnly Cookie** để lưu trữ JWT (Access Token), Frontend (React) hoàn toàn bị "mù" và không thể đọc được nội dung cookie này. 
Do đó, khi người dùng nhấn **F5 (Tải lại trang)** hoặc mở trang web lần đầu, State của Zustand bị reset về `null`, dẫn đến việc UI tưởng rằng người dùng chưa đăng nhập.

Cách dùng Zustand `persist` (lưu state vào localStorage) là một giải pháp tình thế giúp UI hiển thị nhanh, nhưng lại có rủi ro: Nếu Token dưới Backend đã hết hạn, UI vẫn tin là người dùng đang đăng nhập cho tới khi họ thực hiện một Action gọi API.

## Giải pháp: Gọi API `/me` khi khởi động (Strict & Secure)

### Khái niệm
Chúng ta sẽ gọi API `GET /users/me` ngay lập tức khi ứng dụng React vừa Mount (trong `App.tsx` hoặc 1 Component bọc ngoài cùng). 
- **Nếu API thành công (200 OK):** Trả về thông tin user → Ta đưa thông tin này vào Zustand (`useAuthStore`).
- **Nếu API thất bại (401 Unauthorized):** Token không có hoặc đã hết hạn → Ta set user thành `null` và điều hướng hợp lý.
- **Trong lúc gọi API:** Hiển thị một màn hình Loading toàn trang để block UI, ngăn người dùng tương tác cho đến khi biết chắc họ là ai.

### Ví dụ code

#### 1. Định nghĩa API gọi `/me`
Trong file API của Auth (vd: `src/features/auth/api.ts`):

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/lib/api-client';

// Định nghĩa hàm fetch
export const getMeRequest = async () => {
    return apiClient('users/me', {
        method: 'GET',
    });
};

// Custom Hook kết hợp TanStack Query
export const useGetMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMeRequest,
        retry: 0, // Quan trọng: Không retry nếu bị lỗi (vd: 401 Unauthorized)
        staleTime: 5 * 60 * 1000, // Tùy chọn: cache lại trong 5 phút
    });
};
```

#### 2. Component bọc ngoài để Auth Initialization (`InitAuth.tsx`)

Trong thực tế, người ta thường dùng một Component bọc lại các Route. Nếu bạn không muốn thay đổi Zustand (đã bỏ `persist`), bạn lấy data truyền thẳng vào Zustand tại đây:

```tsx
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGetMe } from '../../features/auth/api';
import { useAuthStore } from '../store/authStore';

const InitAuth = () => {
    const { data: user, isLoading, isError } = useGetMe();
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    // Đồng bộ data từ API vào Zustand store
    useEffect(() => {
        if (user) {
            login(user);
        }
        if (isError) {
            logout(); // Đảm bảo clear state nếu token lỗi
        }
    }, [user, isError, login, logout]);

    // Chặn UI khi đang kiểm tra API
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <span>Đang tải dữ liệu người dùng...</span>
            </div>
        );
    }

    // Sau khi check xong thì mới render các Route bên trong
    return <Outlet />;
};

export default InitAuth;
```

#### 3. Cấu hình vào Router
Sử dụng `InitAuth` làm Route bọc ngoài cùng tất cả các tuyến đường.

```tsx
// src/App.tsx
import InitAuth from './shared/components/InitAuth';

function App() {
  return (
    <Routes>
      {/* Route InitAuth sẽ load đầu tiên và block giao diện */}
      <Route element={<InitAuth />}>
        
        {/* Public routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

      </Route>
    </Routes>
  );
}
```

### Common pitfall
- **Không block UI khi Loading:** Nếu bạn không có lệnh `if (isLoading) return <Loading />`, các Component con (như `GuestRoute` hay `ProtectedRoute`) sẽ chạy *trước* khi API `/me` kịp hoàn thành. Lúc đó `user` trong Zustand vẫn đang là `null`, dẫn đến việc hệ thống redirect sai bét (ví dụ: đã đăng nhập nhưng vẫn bị đá ra trang login).
- **Để React Query Retry lỗi 401:** Mặc định TanStack Query sẽ retry lại request 3 lần nếu API lỗi. Việc API `/me` trả lỗi 401 là rất bình thường (vì người dùng chưa login hoặc token hết hạn), bạn phải set cấu hình `retry: 0` để request rớt ngay lập tức.

### Khi nào dùng
- Luôn luôn khuyên dùng cho các ứng dụng có yêu cầu bảo mật cao, hệ thống SaaS, LMS, hoặc các trang nội bộ doanh nghiệp. 
- Giúp đồng bộ trạng thái User với Backend chính xác tuyệt đối ngay tại thời điểm tải trang.

---

## 🔗 References
- Module liên quan: M2 (Auth)
- Related notes: [[dieu-huong-theo-role]]
