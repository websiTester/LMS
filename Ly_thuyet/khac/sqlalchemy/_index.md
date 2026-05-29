---
tags: [sqlalchemy, database, postgresql, async, orm, index]
related: [pydantic-v2, bien-moi-truong-python, async-with-va-yield]
module_refs: [M1, M2]
---

# SQLAlchemy — Mục lục

> SQLAlchemy là ORM (Object-Relational Mapper) phổ biến nhất của Python — cho phép thao tác database bằng Python object thay vì viết SQL thuần. Note này tập trung vào **async SQLAlchemy 2.x** (style mới) vì project dùng FastAPI async.

---

## Các sub-note

| File | Nội dung |
|---|---|
| [[ket-noi-db]] — `ket-noi-db.md` | Engine, AsyncSession, `async_sessionmaker` params, DI trong FastAPI, lỗi setup connection (NoSuchModuleError, asyncpg missing) |
| [[orm]] — `orm.md` | Declarative Model, `Mapped` vs `mapped_column`, Identity Map + Unit of Work, Lifecycle object, Relationship, N+1 problem |
| [[code-first]] — `code-first.md` | `Base.metadata.create_all` (dev), Alembic (production), config `env.py`, lỗi `script_location` |
| [[crud]] — `crud.md` | INSERT/SELECT/UPDATE/DELETE async, transaction, eager loading, CRUD pattern trong FastAPI |
| [[relationship]] — `relationship.md` | Quan hệ 1-1, 1-N, N-N, association table vs association object, cascade, ví dụ thực tế từ project |

---

## Thứ tự đọc khuyến nghị

1. **`ket-noi-db.md`** — setup connection trước, bắt buộc trước mọi thứ.
2. **`orm.md`** — hiểu Model + Session cốt lõi trước khi query.
3. **`crud.md`** — pattern CRUD thực tế (sẽ dùng hàng ngày).
4. **`relationship.md`** — hiểu cách biểu diễn quan hệ giữa các bảng (cần hiểu ORM trước).
5. **`code-first.md`** — tạo bảng từ model (khi chuẩn bị migrate schema).

---

## 🔗 References

- [SQLAlchemy 2.0 Async docs](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [asyncpg](https://magicstack.github.io/asyncpg/current/)
- File project liên quan: `LMS_project/lms_backend/core/db.py`, `LMS_project/lms_backend/core/config.py`, `LMS_project/lms_backend/alembic/env.py`
- Module liên quan: M1 (setup backend), M2 (auth — cần User model + session)
- Related notes: [[bien-moi-truong-python]] (lưu DATABASE_URL trong .env), [[async-with-va-yield]] (session dùng pattern này), [[pathlib-path]] (dùng trong `sys.path.insert`)
