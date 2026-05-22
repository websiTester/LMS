---
tags: [pydantic, pydantic-v2, validation, serialization, fastapi]
related: [pydantic-schemas, dependency-injection, crud]
module_refs: [M1, M2, M3]
---

# Pydantic v2 — Core concepts

> Pydantic = data validation + serialization library cho Python. Dùng type hint để define schema, tự validate input + serialize output. Là backbone của FastAPI: mọi request body, response, query/path param đều đi qua Pydantic.

---

## Khái niệm

**Pydantic làm gì:**

1. **Validate** — kiểm tra data đầu vào có đúng type + constraint không (vd: `age` phải là int >= 0, `email` phải đúng format).
2. **Coerce** — tự convert type nếu hợp lý (vd: string `"42"` → int `42` khi field type `int`).
3. **Serialize** — convert Python object → dict / JSON (ngược lại với validate).
4. **Document** — auto sinh JSON Schema → FastAPI dùng để build OpenAPI docs (`/docs`).

**v1 vs v2:**
- v2 viết lại bằng Rust → nhanh hơn 5-50x.
- API thay đổi nhiều: `.dict()` → `.model_dump()`, `validator` → `field_validator`, `Config` class → `ConfigDict`, etc.
- Bạn đang ở v2 (FastAPI hiện đại require Pydantic v2).

---

## BaseModel — class cơ bản

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool = True   # default value, optional
```

**Tạo instance + validate:**

```python
# Từ dict — common path
user = User(**{"id": 1, "name": "An", "email": "a@x.com"})
# Hoặc:
user = User.model_validate({"id": 1, "name": "An", "email": "a@x.com"})

# Từ kwargs
user = User(id=1, name="An", email="a@x.com")

# Truy cập attribute
print(user.name)           # "An"
print(user.is_active)      # True (default)
```

**Sai data → raise `ValidationError`:**

```python
User(id="abc", name="An", email="a@x.com")
# pydantic.ValidationError:
# id: Input should be a valid integer, unable to parse string as an integer
```

**Type coercion tự động (khi không strict):**

```python
user = User(id="42", name="An", email="a@x.com")
print(user.id, type(user.id))   # 42 <class 'int'>  ← string "42" → int 42
```

→ Pydantic strict mode (`model_config = ConfigDict(strict=True)`) sẽ KHÔNG coerce.

---

## Type hints Pydantic hiểu

| Python type | Pydantic xử lý |
|---|---|
| `int`, `float`, `str`, `bool` | Primitive + auto coerce |
| `list[T]`, `dict[K, V]` | Container, validate từng element |
| `Optional[T]` / `T \| None` | Cho phép `None` |
| `Literal["a", "b"]` | Chỉ chấp nhận giá trị enum |
| `Enum` | Map sang enum class |
| `datetime`, `date`, `time` | Parse từ ISO string |
| `UUID` | Validate format UUID |
| `EmailStr` | Validate email (cần `pip install email-validator`) |
| `HttpUrl`, `IPvAnyAddress` | URL / IP validation |
| `Annotated[T, ...]` | Wrap type với constraint (xem `Field` bên dưới) |

**Ví dụ:**

```python
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, HttpUrl

class User(BaseModel):
    id: int
    email: EmailStr                            # validate email format
    role: Literal["student", "teacher"]        # chỉ 2 giá trị
    avatar_url: HttpUrl | None = None          # optional URL
    tags: list[str] = []                       # list of string, default rỗng
    created_at: datetime                       # parse "2026-05-22T10:00:00"
```

---

## `Field()` — constraint chi tiết

`Field(...)` để chỉ định metadata + constraint:

```python
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    age: int = Field(ge=0, le=150)                          # 0 <= age <= 150
    bio: str | None = Field(default=None, max_length=500)
    score: float = Field(default=0.0, ge=0.0, le=100.0)
    tags: list[str] = Field(default_factory=list)           # default rỗng (KHÔNG dùng default=[])
