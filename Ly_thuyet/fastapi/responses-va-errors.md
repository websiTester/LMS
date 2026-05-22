---
tags: [fastapi, response, error, http-status, httpexception, validation]
related: [pydantic-schemas, pydantic-v2, dependency-injection]
module_refs: [M2, M3, M4]
---

# Responses & Errors — Cách FastAPI trả về kết quả

> Pattern trả success/error response trong FastAPI: status code, `response_model`, `HTTPException`, Pydantic validation 422, custom exception handler, và HTTP status code convention chuẩn REST.

---

## SUCCESS response

### Default behavior

```python
@router.get("/users/{id}")
async def read_user(id: int):
    return {"id": id, "name": "An"}
```

FastAPI mặc định:
- **Status code: 200 OK**
- Auto convert return value → JSON
- Header `content-type: application/json`

### Custom status code qua decorator

```python
from fastapi import status

@router.post(
    "/users/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRead,
)
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, payload)
# → 201 Created, body: UserRead JSON
```

→ POST tạo resource mới phải dùng **201 Created** (REST convention), không phải 200.

### Status code success phổ biến

| Code | Tên | Khi nào | Body |
|---|---|---|---|
| **200 OK** | Default | GET, PUT, PATCH (cần trả data) | Có |
| **201 Created** | Tạo resource mới | POST tạo entity | Có (resource vừa tạo) |
| **202 Accepted** | Đã nhận, xử lý sau | Background task, async job | Có (job ID) |
| **204 No Content** | OK, không có data | DELETE thành công | **KHÔNG** body |

```python
@router.delete("/users/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, id)
    if not user:
        raise HTTPException(404, "Not found")
    await db.delete(user)
    await db.commit()
    # KHÔNG return gì — 204 cấm body
```

### `response_model` — control shape response

```python
@router.post("/users/register", response_model=UserRead)
async def register_user(...):
    return user_orm   # ORM object có cả password_hash
# FastAPI tự convert: ORM → UserRead → JSON
# UserRead lọc bỏ field không khai báo (password_hash KHÔNG bị leak)
```

→ Security: ngay cả khi service trả ORM đầy đủ, `response_model` lọc trước khi gửi client. Xem [[pydantic-schemas]].

### Response list

```python
@router.get("/users", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db)):
    stmt = select(User).limit(20)
    return (await db.execute(stmt)).scalars().all()
```

## ERROR response — `HTTPException`

```python
from fastapi import HTTPException, status

@router.get("/users/{id}", response_model=UserRead)
async def read_user(id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
```

**Response client nhận:**

```http
HTTP/1.1 404 Not Found
content-type: application/json

{"detail": "User not found"}
```

FastAPI tự convert `HTTPException` thành JSON response — status code + body `{"detail": ...}`.

### Status code error phổ biến

| Code | Tên | Khi nào | Ví dụ |
|---|---|---|---|
| **400** | Bad Request | Data sai logic (không phải shape) | "Date in the past" |
| **401** | Unauthorized | Chưa login / token hết hạn | JWT invalid |
| **403** | Forbidden | Có login nhưng không có quyền | User cố xóa course người khác |
| **404** | Not Found | Resource không tồn tại | `GET /users/999` không có |
| **409** | Conflict | State xung đột (duplicate, race) | Email đã tồn tại |
| **422** | Unprocessable Entity | **Pydantic validation fail** (auto FastAPI) | Body sai schema |
| **429** | Too Many Requests | Rate limit | API quota exceeded |
| **500** | Internal Server Error | Bug server (uncaught exception) | Code crash |
| **503** | Service Unavailable | Tạm thời down | DB connection fail |

→ Tránh trả 500 cho lỗi business. 500 chỉ nên xuất hiện khi có **bug** thực sự.

### `detail` có thể là dict / list — không chỉ string

```python
raise HTTPException(
    status_code=400,
    detail={
        "code": "INSUFFICIENT_BALANCE",
        "message": "Số dư không đủ",
        "current_balance": 50000,
        "required": 100000,
    },
)
```

→ Frontend parse `detail.code` để hiển thị i18n message, dùng field khác để render UI.

### Custom header trong error

```python
raise HTTPException(
    status_code=401,
    detail="Token expired",
    headers={"WWW-Authenticate": "Bearer"},
)
```

## Pydantic ValidationError — tự động 422

Client gửi body sai schema (thiếu field, sai type) → FastAPI tự trả 422 **không cần code**:

```http
POST /users/register
Body: {"email": "not-an-email", "password": "short"}

HTTP/1.1 422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    },
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

→ FastAPI auto-handle Pydantic ValidationError. KHÔNG bao giờ phải raise 422 thủ công.

## Pattern đầy đủ cho register endpoint

**`services.py`:**

```python
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

