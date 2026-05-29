---
tags: [sqlalchemy, relationship, foreign-key, one-to-many, many-to-many, one-to-one]
related: [orm, crud, ket-noi-db]
module_refs: [M2, M4, M8, M14]
---

# Relationship — Biểu diễn quan hệ giữa các bảng

> SQLAlchemy dùng `ForeignKey` (ở cột) + `relationship()` (ở Python attribute) để map các kiểu quan hệ 1-1, 1-N, N-N sang Python object. Note này tập trung vào **Mapped annotation style** (SQLAlchemy 2.x).

---

## Khái niệm chung

### 2 thành phần cốt lõi

| Thành phần | Vai trò | Nằm ở đâu |
|---|---|---|
| `ForeignKey` | Tạo ràng buộc ở **cấp database** (cột FK trỏ tới PK bảng khác) | `mapped_column(ForeignKey("table.id"))` |
| `relationship()` | Tạo attribute ở **cấp Python** để truy cập object liên quan | `Mapped[...] = relationship(back_populates="...")` |

### `back_populates` vs `backref`

```python
# ✅ back_populates — KHUYẾN KHÍCH (explicit cả 2 phía)
class User(Base):
    courses: Mapped[list["Course"]] = relationship(back_populates="owner")

class Course(Base):
    owner: Mapped["User"] = relationship(back_populates="courses")

# ❌ backref — legacy, implicit (chỉ khai báo 1 phía, phía kia tự sinh)
class Course(Base):
    owner: Mapped["User"] = relationship(backref="courses")
```

> **Luôn dùng `back_populates`** — explicit cả 2 model, dễ đọc, IDE autocomplete tốt hơn.

---

## One-to-Many (1-N) — Quan hệ phổ biến nhất

### Khái niệm

- **1 bản ghi bảng A** liên kết với **nhiều bản ghi bảng B**
- FK nằm ở **bảng "nhiều"** (bảng con), trỏ về PK bảng cha
- Ví dụ thực tế: 1 User có nhiều Course, 1 Course có nhiều Chapter

### Ví dụ code

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    # Phía "1" — list các object con
    courses: Mapped[list["Course"]] = relationship(back_populates="owner")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))

    # FK trỏ về bảng cha — nằm ở phía "nhiều"
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Phía "N" — 1 object cha
    owner: Mapped["User"] = relationship(back_populates="courses")
```

### Cách nhớ

```
User (1) ──────< Course (N)
  │                  │
  │ courses: list    │ owner_id: FK
  │ (relationship)   │ owner: relationship
```

- **Bảng con** (Course) giữ cột `owner_id` (FK)
- **Bảng cha** (User) có `Mapped[list["Course"]]` — trả về list
- **Bảng con** có `Mapped["User"]` — trả về 1 object

### Ví dụ thực tế từ project (M4)

```python
# 1 Course có nhiều Chapter
class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    chapters: Mapped[list["Chapter"]] = relationship(back_populates="course")

class Chapter(Base):
    __tablename__ = "chapters"
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    course: Mapped["Course"] = relationship(back_populates="chapters")

# 1 Chapter có nhiều Lesson
class Lesson(Base):
    __tablename__ = "lessons"
    id: Mapped[int] = mapped_column(primary_key=True)
    chapter_id: Mapped[int] = mapped_column(ForeignKey("chapters.id"))
    chapter: Mapped["Chapter"] = relationship(back_populates="lessons")
