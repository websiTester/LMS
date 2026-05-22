---
tags: [fastapi, routing, apirouter, structure, modular]
related: [pydantic-schemas, setup]
module_refs: [M2, M3, M5]
---

# Routing & `APIRouter` — Tách router theo feature

> Cách tổ chức endpoint trong FastAPI thành nhiều file router độc lập (user, course, lesson...) thay vì gom hết vào `main.py`. Pattern này scale tốt khi project lớn.

---

## Vì sao cần `APIRouter`

Nếu để hết endpoint trong `main.py`:
- File phình to → khó navigate
- Mọi feature import lẫn nhau → dễ circular import
- Khó test riêng từng nhóm endpoint
- Swagger UI gom hết vào "default" tag → khó đọc

`APIRouter` = "mini FastAPI app" — gom các endpoint cùng nhóm thành 1 unit, rồi `main.py` chỉ `include_router()` lại.

## Pattern cơ bản

### Khai báo router trong feature folder

**`user/router.py`:**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.db import get_db
from user import schemas, services

router = APIRouter(
    prefix="/users",            # mọi route bên dưới đều có tiền tố /users
    tags=["users"],             # nhóm trong Swagger UI
)

@router.get("/", response_model=list[schemas.UserRead])
def list_users(db: Session = Depends(get_db)):
    return services.get_all_users(db)

@router.get("/{user_id}", response_model=schemas.UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = services.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.post("/", response_model=schemas.UserRead, status_code=201)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    return services.create_user(db, payload)
```

**`course/router.py`** (tương tự):

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.db import get_db
from course import schemas, services

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=list[schemas.CourseRead])
def list_courses(db: Session = Depends(get_db)):
    return services.get_all_courses(db)

@router.post("/", response_model=schemas.CourseRead, status_code=201)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    return services.create_course(db, payload)
```

### Wire vào `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from user.router import router as user_router
from course.router import router as course_router

app = FastAPI(title="LMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite dev — KHÔNG để "*" khi dùng cookie auth
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(course_router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

`main.py` giờ chỉ còn: tạo app, mount middleware, include routers. Không chứa business logic.

## Cấu trúc folder feature-based

```
lms_backend/
├── main.py
├── core/
│   ├── config.py
│   └── db.py
├── user/
│   ├── __init__.py
│   ├── router.py      ← APIRouter + endpoints (HTTP layer)
│   ├── schemas.py     ← Pydantic (request/response)
│   ├── models.py      ← SQLAlchemy ORM
│   └── services.py    ← business logic + DB query
├── course/
│   ├── __init__.py
│   ├── router.py
│   ├── schemas.py
│   ├── models.py
│   └── services.py
└── alembic/
```

**Vì sao chia 4 file per feature:**

| File | Trách nhiệm | Test được không cần FastAPI? |
|---|---|---|
| `router.py` | Define HTTP layer: path, method, status code. Gọi service. | Không (cần TestClient) |
| `services.py` | Business logic + DB query. Nhận `db: Session` + DTO, trả model/dict. | Có |
| `schemas.py` | Pydantic validate input + serialize output. | Có (unit test pure) |
| `models.py` | SQLAlchemy ORM, map DB table. | Có (qua session fixture) |

→ Tách services ra giúp test business logic riêng, không cần spin up HTTP server.

→ Xem chi tiết `schemas.py` vs `models.py` ở [[pydantic-schemas]].

## Common pitfall

### Prefix trùng → path bị nhân đôi

```python
# user/router.py
router = APIRouter(prefix="/users")

# main.py — SAI: đã có prefix trong router rồi
app.include_router(user_router, prefix="/users")   # → /users/users/...
```

Chỉ khai báo prefix ở **MỘT** chỗ. Convention: đặt trong `APIRouter()` (gần endpoint, dễ đọc).

### Circular import

Khi `user/services.py` cần model `Course`, mà `course/services.py` cần model `User`:

```python
# user/services.py — top-level import dễ vòng
from course.models import Course   # SAI nếu course cũng import user
```

**Fix:** import trong function (lazy):

```python
def get_enrolled_courses(db, user_id: int):
    from course.models import Course   # local import, chỉ load khi call
    return db.query(Course).filter(...).all()
```

Hoặc tách `models.py` thành module riêng không phụ thuộc service.

### Quên `tags` → Swagger UI khó đọc

Không khai `tags` → endpoint dồn vào nhóm `"default"`. Khi có 20+ endpoint, Swagger UI thành 1 list dài.

```python
router = APIRouter(prefix="/courses", tags=["courses"])   # luôn khai tags
```

### `response_model` + ORM model → ValidationError

Trả ORM `Course` (SQLAlchemy) cho endpoint khai `response_model=CourseRead` (Pydantic) → cần config Pydantic đọc attribute từ object, không phải dict:

```python
# course/schemas.py — Pydantic v2
class CourseRead(BaseModel):
    id: int
    title: str

    model_config = {"from_attributes": True}   # cho phép đọc ORM attr
```

Thiếu `from_attributes=True` → `ValidationError: Input should be a valid dictionary`.

## Khi nào thêm version prefix

Khi API public ra client (mobile, third-party), thêm `/api/v1` để sau này release `v2` không breaking client cũ:

```python
from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(user_router)         # → /api/v1/users/...
api_v1.include_router(course_router)       # → /api/v1/courses/...

app.include_router(api_v1)
```

Lúc đó router con (`user_router`, `course_router`) **không** nên hardcode `/api/v1` — cứ giữ `prefix="/users"`. Version chỉ wrap ở tầng ngoài cùng.

## Nested router — gom theo domain

Khi 1 domain có nhiều sub-feature (vd: course có lesson, quiz, enrollment), có thể nest:

```python
# course/router.py
from course.lesson.router import router as lesson_router
from course.quiz.router import router as quiz_router

router = APIRouter(prefix="/courses", tags=["courses"])
router.include_router(lesson_router)    # → /courses/lessons/...
router.include_router(quiz_router)      # → /courses/quizzes/...
```

→ `main.py` chỉ cần `include` `course_router` 1 lần, các sub-router tự được mount theo.

**Cẩn thận:** nest sâu > 2 tầng → khó debug path. Stick với 2 tầng max.

## Dependency chung cho cả router

Khi mọi endpoint trong router cần auth:

```python
from fastapi import Depends
from core.auth import get_current_user

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    dependencies=[Depends(get_current_user)],   # apply cho TẤT CẢ endpoint trong router
)
```

Endpoint public (vd: list khoá học cho guest) → tách ra `public_router` riêng, không gắn dependency này.

## 🔗 References

- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [APIRouter API ref](https://fastapi.tiangolo.com/reference/apirouter/)
- Module liên quan: M2 (auth — user router), M3 (course CRUD), M5 (lesson nested router)
- Related notes: [[pydantic-schemas]], [[setup]]
