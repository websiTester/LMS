# Nested router — gom theo domain

## Khái niệm
Khi 1 domain có nhiều sub-feature (vd: course có lesson, quiz, enrollment), có thể nest router vào bên trong một router khác.

## Ví dụ code
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