async def create_user(db: AsyncSession, payload: UserCreate) -> User:
    # Check business rule: email tồn tại?
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được sử dụng",
        )

    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    try:
        await db.commit()
    except IntegrityError:
        # Race condition safety net
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được sử dụng",
        )
    await db.refresh(new_user)
    return new_user
```

**`router.py`:**

```python
@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {"description": "Email đã tồn tại"},
        422: {"description": "Dữ liệu không hợp lệ"},
    },
)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    return await create_user(db, payload)
```

**Response client nhận:**

| Tình huống | Status | Body |
|---|---|---|
| Đăng ký thành công | **201** | `{"id": 1, "email": "...", ...}` (UserRead) |
| Body thiếu/sai format | **422** | `{"detail": [{"loc": ..., "msg": ...}, ...]}` |
| Email đã tồn tại | **409** | `{"detail": "Email đã được sử dụng"}` |
| DB crash | **500** | `{"detail": "Internal Server Error"}` |

→ `responses={...}` trong decorator chỉ để document trong `/docs` (Swagger UI), KHÔNG ảnh hưởng behavior.

## Custom exception handler — DRY pattern (advanced)

Khi nhiều endpoint cùng raise 1 loại lỗi:

```python
# core/exceptions.py
class EmailAlreadyExistsError(Exception):
    pass
```

```python
# main.py
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(EmailAlreadyExistsError)
async def email_exists_handler(request: Request, exc: EmailAlreadyExistsError):
    return JSONResponse(
        status_code=409,
        content={"detail": "Email đã được sử dụng"},
    )
```

```python
# services.py — chỉ raise domain exception, không cần HTTPException
async def create_user(...):
    if existing:
        raise EmailAlreadyExistsError()
```

→ Tách biệt:
- **Domain layer** (raise domain exception, không biết HTTP)
- **HTTP layer** (convert exception → response)

Phù hợp project lớn, nhiều layer.

## `Response` / `JSONResponse` — case đặc biệt

```python
from fastapi import Response
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse

@router.get("/avatar/{user_id}")
async def get_avatar(user_id: int):
    return FileResponse("avatars/user1.png", media_type="image/png")

@router.get("/raw")
async def custom():
    return JSONResponse(
        status_code=200,
        content={"x": 1},
        headers={"X-Custom-Header": "value"},
    )
```

→ Dùng khi cần stream file, custom header phức tạp, hoặc full control over response.

## Flow tóm tắt

```
SUCCESS:
  return value
    ↓
  response_model validate + serialize (lọc field không khai báo)
    ↓
  Convert JSON
    ↓
  HTTP {status_code in decorator, default 200} + body

ERROR (HTTPException):
  raise HTTPException(status_code, detail, headers)
    ↓
  FastAPI catch → JSONResponse
    ↓
  HTTP {status_code} + {"detail": <detail>}

ERROR (Pydantic ValidationError):
  Tự động 422 + body chi tiết lỗi từng field

ERROR (uncaught exception):
  HTTP 500 + {"detail": "Internal Server Error"}
```

## Common pitfall

- **Dùng 200 cho POST tạo mới** → sai REST convention, dùng **201**.
- **Return body trong endpoint 204** → FastAPI sẽ raise error vì 204 cấm body.
- **Raise `ValueError`/`Exception` thường** trong service → FastAPI trả 500 (Internal Server Error), không phải status code mong muốn. Phải dùng `HTTPException`.
- **Quên `response_model`** → trả thẳng ORM → leak field nhạy cảm (vd: `password_hash`).
- **Mismatch nullable** giữa ORM model và `response_model` → `ResponseValidationError` (status 500). Xem [[pydantic-v2]] về `from_attributes` + nullable.
- **Validate business state ở Pydantic schema** → không gọi được DB. Phải ở service layer.
- **Trả 500 cho lỗi business** thay vì 4xx → frontend không phân biệt được bug server vs lỗi nghiệp vụ. Always dùng đúng code 4xx.

## Quy tắc nhớ — status code

| Tình huống | Code |
|---|---|
| GET thành công | 200 |
| POST tạo mới thành công | **201** |
| DELETE thành công, không body | **204** |
| Resource không tồn tại | 404 |
| Duplicate (unique violation) | **409** |
| Chưa login | 401 |
| Login nhưng không có quyền | 403 |
| Body sai schema | **422** (tự động) |
| Bug server | 500 |

→ **Nguyên tắc:** dùng đúng status code REST giúp client (FE) handle error theo pattern chuẩn, không phải parse message string.

## 🔗 References

- [FastAPI — Response Model](https://fastapi.tiangolo.com/tutorial/response-model/)
- [FastAPI — Handling Errors](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- [MDN — HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- Module liên quan: M2 (auth endpoint), M3+ (mọi CRUD endpoint)
- Related notes: [[pydantic-schemas]] (response_model), [[pydantic-v2]] (`from_attributes`, ResponseValidationError), [[dependency-injection]] (HTTPException trong dependency)
