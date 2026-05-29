---
tags: [python, env, config, dotenv, pydantic-settings]
related: [fastapi-config, bien-moi-truong-vite]
module_refs: [M1, M2]
---

# Biến môi trường (.env) trong Python

> Cách load biến môi trường từ file `.env` vào Python — dùng cho secrets (DB password, JWT key, API key) và config (URL, debug flag) mà KHÔNG hardcode vào code.

---

## File `.env` là gì

File text đơn giản chứa key-value, đặt ở **root project**:

```env
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=super-secret-key-change-in-prod
DEBUG=true
REDIS_URL=redis://localhost:6379
PORT=8000
```

### Quy tắc cú pháp
- `KEY=VALUE` — không có space quanh `=`
- Không cần quote string (trừ khi có ký tự đặc biệt: `PASSWORD="p@ss word"`)
- Comment bắt đầu bằng `#`
- Tất cả value đều là **string** khi load — phải tự cast sang int/bool nếu cần

---

## Cách 1: `python-dotenv` + `os.environ` (cơ bản)

### Khái niệm
Library `python-dotenv` đọc file `.env` và đẩy vào `os.environ`. Sau đó dùng `os.getenv()` hoặc `os.environ[...]` để lấy ra.

### Cài đặt
```bash
pip install python-dotenv
```

### Ví dụ code

```python
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env vào os.environ (chỉ chạy 1 lần ở entrypoint)

database_url = os.getenv("DATABASE_URL")
jwt_secret = os.getenv("JWT_SECRET")

# Có default value nếu biến không tồn tại
debug = os.getenv("DEBUG", "false")  # default "false" nếu thiếu

# Cast sang type khác (vì os.getenv luôn trả str)
port = int(os.getenv("PORT", "8000"))
debug_bool = os.getenv("DEBUG", "false").lower() == "true"
```

### Common pitfall
- **Quên `load_dotenv()`** → `os.getenv()` trả `None` vì biến chưa được load
- **`os.environ["KEY"]` raise `KeyError`** nếu key không tồn tại → dùng `os.getenv("KEY")` để trả `None` an toàn hơn
- **Không cast type** → `if os.getenv("DEBUG"):` luôn `True` vì string `"false"` cũng truthy
- **Load `.env` nhiều lần ở nhiều file** → chỉ cần gọi `load_dotenv()` **một lần** ở entrypoint (main.py, app.py)

### Khi nào dùng
- Script nhỏ, project đơn giản
- Không cần validate type/required field

---

## Cách 2: `pydantic-settings` (KHUYẾN NGHỊ cho FastAPI)

### Khái niệm
`pydantic-settings` (Pydantic v2) tạo class `Settings` với **type validation tự động** — load từ `.env`, parse type, raise lỗi nếu thiếu biến required. Cleaner hơn nhiều so với `os.getenv()` rải rác.

### Cài đặt
```bash
pip install pydantic-settings
```

### Ví dụ code

```python
# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,  # DATABASE_URL == database_url
        extra="ignore",        # Bỏ qua biến thừa trong .env
    )

    # Required (không có default) → raise ValidationError nếu thiếu
    database_url: str
    jwt_secret: str

    # Optional với default
    debug: bool = False
    port: int = 8000
    redis_url: str = "redis://localhost:6379"

# Singleton — import từ chỗ khác
settings = Settings()
```

### Cách dùng

```python
# main.py
from config import settings

print(settings.database_url)  # auto-typed: str
print(settings.port)          # auto-typed: int (không cần cast)
print(settings.debug)         # auto-typed: bool
```

### Tích hợp với FastAPI (qua Depends)

```python
from functools import lru_cache
from fastapi import Depends, FastAPI
from config import Settings

app = FastAPI()

@lru_cache  # cache để không init Settings nhiều lần
def get_settings() -> Settings:
    return Settings()

@app.get("/info")
def info(settings: Settings = Depends(get_settings)):
    return {"debug": settings.debug, "port": settings.port}
```

