---
tags: [fastapi, pydantic, schemas, models, validation, serialization]
related: [orm, ket-noi-db, crud]
module_refs: [M2, M3, M4]
---

# Pydantic Schemas — `models.py` vs `schemas.py`

> Phân biệt 2 loại class trong FastAPI backend: SQLAlchemy ORM (persistence) và Pydantic schemas (API I/O). Convention naming, flow data, và lý do cần CẢ HAI.

---

## Convention naming chuẩn FastAPI

| File | Chứa class gì | Inherit | Ví dụ tên class |
|---|---|---|---|
| **`models.py`** | **SQLAlchemy ORM** (map với DB table) | `Base` (`DeclarativeBase`) | `Course`, `Chapter`, `Enrollment` |
| **`schemas.py`** | **Pydantic schemas** (request/response API) | `BaseModel` | `CourseCreate`, `CourseUpdate`, `CourseRead` |

→ **`models` = ORM**, **`schemas` = Pydantic**. Không phải ngược lại — dễ nhầm vì cả 2 đều "describe data shape".

## Nguồn gốc tên

- **"Models"** từ web framework truyền thống (Django, Rails) = lớp đại diện entity DB. FastAPI adopt cho ORM layer.
- **"Schemas"** từ JSON Schema / OpenAPI — mô tả **shape** của data đi qua API (input/output). Pydantic chính là tool define schema → file chứa Pydantic gọi `schemas.py`.

**Hint nhận biết qua tên class:**

```
schemas.py    # CourseCreate, CourseUpdate, CourseRead   ← đuôi "Create/Update/Read" = shape API
models.py     # Course, Chapter, Enrollment              ← entity name = ORM model
```

- Tên có suffix `Create`/`Update`/`Read`/`Response`/`Out` → Pydantic.
- Tên entity thuần (`Course`, `User`) → ORM.

## Ví dụ side-by-side

**`models.py`** (ORM — map DB):

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str]
    price: Mapped[int]
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    chapters: Mapped[list["Chapter"]] = relationship(back_populates="course")
```

**`schemas.py`** (Pydantic — API I/O):

```python
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Input: tạo course mới (client gửi lên)
class CourseCreate(BaseModel):
    title: str
    description: str
    price: int
    # KHÔNG có id, created_at, owner_id — server tự sinh

# Input: cập nhật course (mọi field optional vì PATCH)
class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: int | None = None

# Output: trả về cho client (response)
class CourseRead(BaseModel):
    id: int
    title: str
    description: str
    price: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)  # ← cho phép convert từ ORM
```

## Tại sao cần CẢ HAI? Không gộp được sao?

**DB schema và API schema KHÁC NHAU** ở nhiều điểm — không thể gộp thành 1 class:

| Field | ORM (`models.Course`) | API tạo (`schemas.CourseCreate`) | API trả (`schemas.CourseRead`) |
|---|---|---|---|
| `id` | ✅ (auto-gen) | ❌ (client không gửi) | ✅ |
| `title` | ✅ NOT NULL | ✅ required | ✅ |
| `password_hash` (User model) | ✅ NOT NULL | ❌ (client gửi `password` plain) | ❌ (KHÔNG bao giờ trả về!) |
| `owner_id` | ✅ FK | ❌ (lấy từ JWT) | ✅ |
| `created_at` | ✅ `server_default` | ❌ | ✅ |
| Validation regex/length | ❌ (DB không check format) | ✅ (Pydantic validate) | ❌ |

**Nếu cố gộp ORM class làm cả API model:**
- Client phải gửi `id`, `created_at` (sai logic)
- Lộ field nhạy cảm như `password_hash`
- Không validate input format (email regex, length, range...)
- Không separate concerns — sửa shape API phải sửa DB schema theo, đau

## Flow data trong endpoint

```python
# routers/courses.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models import Course
from schemas import CourseCreate, CourseRead

