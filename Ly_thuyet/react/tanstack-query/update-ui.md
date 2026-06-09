# Cách update UI khi có dữ liệu mới (Invalidate Queries)

## Khái niệm
Mặc định `useQuery` sẽ không tự động biết database vừa có dữ liệu mới để update UI ngay lập tức (vì nó dùng HTTP request, không phải kết nối realtime). Tuy nhiên, TanStack Query hỗ trợ tính năng **Invalidate Queries** để đánh dấu cache đã cũ và yêu cầu fetch lại.

Bên cạnh đó, nó cũng có cơ chế tự động lấy lại dữ liệu (Auto Refetching) trong một số ngữ cảnh nhất định.

## 1. Cơ chế tự động fetch lại mặc định
Mặc định TanStack Query sẽ tự động gọi lại API để lấy data mới khi:
- **Refetch on window focus:** Chuyển tab trình duyệt khác rồi quay lại tab web của mình.
- **Refetch on mount:** Component chứa `useQuery` bị unmount rồi mount lại.
- **Refetch on reconnect:** Mất kết nối internet và có mạng trở lại.

## 2. Dùng Invalidate Queries để chủ động update UI
Khi bạn thực hiện hành động **Thêm / Xóa / Sửa** (dùng `useMutation`), bạn cần "báo" cho TanStack Query biết là data đã thay đổi.

### Ví dụ code
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUser) => axios.post('/api/users', newUser),
    
    // Khi thêm thành công, báo cho query 'users' biết data đã cũ
    onSuccess: () => {
      // Dòng này sẽ trigger tất cả các hàm useQuery(['users']) đang mount phải chạy lại API ngay lập tức
      queryClient.invalidateQueries({ queryKey: ['users'] }); 
    }
  });
}
```

### Khi nào dùng
Khi bạn vừa thay đổi trạng thái ở database thông qua một form, và muốn danh sách (table list) hiển thị ở trang hiện tại hoặc trang tiếp theo phản ánh đúng ngay lập tức phần dữ liệu mới này.

## 3. Nếu muốn update UI theo thời gian thực (từ người khác thêm vào)
Nếu hệ thống cần hiển thị dữ liệu mới do *người dùng khác* vừa thêm mà không cần f5:
- **Polling:** Thêm thuộc tính `refetchInterval: 5000` vào `useQuery` để nó tự gọi lại API mỗi 5 giây.
- **WebSockets:** Khi nhận message từ Backend qua WebSocket, tiến hành gọi hàm `queryClient.invalidateQueries(['users'])` thủ công ở phía Frontend.