```

### Common pitfall

- **Quên khai báo `back_populates` ở 1 phía** → relationship chỉ hoạt động 1 chiều, phía còn lại trả `None`
- **FK đặt nhầm phía** — FK luôn nằm ở bảng "nhiều" (bảng con), KHÔNG phải bảng cha

---

## One-to-One (1-1) — Biến thể của 1-N

### Khái niệm

- **1 bản ghi bảng A** liên kết với **đúng 1 bản ghi bảng B**
- Về database: giống 1-N nhưng thêm `UNIQUE` constraint trên FK
- Về SQLAlchemy: thêm `uselist=False` ở phía cha

### Ví dụ code

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    # uselist=False → trả về 1 object thay vì list
    profile: Mapped["UserProfile"] = relationship(
        back_populates="user",
        uselist=False  # ← khác biệt so với 1-N
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)

    # FK + UNIQUE → đảm bảo 1 user chỉ có 1 profile
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True  # ← ràng buộc DB level
    )
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(String(500))

    user: Mapped["User"] = relationship(back_populates="profile")
```

### Cách nhớ

```
User (1) ──── UserProfile (1)
  │                  │
  │ profile          │ user_id: FK + UNIQUE
  │ (uselist=False)  │ user: relationship
```

**2 điểm khác biệt so với 1-N:**

| | 1-N | 1-1 |
|---|---|---|
| Type hint phía cha | `Mapped[list["Child"]]` | `Mapped["Child"]` |
| `uselist` | mặc định `True` (list) | phải set `uselist=False` |
| FK constraint | `ForeignKey` thường | `ForeignKey` + `unique=True` |

### Khi nào dùng 1-1?

- Tách bảng khi có **nhóm cột optional** không phải record nào cũng cần (vd: profile chi tiết, settings)
- **Performance**: tách cột lớn (bio text dài) ra bảng riêng để bảng chính nhẹ hơn
- **KHÔNG nên** tách 1-1 nếu data luôn đi cùng nhau → gộp vào 1 bảng cho đơn giản

### Common pitfall

- **Quên `unique=True` trên FK** → DB cho phép nhiều profile cho 1 user, thành 1-N lúc nào không biết
- **Quên `uselist=False`** → SQLAlchemy trả list thay vì single object, code bị lỗi khi truy cập attribute

---

## Many-to-Many (N-N) — Cần bảng trung gian

### Khái niệm

- **Nhiều bản ghi bảng A** liên kết với **nhiều bản ghi bảng B**
- Cần **bảng trung gian** (association table / junction table) chứa 2 FK
- Ví dụ: 1 Student enroll nhiều Course, 1 Course có nhiều Student

### Cách 1: Association Table đơn giản (chỉ chứa FK)

Dùng khi bảng trung gian **không có cột dữ liệu riêng** (chỉ 2 FK).

```python
from sqlalchemy import Table, Column, ForeignKey

# Bảng trung gian — dùng Table() thay vì class
# vì không cần model riêng (không có cột data)
course_tags = Table(
    "course_tags",
    Base.metadata,
    Column("course_id", ForeignKey("courses.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))

    # secondary = tên bảng trung gian
    tags: Mapped[list["Tag"]] = relationship(
        secondary=course_tags,
        back_populates="courses"
    )


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    courses: Mapped[list["Course"]] = relationship(
        secondary=course_tags,
        back_populates="tags"
    )
```

### Cách nhớ

```
Course (N) ────── course_tags ──────  Tag (N)
  │               (bảng trung gian)      │
  │ tags: list    course_id FK           │ courses: list
  │               tag_id FK              │
```

- **Cả 2 phía** đều có `Mapped[list[...]]`
- **`secondary=`** trỏ tới bảng trung gian
- **Không có FK** trực tiếp trên Course hay Tag

### Cách 2: Association Object (bảng trung gian có cột riêng)

Dùng khi bảng trung gian **có thêm dữ liệu** (vd: `enrolled_at`, `progress`, `grade`).

```python
class Enrollment(Base):
    """Bảng trung gian — dùng class vì có cột data riêng."""
    __tablename__ = "enrollments"

    # Composite primary key (2 FK làm PK)
    student_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id"), primary_key=True
    )

    # Cột dữ liệu riêng của bảng trung gian
    enrolled_at: Mapped[datetime] = mapped_column(default=func.now())
    progress_pct: Mapped[float] = mapped_column(default=0.0)

    # Relationship tới 2 bảng chính
    student: Mapped["User"] = relationship(back_populates="enrollments")
    course: Mapped["Course"] = relationship(back_populates="enrollments")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Trỏ tới association object (KHÔNG dùng secondary)
    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="student"
    )


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)

    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="course"
    )
```

