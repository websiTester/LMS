---
tags: [react, react-router, navigation, redirect, routing]
related: [forms, goi-api-voi-fetch]
module_refs: [M1, M2]
---

# Điều hướng trang (Navigate & Redirect) trong React Router

> Hướng dẫn các phương pháp chuyển trang (navigation) và chuyển hướng (redirection) sau khi thực hiện hành động (như đăng nhập, đăng ký thành công) hoặc bảo vệ tuyến đường (Route Guard) sử dụng React Router v6 & v7.

---

## Sử dụng Hook `useNavigate` (Imperative Navigation)

### Khái niệm
`useNavigate` là hook phổ biến nhất dùng để chuyển hướng theo cách lập trình (imperative). Bạn gọi hàm điều hướng này bên trong các trình xử lý sự kiện (event handler) hoặc sau khi hoàn thành một tác vụ bất đồng bộ (như đợi API trả về kết quả đăng nhập thành công).

### Ví dụ code
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/login', { /*...*/ });
      if (response.ok) {
        // 1. Chuyển hướng sang trang Dashboard
        navigate('/dashboard');
        
        // HOẶC: Chuyển hướng và thay thế trang hiện tại trong lịch sử (History Stack)
        // navigate('/dashboard', { replace: true });
        
        // HOẶC: Chuyển hướng kèm theo dữ liệu (State)
        // navigate('/dashboard', { state: { fromLogin: true } });
      }
    } catch (err) {
      setError('Đăng nhập thất bại');
    }
  };

  return <button onClick={handleLogin}>Đăng nhập</button>;
}
```

### Common pitfall
- **Gọi `useNavigate` ngoài component**: Hook này chỉ hoạt động bên trong một component là con của `<BrowserRouter>` hoặc `<RouterProvider>`. Nếu gọi ở file JS/TS thuần (ví dụ: file cấu hình API Axios/Fetch), React sẽ báo lỗi.
- **Lạm dụng history stack**: Mặc định, `navigate('/path')` sẽ đẩy trang mới vào history stack. Khi người dùng đăng nhập thành công, bạn nên dùng `{ replace: true }` để họ không thể nhấn nút Back của trình duyệt để quay lại trang Login nữa.

### Khi nào dùng
Dùng sau các hành động của người dùng (User Actions) như: click nút, submit form, gọi API thành công, hoặc xử lý logic điều hướng trong `useEffect`.

### ⚠️ Lưu ý lịch sử: `useNavigate` (v6/v7) vs `useHistory` (v5)
Nếu bạn đọc các tài liệu cũ hoặc bài viết hướng dẫn trên mạng viết cho React Router v5, bạn sẽ thấy sự xuất hiện của hook `useHistory`. Tuy nhiên:
- **`useHistory` đã bị KHAI TỬ hoàn toàn** kể từ React Router v6 (và tiếp tục trong v7).
- **`useNavigate` là sự thay thế trực tiếp** với cú pháp được thiết kế tối giản và trực quan hơn.

Bảng ánh xạ cú pháp chuyển đổi từ `useHistory` sang `useNavigate`:

| Thao tác điều hướng | React Router v5 (`useHistory`) | React Router v6 & v7 (`useNavigate`) |
| :--- | :--- | :--- |
| **Khởi tạo** | `const history = useHistory();` | `const navigate = useNavigate();` |
| **Chuyển trang (Push)** | `history.push('/dashboard');` | `navigate('/dashboard');` |
| **Đè trang hiện tại (Replace)** | `history.replace('/dashboard');` | `navigate('/dashboard', { replace: true });` |
| **Quay lại trang trước** | `history.goBack();` | `navigate(-1);` |
| **Đi tới trang tiếp theo** | `history.goForward();` | `navigate(1);` |
| **Đi tới/lùi N trang** | `history.go(n);` | `navigate(n);` |

---


## Sử dụng Component `<Navigate />` (Declarative Navigation)

### Khái niệm
`<Navigate />` là cách chuyển hướng khai báo (declarative). Khi component này được render, React Router sẽ lập tức chuyển hướng người dùng sang trang khác. Phương pháp này thường được dùng nhiều nhất để viết các Route Guard (bảo vệ tuyến đường) hoặc phân quyền người dùng.

### Ví dụ code
```tsx
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: JSX.Element;
  isAuthenticated: boolean;
}

