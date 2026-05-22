---
tags: [fastapi, error, response, exception-handler, validation, production]
related: [responses-va-errors, pydantic-v2, pydantic-schemas]
module_refs: [M2, M3, M4]
---

# Unified Error Response — Format chuẩn cho production

> Vấn đề: Pydantic ValidationError (422) và HTTPException (4xx/5xx) trả về 2 format KHÁC nhau → frontend phải parse 2 cách → pain point thực tế. Note này: chuẩn industry, pattern unified format, implementation đầy đủ với custom exception handlers cho FastAPI.

---

## Vấn đề: 2 format không nhất quán

**Pydantic auto-generated (422):**

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body"],
      "msg": "Value error, Passwords do not match",
      "input": {...},
      "ctx": {...}
    }
  ]
}
```

**HTTPException thủ công (409):**

```json
{
  "detail": "User with this email already exists"
}
```

→ Frontend pain:

```javascript
// ❌ Phải if/else parse 2 loại
if (response.status === 422) {
  errors = response.data.detail.map(e => ({ field: e.loc, msg: e.msg }))
} else {
  errorMsg = response.data.detail   // string
}
```

→ **Doanh nghiệp KHÔNG sống chung với 2 format** — luôn unify thành 1.

---

## 4 chuẩn industry phổ biến

### RFC 7807 — Problem Details for HTTP APIs (IETF)

```json
{
  "type": "https://example.com/errors/email-exists",
  "title": "Email already registered",
  "status": 409,
  "detail": "The email user@x.com is already in use",
  "instance": "/users/register"
}
```

→ Standard IETF, enterprise Java/.NET dùng nhiều. Hơi verbose cho FE.

### Google API Design Guide

```json
{
  "error": {
    "code": 409,
    "message": "Email đã tồn tại",
    "status": "ALREADY_EXISTS",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.BadRequest",
        "fieldViolations": [
          { "field": "email", "description": "Email already registered" }
        ]
      }
    ]
  }
}
```

→ Google Cloud, Firebase. Robust, `status` text + `details` linh hoạt.

### Microsoft Graph API

```json
{
  "error": {
    "code": "EmailAlreadyExists",
    "message": "Email đã tồn tại",
    "innerError": {
      "request-id": "...",
      "date": "..."
    }
  }
}
```

→ Microsoft 365, Azure. Có `request-id` để trace logs.

### JSON:API spec

```json
{
  "errors": [
    {
      "status": "409",
      "code": "EMAIL_EXISTS",
      "title": "Conflict",
      "detail": "Email đã tồn tại",
      "source": { "pointer": "/data/attributes/email" }
    }
  ]
}
```

→ Hơi nặng, ít team Python/JS dùng.

---

## Format recommend cho FastAPI project

Format đơn giản, inspired by Google — phổ biến nhất trong FastAPI enterprise:

```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "Email đã tồn tại",
  "field": "email",                    // optional, cho single-field error
  "errors": [                          // optional, cho multi-field validation
    { "field": "password", "message": "..." }
  ]
}
```

**Frontend xử lý 1 cách duy nhất:**

```javascript
const { code, message, field, errors } = response.data
if (errors) {
  errors.forEach(e => setFieldError(e.field, e.message))   // multi-field
} else if (field) {
  setFieldError(field, message)                            // single-field
} else {
  showToast(message)                                        // generic
}
// i18n: t(`errors.${code}`)
```

---

## Implementation — override 2 exception handlers

### Step 1: Define error schema chuẩn

```python
# core/errors.py
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    field: str
    message: str
    type: str | None = None

class ErrorResponse(BaseModel):
    code: str
    message: str
    field: str | None = None
    errors: list[ErrorDetail] | None = None
```

### Step 2: Override Pydantic 422 + HTTPException handler

```python
# core/error_handlers.py
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

def register_error_handlers(app: FastAPI):

    # Pydantic ValidationError → format chuẩn
    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError):
        errors = []
        for err in exc.errors():
            # loc thường là ["body", "field_name"] hoặc ["body"] cho model_validator
            loc = [str(x) for x in err["loc"][1:]]   # bỏ "body"
            field = ".".join(loc) if loc else "_root_"
            errors.append({
                "field": field,
                "message": err["msg"],
                "type": err["type"],
            })

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "code": "VALIDATION_ERROR",
                "message": "Dữ liệu không hợp lệ",
                "errors": errors,
            },
        )

    # HTTPException → format chuẩn
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        # Nếu detail đã là dict có structure (vd: {"code": ..., "message": ...}), giữ nguyên
        if isinstance(exc.detail, dict) and "code" in exc.detail:
            return JSONResponse(status_code=exc.status_code, content=exc.detail)

        # Default: wrap string detail thành format chuẩn
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "code": "HTTP_ERROR",
                "message": exc.detail if isinstance(exc.detail, str) else "An error occurred",
            },
        )
```

### Step 3: Đăng ký vào app

```python
# main.py
from fastapi import FastAPI
from core.error_handlers import register_error_handlers

app = FastAPI()
register_error_handlers(app)
```

### Step 4: Service raise với code chuẩn

```python
# services.py
from fastapi import HTTPException, status