### So sánh 2 cách

| | Association Table (`Table()`) | Association Object (`class`) |
|---|---|---|
| Khi nào dùng | Bảng trung gian chỉ có 2 FK | Bảng trung gian có thêm cột data |
| Khai báo | `Table()` + `secondary=` | Class model thường + relationship 2 chiều |
| Truy cập | `course.tags` → list Tag trực tiếp | `course.enrollments` → list Enrollment → `.student` |
| Ví dụ | Course ↔ Tag, User ↔ Role | User ↔ Course (có enrolled_at, progress) |

### Ví dụ thực tế từ project

```python
# Enrollment (M11) — student enroll course, có progress + enrolled_at
# → Dùng Association Object vì cần lưu thêm data

enrollment = Enrollment(student_id=user.id, course_id=course.id)
session.add(enrollment)
await session.commit()

# Truy cập
user.enrollments  # → list[Enrollment]
user.enrollments[0].course  # → Course object
user.enrollments[0].progress_pct  # → 0.0

course.enrollments  # → list[Enrollment]
course.enrollments[0].student  # → User object
```

### Common pitfall

- **Dùng `secondary=` khi bảng trung gian có cột data** → không truy cập được cột đó. Phải dùng Association Object
- **Quên composite PK** trên bảng trung gian → cho phép 1 student enroll cùng 1 course nhiều lần
- **N+1 query** — truy cập `course.enrollments` trong loop → mỗi course sinh 1 SELECT. Fix bằng `selectinload`:

```python
# ❌ N+1
courses = await session.execute(select(Course))
for c in courses.scalars():
    print(c.enrollments)  # mỗi lần truy cập = 1 query thêm

# ✅ Eager load
from sqlalchemy.orm import selectinload

stmt = select(Course).options(selectinload(Course.enrollments))
courses = await session.execute(stmt)
```

---

## Tổng hợp nhanh

| Quan hệ | FK ở đâu | Bảng trung gian | Type hint phía có list | Lưu ý |
|---|---|---|---|---|
| **1-N** | Bảng con (phía "nhiều") | Không | `Mapped[list["Child"]]` | Phổ biến nhất |
| **1-1** | Bảng con + `unique=True` | Không | `Mapped["Child"]` + `uselist=False` | Biến thể của 1-N |
| **N-N đơn giản** | Bảng trung gian `Table()` | Có (chỉ FK) | Cả 2 phía đều `list` + `secondary=` | Course ↔ Tag |
| **N-N có data** | Bảng trung gian class | Có (FK + cột riêng) | `list["Association"]` | Enrollment |

---

## Cascade — Xử lý khi xóa/update bản ghi cha

### Khái niệm

Cascade quyết định **điều gì xảy ra với bản ghi con** khi bản ghi cha bị xóa hoặc thay đổi.

Có 2 tầng cascade:
- **Database level** — `ondelete` trong `ForeignKey` (DB tự xử lý)
- **ORM level** — `cascade` trong `relationship()` (SQLAlchemy xử lý trong Python)

### Ví dụ code

```python
class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)

    # ORM cascade — SQLAlchemy tự xóa Chapter khi xóa Course
    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan"  # ← xóa cha → xóa con
    )


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE")  # ← DB level
    )
    course: Mapped["Course"] = relationship(back_populates="chapters")
```

### Các option cascade phổ biến

| Option | Ý nghĩa |
|---|---|
| `"all, delete-orphan"` | Xóa cha → xóa con. Gỡ con khỏi list cha → cũng xóa con |
| `"all, delete"` | Xóa cha → xóa con. Nhưng gỡ con ra thì con vẫn tồn tại |
| `ondelete="CASCADE"` (FK) | DB tự xóa con khi cha bị xóa (không cần ORM) |
| `ondelete="SET NULL"` (FK) | DB set FK = NULL khi cha bị xóa (con vẫn tồn tại) |

