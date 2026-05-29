---
tags: [sqlalchemy, scalar, query, result, async]
related: [crud, orm]
module_refs: [M2, M3, M4]
---

# Scalar trong SQLAlchemy — Cách bóc tách kết quả query

> Khi `await db.execute(stmt)` chạy xong, SQLAlchemy KHÔNG trả về thẳng `User` hay `list[User]` mà trả về `Result` (iterator của `Row` tuple-like). Các method `scalar()` / `scalars()` / `scalar_one()` / `scalar_one_or_none()` là cách **bóc giá trị thực** ra khỏi `Result`. Hiểu sai chỗ này → query "không lỗi nhưng trả nhầm kiểu" (vd nhận `Row` mà tưởng `User`).

---

## Khái niệm cốt lõi

### 1. `Result` là gì?

`db.execute(stmt)` trả về object `Result` — bản chất là **iterator của Row**:

```python
result = await db.execute(select(User).where(User.id == 1))
# result KHÔNG phải User, KHÔNG phải list[User]
# result là Result → iter các Row, mỗi Row giống tuple
```

`Row` là tuple-like. Vd query `select(User)` cho row dạng `(<User object>,)` — **tuple có 1 phần tử là User**. Query `select(User.id, User.email)` cho row `(1, "a@x.com")`.

### 2. "Scalar" nghĩa là gì?

**Scalar = giá trị đơn (1 ô)**, đối lập với Row (tuple nhiều ô).

Họ method scalar* giúp **lấy column đầu tiên của row** thay vì phải tự unwrap tuple:

```python
result = await db.execute(select(User).where(User.id == 1))

# KHÔNG dùng scalar — phải tự unwrap tuple
row = result.first()         # Row hoặc None
user = row[0] if row else None

# DÙNG scalar — gọn hơn, đúng ý đồ
user = result.scalar_one_or_none()   # User hoặc None
```

→ Với query ORM `select(Model)`, scalar* gần như là **default đúng**.

---

## Phân biệt các method (cheatsheet)

Giả sử `result = await db.execute(select(User).where(...))`:

| Method | Trả về | Khi 0 row | Khi 2+ row |
|---|---|---|---|
| `result.scalar()` | column đầu của row đầu | `None` | trả row đầu (im lặng — **nguy hiểm**) |
| `result.scalar_one()` | column đầu, **đúng 1 row** | raise `NoResultFound` | raise `MultipleResultsFound` |
| `result.scalar_one_or_none()` | column đầu, 0 hoặc 1 row | `None` | raise `MultipleResultsFound` |
| `result.scalars()` | `ScalarResult` (iter column đầu mỗi row) | iter rỗng | iter bình thường |
| `result.scalars().all()` | `list[<column đầu>]` | `[]` | list các giá trị |
| `result.scalars().first()` | column đầu của row đầu | `None` | trả row đầu, ignore phần còn lại |
| `result.scalars().one()` | column đầu, đúng 1 row | raise | raise |
| `result.scalars().one_or_none()` | column đầu, 0/1 row | `None` | raise |

**Quy tắc nhanh:**
- Muốn **1 object** → `scalar_one_or_none()` (lookup) hoặc `scalar_one()` (chắc chắn tồn tại).
- Muốn **list object** → `scalars().all()`.
- Muốn **iterate** → `scalars()` trực tiếp trong for-loop.
- Muốn **1 giá trị aggregate** (COUNT, SUM) → `scalar()`.

---

## Ví dụ code

### Lấy 1 object (user lookup)

```python
stmt = select(User).where(User.email == "a@x.com")
result = await db.execute(stmt)

user = result.scalar_one_or_none()
# - Email không tồn tại → user = None
# - Email tồn tại (unique) → user = <User>
# - DB lỗi data có 2 row cùng email → raise MultipleResultsFound (báo bug sớm!)

if user is None:
    raise HTTPException(404, "User not found")
```

### Lấy list object (pagination)

```python
stmt = select(User).where(User.is_active == True).limit(20)
result = await db.execute(stmt)

users = result.scalars().all()   # list[User]
```

### Iterate không load all vào memory

```python
stmt = select(User).where(User.is_active == True)
result = await db.execute(stmt)

for user in result.scalars():    # KHÔNG .all() — stream từng row
    send_email(user.email)
```

### Lấy giá trị aggregate (COUNT, SUM)

```python
from sqlalchemy import func

stmt = select(func.count()).select_from(User).where(User.is_active == True)
result = await db.execute(stmt)

total: int = result.scalar()   # int — KHÔNG cần scalars() vì chỉ 1 row 1 column
```

→ Aggregate luôn trả 1 row → dùng `scalar()` (không `scalar_one`, vì `scalar()` đã cover trường hợp này gọn nhất).

### Multi-column query — KHÔNG dùng scalar*

