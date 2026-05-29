---
tags: [fastapi, jwt, auth, depends, role, middleware]
related: [kien-truc, luong-thuc-thi]
module_refs: [M2, M14]
---

# Xác Thực và Phân Quyền

> Dependency `get_current_user` để xác thực JWT, bảo vệ API endpoints, và factory function `require_role` để phân quyền theo vai trò (admin/teacher/student).

---

## Dependency Xác Thực User (`core/dependencies.py`)

### Khái niệm
Đây là trái tim của hệ thống Auth. Sử dụng cơ chế **Dependency Injection** (`Depends`) của FastAPI để tạo một hàm dùng chung: đọc JWT từ httpOnly cookie → giải mã → trả về User object. Mọi endpoint cần xác thực chỉ cần thêm `Depends(get_current_user)`.

### Ví dụ code
```python
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_token
from app.core.db import get_db
from app.auth.models import User

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    """Đọc JWT từ httpOnly cookie, giải mã, trả về User object."""
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Chưa đăng nhập")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token hết hạn hoặc không hợp lệ")

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User không tồn tại hoặc bị khóa")

    return user
```

### Khi nào dùng
Mọi endpoint cần xác thực đều sử dụng dependency này. Chỉ cần thêm tham số `current_user: User = Depends(get_current_user)` vào hàm endpoint.

---

## Bảo Vệ API Endpoints

### Khái niệm
Sau khi có dependency `get_current_user`, việc bảo vệ bất kỳ API nào chỉ cần thêm 1 tham số vào hàm endpoint. FastAPI tự động gọi dependency trước khi chạy logic endpoint; nếu token không hợp lệ, trả về lỗi 401 ngay lập tức mà không chạy vào thân hàm.

### Ví dụ code
```python
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.auth.models import User

router = APIRouter()

# ✅ API CÔNG KHAI (không cần đăng nhập)
@router.get("/courses")
async def list_courses():
    return {"courses": []}

# 🔒 API CẦN ĐĂNG NHẬP (chỉ thêm Depends)
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}
```

---

## Phân Quyền Theo Role (`auth/dependencies.py`)

### Khái niệm
Hệ thống có 3 role: `admin`, `teacher`, `student`. Tạo một factory function trả về dependency kiểm tra role, cho phép linh hoạt chỉ định role nào được phép truy cập từng endpoint.

### Ví dụ code
```python
from fastapi import Depends, HTTPException
from app.core.dependencies import get_current_user
from app.auth.models import User

def require_role(*allowed_roles: str):
    """Factory function tạo dependency kiểm tra role."""
    async def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập")
        return current_user
    return checker

# Sử dụng:
@router.post("/admin/courses/{id}/approve")
async def approve_course(id: int, admin: User = Depends(require_role("admin"))):
    ...  # Chỉ admin mới vào được

@router.post("/teacher/courses")
async def create_course(teacher: User = Depends(require_role("teacher", "admin"))):
    ...  # Teacher hoặc Admin mới được tạo course
```

### Tại sao `require_role` nằm ở `auth/dependencies.py` chứ không phải `core/`?

Mặc dù `require_role` được dùng rộng rãi bởi nhiều router (course, class, dashboard...), tiêu chí phân biệt là **bản chất logic**, không phải tần suất sử dụng:

| | `core/dependencies.py` | `auth/dependencies.py` |
|---|---|---|
| **Bản chất** | Hạ tầng thuần — không chứa business logic | Authorization — chứa business logic về quyền |
| **Ví dụ** | `get_current_user` (đọc cookie → decode → trả user) | `require_role("admin")` (kiểm tra role) |
| **Nếu thay đổi logic role?** | Không bị ảnh hưởng | Sửa ở đây |

Cách nghĩ: `get_db`, `get_current_user` giống **ổ điện** (hạ tầng mọi phòng đều cần), còn `require_role` giống **khóa cửa** (mọi phòng đều có, nhưng quy tắc "ai vào phòng nào" là quyết định nghiệp vụ thuộc domain Auth).

Các router khác import cross-domain hoàn toàn OK:
```python
# course/router.py
from auth.dependencies import require_role  # ← course → auth: OK
```

