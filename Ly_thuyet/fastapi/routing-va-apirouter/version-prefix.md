# Khi nào thêm version prefix

## Khái niệm
Khi API public ra client (mobile, third-party), thêm `/api/v1` để sau này release `v2` không breaking client cũ:

## Ví dụ code
```python
from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(user_router)         # → /api/v1/users/...
api_v1.include_router(course_router)       # → /api/v1/courses/...

app.include_router(api_v1)
```

Lúc đó router con (`user_router`, `course_router`) **không** nên hardcode `/api/v1` — cứ giữ `prefix="/users"`. Version chỉ wrap ở tầng ngoài cùng.