// Route Guard kiểm tra quyền đăng nhập
function RequireAuth({ children, isAuthenticated }: RequireAuthProps) {
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, lập tức chuyển hướng về trang /login
    // replace={true} để đè trang hiện tại trong lịch sử trình duyệt
    return <Navigate to="/login" replace={true} />;
  }

  return children;
}
```

### Common pitfall
- Quên thuộc tính `replace={true}` dẫn đến việc tạo ra một vòng lặp chuyển hướng vô hạn khi người dùng cố bấm nút Back trên trình duyệt để quay lại.

### Khi nào dùng
Dùng để bảo vệ router (Route Guards), kiểm tra phân quyền người dùng (ví dụ: chỉ Admin mới được vào trang `/admin`, nếu không thì redirect về `/`).

---

## Pattern Thực Tế: Role-based Routing với Zustand (Protected Route)

### Khái niệm
Trong các dự án thực tế, thay vì dùng React Context (gây ra Provider hell và khó dùng ngoài React component), người ta thường kết hợp **Zustand** để lưu trữ thông tin Auth/Role và **React Router (`<Navigate />`)** để làm Guard Component chặn cửa.

```
npm install zustand
```

### Cách triển khai
**Bước 1: Zustand Store chỉ lưu trữ dữ liệu (Không điều hướng)**
```tsx
// store/authStore.ts
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // VD: { id: 1, role: 'STUDENT' }
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null })
}));
```

**Bước 2: Guard Component (ProtectedRoute) kiểm tra quyền**
```tsx
// components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const user = useAuthStore((state) => state.user);

  // 1. Chưa đăng nhập -> Đá ra trang Login
  if (!user) return <Navigate to="/login" replace />;

  // 2. Không đủ quyền -> Đá ra trang 403 Unauthorized
  if (!allowedRoles.includes(user.role)) return <Navigate to="/403-unauthorized" replace />;

  // 3. Đủ quyền -> Cho phép hiển thị các Route con bên trong (Outlet)
  return <Outlet />;
};
```

**Bước 3: Khai báo Router gọn gàng (Không có Provider Hell)**
```tsx
// App.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* VÙNG PROTECTED: Chỉ học viên và giảng viên */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR']} />}>
        <Route path="/my-courses" element={<MyCourses />} />
      </Route>

      {/* VÙNG ADMIN: Chỉ Admin mới được vào */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
```

---

## Pattern Thực Tế: Guest Route (Chặn quay lại trang Login)

### Khái niệm
Ngược lại với `ProtectedRoute` (chặn người chưa đăng nhập), `GuestRoute` (hoặc PublicRoute, AuthRoute) dùng để **chặn những người ĐÃ đăng nhập** quay lại các trang dành cho khách như `/login`, `/register`. Nếu họ cố tình truy cập, ta sẽ đẩy họ về trang chủ hoặc dashboard.

### Cách triển khai

**Bước 1: Tạo GuestRoute Component**
```tsx
// components/GuestRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const GuestRoute = () => {
  const user = useAuthStore((state) => state.user);

  // Nếu ĐÃ đăng nhập -> Đá về trang chủ (dùng replace để chặn nút Back)
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Nếu CHƯA đăng nhập -> Cho phép hiển thị component con (Login/Register)
  return <Outlet />;
};
```

**Bước 2: Gắn vào Router**
Dùng `<GuestRoute>` để bọc nhóm các trang Auth.

```tsx
// App.tsx
import { Routes, Route } from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* 1. VÙNG PUBLIC CHO KHÁCH: Chặn người đã login */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 2. VÙNG PROTECTED: Chặn người chưa login */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/my-courses" element={<MyCourses />} />
      </Route>
    </Routes>
  );
}
```

### 🐞 Common Pitfall: Lỗi Xung Đột Điều Hướng (Race Condition)

**Hiện tượng:** Sau khi đăng nhập thành công, hệ thống có gọi lệnh `navigate` đến `/admin/dashboard` nhưng ngay lập tức lại bị đẩy ngược về trang chủ `/`.

**Nguyên nhân (Race Condition):** 
1. Ở màn hình `<Login>`, ngay sau khi API trả về thành công, bạn cập nhật State của Zustand (gọi hàm `setAuthUser`).
2. Do `<Login>` nằm trong `<GuestRoute>`, việc thay đổi Zustand làm `<GuestRoute>` lập tức bị kích hoạt re-render.
3. `<GuestRoute>` phát hiện đã có `user` (state khác null), nên nó chạy vào lệnh: `return <Navigate to="/" replace />`.
4. Cùng lúc đó, tại trang Login, bạn cũng có gọi lệnh `navigate('/admin/dashboard')`.
5. **Hệ quả:** Lệnh chuyển hướng của Component `<Navigate>` ghi đè lên lệnh `navigate()` của bạn, kéo thẳng user về trang `/`.

**✅ Cách khắc phục:**
Nguyên tắc chuẩn: **Chỉ để một nơi chịu trách nhiệm chuyển trang.**
1. **Tại GuestRoute:** Cho phép nó đọc Role và đẩy user về đúng trang dashboard thay vì fix cứng là `/`.
```tsx
// Trong GuestRoute.tsx
if (user) {
  return <Navigate to={getDashboardByRole(user.role)} replace />;
}
```
2. **Tại trang Login:** Xoá bỏ hoàn toàn câu lệnh `navigate(...)` bên trong phần xử lý thành công, chỉ cần giữ lại logic lưu dữ liệu vào Zustand. Khi đó `GuestRoute` sẽ tự động nhận state mới và làm nốt nhiệm vụ đẩy người dùng đi.

---

## Sử dụng `redirect` trong Loader / Action (Data Router API - Chuẩn V6/V7)

### Khái niệm
Trong các phiên bản React Router mới (v6 & v7) sử dụng `RouterProvider` và Data Routers, bạn định nghĩa các hàm `loader` (chạy trước khi trang render để nạp dữ liệu) hoặc `action` (chạy khi submit form). 
Bạn có thể sử dụng hàm `redirect()` của React Router để chuyển hướng người dùng ngay tại các hàm này trước khi component kịp hiển thị, tối ưu hóa hiệu năng và trải nghiệm người dùng.

### Ví dụ code
```tsx
// router.tsx hoặc trong cấu hình route định nghĩa loader
import { redirect } from 'react-router-dom';