@router.post("/courses", response_model=CourseRead)
async def create_course(
    payload: CourseCreate,                              # 1. Input — Pydantic schema
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = Course(                                    # 2. Map sang ORM model
        **payload.model_dump(),
        owner_id=current_user.id,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course                                       # 3. FastAPI auto convert ORM → CourseRead
```

**Sơ đồ flow:**

```
[Client JSON] ──► CourseCreate (Pydantic validate)  ──► Course (ORM, lưu DB)
                                                              │
                                                              ▼
[Client JSON] ◄── CourseRead (Pydantic serialize)   ◄── Course (ORM, đọc DB)
```

**3 vai trò rõ ràng:**
1. **Pydantic input schema** — validate data từ client (`CourseCreate`, `CourseUpdate`)
2. **ORM model** — persistence layer (`Course` — lưu/đọc DB)
3. **Pydantic output schema** — serialize + control field nào trả ra ngoài (`CourseRead`)

## Patterns đặt tên Pydantic schema

| Suffix | Mục đích | Khi nào dùng |
|---|---|---|
| `*Create` | Input cho POST | Client tạo entity mới |
| `*Update` | Input cho PATCH/PUT | Client sửa entity (fields optional) |
| `*Read` / `*Response` / `*Out` | Output | Server trả về client |
| `*InDB` | Internal | Schema đầy đủ (kể cả password_hash) — chỉ dùng nội bộ, KHÔNG expose |
| `*Base` | Common fields | Inherit chung giữa Create/Update/Read |

**Pattern inheritance (DRY):**

```python
class CourseBase(BaseModel):
    title: str
    description: str
    price: int

class CourseCreate(CourseBase):
    pass  # giống Base, không thêm gì

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: int | None = None

class CourseRead(CourseBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

→ `CourseBase` chứa field chung, các schema con extend. Tránh duplicate field declaration.

## `from_attributes=True` — key để convert ORM → Pydantic

Mặc định Pydantic chỉ accept `dict`. Để convert từ ORM object (truy cập attribute `course.title`), cần:

```python
class CourseRead(BaseModel):
    id: int
    title: str
    # ...
    model_config = ConfigDict(from_attributes=True)
```

Sau đó FastAPI tự convert khi:

```python
@router.get("/courses/{id}", response_model=CourseRead)
async def read_course(id: int, db: AsyncSession = Depends(get_db)):
    course = await db.get(Course, id)
    return course  # ← ORM object, FastAPI dùng CourseRead.from_orm() ngầm
```

Không có `from_attributes=True` → lỗi `ValidationError: Input should be a valid dictionary`.

## Folder structure thực tế

**Option A — File flat (project nhỏ):**

```
lms_backend/
├── models.py        # mọi ORM model
├── schemas.py       # mọi Pydantic schema
├── routers/
└── ...
```

**Option B — Folder (project lớn, recommend):**

```
lms_backend/
├── models/
│   ├── __init__.py
│   ├── user.py          # User, UserSession
│   ├── course.py        # Course, Chapter, Enrollment
│   └── payment.py
├── schemas/
│   ├── __init__.py
│   ├── user.py          # UserCreate, UserRead, UserUpdate
│   ├── course.py        # CourseCreate, CourseRead, CourseUpdate
│   └── payment.py
├── routers/
└── ...
```

→ Module breakdown của roadmap dùng Option B (mỗi domain 1 file).

## Common pitfall

- **Để ORM class trong `schemas/`** hoặc Pydantic trong `models/` → không gây lỗi runtime nhưng rối khi team đọc code.
- **Trả thẳng ORM model qua API** mà không qua Pydantic → lộ password_hash, internal field, không type-safe response.
- **Quên `from_attributes=True`** trong response schema → `ValidationError` khi return ORM object.
- **Dùng cùng 1 class cho Create + Read** → client phải gửi field auto-gen (`id`, `created_at`) hoặc nhận field nhạy cảm.
- **Quên field optional trong Update schema** → PATCH thành PUT (client phải gửi toàn bộ field).

## Quy tắc nhớ

| Câu hỏi | Trả lời |
|---|---|
| Class dùng `Mapped`, `mapped_column`? | → ORM, để trong `models/` |
| Class dùng `BaseModel`, `Field`? | → Pydantic, để trong `schemas/` |
| Class tên có `Create/Update/Read/Out`? | → Pydantic schema |
| Class tên là entity thuần (`User`, `Course`)? | → ORM model |
| Map DB row? | → ORM |
| Validate input / shape response? | → Pydantic |

## 🔗 References

- [Pydantic v2 docs](https://docs.pydantic.dev/latest/)
- [FastAPI — SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/) (pattern models + schemas)
- Module liên quan: M2 (auth — User schemas), M3 (course CRUD), mọi module có REST API
- Related notes: [[orm]] (ORM model), [[ket-noi-db]] (AsyncSession), [[crud]] (CRUD pattern dùng schemas)
