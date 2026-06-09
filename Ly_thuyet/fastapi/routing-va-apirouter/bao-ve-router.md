# Bảo vệ tất cả API bên trong 1 router

## Khái niệm
Trong FastAPI, thay vì phải khai báo `Depends()` để kiểm tra quyền truy cập trên từng hàm endpoint nhỏ lẻ (dễ dẫn đến thiếu sót và bug bảo mật), bạn có thể gán một Dependency cho toàn bộ `APIRouter`. 

Tất cả các route thuộc về router đó sẽ tự động bị ràng buộc bởi Dependency này trước khi chạy vào logic xử lý bên trong.

## Khi nào dùng
- Khi bạn chia router theo Role (ví dụ: `admin_router.py`, `teacher_router.py`). Bạn muốn chặn ngay từ vòng ngoài nếu user không phải admin.
- Khi toàn bộ module cần yêu cầu đăng nhập mới được truy cập (ví dụ: `profile_router`, `order_router`).

## Ví dụ code

Khai báo bảo vệ ngay khi khởi tạo router:

```python
from fastapi import APIRouter, Depends
from core.auth import verify_admin

# Tạo router đặc thù cho Admin, bảo vệ TẤT CẢ endpoint bên trong nó
router = APIRouter(
    prefix="/admin/users",
    tags=["admin_users"],
    dependencies=[Depends(verify_admin)],   # <-- ĐIỂM QUAN TRỌNG
)

# Endpoint này sẽ TỰ ĐỘNG yêu cầu quyền admin mà không cần gọi lại verify_admin
@router.get("/")
def list_all_users():
    return {"message": "Chỉ admin mới thấy nội dung này"}

@router.delete("/{user_id}")
def delete_user(user_id: int):
    return {"message": f"Đã xoá {user_id}"}
```

Một cách khác là bảo vệ ở lúc gộp vào `main.py` (đây cũng là một cách tốt nếu router file thuần tuý không muốn chứa logic Auth):

```python
# main.py
app.include_router(
    admin_router,
    dependencies=[Depends(verify_admin)]
)
```

## Common pitfall
**Sơ ý gộp chung API public và API private:**
Nếu bạn gán dependency `[Depends(get_current_user)]` cho router `/courses`, thì khách vãng lai (chưa đăng nhập) cũng không thể xem danh sách khoá học. 
**Cách khắc phục:** 
Phải tách API public (xem danh sách khoá học) ra `router` bình thường, còn API private (thêm khoá học, xem thống kê) ra `admin_course_router` rồi mới áp dụng bảo vệ.
