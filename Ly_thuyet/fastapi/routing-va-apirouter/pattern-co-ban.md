# Pattern cơ bản

## Khai báo router trong feature folder

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

## Wire vào `main.py`

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
