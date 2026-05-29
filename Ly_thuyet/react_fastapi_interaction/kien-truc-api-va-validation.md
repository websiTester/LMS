---
tags: [architecture, api, validation, fetch, react, zod, tanstack-query]
related: [goi-api-voi-fetch, tanstack-query, destructuring-va-rest-operator]
module_refs: [M2, M6, M24]
---

# Kiến Trúc Gọi API và Validation Chuẩn Doanh Nghiệp

> Hướng dẫn thiết kế cấu trúc gọi API (Data Fetching Layer) và kiểm tra dữ liệu (Validation Layer) theo mô hình hướng tính năng (Feature-based Architecture), sử dụng Native Fetch API kết hợp Zod và TanStack Query.

---

## Tổng Quan Kiến Trúc Hệ Thống ở Frontend

### Khái niệm
Trong các dự án thực tế lớn, việc gọi API trực tiếp trong component UI gây khó khăn cho việc bảo trì, tái sử dụng và kiểm thử (testing). Kiến trúc Frontend chuẩn chia tách ứng dụng thành các lớp (layers) với nhiệm vụ riêng biệt:

1. **Layer 1 - API Client Wrapper (Tập trung)**: Quản lý baseURL, headers mặc định, đính kèm credentials và xử lý lỗi/token refresh tập trung.
2. **Layer 2 - Feature Schemas & Pure API Requests (Hướng tính năng)**: Khai báo Zod schemas để validate dữ liệu đầu vào và các hàm async request thuần (không chứa state của UI).
3. **Layer 3 - Server State Manager (TanStack Query)**: Quản lý trạng thái bất đồng bộ (loading, error, caching, mutations) thông qua custom hooks.

---

## Layer 1: API Client (Tập trung)

### Khái niệm
Tạo một Custom Fetch Wrapper thay vì dùng `fetch` trực tiếp để cấu hình các thiết lập dùng chung cho toàn bộ ứng dụng và intercept response để chuẩn hóa định dạng lỗi trả về từ Backend (FastAPI).

### Ví dụ code
Tạo tại `apps/web/src/shared/lib/api-client.ts`:
```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface CustomFetchOptions extends RequestInit {
  params?: Record<string, string>; // Hỗ trợ truyền query params dạng object
}

export const apiClient = async (endpoint: string, options: CustomFetchOptions = {}) => {
  const { params, headers, ...restOptions } = options;

  // Tự động gộp query parameters vào URL
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Header mặc định cho các JSON request
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config: RequestInit = {
    ...restOptions,
    headers: defaultHeaders,
    credentials: 'include', // Gửi kèm httpOnly cookie (JWT) cho các request CORS
  };

  const response = await fetch(url, config);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null; // Tránh crash khi response rỗng (ví dụ: HTTP 204)
  }

  if (!response.ok) {
    // Chuẩn hóa format lỗi từ backend FastAPI (thường nằm ở detail hoặc message)
    const errorMessage = data?.detail || data?.message || 'Đã có lỗi xảy ra';
    throw new Error(errorMessage);
  }

  return data;
};
```

---

## Layer 2: Feature Schemas & API Requests

### Khái niệm
Mỗi Domain Feature (ví dụ: `auth`, `course`) sẽ tự quản lý Zod Schema validate form và định nghĩa các hàm gọi API thuần túy trong thư mục của nó.

### Ví dụ code
Khai báo Schemas tại `apps/web/src/features/auth/schemas.ts`:
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

// Sinh ra TypeScript type tự động từ Zod Schema để đảm bảo Type-safe
export type LoginFormData = z.infer<typeof loginSchema>;
```

Định nghĩa API request tại `apps/web/src/features/auth/api.ts`:
```typescript
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { LoginFormData } from './schemas';

// Hàm gọi API thuần túy (Pure Function) không phụ thuộc vào React hook hay UI state
export const loginRequest = async (data: LoginFormData) => {
  return apiClient('/users/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
```

---

## Layer 3: Tích hợp Server State (TanStack Query)

### Khái niệm
Sử dụng các Custom Hook của TanStack Query để quản lý cache, loading state, error state và trigger request. Component UI chỉ việc dùng hook này và không cần quan tâm đến logic fetching bên dưới.

### Ví dụ code
Tích hợp Query Mutation Hook vào `apps/web/src/features/auth/api.ts`:
```typescript
// Custom Mutation hook giúp quản lý trạng thái tải/lỗi khi submit form login
export const useLogin = () => {
  return useMutation({
    mutationFn: loginRequest,
  });
};
```

Sử dụng trong React Component (`apps/web/src/features/auth/components/LoginForm.tsx`):
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginSchema, LoginFormData, useLogin } from '@/features/auth';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // Validate form Client-side bằng Zod Schema
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    setApiError(null);
    login(data, {
      onSuccess: (result) => {
        // Redirect học viên sang Dashboard sau khi login thành công
        navigate('/student/dashboard');
      },
      onError: (error: any) => {
        // Nhận error message đã được apiClient chuẩn hóa tự động
        setApiError(error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Render input fields... */}
    </form>
  );
};
```

---

## Lộ Trình Áp Dụng Theo Roadmap

- **Phase 1 (M1-M3)**: Phân tách cấu trúc folder theo dạng module/feature. Tách biệt file `schemas.ts` và `api.ts` ra khỏi UI components.
- **Phase 2 (M6 - TanStack Query Migration)**: Refactor toàn bộ data fetching sang custom query hooks của TanStack Query.
- **Phase 7 (M24 - Monorepo Setup)**:
  * Di chuyển các schema trong `features/*/schemas.ts` ra package dùng chung `packages/schemas/`.
  * Di chuyển `api-client` ra package `packages/api-client/` để chia sẻ sử dụng chung giữa Web (React) và Mobile (React Native + Expo).

---

## 🔗 References
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Zod Documentation](https://zod.dev/)
- [[goi-api-voi-fetch]]
- [[tanstack-query]]
- [[destructuring-va-rest-operator]]
