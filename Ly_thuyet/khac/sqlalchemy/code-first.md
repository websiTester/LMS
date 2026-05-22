---
tags: [sqlalchemy, alembic, migration, code-first, schema]
related: [ket-noi-db, orm, bien-moi-truong-python, pathlib-path]
module_refs: [M1, M2]
---

# Code-first — Tạo bảng từ Model

> Định nghĩa model bằng Python code → sinh bảng trong DB. 2 cách: `Base.metadata.create_all` (dev), Alembic (production). Bao gồm config `env.py` chi tiết + troubleshoot lỗi `script_location`.

---

## Khái niệm

**Code-first** = định nghĩa model bằng Python code trước, rồi từ code đó sinh ra bảng trong DB. Ngược lại là "database-first" (tạo SQL trước, generate code sau).

SQLAlchemy là code-first mặc định — model với `Mapped` + `mapped_column` đã chứa đủ thông tin để tạo bảng. Vấn đề chỉ là **dùng tool gì để chạy CREATE TABLE**: 2 cách chính cho 2 giai đoạn khác nhau.

## Cách 1: `Base.metadata.create_all(engine)` — dev/prototype

`Base.metadata` là registry chứa thông tin mọi model kế thừa `Base`. `create_all` duyệt và sinh `CREATE TABLE IF NOT EXISTS` cho từng bảng.

**Script tạo bảng (async):**

```python
# scripts/init_db.py
import asyncio
from core.db import engine
from models.base import Base
# QUAN TRỌNG: import mọi model để chúng được đăng ký vào Base.metadata
from models.user import User
from models.course import Course

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")

if __name__ == "__main__":
    asyncio.run(init_db())
```

Chạy:
```powershell
python -m scripts.init_db
```

**Cơ chế:**
- Mỗi `class User(Base)` tự đăng ký Table object vào `Base.metadata`.
- `create_all` sinh SQL theo đúng thứ tự foreign key (parent trước child).
- `run_sync` để chạy code sync (`create_all`) trong context async engine.

**Hạn chế quan trọng:**

| Tình huống | Hành vi |
|---|---|
| Bảng chưa có | ✅ Tạo |
| Bảng đã có | ⚠️ Bỏ qua, KHÔNG so sánh schema |
| Thêm column mới vào model | ❌ KHÔNG thêm column vào DB |
| Đổi tên/type column | ❌ KHÔNG sửa |
| Drop bảng cũ không còn model | ❌ KHÔNG xóa |

→ `create_all` chỉ "CREATE TABLE IF NOT EXISTS" — không track diff. Sửa model sau khi bảng tồn tại → DB không cập nhật.

**Khi nào dùng:**
- ✅ Dev nhanh, prototype, schema thay đổi liên tục — `drop_all` + `create_all` để reset.
- ✅ Test (SQLite in-memory).
- ❌ **KHÔNG cho production** — không track migration, mất data khi reset.

## Cách 2: Alembic — migration tool chuyên nghiệp

Alembic so sánh model hiện tại vs DB schema hiện tại → sinh **migration script** (file Python) mô tả diff. Mỗi thay đổi → migration mới → apply để cập nhật DB. Có version + rollback.

**Cài + init:**

```powershell
pip install alembic
alembic init alembic   # tạo folder alembic/ + alembic.ini
```

**Config** — sửa `alembic/env.py`:

```python
from core.config import settings
from models.base import Base
# Import mọi model để Base.metadata thấy hết
from models.user import User
from models.course import Course

# Alembic dùng URL sync — convert từ asyncpg sang psycopg2
config.set_main_option(
    "sqlalchemy.url",
    settings.database_url.replace("+asyncpg", "+psycopg2")
)

target_metadata = Base.metadata  # ← Alembic compare với cái này
```

**Workflow:**

```powershell
# Lần đầu — tạo migration cho schema hiện tại
alembic revision --autogenerate -m "create users and courses tables"
# → sinh file alembic/versions/abc123_create_users_and_courses_tables.py

# Apply vào DB
alembic upgrade head
# → chạy upgrade() trong migration, tạo bảng + ghi version vào bảng alembic_version

# Sau khi sửa model (vd: thêm column bio)
alembic revision --autogenerate -m "add bio to users"
alembic upgrade head

# Rollback nếu cần
alembic downgrade -1      # lùi 1 bước
alembic downgrade base    # về trạng thái ban đầu
```

**File migration sinh ra trông như:**

```python
def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), unique=True),
        # ...
    )

def downgrade():
    op.drop_table('users')
```

**Khi nào dùng Alembic:**
- ✅ Mọi project production.
- ✅ Team nhiều người (migration tracked qua git).
- ✅ Cần rollback, audit history.
- ⚠️ Hơi cồng kềnh cho prototype 1-2 ngày đầu.

## Alembic: chi tiết `env.py` + biến `config`

**Biến `config` trong `env.py` từ đâu ra?**

File `alembic/env.py` được Alembic auto-generate khi chạy `alembic init`, có dòng quan trọng:

```python
from alembic import context

config = context.config   # ← biến `config` được tạo ở đây
```

- `context` import từ `alembic` → `context.config` là object đại diện toàn bộ config từ `alembic.ini`.
- `config` là biến **đã tồn tại sẵn**, KHÔNG phải biến bạn import.
- Mọi code custom phải đặt **SAU dòng này** để dùng được `config`.

