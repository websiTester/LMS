---
tags: [python, async, context-manager, generator, fastapi]
related: [sqlalchemy]
module_refs: [M1, M2]
---

# `async with` và `yield`

> Hai feature Python thường dùng chung trong pattern dependency injection của FastAPI. Note này giải thích từng cái độc lập, rồi tại sao chúng được combine lại trong `get_db()`.

---

## `async with` — Async Context Manager

### Khái niệm

`with` là statement đảm bảo **setup + cleanup** chạy đầy đủ, kể cả khi có exception ở giữa. `async with` cùng ý tưởng nhưng dành cho resource async (setup/cleanup cần `await`).

Object dùng được với `async with` phải implement 2 method:
- `__aenter__(self)` — chạy khi vào block (setup)
- `__aexit__(self, exc_type, exc, tb)` — chạy khi ra block (cleanup, kể cả khi exception)

### So sánh sync vs async

```python
# Sync
with open("file.txt") as f:
    data = f.read()
# f tự đóng ở đây — kể cả nếu f.read() raise exception

# Async
async with AsyncSessionLocal() as session:
    result = await session.execute(...)
# session tự đóng ở đây (await session.close() được gọi ngầm)
```

### Cơ chế bên trong

Code này:

```python
async with X() as y:
    body
```

Tương đương với:

```python
obj = X()
y = await obj.__aenter__()        # setup
try:
    body
finally:
    await obj.__aexit__(...)      # cleanup, LUÔN chạy
```

→ Đó là lý do `async with` an toàn hơn `try/finally` viết tay: không quên cleanup, không phụ thuộc viết đúng.

### Khi nào dùng

- Resource cần đóng/giải phóng sau khi xong: **DB session, HTTP client (httpx), file, lock, transaction**
- Bất kỳ class nào implement `__aenter__` / `__aexit__`

### Common pitfall

- Nhầm `with` (sync) cho `AsyncSession` → không gọi đúng async cleanup → connection leak.
- Quên `await` trước async function bên trong block → coroutine không chạy, code có vẻ pass nhưng không làm gì.

---

## `yield` — Generator Function

### Khái niệm

- Function thường: gọi `return` → thoát, trả 1 value duy nhất, kết thúc.
- Function có `yield`: trở thành **generator** — chạy tới `yield`, **tạm dừng**, trả value ra ngoài, có thể được resume lại để chạy tiếp.

Khác biệt cốt lõi: state của function được **lưu lại** giữa các lần gọi.

### Ví dụ cơ bản

```python
def count_up():
    print("start")
    yield 1
    print("after 1")
    yield 2
    print("after 2")
    yield 3
    print("end")

gen = count_up()
print(next(gen))  # in "start", trả 1
print(next(gen))  # in "after 1", trả 2
print(next(gen))  # in "after 2", trả 3
print(next(gen))  # in "end", raise StopIteration
```

Có thể duyệt bằng `for`:

```python
for n in count_up():
    print(n)
```

### Async generator

Tương tự nhưng có `async def` + `yield`, duyệt bằng `async for`:

```python
async def fetch_pages():
    for url in urls:
        data = await fetch(url)  # I/O async
        yield data

async for page in fetch_pages():
    print(page)
```

### Khi nào dùng

- **Iterator lười (lazy)**: xử lý dữ liệu lớn không load hết vào memory (vd: đọc file 10GB từng dòng).
- **Stream data**: API trả về dữ liệu theo chunk (SSE, streaming JSON).
- **FastAPI dependency với cleanup** — case bạn đang gặp.

---

## Pattern kết hợp trong FastAPI Dependency

Code thực tế trong `db.py`:

```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

### FastAPI xử lý hàm này thế nào

1. Request đến endpoint có `db: AsyncSession = Depends(get_db)`.
2. FastAPI gọi `get_db()` → thấy nó là async generator (có `yield`).
3. FastAPI chạy code đến `yield`:
   - `AsyncSessionLocal()` tạo session object.
   - `__aenter__` chạy → mở connection từ pool, bắt đầu transaction.
   - Đến `yield session` → tạm dừng, đưa `session` cho endpoint.
4. Endpoint chạy với `session` (query, insert, commit...).
5. Khi endpoint xong (success hoặc exception), FastAPI **resume** generator:
   - Code sau `yield` chạy.
   - Trong trường hợp này: thoát khỏi block `async with` → `__aexit__` chạy → session close, connection trả về pool.

### Tại sao không dùng `return`?

```python
# ❌ Sai — return thì cleanup không bao giờ chạy
async def get_db():
    session = AsyncSessionLocal()
    return session  # session bị bỏ rơi, connection leak
```

- `return` exit ngay, FastAPI không có cách nào "gọi lại" để cleanup.
- `yield` để function "treo" giữa chừng, FastAPI giữ tham chiếu để resume sau khi endpoint xong → cleanup chạy đúng thời điểm.

### Tại sao combine `async with` + `yield`?

Bạn có thể viết kiểu thủ công không dùng `async with`:

```python
# Cách dài dòng, không recommend
async def get_db():
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()
```

Hoặc tận dụng `async with` cho ngắn gọn + an toàn:

```python
# Cách gọn — async with tự lo close()
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

→ Cả 2 đều đúng. Cách thứ 2 ngắn hơn vì delegate cleanup cho `__aexit__` của session.

### Common pitfall với pattern này

- **Đặt cleanup TRƯỚC `yield`** → cleanup chạy trước khi endpoint dùng resource → resource đóng, endpoint lỗi.
  ```python
  # ❌ Sai
  async def get_db():
      session = AsyncSessionLocal()
      await session.close()  # đóng trước khi yield
      yield session          # endpoint nhận session đã closed
  ```

- **Yield nhiều lần** → FastAPI confuse, chỉ dùng giá trị yield đầu tiên.
  ```python
  # ❌ Sai
  async def get_db():
      async with AsyncSessionLocal() as s1:
          yield s1
      async with AsyncSessionLocal() as s2:
          yield s2  # không bao giờ tới được
  ```

- **Dùng `def` thay vì `async def`** với async resource → không await được.

- **Quên type hint `AsyncGenerator`** — không sai runtime, nhưng IDE không hiểu được type của yield value.
  ```python
  from typing import AsyncGenerator
  async def get_db() -> AsyncGenerator[AsyncSession, None]:
      ...
  ```
  `AsyncGenerator[YieldType, SendType]` — `SendType=None` vì FastAPI không gửi gì vào.

---

## So sánh nhanh các pattern liên quan

| Pattern | Sync/Async | Khi nào dùng |
|---|---|---|
| `with ... as x:` | Sync | Resource sync (file, lock, sync DB session) |
| `async with ... as x:` | Async | Resource async (async DB session, httpx client) |
| `def f(): yield ...` | Sync generator | Iterator lười, FastAPI sync dependency |
| `async def f(): yield ...` | Async generator | Stream async data, FastAPI async dependency |

---

## 🔗 References

- [Python docs — `with` statement](https://docs.python.org/3/reference/compound_stmts.html#the-with-statement)
- [Python docs — Generators](https://docs.python.org/3/reference/expressions.html#yield-expressions)
- [FastAPI — Dependencies with yield](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/)
- File project liên quan: `LMS_project/lms_backend/core/db.py`
- Module liên quan: M1 (setup backend), M2 (auth — mọi endpoint cần `get_db`)
- Related notes: [[sqlalchemy]] (session lifecycle dùng pattern này)
