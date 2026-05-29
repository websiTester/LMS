---
tags: [fastapi, dependency-injection, depends, endpoint, routing]
related: [pydantic-schemas, ket-noi-db, async-with-va-yield, bao-mat-jwt]
module_refs: [M1, M2, M3]
---

# Dependency Injection trong FastAPI — `Depends()`

> Cách FastAPI inject dependency (DB session, current user, config...) vào endpoint qua `Depends()`. Bao gồm cơ chế phân loại parameter, lỗi thường gặp khi quên `Depends`, và convention thứ tự param.

---

## Cách FastAPI phân loại parameter của endpoint

FastAPI phân loại mỗi param theo **default value** + **type**:

| Default value | FastAPI coi là | Ví dụ |
|---|---|---|
| `Depends(...)` | Dependency — gọi function, inject return value | `db: AsyncSession = Depends(get_db)` |
| `Query(...)` / không default + type primitive | Query string | `q: str = Query(...)` |
| `Path(...)` / có trong URL pattern `/{var}` | Path param | `user_id: int` (khi route là `/users/{user_id}`) |
| `Body(...)` / type là Pydantic `BaseModel` | Request body JSON | `payload: UserCreate` |
| `Header(...)` / `Cookie(...)` | HTTP header / cookie | `user_agent: str = Header(...)` |

→ Param **không có default** + type **không phải Pydantic** + **không trong URL** → FastAPI fallback coi là **body** → cố sinh Pydantic field → crash nếu type không tương thích.

## Lỗi thực tế: `Invalid args for response field` khi quên `Depends`

**Code SAI:**

```python
@router.post("/register")
async def register_user(db: AsyncSession, payload: UserCreate):
    #                    ^^^^^^^^^^^^^^^ thiếu = Depends(get_db)
    ...
```

**Lỗi:**

```
fastapi.exceptions.FastAPIError: Invalid args for response field!
Hint: check that <class 'sqlalchemy.ext.asyncio.session.AsyncSession'> is a valid Pydantic field type.
```

**Nguyên nhân:**
- `db: AsyncSession` không có `= Depends(...)` → FastAPI coi là body param.
- `AsyncSession` không phải Pydantic model → fail khi tạo field.
- Error message nói "response field" gây confusion, nhưng thực tế FastAPI dùng cùng cơ chế `create_model_field` cho cả request và response → vấn đề thật là **request param không hợp lệ**.

**Fix:**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from .schemas import UserCreate, UserRead
from .services import create_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserRead)
async def register_user(
    payload: UserCreate,                          # body (Pydantic)
    db: AsyncSession = Depends(get_db),           # dependency (có Depends)
):
    return await create_user(db, payload)
```

**3 thay đổi cần thiết:**

| # | Sửa gì | Vì sao |
|---|---|---|
| 1 | `from fastapi import ..., Depends` | Import `Depends` |
| 2 | `from core.db import get_db` | Import dependency function |
| 3 | `db: AsyncSession = Depends(get_db)` | FastAPI nhận diện đây là dependency |

→ **Quy tắc nhớ:** Mọi type non-Pydantic, non-primitive trong endpoint param ĐỀU phải kèm `Depends(...)`.

## Cơ chế `Depends`

`Depends(get_db)` nói với FastAPI: "trước khi chạy endpoint, hãy gọi `get_db()` và inject return value vào param này".

**Flow:**

```
Request đến /users/register
    ↓
FastAPI parse body → tạo UserCreate instance
    ↓
FastAPI gọi get_db() → nhận AsyncSession từ yield
    ↓
FastAPI gọi register_user(payload=..., db=...)
    ↓
Sau khi endpoint xong → resume get_db() để cleanup (close session)
```

→ `get_db()` dùng pattern `async def` + `yield` (xem [[async-with-va-yield]]) để có cleanup tự động.

## Thứ tự param — convention

Convention FastAPI: **Path → Query → Body → Dependencies**.

```python
@router.put("/courses/{course_id}/chapters/{chapter_id}")
async def update_chapter(
    course_id: int,                                # 1. Path
    chapter_id: int,                               # 1. Path
    q: str | None = None,                          # 2. Query (optional)
    payload: ChapterUpdate,                        # 3. Body (Pydantic)
    db: AsyncSession = Depends(get_db),            # 4. Dependency
    current_user: User = Depends(get_current_user),# 4. Dependency
):
    ...
```

**Lý do:**
- Path/Query không có default → bắt buộc đứng trước param có default.
- Body Pydantic thường là input chính → đặt rõ trước dependencies.
- Dependencies thường là "auxiliary" (DB session, auth user, config) → cuối cho dễ scan.

## Sub-dependencies — Depends gọi Depends

Dependency có thể tự nó depend dependency khác:

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),           # ← dep này dùng dep khác
    db: AsyncSession = Depends(get_db),
) -> User:
    user_id = decode_jwt(token)
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(401)
    return user

@router.get("/me")
async def read_me(
    current_user: User = Depends(get_current_user),  # ← endpoint chỉ depend 1 cái, FastAPI lo phần resolve cây
):
    return current_user
```

→ FastAPI tự build dependency graph + resolve theo thứ tự. Mỗi dependency chỉ chạy **1 lần per request** (cache mặc định).

## Parameterized dependency — Depends với class

Khi dependency cần param (không phải fixed):

```python
class Paginator:
    def __init__(self, page: int = 1, size: int = 20):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size

@router.get("/courses")
async def list_courses(
    pag: Paginator = Depends(Paginator),    # ← class làm dependency
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Course).offset(pag.offset).limit(pag.size)
    return (await db.execute(stmt)).scalars().all()
```

→ FastAPI tự đọc `__init__` signature của `Paginator` → tạo query param `page`, `size` → instantiate → inject. Cách viết gọn hơn nếu cần nhóm nhiều query param.

## Common pitfall

- **Quên `Depends`** → `Invalid args for response field` (case ở trên).
- **Import sai `Depends`** từ module khác (vd: `pydantic.Depends`) → không có effect, FastAPI vẫn coi là body.
- **Dependency function quên `async def`** khi cần `await` trong đó → `SyntaxError: 'await' outside async function`.
- **Đặt path param SAU body/dependency** → Python `SyntaxError: non-default argument follows default argument`.
- **Dùng `Body(...)` cho param Pydantic + dependency khác cũng cần body** → conflict, FastAPI không biết parse body theo schema nào. Mỗi endpoint chỉ nên có 1 body param.
- **Dependency throws exception** → FastAPI tự convert thành HTTPException response. Trong dependency có thể `raise HTTPException(401)` trực tiếp.

## Quy tắc nhớ

| Khi nào dùng `Depends` | Khi nào KHÔNG |
|---|---|
| Inject resource có cleanup (DB session) | Param primitive (`int`, `str`) → để FastAPI tự coi là query/path |
| Lấy current user từ JWT | Body data → dùng Pydantic schema |
| Share logic giữa nhiều endpoint | Validation đơn giản → Pydantic `Field(...)` |
| Validate quyền truy cập | |
| Inject config / settings | |

## 🔗 References

- [FastAPI — Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI — Dependencies with yield](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/)
- Module liên quan: M1 (setup `get_db`), M2 (auth — `get_current_user`), mọi module có endpoint
- Related notes: [[pydantic-schemas]] (body Pydantic), [[ket-noi-db]] (`get_db` dependency), [[async-with-va-yield]] (cleanup pattern của `get_db`)
