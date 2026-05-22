---
tags: [sqlalchemy, engine, asyncsession, connection-pool, async]
related: [orm, code-first, async-with-va-yield, bien-moi-truong-python]
module_refs: [M1, M2]
---

# Kết nối database (Engine)

> Setup connection với async PostgreSQL: Engine, AsyncSession, dependency injection trong FastAPI, các lỗi thường gặp khi cài đặt.

---

## Khái niệm

**Engine** là entrypoint của SQLAlchemy — đóng vai trò:
- Quản lý **connection pool** (tái sử dụng connection, không mở/đóng mỗi query)
- Dịch Python operation → SQL gửi xuống database
- Quản lý dialect (PostgreSQL, MySQL, SQLite... mỗi loại có SQL syntax khác nhau)

Engine **không** mở connection ngay khi tạo — chỉ mở khi query thực sự chạy (lazy).

## Cài đặt package

```bash
# Async với PostgreSQL
pip install sqlalchemy[asyncio] asyncpg

# Sync (nếu cần)
pip install sqlalchemy psycopg2-binary
```

- `sqlalchemy[asyncio]` — SQLAlchemy core + extension async
- `asyncpg` — driver async cho PostgreSQL (nhanh hơn psycopg2 nhiều, native async)
- `psycopg2-binary` — driver sync (chỉ dùng nếu không cần async, vd: Alembic migration)

## Database URL format

```
<dialect>+<driver>://<user>:<password>@<host>:<port>/<dbname>
```

Ví dụ:
```
postgresql+asyncpg://lms_user:secret@127.0.0.1:5432/lms_db
postgresql+psycopg2://lms_user:secret@127.0.0.1:5432/lms_db   # sync
sqlite+aiosqlite:///./local.db                                 # SQLite async
```

**Lưu ý:**
- Phần `+asyncpg` / `+psycopg2` BẮT BUỘC để SQLAlchemy chọn đúng driver
- URL nên lưu trong `.env`, KHÔNG hardcode vào code
- Nếu password có ký tự đặc biệt (`@`, `:`, `/`), phải URL-encode: dùng `urllib.parse.quote_plus`

## Tạo Async Engine

```python
# core/db.py
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=False,        # True = log mọi SQL ra console (debug, đừng để True ở prod)
    pool_size=5,       # số connection giữ sẵn trong pool
    max_overflow=10,   # số connection tối đa được tạo thêm khi pool đầy
    pool_pre_ping=True,# ping check connection trước khi dùng (tránh "connection closed")
)
```

**Khi nào tune các param:**
- `pool_size=5`, `max_overflow=10` — default đủ cho dev. Production cần benchmark.
- `pool_pre_ping=True` — bật khi deploy với database có thể bị restart/timeout (Cloud SQL, Supabase free tier...).
- `echo=True` — chỉ bật khi debug query, output rất nhiều.

## Session — thao tác data thực tế

Engine chỉ là pool connection. Để query, cần **Session** (hoặc `AsyncSession`).

```python
# core/db.py
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # giữ object còn truy cập được sau commit
    autoflush=False,
)
```

**`expire_on_commit=False` quan trọng cho FastAPI:**
- Default `True` → sau `commit()`, mọi attribute của object bị "expire", lần truy cập tiếp theo sẽ query lại DB.
- Trong API trả về JSON, cần đọc attribute sau commit để serialize → phải set `False`, nếu không sẽ raise lỗi async.

## Tham số `async_sessionmaker` — bắt buộc vs optional

Signature thực tế:

```python
async_sessionmaker(bind=None, class_=AsyncSession, **kw)
```

Mọi tham số đều có default → **kỹ thuật không có param nào bắt buộc**. Nhưng thực tế:

| Tham số | Bắt buộc? | Default | Ghi chú |
|---|---|---|---|
| `engine` (positional, tên gốc `bind`) | ✅ Thực tế bắt buộc | `None` | Không truyền → session không biết kết nối DB nào |
| `class_=AsyncSession` | ❌ Optional | `AsyncSession` | Dư thừa, default đã đúng — có thể bỏ |
| `expire_on_commit=False` | ❌ Optional | `True` | **Phải override `False`** cho FastAPI async |
| `autoflush=False` | ❌ Optional | `True` | Tuỳ style: explicit flush thủ công vs flush ngầm |

**Giải thích chi tiết:**

- **`engine`**: truyền positional nên không cần ghi `bind=engine`. Session lấy connection từ pool của engine này.

- **`class_=AsyncSession`**: `async_sessionmaker` đã default class này, chỉ cần truyền nếu bạn subclass `AsyncSession`. Hai cách dưới đây tương đương:
  ```python
  async_sessionmaker(engine, class_=AsyncSession, ...)
  async_sessionmaker(engine, ...)  # ngắn hơn, đủ rồi
  ```

- **`expire_on_commit=False`**: default `True` → sau `commit()`, attribute bị expire → truy cập tiếp sẽ lazy-load từ DB. Trong async context, lazy-load ngầm raise `MissingGreenlet` vì cần I/O nhưng không có `await`. FastAPI thường trả object sau commit để serialize JSON → **bắt buộc set `False`**.

