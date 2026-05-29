---
tags: [sqlalchemy, orm, model, mapped, identity-map, unit-of-work, relationship]
related: [ket-noi-db, code-first, crud]
module_refs: [M1, M2]
---

# ORM — Object-Relational Mapping

> Lớp dịch giữa Python class ↔ bảng database. Tập trung vào Declarative Model (SQLAlchemy 2.x), cơ chế cốt lõi của Session, lifecycle object, relationship + N+1 problem.

---

## Khái niệm

ORM = lớp dịch giữa **Python class** ↔ **bảng database**. Thao tác Python object → SQLAlchemy tự sinh SQL.

Without ORM (SQL thuần) — kết quả là tuple, không type-safe, dễ SQL injection nếu concat string. With ORM — code Python-native, IDE autocomplete, an toàn mặc định.

## Định nghĩa Model (SQLAlchemy 2.x style)

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str] = mapped_column(String(100))
```

**Cơ chế bên trong:**
- `DeclarativeBase` là metaclass — khi define `class User(Base)`, SQLAlchemy quét attribute, thấy `Mapped[...]` + `mapped_column(...)` thì đăng ký vào **registry**.
- Registry lưu mapping `User class ↔ users table` (column-by-column).
- Mỗi instance `User(...)` "biết" thuộc table nào → dùng để sinh SQL.

## `Mapped` vs `mapped_column` — khi nào cần cái nào

Hai thứ phục vụ mục đích KHÁC nhau:

- **`Mapped[type]`** = type annotation (cho Python type checker + IDE biết attribute là column kiểu gì)
- **`mapped_column(...)`** = runtime descriptor (chỉ định metadata column: PK, FK, default, unique, length, index...)

**Có thể bỏ `mapped_column()`** trong case đơn giản, **KHÔNG bao giờ bỏ được `Mapped[]`**.

**Khi chỉ cần `Mapped[]`** — column không có metadata gì đặc biệt:

```python
name: Mapped[str]                       # VARCHAR NOT NULL
age: Mapped[int]                        # INTEGER NOT NULL
bio: Mapped[Optional[str]]              # VARCHAR NULL
created_at: Mapped[datetime]            # TIMESTAMP NOT NULL
```

SQLAlchemy 2.x suy ra column type từ Python type qua `type_annotation_map`:

| Python annotation | Cột DB |
|---|---|
| `Mapped[int]` | `INTEGER NOT NULL` |
| `Mapped[str]` | `VARCHAR NOT NULL` (PG: `TEXT`) |
| `Mapped[Optional[str]]` / `Mapped[str \| None]` | `VARCHAR NULL` |
| `Mapped[bool]` | `BOOLEAN NOT NULL` |
| `Mapped[datetime]` | `TIMESTAMP NOT NULL` |
| `Mapped[float]` | `FLOAT NOT NULL` |

→ NULL/NOT NULL được suy ra từ `Optional` / `| None`.

**BẮT BUỘC dùng `mapped_column(...)`** khi cần metadata:

| Use case | Code |
|---|---|
| Primary key | `id: Mapped[int] = mapped_column(primary_key=True)` |
| Foreign key | `owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))` |
| Unique | `email: Mapped[str] = mapped_column(unique=True)` |
| Index | `username: Mapped[str] = mapped_column(index=True)` |
| Độ dài String | `name: Mapped[str] = mapped_column(String(100))` |
| Default Python-side | `is_active: Mapped[bool] = mapped_column(default=True)` |
| Default DB-side | `created_at: Mapped[datetime] = mapped_column(server_default=func.now())` |
| Đổi tên column DB | `email: Mapped[str] = mapped_column("user_email")` |
| Override type | `id: Mapped[int] = mapped_column(BigInteger, primary_key=True)` |

**Best practice — luôn dùng `mapped_column(...)` kể cả không có metadata:**

```python
# ❌ Không khuyến nghị (vẫn chạy)
name: Mapped[str]

# ✅ Khuyến nghị
name: Mapped[str] = mapped_column(String(100))
```

Lý do:
- **Length explicit cho String** — `Mapped[str]` không có length → PG ra `TEXT`, MySQL khác behavior. Set length thì cross-DB consistent.
- **Dễ thêm metadata sau** — khi cần `index=True`, `unique=True` không phải refactor cú pháp.
- **Code đồng nhất** — đọc 1 style dễ hơn lẫn 2 style.

→ Hi sinh chút verbose đổi lấy consistency + future-proof.

## Lưu ý: `models/` vs `schemas/` folder convention

Hai folder có vai trò KHÁC nhau, đừng nhầm:

| | SQLAlchemy Model | Pydantic Schema |
|---|---|---|
| Mục đích | Map DB row | Validate request, serialize response |
| Inherit | `Base` (`DeclarativeBase`) | `BaseModel` |
| Field syntax | `Mapped[str] = mapped_column(...)` | `name: str = Field(...)` |
| Folder convention | `models/` | `schemas/` |

→ ORM model (`Mapped`, `mapped_column`) BỎ trong `models/`, KHÔNG phải `schemas/`. Folder `schemas/` để dành cho Pydantic (`UserCreate`, `UserResponse`...). Nhầm folder không gây lỗi runtime nhưng rối khi project lớn dần.

## Hai cơ chế cốt lõi của Session: Identity Map + Unit of Work

Phần **quan trọng nhất** để hiểu ORM. Session không chỉ là "connection wrapper" — là **workspace** quản lý object.

**Identity Map** — mỗi row trong DB chỉ tương ứng 1 Python object duy nhất trong 1 session:

```python
user_a = await session.get(User, 1)
user_b = await session.get(User, 1)
assert user_a is user_b  # ✅ True — cùng 1 object, lần 2 không query DB
```

→ Tránh duplicate object, đảm bảo nhất quán, giảm query.

**Unit of Work** — session track mọi thay đổi nhưng KHÔNG gửi DB ngay:

```python
user = await session.get(User, 1)
user.email = "new@x.com"        # Session ghi nhớ diff, chưa có SQL
user.name = "New Name"          # Ghi nhớ tiếp

