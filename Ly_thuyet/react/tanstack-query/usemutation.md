# Thay đổi dữ liệu với useMutation

## Khái niệm
Khác với `useQuery` (chuyên dùng để **truy vấn** dữ liệu - phương thức GET), hook **`useMutation`** được sử dụng để **thay đổi** dữ liệu trên server (thực hiện các phương thức POST, PUT, DELETE, PATCH).

Các tham số và biến cố định quan trọng của `useMutation` (TanStack Query v5):
- **`mutationFn` (Cấu hình - Cố định)**: Thuộc tính nhận vào một hàm async thực hiện HTTP request thực tế.
- **`mutate` (Hàm trả về - Cố định khi bóc tách)**: Hàm dùng để kích hoạt (trigger) chạy request. Có thể alias đổi tên.
- **`isPending` (Trạng thái - Cố định)**: Biến boolean tự động chuyển sang `true` khi request bắt đầu chạy và trả về `false` khi hoàn tất.

## Ví dụ code
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

## Sự khác biệt giữa `onSuccess`, `onError` và `onSettled`

| Callback | Khi nào chạy? | Ứng dụng thực tế |
|---|---|---|
| **`onSuccess`** | Chỉ chạy khi API thành công (Status 2xx). | Hiển thị thông báo "Cập nhật thành công", đóng Modal, chuyển hướng. |
| **`onError`** | Chỉ chạy khi API thất bại (Lỗi mạng, 4xx, 5xx). | Hiển thị thông báo lỗi. |
| **`onSettled`** | **Luôn luôn chạy cuối cùng**, bất kể thành công hay thất bại. | Dọn dẹp State rác, ẩn Loading toàn cục, hoặc **Đăng xuất (Logout)**. |

**✅ Cách viết Đăng xuất chuẩn với `onSettled`:**
```tsx
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient('users/logout', { method: 'POST' }),
        onSettled: () => {
            // Bất kể API có gọi được hay không, vẫn phải xóa dữ liệu nội bộ
            useAuthStore.getState().logout();
            queryClient.clear(); // Xóa sạch bộ nhớ đệm cache
            window.location.href = '/login'; // Ép tải lại trang (Hard Reload)
        }
    });
};

## Truyền nhiều tham số vào mutationFn (Single Variable Rule)

Trong TanStack Query, hàm `mutationFn` có một quy tắc cứng nhắc: **Chỉ nhận đúng 1 tham số duy nhất**. Nếu hàm API yêu cầu nhiều tham số rời rạc, bạn phải gom chúng thành 1 object.

### Cách 1: Gom thành Object ngay tại `useMutation` (Giữ nguyên hàm API)

```tsx
// Hàm API (ví dụ) nhận 2 tham số rời rạc
const updateCourse = async (courseId: number, data: CourseData) => { /* ... */ }

export const useUpdateCourse = () => {
  return useMutation({
    // Bọc lại thành Arrow Function nhận 1 object chứa 2 biến
    mutationFn: ({ id, data }: { id: number, data: CourseData }) => updateCourse(id, data),
  });
};

// Gọi mutate ở Component
const { mutate } = useUpdateCourse();
mutate({ id: 1, data: newCourseData });
```

### Cách 2: Sửa trực tiếp hàm API (Khuyên dùng)

Clean code hơn là thiết kế hàm API ngay từ đầu chỉ nhận 1 tham số (là object payload).

```tsx
// Định nghĩa lại hàm API chỉ nhận 1 tham số payload
const updateCourse = async ({ courseId, data }: { courseId: number, data: CourseData }) => { /* ... */ }

export const useUpdateCourse = () => {
  return useMutation({
    mutationFn: updateCourse, // Truyền thẳng hàm vào
  });
};
```

---

## Cơ chế truyền `variables` tự động (Luồng Dữ Liệu)

Khi sử dụng `useMutation`, bạn **KHÔNG CẦN** và không thể tự truyền tay dữ liệu vào các callback (`onSuccess`, `onError`) ở file định nghĩa API. Mọi thứ được TanStack Query "chuyển phát nhanh" tự động ở dưới ngầm.

### Luồng đi của dữ liệu (Payload)

**1. Ở Component Form (Gửi dữ liệu):**
Bạn gói payload (VD: `{ courseId, courseData }`) vào một cái Object rồi truyền vào hàm `mutate`:
```tsx
// Gửi cái hộp { courseId, courseData } đi
updateCourse(
  { courseId: 1, courseData: data }, 
  { onSuccess: () => { /* Xử lý UI: Chuyển trang, Toast... */ } }
)
```

**2. Ở file API (Xử lý ngầm):**
TanStack Query mang hộp data đó đi gọi API (`mutationFn`).
Sau khi API thành công, nó **tự động bê nguyên cái hộp ban đầu** đưa cho hàm `onSuccess` dưới tư cách là tham số thứ 2 (mang tên `variables`).

Do đó, bạn chỉ cần hứng biến `variables` ở file định nghĩa hook để lấy lại chính xác dữ liệu gốc mà không cần phải truyền thủ công:

```tsx
export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateCourseRequest, // Nhận hộp data
        
        // Bạn CHỈ CẦN khai báo chữ "variables" ở đây
        // TanStack Query sẽ tự động ấn cái hộp {courseId, courseData} vào tay bạn
        onSuccess: (data, variables) => { 
            // Lấy được courseId tự động từ UI gửi lên!
            const id = variables.courseId; 
            
            // Xóa cache cực chuẩn
            queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) }); 
        }
    })
}
```

**Lợi ích (Chuẩn Enterprise):**
- **Clean Code:** Hook `useUpdateCourse` không bị dính chặt vào bất kỳ State hay Param cụ thể nào của Component. Nó hoàn toàn độc lập và tái sử dụng được ở mọi nơi.
- **Tách bạch logic:** `onSuccess` ở Hook API chuyên xử lý **Server State** (Xóa cache, chèn cache), trong khi `onSuccess` ở hàm `mutate` tại Component chuyên xử lý **UI State** (Điều hướng, thông báo). Cả hai hàm `onSuccess` này sẽ cùng được gọi khi API chạy xong.
