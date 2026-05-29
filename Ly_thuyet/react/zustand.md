# Zustand (Global State Management)

> Thư viện quản lý global state gọn nhẹ, hiệu năng cao, thường được dùng để thay thế Context API trong các dự án thực tế.

---

## Khái niệm cơ bản

### Khái niệm
Zustand (tiếng Đức nghĩa là "Trạng thái") là một thư viện quản lý trạng thái toàn cục (Global State) cho React. Khác với Context API hay Redux, Zustand không yêu cầu bạn phải bọc ứng dụng bằng bất kỳ `<Provider>` nào. Nó sử dụng mô hình hooks cực kỳ đơn giản và trực quan.

### Ưu điểm vượt trội
- **Không Provider Hell:** Không cần bọc component ở file `App.tsx`.
- **Tối ưu Re-render:** Hỗ trợ tính năng Selector giúp component chỉ render lại khi chính xác phần state mà nó quan tâm bị thay đổi.
- **Gọn nhẹ:** Code cực ngắn, boilerplate (code lặp lại) gần như bằng 0.
- **Làm việc ngoài React Component:** Có thể đọc/ghi state ở các file JS/TS thông thường (ví dụ: file cấu hình Axios interceptor).

---

## Cách sử dụng cơ bản

### 1. Cài đặt
```bash
npm install zustand
```

### 2. Khởi tạo Store
Bạn tạo một file (ví dụ `store/authStore.ts`) và định nghĩa dữ liệu (state) cùng với các hành động (actions) bên trong nó:

```tsx
import { create } from 'zustand';

// Định nghĩa TypeScript
interface AuthState {
  user: { id: number; name: string; role: string } | null;
  login: (userData: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 1. Khai báo các State
  user: null,

  // 2. Khai báo các Action (Dùng hàm set để thay đổi state)
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
}));
```

### 3. Sử dụng bên trong Component
Sử dụng hook `useAuthStore` kèm theo một hàm **Selector** để chỉ lấy đúng giá trị bạn cần.

```tsx
import { useAuthStore } from '../store/authStore';

function UserProfile() {
  // Lấy dữ liệu state
  const user = useAuthStore((state) => state.user);
  
  // Lấy hàm action
  const logout = useAuthStore((state) => state.logout);

  if (!user) return <p>Vui lòng đăng nhập</p>;

  return (
    <div>
      <p>Xin chào, {user.name} ({user.role})</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

### 4. Sử dụng bên ngoài React (Non-component)
Đôi khi bạn cần thay đổi state ở những nơi không phải là React Component (ví dụ: ép người dùng đăng xuất khi API báo lỗi `401 Unauthorized`). Zustand cho phép bạn làm điều này thông qua `.getState()` và `.setState()`:

```tsx
import { useAuthStore } from '../store/authStore';

export const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Gọi hàm logout trực tiếp từ store mà không cần dùng hook
    useAuthStore.getState().logout();
    
    // Đá về trang login
    window.location.href = '/login';
  }
};
```

---

## Hiểu rõ về hàm `set` (Cập nhật State)

Biến `set` trong đoạn `create((set) => ...)` là một hàm được Zustand cung cấp sẵn để cập nhật State (tương tự như `setState` trong React).

### Đặc điểm: Tự động gộp State (Auto Merge)
Khác với Redux hay `useReducer` bắt buộc bạn phải copy lại toàn bộ state cũ (`...state`), hàm `set` của Zustand rất thông minh: nó tự động gộp (shallow merge) giá trị mới vào state cũ.
Nếu store có `{ user, theme, cart }`, khi gọi `set({ user: newData })`, các biến `theme` và `cart` vẫn được giữ nguyên an toàn.

### Hai cách sử dụng hàm `set`

**Cách 1: Truyền trực tiếp Object (Khi không quan tâm state cũ)**
Thường dùng khi bạn muốn đè thẳng giá trị mới (vd: cập nhật user khi đăng nhập).
```tsx
login: (userData) => {
   set({ user: userData }); 
}
```

**Cách 2: Truyền một Callback (Khi state mới phụ thuộc state cũ)**
Dùng khi bạn cần đọc dữ liệu cũ để tính toán dữ liệu mới (vd: thêm đồ vào giỏ hàng). Hàm callback sẽ cung cấp cho bạn tham số `state` đại diện cho toàn bộ dữ liệu hiện tại.
```tsx
export const useCartStore = create((set) => ({
  cartItems: [],
  
  addToCart: (newItem) => {
    set((state) => {
      // Đọc mảng cartItems cũ, rải ra và thêm newItem vào
      return { cartItems: [...state.cartItems, newItem] };
    });
  }
}));
```

---

## Kiến trúc Store: Chia nhỏ vs Gom chung (Store Splitting)

Khi dự án lớn lên, câu hỏi thường gặp là: *Nên gom tất cả state vào một `useAppStore` duy nhất hay tạo ra nhiều store nhỏ?*

**Zustand khuyến khích bạn tạo NHIỀU store nhỏ gọn độc lập (Best Practice).**

Hãy tách biệt các store theo từng Domain/Feature (Nhóm chức năng).
Ví dụ trong một hệ thống LMS:
- `useAuthStore`: Chỉ quản lý User, Token, Role.
- `useCartStore`: Chỉ quản lý Giỏ hàng mua khoá học.
- `useThemeStore`: Chỉ quản lý giao diện Sáng/Tối.

**Tại sao nên chia nhỏ?**
1. **Dễ bảo trì:** Các file store sẽ rất ngắn gọn, dễ đọc, chỉ tập trung xử lý đúng 1 nghiệp vụ.
2. **Tối ưu hiệu năng tuyệt đối:** Nếu người dùng thêm khoá học vào `useCartStore`, việc này sẽ không bao giờ kích hoạt re-render nhầm cho các component đang lắng nghe `useAuthStore` hay `useThemeStore`. Sự cô lập state (isolation) này giúp ứng dụng chạy cực kỳ mượt mà.

*(Lưu ý: Nếu có một vài state lặt vặt dùng chung khắp nơi như trạng thái mở/đóng Sidebar, bạn có thể gom chúng vào một `useUIStore` thay vì tạo quá nhiều file nhỏ lắt nhắt).*

---

## 🐞 Common Pitfalls (Các lỗi thường gặp)

### 1. Lỗi Destructuring từ null/undefined
**Lỗi hiển thị:** `Uncaught TypeError: Cannot destructure property 'X' of 'useStore(...)' as it is null.`

**Nguyên nhân:** 
Xảy ra khi bạn kết hợp sai cú pháp giữa Selector của Zustand và Destructuring của Javascript. Ví dụ khi làm tính năng Auth, ban đầu `state.user` là `null`. Câu lệnh dưới đây sẽ trả về `null` trước, sau đó cố gắng dùng `{}` để bóc tách từ `null` dẫn đến crash app.

**❌ Sai (Gây crash):**
```tsx
const { user } = useAuthStore((state) => state.user);
```

**✅ Đúng (Cách 1: Lấy trực tiếp - Khuyên dùng):**
Cách này tối ưu performance vì component chỉ re-render khi đúng biến `user` thay đổi.
```tsx
const user = useAuthStore((state) => state.user);
```

**✅ Đúng (Cách 2: Lấy toàn bộ store rồi destructure):**
Cách này dễ viết nhưng sẽ làm component re-render khi BẤT KỲ state nào trong store thay đổi.
```tsx
const { user } = useAuthStore();
```

---

## 🔗 References
- [Zustand Docs](https://github.com/pmndrs/zustand)
- Related notes: [[context-api]]