new_user = User(email="b@x.com", name="Bình")
session.add(new_user)           # Ghi nhớ: "có user mới chờ insert"

await session.commit()          # Lúc này mới sinh SQL:
                                #   UPDATE users SET ... WHERE id=1;
                                #   INSERT INTO users ...;
                                #   COMMIT;
```

→ Gom nhiều thay đổi, flush 1 lần, tự sắp xếp insert parent trước child theo FK.

## Lifecycle của object trong Session

```
Transient ──add()──▶ Pending ──flush/commit──▶ Persistent
                                                    │
                                       expunge() ───┤
                                                    ▼
                                                Detached
```

| Trạng thái | Mô tả |
|---|---|
| **Transient** | Object mới tạo (`User(...)`), chưa biết session, chưa có trong DB |
| **Pending** | Đã `session.add()`, chưa flush — chưa có trong DB |
| **Persistent** | Đã flush/commit — có row trong DB, session đang track |
| **Detached** | Từng persistent, session đã close/expunge — không track nữa |

→ Hiểu lifecycle giúp debug "user không lưu được" (quên add?) hoặc "object trùng" (detached add lại?).

## Relationship — map JOIN sang Python attribute

```python
class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    owner: Mapped["User"] = relationship(back_populates="courses")

class User(Base):
    # ...
    courses: Mapped[list["Course"]] = relationship(back_populates="owner")
```

Truy cập relationship → ORM tự sinh SELECT phụ:

```python
user = await session.get(User, 1)
for course in user.courses:  # SELECT * FROM courses WHERE owner_id=1
    print(course.title)
```

## Vấn đề N+1 và Eager Loading

**Lazy loading** (default sync, disabled trong async) — relationship load khi truy cập → gây N+1:

```python
users = (await session.execute(select(User))).scalars().all()  # 1 query
for u in users:
    print(u.courses)  # N query thêm — mỗi user 1 query
# Tổng: 1 + N query — chậm nếu N lớn
```

**Eager loading** — load trước trong 1 query với `selectinload` hoặc `joinedload`:

```python
from sqlalchemy.orm import selectinload

stmt = select(User).options(selectinload(User.courses))
users = (await session.execute(stmt)).scalars().all()
# Chỉ 2 query: 1 cho users + 1 cho courses IN (user_ids)
for u in users:
    print(u.courses)  # không query thêm
```

**Async lưu ý:** Lazy loading **mặc định bị disable** trong async SQLAlchemy (lazy = blocking I/O, không phù hợp async). Phải dùng `selectinload` / `joinedload` / `await session.refresh(obj, ["courses"])` chủ động.

## Flow tổng kết — Python object → SQL

```
1. Define class  →  class User(Base)
                    └─ SQLAlchemy đăng ký mapping vào registry

2. Tạo object    →  user = User(email=..., name=...)
                    └─ Transient

3. Add session   →  session.add(user)
                    └─ Pending, session track changes (Unit of Work)

4. Modify        →  user.email = "new@..."
                    └─ Session ghi nhớ diff

5. Commit        →  await session.commit()
                    └─ Sinh SQL từ mọi change → flush → COMMIT

6. Cleanup       →  session đóng, connection trả pool
```

## Khi nào KHÔNG dùng ORM

- Query phức tạp (window function, CTE phức tạp) → `text("...")` hoặc Core (raw SQL với placeholder).
- Bulk insert/update hàng triệu row → ORM chậm; dùng `session.execute(insert(User), [{...}, ...])` hoặc `COPY`.
- Migration schema → dùng **Alembic** (sinh SQL từ model diff), KHÔNG tự tạo bảng qua ORM trong runtime.

## Common pitfall

- **Quên `selectinload`** trong async → access `.courses` → `MissingGreenlet` exception.
- **Modify attribute không track** (sửa list `user.courses` thay vì add object mới) → Unit of Work không thấy diff.
- **Object detached vẫn truy cập relationship** → `DetachedInstanceError`.
- **Define model nhưng quên import** vào nơi tạo bảng → Alembic không thấy → migration thiếu bảng.
- **Hai session cùng track 1 row** → Identity Map khác nhau, có thể conflict khi commit.
- **Lỗi `Undefined name 'Date'` (Nhầm cú pháp Javascript):** Rất hay gặp khi cố truyền `create_at=Date.now()` lúc tạo object mới. Trong Python phải dùng `datetime.now(timezone.utc)`. 
- **Tự truyền thời gian thủ công thay vì để DB tự lo:** Thay vì phải tự truyền thời gian bằng Python mỗi lần tạo object mới, hãy luôn luôn cấu hình `server_default=func.now()` ở trong Model. Lúc này Database sẽ tự lấy ngày giờ lúc insert, code Python cực kỳ nhàn.
- **Lỗi `Type "tuple[User]" is not assignable to return type "User"` (Dấu phẩy thừa chết người):** Rất hay mắc phải khi khởi tạo Model mà lỡ tay để thừa dấu phẩy (`,`) ở cuối cùng (`new_user = User(...),`). Trong Python, dấu phẩy thừa này sẽ biến biến `new_user` thành một `Tuple` chứa object thay vì chính object đó. Hậu quả là `db.add(new_user)` sẽ sập hệ thống (Crash). Hãy cẩn thận xóa dấu phẩy thừa này!