### Common pitfall
- **Không có default + biến thiếu trong `.env`** → app crash khi start (đây là **feature**, không phải bug — fail fast tốt hơn fail silent)
- **Khai báo type `int` nhưng `.env` ghi `PORT=abc`** → `ValidationError` khi start
- **Quên `case_sensitive=False`** → `DATABASE_URL` trong `.env` không match `database_url` trong class
- **Tạo `Settings()` nhiều lần** → tốn I/O đọc file. Dùng `@lru_cache` hoặc module-level singleton

### Khi nào dùng
- FastAPI/Django project (production-grade)
- Cần validate config khi start app
- Muốn auto-cast type + autocomplete trong IDE

---

## Best practices

### 1. KHÔNG commit `.env` vào Git

Thêm vào `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
```

### 2. Luôn có `.env.example` (commit vào Git)

File template không chứa secret thật, để dev khác biết cần khai báo gì:

```env
# .env.example — copy thành .env và điền value thật
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=<generate-random-32-chars>
DEBUG=false
PORT=8000
```

### 3. Tách `.env` theo môi trường

```
.env.development   # dev local
.env.staging       # staging server
.env.production    # production (chỉ trên server, KHÔNG commit)
```

Load theo môi trường:
```python
import os
from dotenv import load_dotenv

env = os.getenv("APP_ENV", "development")
load_dotenv(f".env.{env}")
```

Hoặc với pydantic-settings:
```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('APP_ENV', 'development')}"
    )
```

### 4. Trên production: dùng env thật, KHÔNG dùng file `.env`

Trên server thật (Docker, VPS, Cloud), set biến qua:
- Docker: `-e KEY=VALUE` hoặc `docker-compose.yml`
- Systemd: `Environment=KEY=VALUE`
- Kubernetes: Secret/ConfigMap
- Cloudflare/Vercel: dashboard

Lý do: file `.env` dễ leak (commit nhầm, backup không mã hóa). Env thật được OS/orchestrator quản lý an toàn hơn.

### 5. KHÔNG log/print secret

```python
# ❌ SAI — log ra terminal/file
print(f"JWT secret: {settings.jwt_secret}")
logger.info(f"DB: {settings.database_url}")  # chứa password!

# ✅ ĐÚNG — log che hoặc bỏ
logger.info(f"DB host connected: {urlparse(settings.database_url).hostname}")
```

### 6. Generate secret an toàn

```bash
# JWT secret 32 bytes random (hex)
python -c "import secrets; print(secrets.token_hex(32))"

# Hoặc base64
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## `SettingsConfigDict` — Tham số chi tiết

Class config truyền vào `model_config` của `BaseSettings`. Quyết định cách Pydantic đọc/parse env vars. Đây là 4 tham số dùng thường xuyên nhất:

### `env_file=".env"`

**Mục đích:** Chỉ định file `.env` để đọc khi instantiate `Settings()`.

**Cơ chế:** Pydantic đọc file ở **working directory** (nơi chạy `python`/`uvicorn`), parse từng dòng `KEY=VALUE`, map vào field.

**Giá trị nhận được:**
```python
env_file=".env"                          # 1 file
env_file=(".env", ".env.local")          # nhiều file, file sau override file trước
env_file=None                            # chỉ đọc từ os.environ, không đọc file
```

**Thứ tự ưu tiên:** `os.environ` (env var thật từ shell/Docker) > `.env` file > default value trong class. Tức là `export DATABASE_URL=...` trong shell sẽ **override** giá trị trong `.env`.

**Pitfall:** Path là **relative theo working dir**, không phải theo file Python. Chạy từ thư mục khác → không tìm thấy `.env`. Muốn an toàn:
```python
from pathlib import Path
env_file=Path(__file__).parent / ".env"   # absolute path
```

### `env_file_encoding="utf-8"`

**Mục đích:** Encoding khi đọc file `.env`.

**Vì sao quan trọng:** Trên **Windows**, default Python đôi khi là `cp1252` hoặc `cp1258` → đọc `.env` có comment tiếng Việt có dấu sẽ bị `UnicodeDecodeError`. Set `"utf-8"` explicit → an toàn cross-platform.

**Ví dụ lỗi nếu thiếu:**
```
UnicodeDecodeError: 'charmap' codec can't decode byte 0x9d in position 12
```

→ **Best practice:** luôn để `"utf-8"`.

### `case_sensitive=False`

**Mục đích:** Quy định việc match tên field với tên env var có phân biệt hoa/thường hay không.

**`False` (recommended):**
```python
class Settings(BaseSettings):
    database_url: str                   # field lowercase
    model_config = SettingsConfigDict(case_sensitive=False)