### Khi nào dùng cái nào?

- **`delete-orphan`** — khi con không có nghĩa nếu không có cha (Chapter không thể tồn tại mà không có Course)
- **`ondelete="CASCADE"` ở FK** — luôn thêm làm safety net ở DB level, phòng trường hợp xóa không qua ORM (raw SQL, admin tool)
- **Nên dùng cả 2** (ORM + DB level) cho chắc chắn

---

## Circular Import — Lỗi model import lẫn nhau

### Tình huống

Khi tách model ra nhiều file (vd: `user/models.py`, `course/models.py`), bản năng sẽ muốn import class từ file kia để dùng trong `relationship()` hoặc `ForeignKey`:

```python
# ❌ user/models.py
from course.models import Course  # import Course

class User(Base):
    courses: Mapped[list["Course"]] = relationship(back_populates="teacher")

# ❌ course/models.py
from user.models import User  # import User

class Course(Base):
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    teacher: Mapped["User"] = relationship(back_populates="courses")
```

### Lỗi gặp phải

```
ImportError: cannot import name 'User' from partially initialized module
'user.models' (most likely due to a circular import)
```

**Vòng lặp:** `env.py` → `user.models` → `course.models` → `user.models` (💥 chưa load xong)

### Vì sao KHÔNG CẦN import trực tiếp

**Cả `ForeignKey` lẫn `relationship` đều dùng string, không cần class thật:**

| Thành phần | Dùng gì | Ví dụ |
|---|---|---|
| `ForeignKey` | **Tên bảng** (string `__tablename__`) | `ForeignKey("users.id")` — không phải `User.id` |
| `relationship` type hint | **String annotation** (tên class trong `""`) | `Mapped["User"]` — SQLAlchemy tự resolve qua registry của `Base` |
| `back_populates` | **Tên attribute** (string) | `back_populates="courses"` |

→ Không thành phần nào cần `import User` hay `import Course` thật.

### Cách fix

**Xóa import lẫn nhau ở các model file:**

```python
# ✅ user/models.py — KHÔNG import course.models
from core.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    courses: Mapped[list["Course"]] = relationship(back_populates="teacher")
    #                    ^^^^^^^^ string — SQLAlchemy tự tìm class "Course"

# ✅ course/models.py — KHÔNG import user.models
from core.db import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    #                                                   ^^^^^^^^ tên bảng, không phải class
    teacher: Mapped["User"] = relationship(back_populates="courses")
    #                ^^^^^^ string — SQLAlchemy tự tìm class "User"
```

**Đảm bảo `env.py` (Alembic) import TẤT CẢ model:**

```python
# alembic/env.py
from core.db import Base
from user.models import User          # noqa: F401
from course.models import Course, Chapter, Lesson  # noqa: F401

target_metadata = Base.metadata
```

Alembic cần import để các model đăng ký vào `Base.metadata` → autogenerate mới detect được bảng.

### Rule chung

> **Các model file KHÔNG BAO GIỜ cần import lẫn nhau.** Chỉ cần 1 file trung tâm (vd: `env.py`, hoặc `models/__init__.py`) import tất cả model để đăng ký vào `Base.metadata`.

---

## 🔗 References

- [SQLAlchemy Relationship Patterns](https://docs.sqlalchemy.org/en/20/orm/relationships.html)
- [Association Object pattern](https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html#association-object)
- [Cascade docs](https://docs.sqlalchemy.org/en/20/orm/cascades.html)
- Module liên quan: M2 (User model), M4 (Course/Chapter/Lesson — 1-N), M8 (Teacher CRUD), M11 (Enrollment — N-N)
- Related notes: [[orm]], [[crud]]

