---
tags: [sqlalchemy, crud, async, query, transaction, fastapi]
related: [ket-noi-db, orm]
module_refs: [M2, M3, M4]
---

# CRUD — Tương tác với data qua SQLAlchemy (async)

> Pattern INSERT/SELECT/UPDATE/DELETE async với AsyncSession. Bao gồm transaction, eager loading, pattern CRUD trong FastAPI.

---

## Setup giả định

Mọi tương tác đi qua `AsyncSession`. Code giả định bạn đã có model:

```python
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=True)
```

## INSERT — Thêm data

**Single row:**

```python
async def create_user(db: AsyncSession, email: str, name: str) -> User:
    user = User(email=email, name=name)
    db.add(user)             # Pending — chưa lưu DB
    await db.commit()        # Sinh INSERT, COMMIT transaction
    await db.refresh(user)   # Refresh để lấy id auto-increment + default values từ DB
    return user
```

**Lưu ý `refresh`**: sau commit, nếu cần đọc `user.id` (PK auto-generated) hay column có `server_default` (vd `created_at`), phải refresh để lấy giá trị DB sinh ra. Nếu set `expire_on_commit=False` (xem [[ket-noi-db]]), attribute đã có sẵn → không cần refresh trừ khi muốn lấy column server-side.

**Bulk insert:**

```python
from sqlalchemy import insert

# Cách 1: add_all (qua ORM, chậm hơn nhưng tiện)
users = [User(email=f"u{i}@x.com", name=f"User {i}") for i in range(100)]
db.add_all(users)
await db.commit()

# Cách 2: bulk insert qua Core (nhanh hơn ~10x, không trả về object)
await db.execute(
    insert(User),
    [{"email": f"u{i}@x.com", "name": f"User {i}"} for i in range(10000)]
)
await db.commit()
```

→ Bulk 1000+ row dùng Core, không add_all.

## SELECT — Đọc data

**Lấy theo PK (nhanh nhất, dùng Identity Map cache):**

```python
user = await db.get(User, 1)  # SELECT * FROM users WHERE id=1
if user is None:
    raise HTTPException(404)
```

**Filter điều kiện:**

```python
from sqlalchemy import select

stmt = select(User).where(User.email == "a@x.com")
result = await db.execute(stmt)
user = result.scalar_one_or_none()   # 0 hoặc 1 row, None nếu không có
# user = result.scalar_one()         # ĐÚNG 1 row, raise nếu 0 hoặc nhiều
```

**Nhiều rows:**

```python
stmt = select(User).where(User.is_active == True)
result = await db.execute(stmt)
users = result.scalars().all()       # list[User]
# hoặc iterate
for user in result.scalars():
    print(user.email)
```

**Combine điều kiện:**

```python
from sqlalchemy import and_, or_

stmt = select(User).where(
    and_(User.is_active == True, User.name.ilike("%an%"))
)
# Hoặc dùng tuple — and_ ngầm:
stmt = select(User).where(User.is_active == True, User.name.ilike("%an%"))
```

**Order, limit, offset (pagination):**

```python
stmt = (
    select(User)
    .where(User.is_active == True)
    .order_by(User.created_at.desc())
    .limit(20)
    .offset(40)              # trang 3, mỗi trang 20
)
users = (await db.execute(stmt)).scalars().all()
```

**Aggregate (COUNT, SUM, AVG):**

```python
from sqlalchemy import func

stmt = select(func.count()).select_from(User).where(User.is_active == True)
total = (await db.execute(stmt)).scalar()  # int

# Group by
stmt = (
    select(User.is_active, func.count(User.id))
    .group_by(User.is_active)
)
rows = (await db.execute(stmt)).all()  # list[(bool, int)]
```

**JOIN với relationship (eager loading, tránh N+1):**

```python
from sqlalchemy.orm import selectinload

stmt = (
    select(User)
    .options(selectinload(User.courses))   # load courses trong 1 query phụ
    .where(User.id == 1)
)
user = (await db.execute(stmt)).scalar_one()
for course in user.courses:                # KHÔNG query thêm
    print(course.title)
```

→ Chi tiết N+1 problem: xem [[orm]] section "Vấn đề N+1".

**JOIN không qua relationship:**

```python
stmt = (
    select(User.name, Course.title)
    .join(Course, Course.owner_id == User.id)
    .where(Course.title.ilike("%react%"))
)
rows = (await db.execute(stmt)).all()  # list[(name, title)]
```

## UPDATE — Sửa data

**Object-based (qua ORM, recommend cho trường hợp thường):**

```python
user = await db.get(User, 1)
user.name = "New Name"
user.is_active = False
await db.commit()
# SQLAlchemy tự sinh UPDATE users SET name=..., is_active=... WHERE id=1
```

→ Unit of Work track diff, chỉ UPDATE column thực sự thay đổi.

**Bulk update (nhanh hơn, không load object):**