// Loader kiểm tra quyền truy cập trước khi tải trang Dashboard
export async function dashboardLoader() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Chuyển hướng người dùng về trang login ở tầng route loader
    return redirect('/login');
  }
  
  return null; // Cho phép truy cập
}
```

### Khi nào dùng
Dùng khi dự án của bạn sử dụng cấu trúc Data Router mới của React Router (`createBrowserRouter`), giúp chặn người dùng không hợp lệ ngay tại tầng định tuyến trước khi component được mount.

---

## Chuyển hướng ngoài hệ thống bằng `window.location` (Native Web API)

### Khái niệm
Khi bạn muốn chuyển hướng người dùng ra ngoài ứng dụng Single Page Application (SPA) của bạn (ví dụ: sang cổng thanh toán VNPay, MoMo, hoặc trang chủ của một đối tác bên thứ ba), các API nội bộ của React Router sẽ không hoạt động. Lúc này bạn phải sử dụng đối tượng `window.location` của trình duyệt.

### Ví dụ code
```tsx
const handlePayment = async () => {
  const response = await fetch('http://localhost:8000/payment/create', { method: 'POST' });
  const data = await response.json();
  
  if (response.ok && data.paymentUrl) {
    // Điều hướng sang cổng thanh toán bên thứ ba (VNPay/MoMo)
    window.location.href = data.paymentUrl;
    
    // HOẶC: Đè trang hiện tại để người dùng không bấm back quay lại
    // window.location.replace(data.paymentUrl);
  }
};
```

### Common pitfall
- **Tải lại trang không cần thiết**: Sử dụng `window.location.href = "/dashboard"` cho các trang nội bộ của React sẽ khiến toàn bộ trang web bị tải lại từ đầu (Hard Reload), làm mất đi trạng thái (state) hiện có và lợi thế mượt mà của ứng dụng SPA. Chỉ dùng thuộc tính này cho các link ngoài hệ thống.

### Khi nào dùng
Dùng khi chuyển hướng sang tên miền (domain) khác ngoài hệ thống React, hoặc khi bắt buộc phải tải lại toàn bộ trang web để reset sạch state.

---

## Kỹ thuật Nested Routing với `<Outlet />`

### Khái niệm
`<Outlet />` là một component của React Router dùng để làm "khung hình trống" (placeholder) bên trong một component cha. Nó cho phép React Router "nhét" các component con tương ứng với URL hiện tại vào vị trí đó. Kỹ thuật này được gọi là **Nested Routing** (Route lồng nhau).

Trong thực tế doanh nghiệp, 100% các hệ thống có Sidebar/Header cố định (như Admin Dashboard) đều sử dụng pattern này để điều hướng thay vì dùng `useState` ẩn/hiện nội dung, nhằm đảm bảo mỗi trang có 1 URL độc lập, hỗ trợ nút Back/Forward của trình duyệt và chia sẻ link.

### Ví dụ code (Tạo Layout)
Đây là cách phổ biến nhất để tạo một Layout có thanh Sidebar cố định, chỉ thay đổi nội dung ở giữa:

**Bước 1: Khai báo Layout Component chứa `<Outlet />`**
```tsx
import { Outlet, NavLink } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="flex">
      {/* Sidebar luôn cố định không thay đổi */}
      <aside className="w-64">
        {/* Dùng NavLink để tự highlight menu đang chọn */}
        <NavLink 
          to="/admin/users"
          className={({ isActive }) => isActive ? 'bg-blue-600 text-white' : 'text-gray-300'}
        >
          User Management
        </NavLink>
      </aside> 
      
      <main className="flex-1 p-4">
        {/* NỘI DUNG ĐỘNG: Các component con sẽ được render vào đây */}
        <Outlet /> 
      </main>
    </div>
  );
}
```

**Bước 2: Lồng Route con vào trong Route cha**
```tsx
// App.tsx
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      {/* Route cha */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Các Route con: khi gõ /admin/users, <Outlet> sẽ biến thành <UserList> */}
        <Route path="users" element={<UserList />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

### Khi nào dùng
- Xây dựng **Layout** (bố cục màn hình) có các phần cố định như Header, Sidebar, Footer và nội dung động ở giữa.
- Khi viết các **Route Guard** (`ProtectedRoute`, `GuestRoute`). Khi Component Guard xác nhận người dùng đủ điều kiện, nó sẽ `return <Outlet />` để cho phép các component con hiển thị.

---

## Truyền dữ liệu từ Route Cha xuống Route Con trong Nested Routing

Khi cấu trúc lồng nhau phức tạp, Route con thường cần sử dụng dữ liệu từ Route cha. Có 2 cách tiêu chuẩn để thực hiện việc này:

### Cách 1: Qua tham số URL (`useParams`)
Dùng khi tham số truyền xuống mang tính **định danh** (như `id`, `slug`).

**Khai báo:** Đặt tham số trên URL của Route cha.
```tsx
<Route path="/courses/:courseId" element={<CourseDetailLayout />}>
  <Route path="students" element={<CourseStudents />} />
</Route>
```

**Sử dụng ở Route con:** Bất kỳ subroute nào lồng bên trong cũng có thể bắt được param của cha thông qua hook `useParams`.
```tsx
import { useParams } from 'react-router-dom';

const CourseStudents = () => {
  const { courseId } = useParams();
  return <div>Đang xem học viên của khóa: {courseId}</div>;
};
```

### Cách 2: Qua Component Context (`useOutletContext`)
Dùng khi bạn muốn truyền một khối **dữ liệu phức tạp** (Objects, Array, State, Functions) mà Route cha đã fetch xong, để Route con không phải gọi lại API gây lãng phí.

**Truyền ở Route cha:** Sử dụng thuộc tính `context` của thẻ `<Outlet />`.
```tsx
import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const CourseDetailLayout = () => {
  const { courseId } = useParams();
  const { data: courseInfo, isLoading } = useQuery({ /* ... */ });

  if (isLoading) return <Loading />;

  return (
    <div>
      {/* Bơm data phức tạp xuống các Route con */}
      <Outlet context={{ courseInfo, isEditing: true }} />
    </div>
  );
};
```

**Hứng ở Route con:** Sử dụng hook `useOutletContext`.
```tsx
import { useOutletContext } from 'react-router-dom';

type ContextType = {
  courseInfo: { id: string; title: string };
  isEditing: boolean;
};

const CourseSettings = () => {
  const { courseInfo, isEditing } = useOutletContext<ContextType>();
  return <input defaultValue={courseInfo.title} disabled={!isEditing} />;
};
```

> **💡 Lưu ý quan trọng về bản chất của `useOutletContext`:**
> - Trái với suy nghĩ "Nested routing thì con KHÔNG ĐƯỢC phụ thuộc vào cha", thực tế con phụ thuộc vào cha rất thường xuyên, nhưng chúng giao tiếp qua `<Outlet />` thay vì Props truyền thống.
> - Khi cha khai báo `<Outlet context={{ data }} />`, nó đóng vai trò như một đài phát thanh (broadcaster). Nó "phát công khai" gói dữ liệu này cho **tất cả các Component con** lồng bên trong.
> - Quyền quyết định nằm ở Component con: Nếu con CẦN dùng, nó gọi `useOutletContext()` để lấy data. Nếu con KHÔNG CẦN, nó cứ phớt lờ đi và không cần gọi hook này, hoàn toàn không gây ra lỗi hay bị ảnh hưởng gì.

---

## 🔗 References
- [React Router - useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [React Router - Navigate Component](https://reactrouter.com/en/main/components/navigate)
- [React Router - redirect](https://reactrouter.com/en/main/fetch/redirect)
- Module liên quan: M1 (Setup Route), M2 (Đăng nhập chuyển hướng), M12 (Redirect cổng thanh toán VNPay)
- Related notes: [[goi-api-voi-fetch]], [[forms]]
