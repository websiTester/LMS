---
tags: [fastapi, jwt, auth, architecture, config]
related: [tao-va-giai-ma-token, xac-thuc-va-phan-quyen]
module_refs: [M2]
---

# Kiến Trúc Phân Tầng JWT Auth

> Cấu trúc thư mục và cấu hình biến môi trường cho hệ thống JWT Auth trong FastAPI.

---

## Kiến Trúc Phân Tầng

### Khái niệm
Hệ thống JWT Auth được chia thành 2 tầng rõ rệt trong cấu trúc thư mục Backend:

- **Tầng hạ tầng (`core/`)**: Chứa các utility function thuần túy dùng chung cho toàn bộ ứng dụng — tạo/giải mã token, hash password, dependency `get_current_user`.
- **Tầng nghiệp vụ (`auth/`)**: Chứa logic đăng ký, đăng nhập, đăng xuất, refresh token — là domain-specific.

```
apps/backend/app/
├── core/
│   ├── config.py             # Load JWT_SECRET, TOKEN_EXPIRE từ .env
│   ├── security.py           # Hàm tạo/giải mã JWT, hash password
│   └── dependencies.py       # Dependency get_current_user (dùng chung mọi API)
│
└── auth/
    ├── router.py             # Endpoints: /auth/login, /auth/signup, /auth/logout
    ├── service.py            # Business logic: verify password, tạo user
    ├── schemas.py            # Pydantic: UserCreate, UserLogin, TokenResponse
    ├── models.py             # SQLAlchemy: User, RefreshToken
    └── dependencies.py       # require_role (admin/teacher)
```

---

## Cấu Hình Biến Môi Trường (`core/config.py`)

### Khái niệm
Sử dụng `pydantic-settings` để load JWT secret và thời gian hết hạn token từ file `.env`. JWT secret **bắt buộc** phải nằm trong biến môi trường, không được hard-code trong code.

### Ví dụ code
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    jwt_secret: str                          # Bắt buộc, app crash nếu thiếu
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30    # Access token sống 30 phút
    refresh_token_expire_days: int = 7       # Refresh token sống 7 ngày

settings = Settings()
```
Sử dụng câu lệnh 
`python -c "import secrets; print(secrets.token_hex(32))"`
để generate random secret.

### Common pitfall
- Hard-code JWT secret trong code → lộ secret khi push lên Git.
- Không set `access_token_expire_minutes` quá dài (ví dụ 24h) vì nếu token bị đánh cắp, attacker có thể dùng suốt thời gian đó.

---

## Luồng Hoạt Động Tổng Quan

```
[User nhấn Login]
  → FE gửi POST /auth/login (email + password)
  → BE verify password → tạo JWT → set httpOnly cookie trong response
  → Browser tự động lưu cookie

[User truy cập API cần auth]
  → FE gọi GET /me (browser TỰ ĐỘNG gửi kèm cookie)
  → BE đọc cookie → decode JWT → lấy user_id → query DB → trả về User
  → Nếu token hết hạn → trả 401 → FE gọi POST /auth/refresh
```
