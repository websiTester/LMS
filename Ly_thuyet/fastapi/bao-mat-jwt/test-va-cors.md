---
tags: [fastapi, swagger, cors, testing, cookie, credentials]
related: [login-endpoint, kien-truc]
module_refs: [M2]
---

# Test JWT Trên Swagger và Cấu Hình CORS

> Cách test JWT auth trên giao diện Swagger UI (`/docs`) và lý do phải cấu hình CORS `allow_origins` cụ thể khi dùng cookie.

---

## Test JWT Trên Swagger UI

### Khái niệm
Swagger UI (`/docs`) gửi request bằng JavaScript (`fetch`), nên khi dùng httpOnly cookie, Swagger **không thể** tự đọc và đính kèm cookie. Cần cấu hình thêm để Swagger gửi kèm cookie.

### Cách 1: Cho phép Swagger gửi cookie (Đơn giản)

Thêm 1 dòng khi tạo FastAPI app:

```python
app = FastAPI(
    swagger_ui_parameters={"withCredentials": True}  # Swagger gửi kèm cookie
)
```

Kết hợp CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,     # BẮT BUỘC cho cookie
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Quy trình test:**
1. Mở Swagger → gọi `POST /auth/login` với email + password → server set cookie.
2. Swagger tự động lưu cookie (vì `withCredentials: true`).
3. Gọi tiếp `GET /me` → Swagger gửi kèm cookie → nhận được user info.

### Cách 2: Thêm `OAuth2PasswordBearer` song song (Linh hoạt hơn)

Hỗ trợ **cả 2 cách** xác thực: cookie (cho browser thật) + Bearer header (cho Swagger/Postman):

```python
from fastapi.security import OAuth2PasswordBearer

# Khai báo scheme để Swagger hiển thị nút 🔒 Authorize
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

async def get_current_user(
    request: Request,
    token_from_header: str | None = Depends(oauth2_scheme),  # Bearer header
    db: AsyncSession = Depends(get_db)
):
    # Ưu tiên đọc từ cookie (browser thật)
    token = request.cookies.get("access_token")

    # Fallback: đọc từ Authorization header (Swagger/Postman)
    if not token:
        token = token_from_header

    if not token:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")

    # ... phần decode và query user giữ nguyên
```

**Quy trình test:**
1. Gọi `POST /auth/login` → copy token từ response (hoặc DevTools → Cookie).
2. Nhấn nút **🔒 Authorize** trên Swagger → paste token vào.
3. Gọi `GET /me` → Swagger gửi header `Authorization: Bearer eyJhbG...`.

### So sánh 2 cách

| | Cách 1 (withCredentials) | Cách 2 (Bearer header) |
|---|---|---|
| Setup | Đơn giản (1 dòng) | Phức tạp hơn (sửa dependency) |
| Giống production | ✅ Dùng cookie giống browser thật | ❌ Dùng header, khác flow thật |
| Dùng với Postman | ❌ Cần config thêm | ✅ Dễ dàng |
| Nút Authorize trên Swagger | Không có | Có 🔒 |

---

## Tại Sao `allow_origins` Không Được Dùng Wildcard `*` Khi Có Cookie

### Lý do 1: Kỹ thuật — Browser CẤM `*` kèm credentials

Đây là **quy tắc cứng** của đặc tả CORS. Khi set `allow_credentials=True` (để gửi cookie), browser **từ chối** nếu server trả header `Access-Control-Allow-Origin: *`.

```python
# ❌ KHÔNG HOẠT ĐỘNG — browser block ngay
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # wildcard
    allow_credentials=True,     # credentials
    # → Browser báo lỗi: "must not be the wildcard '*' when credentials mode is 'include'"
)

# ✅ HOẠT ĐỘNG — phải chỉ định rõ origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # origin cụ thể
    allow_credentials=True,
)
```

### Lý do 2: Bảo mật — CORS và JWT bảo vệ những thứ KHÁC NHAU

| Cơ chế | Bảo vệ khỏi | Ví dụ tấn công |
|---|---|---|
| **JWT** | Người lạ (không có tài khoản) | Ai đó gọi API mà không có token |
| **CORS** | Website khác lợi dụng **cookie của user** | Website `evil.com` gọi API **bằng cookie của user** |

Kịch bản tấn công nếu dùng `allow_origins=["*"]`:

```
1. User đăng nhập vào app (localhost:5173)
   → Browser lưu cookie access_token

2. User truy cập evil.com (tab khác)

3. evil.com chạy JavaScript:
   fetch("http://localhost:8000/me", { credentials: "include" })
   → Browser TỰ ĐỘNG gửi kèm cookie access_token
   → JWT hợp lệ → API trả về thông tin user

4. evil.com đọc response → đánh cắp thông tin
```

Khi `allow_origins=["http://localhost:5173"]`:
- Browser kiểm tra: request từ `evil.com`, server chỉ cho phép `localhost:5173` → **block response**.

### Khi nào dùng

- **Không dùng cookie** (chỉ dùng Bearer header) → `allow_origins=["*"]` OK vì `evil.com` không có token.
- **Dùng cookie** (`allow_credentials=True`) → **bắt buộc** chỉ định origin cụ thể, vừa vì browser cấm wildcard, vừa vì chống tấn công qua cookie.
