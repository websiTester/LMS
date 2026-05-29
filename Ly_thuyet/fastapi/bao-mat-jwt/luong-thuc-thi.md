---
tags: [fastapi, depends, endpoint, execution-flow, response-model]
related: [xac-thuc-va-phan-quyen, login-endpoint]
module_refs: [M2]
---

# Luồng Thực Thi Dependency Trong Endpoint Thực Tế

> Giải thích chi tiết cách `get_current_user` dependency và endpoint `get_me` phối hợp qua cơ chế Dependency Injection, kèm sơ đồ thứ tự thực thi và vai trò `response_model`.

---

## Cơ Chế Phối Hợp Dependency — Endpoint

### Khái niệm
Khi user gọi một API được bảo vệ (ví dụ: `GET /me`), FastAPI sẽ thực thi dependency `get_current_user` **trước** khi chạy hàm endpoint. Nếu dependency raise exception (ví dụ: token hết hạn), endpoint **không bao giờ được chạy** — FastAPI trả lỗi ngay lập tức. Đây là lý do endpoint có thể viết cực kỳ "mỏng" (chỉ 1 dòng `return`).

### Ví dụ code
Endpoint `get_me` và dependency `get_current_user` phối hợp:

```python
# --- Endpoint (rất mỏng — chỉ nhận kết quả và trả ra) ---
@router.get("/me", response_model=UserRead)
async def get_me(current_user=Depends(get_current_user)):
    # current_user lúc này ĐÃ LÀ User object hợp lệ từ database
    return current_user

# --- Dependency (làm việc nặng — xác thực qua 4 bước) ---
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    # Bước 1: Đọc JWT từ cookie
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")

    # Bước 2: Giải mã token
    try:
        payload = decode_token(token)
        # Bước 3: Lấy user_id từ payload
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token hết hạn")

    # Bước 4: Query user từ database
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User không tồn tại")

    return user  # ← Giá trị này được inject vào biến current_user của endpoint
```

### Thứ tự thực thi chi tiết

```
Browser gửi GET /me (cookie access_token gửi kèm tự động)
    │
    ▼
FastAPI thấy endpoint cần Depends(get_current_user)
    │
    ├─ Gọi get_current_user(request, db) TRƯỚC
    │   ├─ 1. Đọc cookie → không có? → 401 DỪNG
    │   ├─ 2. decode_token() → sai/hết hạn? → 401 DỪNG
    │   ├─ 3. payload.get("sub") → None? → 401 DỪNG
    │   ├─ 4. db.get(User, user_id) → không có? → 401 DỪNG
    │   └─ return user ✅
    │       │
    │       ▼
    ├─ Inject user vào current_user, chạy get_me() SAU
    │   └─ return current_user
    │       │
    │       ▼
    └─ FastAPI serialize qua UserRead schema (lọc bỏ hashed_password)
        │
        ▼
Browser nhận: {"id": 42, "email": "huy@example.com", "role": "student"}
```

---

## Vai Trò Của `response_model=UserRead`

### Khái niệm
Khi endpoint `return current_user` (một SQLAlchemy User object chứa tất cả columns kể cả `hashed_password`), FastAPI tự động lọc chỉ giữ lại các trường được khai báo trong Pydantic schema `UserRead`. Các trường nhạy cảm như `hashed_password` sẽ bị loại bỏ khỏi response.

### Common pitfall
- Viết logic xác thực trực tiếp trong endpoint thay vì tách ra dependency → code bị lặp lại ở mọi endpoint cần auth.
- Quên rằng `Depends(get_db)` bên trong `get_current_user` cũng là một sub-dependency — FastAPI tự động resolve cây dependency từ trong ra ngoài.
