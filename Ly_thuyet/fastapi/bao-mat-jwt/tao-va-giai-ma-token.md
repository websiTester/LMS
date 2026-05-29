---
tags: [fastapi, jwt, security, token, password, argon2]
related: [jwt-claims, kien-truc]
module_refs: [M2]
---

# Tạo và Giải Mã JWT Token

> Hàm utility thuần túy (`core/security.py`) để hash/verify password bằng Argon2 và tạo/giải mã JWT token bằng `python-jose`. Kèm giải thích chi tiết từng bước trong hàm `create_access_token`.

---

## Hàm Hash Password và Tạo/Giải Mã JWT

### Khái niệm
File `core/security.py` chứa các hàm utility thuần túy (không chứa business logic). Bao gồm: hash/verify password bằng Argon2 và tạo/giải mã JWT token bằng thư viện `python-jose`.

Cài đặt thư viện:
```bash
pip install passlib[argon2]
pip install python-jose[cryptography]
```

### Ví dụ code
```python
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Hash password bằng Argon2 (an toàn hơn bcrypt)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_token(token: str) -> dict:
    """Giải mã và trả về payload. Raise JWTError nếu token không hợp lệ/hết hạn."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
```

### Common pitfall
- Dùng `datetime.utcnow()` (deprecated từ Python 3.12) thay vì `datetime.now(timezone.utc)` → có thể gây lỗi timezone.
- Lưu password dạng plaintext hoặc dùng MD5/SHA1 → không an toàn. Phải dùng Argon2 hoặc bcrypt.

---

## Chi Tiết Hàm `create_access_token`

### Khái niệm
Hàm `create_access_token` nhận vào một dictionary chứa thông tin định danh user, bổ sung thời gian hết hạn, rồi mã hóa (ký) tất cả thành một chuỗi JWT token. Dưới đây là giải thích chi tiết từng bước xử lý bên trong hàm.

### Ví dụ code
```python
def create_access_token(data: dict) -> str:
    # 1. Tạo bản sao để không thay đổi dictionary gốc của caller
    to_encode = data.copy()
    # data = {"sub": 42} → to_encode = {"sub": 42} (bản sao độc lập)

    # 2. Tính thời điểm hết hạn = thời gian hiện tại (UTC) + số phút cấu hình
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    # Ví dụ: 16:30 UTC + 30 phút = 17:00 UTC

    # 3. Thêm trường exp (hết hạn) và type (phân biệt access vs refresh) vào payload
    to_encode.update({"exp": expire, "type": "access"})
    # to_encode = {"sub": 42, "exp": datetime(2026,5,25,17,0,0), "type": "access"}

    # 4. Ký và mã hóa payload thành chuỗi JWT gồm 3 phần (header.payload.signature)
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    # → "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQyLC...abc123"
```

Chuỗi JWT trả về gồm 3 phần ngăn cách bởi dấu chấm (`.`):

| Phần | Nội dung | Có thể đọc được? |
|---|---|---|
| **Header** | `{"alg": "HS256"}` | ✅ Ai cũng decode được (base64) |
| **Payload** | `{"sub": 42, "exp": ..., "type": "access"}` | ✅ Ai cũng decode được (base64) |
| **Signature** | Hash(header + payload + secret_key) | ❌ Chỉ server có secret mới tạo/verify được |

### Common pitfall
- JWT **KHÔNG mã hóa** dữ liệu (ai cũng có thể đọc payload bằng base64 decode). Nó chỉ **ký** (sign) để đảm bảo dữ liệu không bị giả mạo. Do đó, **tuyệt đối không đặt password hay thông tin nhạy cảm** vào payload.
- Không dùng `.copy()` cho dictionary → hàm sẽ thay đổi trực tiếp dictionary gốc của caller, gây bug khó debug.
