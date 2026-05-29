---
tags: [fastapi, login, security, cookie, response]
related: [tao-va-giai-ma-token, xac-thuc-va-phan-quyen]
module_refs: [M2]
---

# Login Endpoint — Bảo Mật và Cookie

> Bảo mật hàm xác thực login (chống User Enumeration), cơ chế tham số `response: Response`, và cách set JWT vào httpOnly cookie.

---

## Set JWT Vào httpOnly Cookie

### Khái niệm
Theo roadmap, dự án sử dụng **httpOnly cookie** thay vì trả JWT trong response body. Cookie httpOnly không thể bị JavaScript đọc được (chống tấn công XSS). Browser tự động gửi kèm cookie trong mỗi request đến cùng domain.

### Ví dụ code
```python
from fastapi import APIRouter, Response

router = APIRouter(prefix="/auth")

@router.post("/login")
async def login(data: UserLogin, response: Response, db=Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)

    access_token = create_access_token({"sub": user.id})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,         # JS không đọc được (chống XSS)
        secure=True,           # Chỉ gửi qua HTTPS (bật ở production)
        samesite="strict",     # Chống CSRF
        max_age=30 * 60,       # 30 phút
    )

    return {"message": "Đăng nhập thành công"}
```

### Common pitfall
- **Lưu JWT trong localStorage** → XSS attack có thể đọc được. Luôn dùng httpOnly cookie.
- Quên set `samesite="strict"` hoặc CSRF token khi dùng cookie auth → dễ bị tấn công CSRF.
- Refresh token rotation: phải revoke token cũ ngay khi cấp token mới (chống token theft).

---

## Bảo Mật Hàm Xác Thực Login (Service Layer)

### Khái niệm
Hàm xác thực login (thường đặt tại `auth/service.py`) nhận email + password từ user, truy vấn database để tìm user, sau đó so sánh password. Có 2 lỗi bảo mật thường gặp khi viết hàm này.

### Ví dụ code
```python
from app.core.security import verify_password

async def login_user_service(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email_service(db, email)

    # Gộp chung 2 trường hợp (email sai + password sai) thành 1 thông báo
    # → Chống kỹ thuật User Enumeration (attacker dò email tồn tại)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng"
        )

    return user
```

### Common pitfall
- **So sánh password dạng plaintext**: Viết `if user.hashed_password != password` sẽ luôn sai vì password trong DB đã được hash (dạng `$argon2id$v=19$...`), còn password từ form là plaintext (dạng `"123456"`). Phải dùng `verify_password(plain, hashed)` để hash rồi so sánh.
- **Rò rỉ thông tin (Information Leakage)**: Nếu trả message khác nhau cho email sai (`"User not found"`) và password sai (`"Invalid password"`), attacker có thể dò ra email nào tồn tại trong hệ thống. Luôn trả **cùng 1 thông báo chung** cho cả 2 trường hợp.

---

## Tham Số `response: Response` Trong Endpoint

### Khái niệm
Khi khai báo `response: Response` làm tham số trong endpoint, FastAPI sẽ inject vào một **đối tượng response rỗng** (bản nháp). Đối tượng này cho phép bạn ghi thêm cookie hoặc header **trước khi** FastAPI gửi response thực sự cho browser.

`response: Response` **KHÔNG phải** là kết quả API trả về. Nó chỉ là bản nháp để bạn đính kèm metadata (cookie, header). Dữ liệu trả về thực sự là giá trị từ lệnh `return`.

### Ví dụ code
```python
from fastapi import Response

@router.post("/login", response_model=UserRead)
async def login_user(payload: UserLogin, response: Response, db=Depends(get_db)):
    user = await login_user_service(db, payload.email, payload.password)
    access_token = create_access_token({"sub": user.id})

    # Ghi cookie lên "bản nháp" response
    response.set_cookie(key="access_token", value=access_token, httponly=True)

    # Trả về data — FastAPI gộp data + cookie thành response hoàn chỉnh
    return user
```

### Luồng hoạt động

```
1. FastAPI tạo đối tượng Response rỗng (bản nháp)
       │
2. Inject vào endpoint qua tham số response: Response
       │
3. Bạn ghi cookie lên bản nháp: response.set_cookie(...)
       │
4. Bạn return data: return user
       │
5. FastAPI GỘP data + cookie/header từ bản nháp
   → Tạo response HOÀN CHỈNH gửi cho browser:
       HTTP/1.1 200 OK
       Set-Cookie: access_token=eyJhbG...; HttpOnly    ← từ set_cookie()
       Content-Type: application/json
       {"id": 42, "email": "huy@example.com", ...}     ← từ return user
```

### Khi nào dùng
Khai báo `response: Response` làm tham số khi endpoint cần thao tác lên response header hoặc cookie (ví dụ: login set JWT cookie, logout clear cookie, set custom header). Các endpoint không cần thao tác header/cookie thì không cần tham số này.
