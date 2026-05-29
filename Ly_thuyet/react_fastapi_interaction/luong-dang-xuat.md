---
tags: [auth, logout, cookie, httponly, security]
module_refs: [M2]
---

# Luồng Đăng xuất (Logout Flow) với HttpOnly Cookie

> Hướng dẫn cách xử lý đăng xuất an toàn và chuẩn xác khi hệ thống lưu trữ JWT bằng HttpOnly Cookie (cần sự phối hợp giữa cả Frontend và Backend).

---

## Bản chất của việc Đăng xuất

Khi sử dụng **HttpOnly Cookie** để bảo mật Access Token, bạn không thể sử dụng Javascript ở Frontend (React) để xóa token này. Trình duyệt thiết kế thuộc tính `HttpOnly` chính là để chặn Javascript can thiệp, nhằm chống lại các cuộc tấn công XSS.

Do Javascript không thể đọc hay xóa được Cookie này, lệnh như `document.cookie = "access_token=; expires=Thu, 01 Jan 1970"` ở phía React là hoàn toàn **vô tác dụng**. 

Cách duy nhất để xóa nó là **gọi API báo cho Backend**, để Backend ra lệnh lại cho trình duyệt tiêu hủy Cookie đó.

---

## Luồng Logout chuẩn Doanh nghiệp

Để đăng xuất hoàn toàn, hệ thống cần thực hiện 2 việc song song:
1. **Backend:** Xóa Cookie chứa JWT trên trình duyệt (và dọn dẹp Database nếu dùng Refresh Token).
2. **Frontend:** Xóa State cục bộ (trên RAM và `localStorage`) để UI biết người dùng đã đăng xuất.

### 1. Phía Backend (FastAPI)

Cần có một endpoint riêng cho việc đăng xuất. Endpoint này sẽ trả về header `Set-Cookie` đè lên cookie hiện tại, gán giá trị rỗng và set thời gian sống (`max_age`) về 0 để trình duyệt xóa nó ngay lập tức.

#### Ví dụ code Backend
```python
# Mẫu code cho FastAPI
from fastapi import APIRouter, Response

router = APIRouter()

@router.post("/logout")
async def logout(response: Response):
    # Set lại cookie với value rỗng và max_age=0 (hoặc expires trong quá khứ)
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        max_age=0, 
        samesite="strict",
        secure=True # Bật True nếu đang chạy HTTPS trên production
    )
    
    # [Nâng cao] Nếu hệ thống có dùng Refresh Token lưu ở DB/Redis:
    # Ở đây ta sẽ lấy User ID và xóa/blacklist Refresh Token tương ứng
    
    return {"message": "Đăng xuất thành công"}
```

### 2. Phía Frontend (React)

React cần gọi API `/logout` ở trên, đồng thời tự dọn dẹp các State do mình quản lý (Zustand, React Query, LocalStorage).

#### Ví dụ code Frontend
```tsx
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../shared/lib/api-client';

export const useLogout = () => {
    // Nếu trong Component thì dùng useNavigate
    // const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // 1. Gọi API để Backend xóa HttpOnly Cookie
            await apiClient('users/logout', { method: 'POST' });
        } catch (error) {
            console.error("Lỗi khi gọi API logout, có thể do rớt mạng hoặc token đã hết hạn", error);
        } finally {
            // 2. Bất kể API thành công hay lỗi mạng, BẮT BUỘC phải dọn sạch State ở Frontend
            // Hành động này sẽ clear RAM và clear luôn localStorage (nếu có dùng middleware persist)
            useAuthStore.getState().logout();
            
            // 3. Ép điều hướng về trang Login
            // Cách 1 (SPA Route): navigate('/login', { replace: true });
            
            // Cách 2 (Hard Reload - Khuyên dùng):
            // Dùng window.location.href để ép trình duyệt tải lại toàn bộ app.
            // Việc này giúp dọn sạch toàn bộ bộ nhớ đệm (Cache của Tanstack Query, State rác...)
            window.location.href = '/login'; 
        }
    };

    return handleLogout;
};
```

### Common pitfall
- **Chỉ xóa State ở React mà không gọi API:** User trông có vẻ đã đăng xuất (vì giao diện văng ra trang login), nhưng Cookie ở trình duyệt vẫn còn hạn. Kẻ gian xài máy tính đó có thể gọi thẳng API Backend và vẫn được cấp quyền.
- **Không dọn sạch State ở React nếu API lỗi:** Rất nhiều bạn bỏ lệnh dọn state vào trong khối `try`, bỏ qua khối `catch/finally`. Nếu mạng bị đứt lúc gọi API `/logout`, mã lỗi văng ra khối `catch` và lệnh xóa State không bao giờ được chạy, khiến người dùng "kẹt" lại không thể thoát tài khoản được. Do đó, lệnh `logout()` cục bộ phải luôn nằm ở khối `finally`.

### Khi nào dùng
Luôn phải dùng cơ chế này mỗi khi bạn ứng dụng bảo mật JWT thông qua HttpOnly Cookie.

---

## 🔗 References
- Module liên quan: M2 (Auth)
- Related notes: [[xac-thuc-khi-khoi-tao]], [[bao-mat-jwt]]