```python
stmt = select(User.id, User.email).where(User.is_active == True)
result = await db.execute(stmt)

rows = result.all()              # list[Row] — mỗi row = (id, email)
for row in rows:
    print(row.id, row.email)     # Row hỗ trợ access theo tên column
    # hoặc: print(row[0], row[1])
```

→ Khi cần **nhiều column**, không bóc scalar — giữ nguyên `Row` để access đa column.

---

## Vì sao SQLAlchemy thiết kế kỳ vậy?

Câu hỏi tự nhiên: tại sao `select(User)` không trả về thẳng `list[User]`?

**Lý do:** SQLAlchemy 2.x **thống nhất Core + ORM**. Cùng 1 API `execute()` xử lý được:
- Query ORM (`select(User)`) → row chứa entity
- Query Core (`select(users_table.c.id, users_table.c.email)`) → row chứa column thuần
- Query mixed (`select(User, Course.title)`) → row chứa cả entity + column

→ Mọi thứ trả về `Result[Row]` đồng nhất. `scalar*` là **bóc lớp Row** ở downstream khi user biết mình chỉ cần 1 cột.

Cái giá: bạn phải gõ `.scalars().all()` thay vì chỉ `await db.execute(...)`. Đổi lại API nhất quán cho mọi loại query.

---

## Common pitfall

- **Nhầm `scalar()` với `scalar_one()`**:
  - `scalar()` im lặng trả `None` khi không có row, im lặng trả row đầu khi có nhiều row.
  - `scalar_one()` raise khi không đúng 1 row → an toàn hơn cho lookup.
  - **Lookup theo PK/unique field → dùng `scalar_one_or_none()`**, không `scalar()`.

- **Quên `.scalars()` khi lấy list**:
  ```python
  users = (await db.execute(select(User))).all()
  # users = list[Row] — mỗi Row là tuple (User,)
  for row in users:
      print(row[0].email)   # phải unwrap [0] — sai pattern
  ```
  Đúng:
  ```python
  users = (await db.execute(select(User))).scalars().all()
  # users = list[User]
  ```

- **Dùng `scalar*` cho multi-column query** → mất column 2 trở đi:
  ```python
  stmt = select(User.id, User.email)
  ids = (await db.execute(stmt)).scalars().all()
  # ids = list[int] — CHỈ id, MẤT email
  ```
  Cần `result.all()` để giữ Row.

- **`scalar_one()` cho query có thể 0 row** → raise `NoResultFound` thay vì trả None. Pattern endpoint:
  ```python
  user = result.scalar_one_or_none()   # ĐÚNG cho lookup
  if user is None:
      raise HTTPException(404)
  ```

- **Gọi `.scalars()` 2 lần trên cùng `result`** → lần 2 iter rỗng. `Result` là iterator, đọc 1 lần. Cần dùng lại → `.scalars().all()` thành list rồi xử lý.

- **Lỗi Type Checker (Mypy/Pylance): `Type "Sequence[T]" is not assignable to return type "list[T]"`**:
  - Khi dùng `result.scalars().all()`, kiểu trả về của SQLAlchemy 2.0 là `Sequence[T]` (một tập hợp chỉ-được-đọc). Nếu hàm của bạn khai báo trả về `list[T]` (tập hợp có thể thay đổi), Type Checker sẽ báo lỗi không tương thích.
  - **Cách fix 1**: Ép kiểu kết quả sang list thực sự: `return list(result.scalars().all())`
  - **Cách fix 2**: Đổi type hint của hàm thành `Sequence[T]` (Khuyên dùng: `from typing import Sequence`).

---

## Khi nào dùng cái nào — quick decision tree

```
Query trả 1 giá trị aggregate (COUNT, SUM, MAX...)?
  → result.scalar()

Query trả nhiều column (select(User.id, User.email, Course.title))?
  → result.all() / result.first() — KHÔNG scalar

Query ORM trả 1 entity (lookup theo PK/unique)?
  → result.scalar_one_or_none()   (có thể 0)
  → result.scalar_one()            (chắc chắn 1, raise nếu sai)

Query ORM trả nhiều entity?
  → result.scalars().all()         (load list)
  → for x in result.scalars(): ... (stream iterate)

Lấy theo PK đơn giản?
  → await db.get(Model, id)        (không cần execute + scalar)
```

---

## 🔗 References

- [SQLAlchemy 2.0 — Result API](https://docs.sqlalchemy.org/en/20/core/connections.html#sqlalchemy.engine.Result)
- [SQLAlchemy 2.0 — ScalarResult](https://docs.sqlalchemy.org/en/20/core/connections.html#sqlalchemy.engine.ScalarResult)
- Related notes: [[crud]] (pattern CRUD hàng ngày dùng scalar*), [[orm]] (Session + execute return Result)
- Module liên quan: M2 (auth — lookup user theo email), M3+ (mọi CRUD đều dùng)
