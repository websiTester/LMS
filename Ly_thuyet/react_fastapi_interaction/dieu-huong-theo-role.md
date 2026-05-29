---
tags: [auth, role, routing, navigate, react-router, jwt, context]
related: [goi-api-voi-fetch, kien-truc-api-va-validation]
module_refs: [M2, M8, M14]
---

# Điều hướng theo Role sau Login

> Sau khi user login thành công, FE cần biết role (`student`, `teacher`, `admin`) để navigate đúng dashboard. Note này trình bày 3 cấp độ từ đơn giản đến chuẩn doanh nghiệp.

---

## Bối cảnh project

**API login trả về `UserRead` chứa `role`:**

```python
# BE: user/schemas.py
class UserRead(BaseModel):
    id: int
    email: str
    role: Literal["student", "teacher", "admin"]
    is_active: bool
```

**Route structure:**

```
/student/dashboard   ← student
/teacher             ← teacher
/admin               ← admin
```

---

## Cấp 1: Navigate trực tiếp trong `onSuccess` (Đơn giản nhất)

### Cách làm

Sau login thành công, check `role` từ response → navigate:

```tsx
// pages/public/Login.tsx
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../features/auth/api';

export default function Login() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (user) => {
        // Navigate theo role
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          default:
            navigate('/student/dashboard');
        }
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    });
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### Ưu / Nhược

| ✅ Ưu | ❌ Nhược |
|---|---|
| Đơn giản, nhanh, dễ hiểu | Reload trang → mất user info → không biết redirect đi đâu |
| Phù hợp khi đang học | User gõ thẳng URL `/admin` → vào được dù không phải admin |
| Không cần thêm file nào | Logic role lặp lại nếu nhiều nơi cần check |

### Vấn đề chưa giải quyết

1. **Không bảo vệ route** — ai cũng vào được `/admin` bằng cách gõ URL
2. **Reload mất state** — F5 trang → không biết user là ai
3. **Role logic nằm rải rác** — mỗi chỗ cần check role phải viết lại switch/case

---

## Cấp 2: AuthContext + helper navigate (Trung bình)

### Cách làm

Lưu user info vào Context → dùng helper function navigate theo role:

**1. Tạo AuthContext:**

```tsx
// shared/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải dùng trong AuthProvider');
  return context;
};
```

**2. Helper navigate theo role:**

```tsx
// shared/utils/navigation.ts

// Map role → đường dẫn dashboard mặc định
const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student/dashboard',
};

export const getDashboardByRole = (role: string): string => {
  return ROLE_DASHBOARD[role] ?? '/';
};
```

**3. Login dùng AuthContext + helper:**

```tsx
// pages/public/Login.tsx
import { useAuth } from '../../shared/context/AuthContext';
import { getDashboardByRole } from '../../shared/utils/navigation';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { mutate: login } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (user) => {
        setUser(user);                              // Lưu vào context
        navigate(getDashboardByRole(user.role));     // Navigate theo role
      },
    });
  };
}
```

### Ưu / Nhược

| ✅ Ưu | ❌ Nhược |
|---|---|
| User info có sẵn mọi nơi qua `useAuth()` | Reload trang vẫn mất state (Context reset) |
| Logic navigate tập trung 1 chỗ | Chưa bảo vệ route (vẫn vào được bằng URL) |
| Dễ mở rộng thêm role | Cần thêm persist (localStorage hoặc `/me` API) |

---

## Cấp 3: AuthContext + ProtectedRoute + Role Guard (Chuẩn doanh nghiệp)

### Tổng quan flow

```
Login → set JWT cookie → fetch /me → lưu AuthContext → navigate dashboard
  │
  └─ Mọi lần reload → fetch /me → hydrate AuthContext → render đúng route

