# Context API

> Quản lý và chia sẻ state toàn cục (global state) cho các component trong React mà không cần truyền props qua từng cấp (prop drilling).

---

## Khái niệm cơ bản

### Khái niệm
Context API cho phép chúng ta chia sẻ những dữ liệu được coi là "global" (toàn cục) đối với một cây các component React, ví dụ như: thông tin người dùng đang đăng nhập (user authentication), theme (dark/light), hoặc ngôn ngữ hiện tại.

Nó bao gồm 2 phần chính:
- **Provider**: Component bọc ngoài cùng, đóng vai trò cung cấp giá trị context.
- **Consumer** (thường dùng hook `useContext`): Nơi tiêu thụ và sử dụng giá trị context đó.

### Ví dụ code
```tsx
import { createContext, useContext, useState } from 'react';

// 1. Tạo Context với giá trị mặc định là 'light'
const ThemeContext = createContext('light');

export default function App() {
  const [theme, setTheme] = useState('light');

  return (
    // 2. Bọc các component con vào Provider và truyền value
    <ThemeContext.Provider value={theme}>
      <div className={theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}>
        <h1>Demo createContext</h1>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Đổi Theme
        </button>
        
        {/* Component này nằm tuốt bên trong, không cần nhận props */}
        <ChildComponent />
      </div>
    </ThemeContext.Provider>
  );
}

function ChildComponent() {
  return <GrandChildComponent />;
}

function GrandChildComponent() {
  // 3. Lấy giá trị trực tiếp từ Context, bỏ qua ChildComponent
  const currentTheme = useContext(ThemeContext);
  
  return (
    <p>Theme hiện tại đang là: <strong>{currentTheme}</strong></p>
  );
}
```

### Common pitfall

- **Lỗi `useContext must be used within a Provider`**: Xảy ra khi một component gọi hook (ví dụ: `useAuth()`) nhưng component đó **không nằm bên trong (không phải là con của)** component `AuthProvider`. 
  - **Cách fix**: Đảm bảo bọc component đang gọi hook vào bên trong `AuthProvider` ở file root (như `main.tsx` hoặc `providers.tsx`).
  - **Lưu ý thứ tự bọc (Provider Ordering)**: Nếu `AuthProvider` của bạn có sử dụng TanStack Query (gọi API bằng `useQuery`), thì `AuthProvider` BẮT BUỘC phải được đặt vào **bên trong** `QueryClientProvider`.

```tsx
// ❌ SAI: GuestRoute/App nằm ngoài AuthProvider
<AuthProvider />
<App /> // Bất kỳ component nào trong App gọi useAuth() sẽ văng lỗi

// ✅ ĐÚNG:
<QueryClientProvider client={queryClient}>
    <AuthProvider>
        <App /> {/* Hoạt động hoàn hảo */}
    </AuthProvider>
</QueryClientProvider>
```

---

## So sánh Context API và Zustand

Mặc dù cùng giải quyết vấn đề chia sẻ state toàn cục (tránh prop drilling), **Zustand** thường được ưu tiên hơn Context API trong ứng dụng thực tế vì 3 khác biệt cốt lõi:

### 1. Vấn đề Re-render (Quan trọng nhất)
- **Context API:** Khi một giá trị trong Provider thay đổi, **TẤT CẢ** các component gọi `useContext` đó đều bị re-render, kể cả khi component đó chỉ sử dụng một phần dữ liệu không bị thay đổi.
- **Zustand:** Hỗ trợ "selector". Component chỉ re-render khi chính xác state mà nó chọn bị thay đổi.

### 2. Boilerplate Code (Provider hell)
- **Context API:** Bắt buộc phải có `<Context.Provider>` bọc quanh cây component. Càng nhiều global state (Theme, Auth, Cart,...) thì càng có nhiều Provider lồng nhau tạo thành "Provider hell".
- **Zustand:** **Không cần Provider!** Chỉ cần tạo store trong một file, import hook vào component và dùng trực tiếp. Code sạch và dễ quản lý hơn.

### 3. Dùng bên ngoài React Component
- **Context API:** Bắt buộc gọi bên trong React Component, rất khó truy cập hoặc cập nhật state từ những file không phải React (ví dụ: file cấu hình `axios interceptor`).
- **Zustand:** Store tồn tại độc lập bên ngoài React tree. Có thể dùng `useStore.getState()` và `useStore.setState()` thoải mái ở các file `.ts`/`.js` thông thường.

### Tóm tắt: Khi nào dùng cái nào?
- **Nên dùng Zustand:** Quản lý Global State chính của ứng dụng, các state thay đổi liên tục, thao tác nghiệp vụ phức tạp.
- **Nên dùng Context API:** 
  - Dữ liệu **rất ít thay đổi** (Theme, Ngôn ngữ, Auth User ban đầu).
  - Khi viết **Thư viện (Library)**: Tránh bắt ép người dùng phải cài thêm dependency ngoài.
  - Khi cần **Scoped State**: Tạo nhiều môi trường state khác nhau trên cùng một màn hình (ví dụ: 2 Theme khác nhau bằng cách dùng 2 Provider độc lập).

---

## 🔗 References
- [React Context Docs](https://react.dev/learn/passing-data-deeply-with-context)
- Module liên quan: M2 (Auth)
