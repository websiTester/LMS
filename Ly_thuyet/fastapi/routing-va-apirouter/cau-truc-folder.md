# Cấu trúc folder feature-based

## Sơ đồ cấu trúc

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

## Vì sao chia 4 file per feature:

| File | Trách nhiệm | Test được không cần FastAPI? |
|---|---|---|
| `router.py` | Define HTTP layer: path, method, status code. Gọi service. | Không (cần TestClient) |
| `services.py` | Business logic + DB query. Nhận `db: Session` + DTO, trả model/dict. | Có |
| `schemas.py` | Pydantic validate input + serialize output. | Có (unit test pure) |
| `models.py` | SQLAlchemy ORM, map DB table. | Có (qua session fixture) |

→ Tách services ra giúp test business logic riêng, không cần spin up HTTP server.

→ Xem chi tiết `schemas.py` vs `models.py` ở [[pydantic-schemas]].