async def create_user(db, payload):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "EMAIL_ALREADY_EXISTS",
                "message": "Email đã tồn tại",
                "field": "email",
            },
        )
    # ...
```

---

## Kết quả — cả 2 loại lỗi cùng format

**Validation error (Pydantic 422 từ `@model_validator`):**

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "_root_",
      "message": "Value error, Passwords do not match",
      "type": "value_error"
    }
  ]
}
```

**Business rule error (HTTPException 409):**

```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "Email đã tồn tại",
  "field": "email"
}
```

→ Cùng format `{code, message, ...}`. FE xử lý 1 cách.

---

## Best practices kèm

### 1. Error code là **Enum**, không phải string tự do

```python
# core/error_codes.py
from enum import Enum

class ErrorCode(str, Enum):
    # Auth
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"

    # User
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"
    USER_NOT_FOUND = "USER_NOT_FOUND"

    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"

    # Business
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE"
    COURSE_FULL = "COURSE_FULL"
```

```python
raise HTTPException(
    status_code=409,
    detail={"code": ErrorCode.EMAIL_ALREADY_EXISTS.value, ...}
)
```

→ Tránh typo, autocomplete, dễ refactor, dễ document trong OpenAPI.

### 2. i18n ở Frontend dùng `code`, KHÔNG phải `message`

```javascript
const errorMessages = {
  EMAIL_ALREADY_EXISTS: t('errors.emailExists'),
  INVALID_CREDENTIALS: t('errors.invalidLogin'),
  // ...
}

showError(errorMessages[response.data.code] || t('errors.unknown'))
```

→ Backend trả tiếng Việt vẫn OK, nhưng FE override bằng i18n theo `code` → support đa ngôn ngữ. Khi đổi message tiếng, KHÔNG cần đổi backend.

### 3. Thêm `request_id` để trace log

```python
# main.py
import uuid

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response
```

```python
# trong handler:
return JSONResponse(
    status_code=...,
    content={
        "code": ...,
        "message": ...,
        "request_id": getattr(request.state, "request_id", None),
    },
)
```

→ User báo lỗi, hỏi `request_id` → grep log → tìm chính xác request đó. Critical cho debug production.

### 4. Log NỘI BỘ chi tiết, response NGOÀI generic

```python
import logging
logger = logging.getLogger(__name__)

try:
    payment = await charge_user(...)
except StripeError as e:
    logger.error(f"Stripe error for user {user_id}: {e}", exc_info=True)
    # KHÔNG leak chi tiết Stripe ra ngoài
    raise HTTPException(
        500,
        detail={
            "code": "PAYMENT_FAILED",
            "message": "Thanh toán thất bại, vui lòng thử lại",
        }
    )
```

→ Log nội bộ: stack trace + chi tiết third-party.
→ Response ngoài: generic message → không leak architecture, không panic user.

---

## Common pitfall

- **Không override Pydantic 422 handler** → app vẫn dùng default format `detail: [...]`, không match HTTPException → FE phải parse 2 loại.
- **Quên check `isinstance(detail, dict)`** trong HTTPException handler → wrap dict thành `{"code": "HTTP_ERROR", "message": {...}}` (message thành dict, sai).
- **Hardcode message tiếng Việt vào `code`** (vd: `code="EMAIL_DA_TON_TAI"`) → khó refactor, không chuẩn. `code` luôn nên là English UPPER_SNAKE_CASE.
- **Dùng cả `errors` và `field` cùng lúc** → frontend lẫn lộn dùng cái nào. Convention: `errors` (multi-field) hoặc `field` (single-field), không cùng lúc.
- **Trả full stack trace ra response** → leak internal architecture, security risk. Stack trace chỉ log, không response.
- **Không có `request_id`** → user báo "API trả 500 lúc 3h chiều" → đào log không ra.

---

## Quy tắc nhớ

| Aspect | Recommend |
|---|---|
| Format chính | `{code, message, field?, errors?}` |
| Pydantic 422 | Override handler để match format |
| HTTPException | Override handler, support `detail` dạng dict |
| `code` | Enum UPPER_SNAKE_CASE, English |
| `message` | Có thể tiếng Việt, FE thường override bằng i18n |
| `request_id` | Thêm middleware sinh + header `X-Request-ID` |
| Log vs Response | Log chi tiết, response generic — không leak architecture |
| Error code source-of-truth | 1 file `core/error_codes.py` chứa Enum |

---

## 🔗 References

- [RFC 7807 — Problem Details](https://datatracker.ietf.org/doc/html/rfc7807)
- [Google Cloud API Error Handling](https://cloud.google.com/apis/design/errors)
- [Microsoft REST API Guidelines — Errors](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#7102-error-condition-responses)
- [JSON:API — Errors](https://jsonapi.org/format/#errors)
- [FastAPI — Custom exception handlers](https://fastapi.tiangolo.com/tutorial/handling-errors/#install-custom-exception-handlers)
- Module liên quan: M1 (setup error handlers), M2+ (mọi endpoint)
- Related notes: [[responses-va-errors]] (HTTP basics), [[pydantic-v2]] (`@model_validator`), [[pydantic-schemas]] (response shape)