```

`.env` file dùng tên nào cũng OK:
```env
DATABASE_URL=postgresql://...           # ← match được
Database_Url=postgresql://...           # ← cũng match
database_url=postgresql://...           # ← cũng match
```

**`True`:** Bắt buộc tên field trong class **trùng chính xác** với env var. Convention 12-factor app khuyến nghị env var UPPERCASE → nếu set `True`, phải đặt field UPPERCASE:
```python
class Settings(BaseSettings):
    DATABASE_URL: str                   # phải uppercase
```

**Khuyến nghị:** giữ `False` vì Python convention là snake_case lowercase, env var convention là UPPERCASE — `case_sensitive=False` giúp 2 thế giới hợp nhất.

### `extra="ignore"`

**Mục đích:** Quy định cách xử lý khi `.env` chứa biến **không có field tương ứng** trong class.

**3 giá trị:**

| Giá trị | Hành vi | Khi nào dùng |
|---|---|---|
| `"ignore"` | Bỏ qua biến thừa, không lỗi | **Recommended** — `.env` thường share với Docker/Node, không phải biến nào cũng dùng trong Python |
| `"allow"` | Cho phép, lưu vào `__pydantic_extra__` | Khi muốn truy cập biến không khai báo trước (hiếm dùng) |
| `"forbid"` | **Raise ValidationError** nếu có biến không khai báo | Strict mode — muốn `.env` phải khớp chính xác class |

**Ví dụ minh hoạ:**

`.env`:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=abc123
SOME_DOCKER_VAR=xyz                     # biến của Docker
NODE_ENV=production                     # biến của Node.js
```

```python
class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
```

- `extra="ignore"` → load OK, chỉ lấy 2 field cần ✅
- `extra="forbid"` → **raise lỗi** vì `SOME_DOCKER_VAR`/`NODE_ENV` không có field ❌

### Khi nào nên đổi setting?

| Tình huống | Đổi |
|---|---|
| CI/CD production, không có file `.env`, chỉ env vars thật | `env_file=None` |
| Multi-env (dev/staging/prod) | `env_file=(".env", f".env.{os.getenv('APP_ENV', 'dev')}")` |
| Muốn strict: `.env` phải khớp 100% class | `extra="forbid"` |
| Đa file: dev có Docker, prod env thật | Giữ `extra="ignore"` |

### Tham số khác đôi khi gặp

- `env_prefix="APP_"` — chỉ đọc env var có prefix `APP_` (vd: `APP_DATABASE_URL` → field `database_url`). Hữu ích khi tránh xung đột với env var khác trong system.
- `env_nested_delimiter="__"` — cho phép field nested. `DB__HOST=localhost` → `settings.db.host`. Dùng cho config phức tạp.
- `secrets_dir="/run/secrets"` — đọc secret từ Docker secrets / Kubernetes secrets thay vì env var.

---

## So sánh nhanh 2 cách

| Tiêu chí | `python-dotenv` + `os.getenv` | `pydantic-settings` |
|---|---|---|
| Cài đặt | `python-dotenv` | `pydantic-settings` |
| Auto-cast type | ❌ (luôn `str`) | ✅ (int, bool, list, ...) |
| Validate required | ❌ (manual check) | ✅ (raise khi thiếu) |
| IDE autocomplete | ❌ | ✅ |
| Boilerplate | Ít | Hơi nhiều (1 class) |
| Phù hợp | Script nhỏ | FastAPI/production |

**Khuyến nghị cho website project (FastAPI):** dùng `pydantic-settings`.

---

## 🔗 References

- [python-dotenv docs](https://pypi.org/project/python-dotenv/)
- [pydantic-settings docs](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [12-Factor App: Config](https://12factor.net/config) — best practice quản lý config
- Module liên quan: M1 (project setup), M2 (auth — JWT secret), M16 (payment — VNPay/MoMo API key)
- Related notes: [[fastapi-config]] (chưa tạo — khi học FastAPI config sâu hơn), [[bien-moi-truong-vite]]