```

**Constraint phổ biến:**

| Constraint | Áp dụng cho | Ý nghĩa |
|---|---|---|
| `min_length` / `max_length` | str, list | Độ dài |
| `pattern` | str | Regex |
| `ge` / `gt` / `le` / `lt` | int, float | Greater/less (equal) |
| `multiple_of` | int, float | Bội số |
| `default` | mọi type | Giá trị mặc định |
| `default_factory` | mọi type | Factory function (cho mutable default như `[]`, `{}`) |
| `alias` | mọi type | Tên field trong JSON khác tên attribute Python |
| `description` | mọi type | Hiện trong OpenAPI docs |
| `examples` | mọi type | Ví dụ trong docs |

→ `default_factory=list` **bắt buộc** cho mutable default (list, dict, set). Dùng `default=[]` sẽ share cùng list giữa các instance — bug nguy hiểm.

---

## Validators — custom logic

### `@field_validator` — validate 1 field

```python
from pydantic import BaseModel, field_validator

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_strong_enough(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
```

→ Return value trở thành value của field (có thể transform). Raise `ValueError` để báo lỗi.

### `@model_validator` — validate cross-field

Dùng khi cần check 2+ field cùng nhau:

```python
from pydantic import BaseModel, model_validator

class UserCreate(BaseModel):
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
```

→ `mode="after"`: chạy SAU khi các field đã validate xong (recommend, dùng `self`).
→ `mode="before"`: chạy TRƯỚC validate, nhận raw dict (advanced).

→ Pattern này tốt hơn check trong service layer: FastAPI tự trả 422 với message chuẩn, không leak vào business logic.

---

## `ConfigDict` — config model

```python
from pydantic import BaseModel, ConfigDict

class UserRead(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(
        from_attributes=True,    # convert từ ORM object (truy cập attribute)
        str_strip_whitespace=True,
        populate_by_name=True,   # cho phép dùng cả alias và tên gốc
        extra="forbid",          # reject field không khai báo (default: "ignore")
    )
```

**Các config hay dùng:**

| Config | Tác dụng |
|---|---|
| `from_attributes=True` | Cho phép `Model.model_validate(orm_object)` (convert ORM → Pydantic) |
| `str_strip_whitespace=True` | Auto strip whitespace của mọi field string |
| `extra="forbid"` | Reject field không khai báo trong schema (chống typo, security) |
| `extra="allow"` | Lưu field thừa vào `model.__pydantic_extra__` |
| `populate_by_name=True` | Field có alias vẫn nhận được tên gốc |
| `frozen=True` | Immutable — không sửa được attribute sau khi tạo |
| `validate_assignment=True` | Re-validate khi gán attribute sau khi tạo |

---

## `from_attributes=True` — chi tiết quan trọng

Mặc định Pydantic v2 chỉ validate được từ **dict**, KHÔNG đọc từ object:

```python
class UserRead(BaseModel):
    id: int
    email: str

# ✅ OK — dict
UserRead.model_validate({"id": 1, "email": "a@x.com"})

# ❌ Lỗi — object
UserRead.model_validate(orm_user)
# ValidationError: Input should be a valid dictionary
```

Bật `from_attributes=True` → Pydantic dùng `getattr(obj, "field")` thay vì subscript:

```python
class UserRead(BaseModel):
    id: int
    email: str
    model_config = ConfigDict(from_attributes=True)

UserRead.model_validate(orm_user)   # ✅ Pydantic đọc attribute
```

### Tại sao FastAPI vẫn chạy được nếu KHÔNG bật?

FastAPI có **lớp xử lý trung gian** `jsonable_encoder` trước khi Pydantic validate response:

```
1. Endpoint return ORM User object
2. FastAPI gọi jsonable_encoder(user_obj)
   → duyệt attribute, convert thành dict {"id": 1, "email": "...", ...}
3. Pydantic UserRead.model_validate(dict)  ← input đã là dict, không cần from_attributes
4. Return JSON
```

→ Tại bước 3, Pydantic nhận dict đã được encode, không cần `from_attributes=True`. Đó là lý do nhiều người không set vẫn thấy chạy bình thường qua FastAPI route.

### Khi nào BẮT BUỘC cần `from_attributes=True`

Khi convert ORM → Pydantic **TRỰC TIẾP** (không qua FastAPI flow):

**1. Service layer trả Pydantic:**
```python
async def get_user(db: AsyncSession, user_id: int) -> UserRead:
    orm_user = await db.get(User, user_id)
    return UserRead.model_validate(orm_user)   # ← CẦN
```

**2. Test unit:**
```python
def test_serialize():
    user = User(id=1, email="a@x.com")
    user_read = UserRead.model_validate(user)   # ← CẦN
```

**3. Custom response logic:**
```python
@router.get("/users/{id}")
async def custom(id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, id)
    return {
        "user": UserRead.model_validate(user),   # ← CẦN
        "extra": "...",
    }
```

### Best practice — LUÔN thêm

Set `from_attributes=True` cho mọi response schema vì:

| Lý do | Giải thích |
|---|---|
| **Future-proof** | Refactor service trả Pydantic về sau không phải sửa lại |
| **Test thuận lợi** | `Model.model_validate(orm_obj)` work ngay |
| **Consistent** | Đọc code rõ intent: schema này có thể tạo từ ORM |
| **Cost = 0** | 1 dòng, không ảnh hưởng performance |
| **FastAPI có thể đổi** | Future version có thể bỏ pre-convert → code vẫn chạy |

### Pydantic v1 → v2 đổi tên

| | v1 (cũ) | v2 (hiện tại) |
|---|---|---|
| Tên config | `orm_mode = True` | `from_attributes = True` |
| Vị trí | `class Config: orm_mode = True` | `model_config = ConfigDict(from_attributes=True)` |

→ Tutorial cũ thường dùng `orm_mode` — Pydantic v2 warn cho qua nhưng không nên dùng.

### Caveat: lazy loading async — `from_attributes` không cứu được

Nếu schema có field tham chiếu relationship:

```python
class UserRead(BaseModel):
    id: int
    courses: list[CourseRead]   # ← relationship
    model_config = ConfigDict(from_attributes=True)
```

Khi Pydantic đọc `orm_user.courses`, SQLAlchemy cần query → **async mặc định disable lazy loading** → raise `MissingGreenlet`.

→ Phải eager load TRƯỚC khi serialize:

```python
stmt = select(User).options(selectinload(User.courses)).where(User.id == 1)
user = (await db.execute(stmt)).scalar_one()
return user   # courses đã loaded, serialize OK
```

→ Xem [[orm]] về N+1 problem và [[crud]] về eager loading.

---

## Nested model

Pydantic compose model thoải mái:

```python
class Address(BaseModel):
    street: str
    city: str
    zip_code: str

class Course(BaseModel):
    id: int
    title: str

class User(BaseModel):
    id: int
    name: str
    address: Address                      # nested
    courses: list[Course] = []            # list of nested
```

```python
user = User.model_validate({
    "id": 1,
    "name": "An",
    "address": {"street": "123", "city": "HN", "zip_code": "100000"},
    "courses": [{"id": 1, "title": "React"}],
})
print(user.address.city)         # "HN"
print(user.courses[0].title)     # "React"
```

→ Pydantic validate đệ quy. Nested error message rất chi tiết (path đến field bị lỗi).

---

## Serialize — `model_dump()` / `model_dump_json()`

```python
user = User(id=1, name="An", email="a@x.com")

user.model_dump()        # → dict: {"id": 1, "name": "An", "email": "a@x.com", "is_active": True}
user.model_dump_json()   # → JSON string: '{"id":1,"name":"An",...}'
```

**Tham số hay dùng:**

```python
user.model_dump(
    exclude={"password", "hashed_password"},   # bỏ field nhạy cảm
    exclude_none=True,                          # bỏ field None
    exclude_unset=True,                         # bỏ field không set explicit
    by_alias=True,                              # dùng alias name
)
```

→ `exclude_unset=True` cực hữu ích cho PATCH endpoint (chỉ lấy field client thực sự gửi):

```python
@router.patch("/users/{id}")
async def update(id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, id)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.commit()
```

→ Không update field client không gửi.

---

## Validate từ dict / JSON

```python
# Từ dict
user = User.model_validate({"id": 1, "name": "An", "email": "a@x.com"})

# Từ JSON string
user = User.model_validate_json('{"id": 1, "name": "An", "email": "a@x.com"}')

# Từ ORM object (cần from_attributes=True)
class UserRead(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

orm_user = await db.get(User, 1)
user_read = UserRead.model_validate(orm_user)
```

---

## Inheritance — DRY schema

Pattern hay dùng để tránh duplicate field giữa Create/Update/Read:

```python
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    role: Literal["student", "teacher"]

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class UserUpdate(BaseModel):
    # Tất cả optional cho PATCH
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=50)
    role: Literal["student", "teacher"] | None = None

class UserRead(UserBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)
```

→ Xem [[pydantic-schemas]] để hiểu sâu hơn về pattern `models/` vs `schemas/` trong FastAPI.

---

## Settings management — `BaseSettings`

Pydantic v2 tách `BaseSettings` thành package riêng `pydantic-settings`. Dùng load config từ `.env`:

```python
# core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    database_url: str
    secret_key: str
    cors_origins: list[str] = []

settings = Settings()
```

```env
# .env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
SECRET_KEY=changeme
CORS_ORIGINS=["http://localhost:3000"]
```

→ Tự load `.env`, validate type. Sai type → fail khi import settings.

---

## Common pitfall

- **`default=[]` cho list field** → share giữa instances. Phải dùng `default_factory=list`.
- **`@field_validator` quên `@classmethod`** → Pydantic v2 strict, raise lỗi.
- **`from_attributes=True` thiếu** → không convert được ORM → Pydantic, raise `ValidationError`.
- **Validate trong service thay vì Pydantic** → leak validation logic, response 500 thay vì 422.
- **`EmailStr` không hoạt động** → quên `pip install email-validator`.
- **Mix v1 v2 syntax** — vd: dùng `class Config:` (v1) với Pydantic v2 → silently ignored.
- **Pydantic v2 strict mode + FastAPI** — nếu set `strict=True`, client gửi `"true"` (string) thay vì `true` (bool) → reject. Default non-strict thường tốt hơn cho API.

---

## Quy tắc nhớ

| Tình huống | Dùng cái nào |
|---|---|
| Define data shape | `class Foo(BaseModel)` |
| Validate 1 field | `@field_validator("field_name")` |
| Validate nhiều field cùng lúc | `@model_validator(mode="after")` |
| Constraint min/max/regex | `Field(min_length=..., pattern=...)` |
| Default mutable (list, dict) | `Field(default_factory=list)` |
| Convert ORM → Pydantic | `ConfigDict(from_attributes=True)` |
| Load `.env` | `pydantic_settings.BaseSettings` |
| Convert Pydantic → dict | `.model_dump()` |
| PATCH endpoint (chỉ field client gửi) | `.model_dump(exclude_unset=True)` |

---

## 🔗 References

- [Pydantic v2 docs](https://docs.pydantic.dev/latest/)
- [Pydantic Field docs](https://docs.pydantic.dev/latest/api/fields/)
- [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- Module liên quan: M1 (config settings), M2 (UserCreate/Read schemas), M3+ (mọi endpoint)
- Related notes: [[pydantic-schemas]] (convention `models/` vs `schemas/`), [[dependency-injection]] (Depends + Pydantic body), [[crud]] (dùng schemas trong CRUD), [[bien-moi-truong-python]] (load `.env` qua BaseSettings)