```python
from sqlalchemy import update

stmt = (
    update(User)
    .where(User.is_active == False)
    .values(is_active = True)
)
await db.execute(stmt)
await db.commit()
# UPDATE users SET is_active=true WHERE is_active=false
```

→ Bulk update KHÔNG đi qua ORM, KHÔNG trigger event listener, KHÔNG update Identity Map. Object đang trong session sẽ stale → cần `await db.expire_all()` nếu sau đó còn dùng.

## DELETE — Xóa data

**Object-based:**

```python
user = await db.get(User, 1)
await db.delete(user)
await db.commit()
# DELETE FROM users WHERE id=1
```

**Bulk delete:**

```python
from sqlalchemy import delete

stmt = delete(User).where(User.is_active == False)
await db.execute(stmt)
await db.commit()
```

**Soft delete (recommend cho data user-facing):**

→ Không xóa thật, chỉ set flag. Thêm column `deleted_at: Mapped[Optional[datetime]]`, update thay vì delete:

```python
user.deleted_at = datetime.utcnow()
await db.commit()
```

Khi query mặc định: `where(User.deleted_at.is_(None))`.

## Transaction — gom nhiều thao tác

Session **tự động** quản lý transaction. Mặc định mọi thao tác nằm trong 1 transaction, `commit()` để confirm hoặc `rollback()` để hủy.

**Pattern explicit:**

```python
async def transfer_courses(db: AsyncSession, from_user_id: int, to_user_id: int):
    try:
        async with db.begin():           # begin transaction explicit
            stmt = (
                update(Course)
                .where(Course.owner_id == from_user_id)
                .values(owner_id = to_user_id)
            )
            await db.execute(stmt)
            # commit tự động khi exit `async with` mà không exception
    except Exception:
        # rollback tự động — không cần gọi
        raise
```

**Rollback thủ công khi có lỗi giữa chừng:**

```python
try:
    db.add(user)
    await db.flush()
    db.add(course)
    await db.commit()
except IntegrityError:
    await db.rollback()
    raise
```

## Pattern hay dùng trong FastAPI

**Repository / CRUD function:**

```python
# crud/user.py
async def get_user(db: AsyncSession, user_id: int) -> User | None:
    return await db.get(User, user_id)

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return (await db.execute(stmt)).scalar_one_or_none()

async def create_user(db: AsyncSession, data: UserCreate) -> User:
    user = User(**data.model_dump())
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def list_users(db: AsyncSession, skip: int = 0, limit: int = 20) -> list[User]:
    stmt = select(User).offset(skip).limit(limit)
    return list((await db.execute(stmt)).scalars().all())
```

**Endpoint sử dụng:**

```python
@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await get_user(db, user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    return user
```

**get_or_create (idempotent):**

```python
async def get_or_create_user(db: AsyncSession, email: str, name: str) -> User:
    existing = await get_user_by_email(db, email)
    if existing:
        return existing
    user = User(email=email, name=name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
```

→ Race condition risk: nếu 2 request cùng tạo email giống nhau, một sẽ fail unique constraint. Production cần handle `IntegrityError` + retry, hoặc dùng `INSERT ... ON CONFLICT DO NOTHING` (PostgreSQL specific).

## Quy tắc nhớ — cheatsheet

| Thao tác | Pattern chuẩn async |
|---|---|
| Lấy theo PK | `await db.get(Model, id)` |
| Lấy 1 row theo điều kiện | `(await db.execute(select(...).where(...))).scalar_one_or_none()` |
| Lấy nhiều rows | `(await db.execute(...)).scalars().all()` |
| Đếm | `(await db.execute(select(func.count())...)).scalar()` |
| Insert | `db.add(obj); await db.commit(); await db.refresh(obj)` |
| Update qua ORM | sửa attribute → `await db.commit()` |
| Bulk update | `await db.execute(update(...).where(...).values(...))` |
| Delete | `await db.delete(obj); await db.commit()` |
| Tránh N+1 | `.options(selectinload(Model.relation))` |

→ Luôn `await` trước `db.execute()`, `db.commit()`, `db.refresh()`, `db.delete()`. Quên là bug âm thầm — code không lỗi nhưng data không đổi.

## Common pitfall

- **Quên `await`** trước các method async → coroutine không chạy, code "có vẻ pass" nhưng data không lưu.
- **`scalar_one()` khi 0 row** → raise `NoResultFound`. Dùng `scalar_one_or_none()` nếu chấp nhận None.
- **`scalar()` vs `scalars()`** — `scalar()` lấy giá trị scalar duy nhất (cho aggregate), `scalars()` map Row → Model object (cho list[User]).
- **Bulk update qua Core không update Identity Map** → object trong session vẫn giữ giá trị cũ, cần `await db.expire_all()` hoặc query lại.
- **Quên `commit`** sau khi `add()` / `delete()` → thay đổi không persist.
- **Commit giữa transaction explicit `async with db.begin()`** → lỗi double-commit. Trong context đó, để `async with` tự commit khi exit.
