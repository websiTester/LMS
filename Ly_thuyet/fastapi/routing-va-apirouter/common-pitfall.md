# Common pitfall khi dùng APIRouter

## 1. Prefix trùng → path bị nhân đôi

```python
# user/router.py
router = APIRouter(prefix="/users")

# main.py — SAI: đã có prefix trong router rồi
app.include_router(user_router, prefix="/users")   # → /users/users/...
```

Chỉ khai báo prefix ở **MỘT** chỗ. Convention: đặt trong `APIRouter()` (gần endpoint, dễ đọc).

## 2. Circular import

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

## 3. Quên `tags` → Swagger UI khó đọc

Không khai `tags` → endpoint dồn vào nhóm `"default"`. Khi có 20+ endpoint, Swagger UI thành 1 list dài.

```python
router = APIRouter(prefix="/courses", tags=["courses"])   # luôn khai tags
```

## 4. `response_model` + ORM model → ValidationError

Trả ORM `Course` (SQLAlchemy) cho endpoint khai `response_model=CourseRead` (Pydantic) → cần config Pydantic đọc attribute từ object, không phải dict:

```python
# course/schemas.py — Pydantic v2
class CourseRead(BaseModel):
    id: int
    title: str

    model_config = {"from_attributes": True}   # cho phép đọc ORM attr
```

Thiếu `from_attributes=True` → `ValidationError: Input should be a valid dictionary`.
