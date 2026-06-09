# Vì sao cần APIRouter

## Khái niệm
Nếu để hết endpoint trong `main.py`:
- File phình to → khó navigate
- Mọi feature import lẫn nhau → dễ circular import
- Khó test riêng từng nhóm endpoint
- Swagger UI gom hết vào "default" tag → khó đọc

`APIRouter` = "mini FastAPI app" — gom các endpoint cùng nhóm thành 1 unit, rồi `main.py` chỉ `include_router()` lại.