- **`autoflush=False`**: default `True` → trước mỗi `execute()` (kể cả `SELECT`), session tự flush thay đổi pending. Đặt `False` để tự gọi `await session.flush()` khi cần — explicit hơn, dễ debug, nhưng phải nhớ flush thủ công khi muốn lấy ID auto-increment trước commit.

**Phiên bản tối giản đủ dùng:**

```python
AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
)
```

**Các `**kw` khác có thể truyền** (hiếm dùng):
- `autobegin=True/False` — default `True`, auto bắt đầu transaction khi query đầu tiên chạy
- `info={...}` — dict metadata gắn session, dùng để debug/log
- `twophase`, `query_cls` — nâng cao

## Dùng Session trong FastAPI (Dependency Injection)

```python
# core/db.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

```python
# routers/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.db import get_db
from models import User

router = APIRouter()

@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()
```

**Vì sao dùng `async with` + `yield`:**
- `async with` tự động đóng session khi request xong → trả connection về pool.
- `yield` (không phải `return`) để FastAPI hiểu đây là dependency cleanup pattern.

→ Chi tiết về `async with` + `yield`: xem [[async-with-va-yield]].

## Tắt engine khi app shutdown

```python
# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.db import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()  # đóng tất cả connection trong pool

app = FastAPI(lifespan=lifespan)
```

Bỏ qua bước này → khi reload dev server, connection cũ không được đóng → DB có thể đạt max_connections.

## Common pitfall

- **Quên `+asyncpg` trong URL** → SQLAlchemy chọn driver sync mặc định → raise `MissingGreenlet` khi chạy async.
- **Dùng `Session` thay vì `AsyncSession`** với async engine → lỗi runtime.
- **Quên `await` trước `db.execute(...)`, `db.commit()`** → coroutine không chạy, không có lỗi nhưng data không lưu.
- **Hardcode URL trong code** → leak credential khi push Git.
- **Tạo nhiều engine** (mỗi request 1 engine) → connection pool không tái sử dụng, chậm + cạn connection. Engine là **singleton**, tạo 1 lần khi app start.
- **`expire_on_commit=True` (default)** với FastAPI async → lỗi `MissingGreenlet` khi serialize response sau commit.

## Lỗi thực tế đã gặp khi setup connection

### Lỗi 1: `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres`

```
sqlalchemy.exc.NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres
```

- **Nguyên nhân:** Database URL dùng scheme `postgres://` — SQLAlchemy KHÔNG nhận. Đây là quirk lịch sử: Heroku/Railway/Supabase hay trả về URL dạng cũ này.
- **Fix:** Đổi scheme thành `postgresql+asyncpg://` (cho async) hoặc `postgresql://` (sync):
  ```env
  # ❌ Sai
  DATABASE_URL=postgres://user:pass@127.0.0.1:5431/lms_db
  # ✅ Đúng cho async
  DATABASE_URL=postgresql+asyncpg://user:pass@127.0.0.1:5431/lms_db
  ```
- **Fix linh hoạt trong code** (phòng provider trả URL cũ):
  ```python
  raw_url = settings.database_url
  if raw_url.startswith("postgres://"):
      raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
  engine = create_async_engine(raw_url)
  ```

### Lỗi 2: `ModuleNotFoundError: No module named 'asyncpg'`

```
File ".../sqlalchemy/dialects/postgresql/asyncpg.py", line 1094, in import_dbapi
    return AsyncAdapt_asyncpg_dbapi(__import__("asyncpg"))
ModuleNotFoundError: No module named 'asyncpg'
```

- **Nguyên nhân:** URL có `+asyncpg` → SQLAlchemy cần driver `asyncpg` để kết nối, nhưng package này chưa cài. `asyncpg` là package Python độc lập, KHÔNG đi kèm SQLAlchemy.
- **Stack layer khi connect async PostgreSQL:**
  ```
  Code Python
      ↓
  SQLAlchemy ORM       ← pip install sqlalchemy
      ↓
  asyncpg driver       ← pip install asyncpg (riêng)
      ↓
  PostgreSQL server
  ```
- **Fix:**
  ```powershell
  pip install asyncpg
  ```
- **Verify cài đúng venv:**
  ```powershell
  pip show asyncpg
  ```

**Bộ package thường cần cài cùng cho FastAPI + async PostgreSQL:**

```powershell
pip install sqlalchemy[asyncio] asyncpg psycopg2-binary alembic pydantic-settings
```

- `asyncpg` — driver async cho runtime app
- `psycopg2-binary` — driver sync, **Alembic migration cần** (Alembic không hỗ trợ async tốt)
- `alembic` — tool migration schema

**Verify connection thực sự** (engine lazy, tạo xong chưa connect):

```python
import asyncio
from sqlalchemy import text

async def test_connection():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1"))
        print("DB OK:", result.scalar())

if __name__ == "__main__":
    asyncio.run(test_connection())
```

Thấy `DB OK: 1` → connect thành công. Lỗi `connection refused` → PostgreSQL chưa chạy ở port đó.

## Khi nào dùng

- Mọi project FastAPI cần persist data quan hệ (user, course, enrollment...).
- Migration schema → dùng kèm Alembic (xem [[code-first]]).
- Nếu chỉ cần KV cache → dùng Redis, không cần SQLAlchemy.