→ Nếu bạn báo lỗi `"config" is not defined`, nguyên nhân: đang viết ở file khác, hoặc xóa nhầm dòng `config = context.config`, hoặc đặt code TRƯỚC dòng đó.

**`config.set_main_option(...)` tác dụng gì?**

- `config.get_main_option("sqlalchemy.url")` → đọc giá trị từ section `[alembic]` của `alembic.ini`.
- `config.set_main_option("sqlalchemy.url", "...")` → **override** giá trị đó trong runtime, KHÔNG sửa file `.ini`.
- Mục đích: load URL từ `.env` qua `pydantic_settings` thay vì hardcode trong `alembic.ini` → tránh leak credential khi commit git.

**3 thay đổi BẮT BUỘC trong `env.py` để integrate với project:**

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# ←─── 1. Thêm sys.path để import được core/, models/ ở thư mục cha
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core.config import settings
from models.base import Base
from models.user import User           # import MỌI model
from models.course import Course

config = context.config

# ←─── 2. Chèn SAU `config = context.config` để override URL
config.set_main_option(
    "sqlalchemy.url",
    settings.database_url.replace("+asyncpg", "+psycopg2")
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ←─── 3. Đổi từ None sang Base.metadata để autogenerate biết schema
target_metadata = Base.metadata

# ... phần còn lại của file giữ nguyên ...
```

| # | Sửa gì | Vì sao |
|---|---|---|
| 1 | `sys.path.insert(...)` | Alembic chạy từ `alembic/` subfolder → cần thêm `lms_backend/` vào path để import được `core/`, `models/` |
| 2 | `config.set_main_option(...)` SAU `config = context.config` | Override URL runtime, load từ `.env` thay hardcode |
| 3 | `target_metadata = Base.metadata` (thay None) | Cho autogenerate biết schema model để diff với DB |

## Lỗi `FAILED: No 'script_location' key found in configuration`

**Nguyên nhân:** Thiếu file `alembic.ini` ở thư mục hiện tại (hoặc file có nhưng thiếu key `script_location`). Đây là setting BẮT BUỘC chỉ định folder migration.

Thường gặp khi:
- Chưa chạy `alembic init` ở đúng folder.
- Tạo folder `alembic/` thủ công không qua command → không có `alembic.ini` đi kèm.
- Chạy `alembic` CLI từ thư mục sai (alembic tìm `alembic.ini` ở CWD).

**Fix đúng nhất:**

```powershell
# Đứng ở folder backend
cd LMS_project\lms_backend

# Backup env.py nếu đã customize
Copy-Item .\alembic\env.py .\alembic\env.py.bak  # nếu có folder cũ

# Xóa folder alembic cũ
Remove-Item -Recurse -Force .\alembic\

# Init lại đúng cách — sinh CẢ alembic.ini + alembic/
alembic init alembic

# Apply lại 3 customization vào env.py mới
# ...
```

Verify:
```powershell
alembic current   # output rỗng = OK (chưa có migration)
```

**Lưu ý CWD khi chạy `alembic`:**

Alembic CLI tìm `alembic.ini` ở **CWD**. Phải đứng đúng folder:

```powershell
# ❌ Sai
cd E:\React_Tutorial\React_roadmap
alembic current   # không tìm thấy alembic.ini

# ✅ Đúng
cd E:\React_Tutorial\React_roadmap\LMS_project\lms_backend
alembic current
```

Hoặc dùng `-c` để chỉ định path từ bất cứ đâu:

```powershell
alembic -c E:\...\lms_backend\alembic.ini current
```

## So sánh nhanh

| | `create_all` | Alembic |
|---|---|---|
| Setup | 5 dòng code | Cài + init + config |
| Track diff | ❌ | ✅ |
| Sửa schema | ❌ Phải drop + recreate | ✅ Migration riêng |
| Rollback | ❌ | ✅ |
| Production-ready | ❌ | ✅ |
| Async support | ✅ (qua `run_sync`) | ⚠️ Phải dùng URL sync |

## Lộ trình khuyến nghị cho project

- **Phase đầu (M1-M2):** Dùng `create_all` — hiểu rõ relationship code ↔ DB, nhanh, không vướng config.
- **Schema bắt đầu ổn định (~M3+):** Setup Alembic — tạo migration đầu từ schema hiện tại, mọi thay đổi sau đi qua migration.
- **Trước deploy production:** BẮT BUỘC có Alembic.

→ Đừng setup Alembic từ ngày 1 nếu chưa quen (overhead). Nhưng đừng đợi đến lúc deploy mới setup, vì migration đầu tiên phải mô phỏng lại lịch sử schema rất phiền.

## Common pitfall

- **Quên import model** trong `init_db.py` hoặc `alembic/env.py` → `Base.metadata` không thấy → không sinh bảng/migration cho model đó.
- **Alembic dùng URL async** → lỗi vì Alembic không hỗ trợ async tốt. Phải convert `+asyncpg` → `+psycopg2`.
- **Sửa migration đã apply trên DB khác** → conflict version. Migration đã merge git là **immutable** — sửa thì tạo migration mới.
- **Autogenerate không bắt được mọi thay đổi** — vd: rename column thường bị detect thành drop + add (mất data). Phải sửa thủ công file migration thành `op.alter_column(..., new_column_name=...)`.
