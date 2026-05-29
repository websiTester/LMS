---
tags: [python, syntax, args, kwargs, function]
related: [destructuring-va-rest-operator]
module_refs: [M2]
---

# *args và **kwargs Trong Python

> Cú pháp `*args` (positional arguments) và `**kwargs` (keyword arguments) cho phép hàm nhận số lượng tham số không giới hạn. Tương tự Rest Syntax (`...`) trong JavaScript nhưng dành cho Python.

---

## `*args` — Nhận Nhiều Positional Arguments

### Khái niệm
Dấu `*` trước tên tham số gom tất cả các đối số (arguments) thành một **tuple**. Hàm có thể nhận 1, 2, hoặc bao nhiêu đối số tùy ý.

### Ví dụ code
```python
def require_role(*allowed_roles: str):
    print(allowed_roles)
    print(type(allowed_roles))

require_role("admin")
# → ("admin",)              ← tuple 1 phần tử
# → <class 'tuple'>

require_role("teacher", "admin")
# → ("teacher", "admin")    ← tuple 2 phần tử

require_role("student", "teacher", "admin")
# → ("student", "teacher", "admin")
```

Nhờ vậy, kiểm tra giá trị bằng `in` hoạt động tự nhiên:
```python
current_role = "teacher"
if current_role not in allowed_roles:
    # "teacher" not in ("teacher", "admin") → False → PASS ✅
    raise HTTPException(status_code=403)
```

### So sánh có `*` và không có `*`
```python
# Không có * → phải truyền list thủ công
def require_role(allowed_roles: list[str]):
    ...
require_role(["teacher", "admin"])  # ← phải bọc trong []

# Có * → gọn hơn, gọi tự nhiên hơn
def require_role(*allowed_roles: str):
    ...
require_role("teacher", "admin")    # ← không cần []
```

---

## `**kwargs` — Nhận Nhiều Keyword Arguments

### Khái niệm
Dấu `**` gom tất cả keyword arguments (tham số có tên) thành một **dictionary**.

### Ví dụ code
```python
def create_user(**fields):
    print(fields)
    print(type(fields))

create_user(name="Huy", age=25, role="student")
# → {"name": "Huy", "age": 25, "role": "student"}    ← dictionary
# → <class 'dict'>
```

---

## So Sánh Với JavaScript Rest Syntax

| Python | JavaScript | Kết quả |
|---|---|---|
| `*args` | `...args` (trong function params) | Tuple / Array |
| `**kwargs` | Không có tương đương trực tiếp | Dictionary / — |
| `func("a", "b")` | `func("a", "b")` | Giống nhau |

---

## 🔗 References
- [Python Docs — *args and **kwargs](https://docs.python.org/3/tutorial/controlflow.html#arbitrary-argument-lists)
- Related notes: [[destructuring-va-rest-operator]] (JavaScript tương đương)