Route guard:
  /admin/*     → chỉ role admin
  /teacher/*   → chỉ role teacher  
  /student/*   → chỉ role student hoặc teacher/admin
  /login       → chỉ khi CHƯA login (redirect đi nếu đã login)
```

### 1. AuthContext + persist qua `/me` API

```tsx
// shared/context/AuthContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface User {
  id: number;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;         // đang fetch /me (chưa biết user là ai)
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Mỗi lần mount (kể cả reload), tự fetch /me từ JWT cookie
  // Nếu cookie hợp lệ → có user, nếu không → user = null
  const { data: user = null, isLoading } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await apiClient('me', { method: 'GET' });
      } catch {
        return null;   // Chưa login hoặc token expired
      }
    },
    staleTime: 10 * 60 * 1000,   // Cache 10 phút
    retry: false,
  });

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải dùng trong AuthProvider');
  return context;
};
```

**Tại sao dùng `useQuery` fetch `/me` thay vì `useState`?**

| | `useState` (Cấp 2) | `useQuery` fetch `/me` (Cấp 3) |
|---|---|---|
| Reload trang | ❌ Mất state | ✅ Tự fetch lại từ cookie |
| Mở tab mới | ❌ Không có user | ✅ Tự fetch → có user |
| Token hết hạn | Không biết | ✅ `/me` trả 401 → user = null |
| Cache | Không | ✅ Không fetch lại trong 10 phút |

### 2. ProtectedRoute component

```tsx
// shared/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'teacher' | 'admin')[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Đang fetch /me → show loading (tránh flash redirect)
  if (isLoading) {
    return <div>Loading...</div>;  // Hoặc spinner component
  }

  // Chưa login → redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Có login nhưng role không được phép → redirect về dashboard đúng role
  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to={getDashboardByRole(user!.role)} replace />;
  }

  // OK → render children route
  return <Outlet />;
};
```

### 3. GuestRoute (chỉ cho chưa login)

```tsx
// shared/components/GuestRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardByRole } from '../utils/navigation';

export const GuestRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  // Đã login → redirect về dashboard (không cần vào login/signup nữa)
  if (isAuthenticated) {
    return <Navigate to={getDashboardByRole(user!.role)} replace />;
  }

  return <Outlet />;
};
```

### 4. Route setup với guard

```tsx
// App.tsx
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { GuestRoute } from './shared/components/GuestRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — ai cũng vào được */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/coursesList" element={<CourseList />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />

        {/* Guest only — chỉ khi CHƯA login */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Route>

        {/* Student — login + role student */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Teacher — login + role teacher */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
        </Route>

        {/* Admin — login + role admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 5. Login page — navigate sau login

```tsx
// pages/public/Login.tsx
export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: login } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (user) => {
        // Invalidate query 'me' → AuthContext tự update
        queryClient.setQueryData(['me'], user);
        // Navigate theo role
        navigate(getDashboardByRole(user.role));
      },
    });
  };
}
```

### Ưu / Nhược

| ✅ Ưu | ❌ Nhược |
|---|---|
| Route được bảo vệ — gõ URL cũng không vào được | Phức tạp hơn, cần hiểu Context + useQuery |
| Reload trang giữ login (từ JWT cookie) | Cần BE có endpoint `GET /me` |
| Logic role tập trung trong `ProtectedRoute` | Loading state khi fetch `/me` (flash ngắn) |
| Dễ thêm role mới | |
| Đã login thì không vào lại `/login` | |

---

## So sánh 3 cấp độ

| | Cấp 1: onSuccess | Cấp 2: Context + helper | Cấp 3: Context + Guard |
|---|---|---|---|
| **Độ phức tạp** | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Bảo vệ route** | ❌ | ❌ | ✅ |
| **Giữ login khi reload** | ❌ | ❌ | ✅ (qua `/me`) |
| **Block guest vào dashboard** | ❌ | ❌ | ✅ |
| **Block login page khi đã login** | ❌ | ❌ | ✅ |
| **Logic role tập trung** | ❌ | ✅ | ✅ |
| **Khi nào dùng** | Prototype, đang học | Side project | Production |

---

## Lộ trình áp dụng cho project

1. **Hiện tại (M2)**: Bắt đầu từ **Cấp 1** để hiểu flow → chạy được trước
2. **Khi refactor (M3-M4)**: Nâng lên **Cấp 2** — thêm AuthContext + helper
3. **Khi làm teacher/admin dashboard (M8, M14)**: Nâng lên **Cấp 3** — thêm ProtectedRoute + GuestRoute + fetch `/me`

Không cần làm Cấp 3 ngay từ đầu — sẽ phức tạp quá khi chưa hiểu đủ Context + React Router.

---

## ⚠️ Lưu ý bảo mật

> **Route guard ở FE chỉ là UX** — ngăn user nhìn thấy UI không phải của mình. **Bảo mật thật phải ở BE** (check role trong `Depends` trước khi trả data). FE guard dễ bypass bằng DevTools.

```python
# BE: LUÔN check role ở endpoint — đây mới là security thật
async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")
    return current_user

@router.get("/admin/courses/pending")
async def get_pending(admin: User = Depends(require_admin)):
    ...
```

---

## 🔗 References

- [React Router Auth example](https://reactrouter.com/start/library/auth)
- [TanStack Query + Auth pattern](https://tkdodo.eu/blog/react-query-and-auth)
- Module liên quan: M2 (auth), M8 (teacher dashboard — cần role guard), M14 (admin review)
- Related notes: [[kien-truc-api-va-validation]], [[goi-api-voi-fetch]]
