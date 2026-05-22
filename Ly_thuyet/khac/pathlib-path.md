---
tags: [python, pathlib, filesystem, path]
related: [bien-moi-truong-python]
module_refs: [M1]
---

# `pathlib.Path` — Xử lý đường dẫn file/thư mục trong Python

> `pathlib` là module chuẩn của Python (từ 3.4+) cung cấp class `Path` để thao tác với đường dẫn theo cách **object-oriented**, thay thế cho cách cũ dùng `os.path` (string-based).
> Lợi thế lớn nhất: **cross-platform** — code giống nhau chạy được trên Windows (`\`), Linux/Mac (`/`).

---

## Khái niệm cơ bản

### Vì sao có `pathlib`?

Cách cũ dùng `os.path` (string-based) khó đọc, dễ sai:

```python
# ❌ Cách cũ — os.path
import os
config_dir = os.path.dirname(os.path.abspath(__file__))
env_file = os.path.join(config_dir, ".env")
data_file = os.path.join(config_dir, "..", "data", "users.json")
```

Cách mới dùng `Path` (object-oriented) gọn và rõ ràng hơn:

```python
# ✅ Cách mới — pathlib
from pathlib import Path
config_dir = Path(__file__).parent
env_file = config_dir / ".env"
data_file = config_dir.parent / "data" / "users.json"
```

→ Toán tử `/` được overload để join path → đọc giống cấu trúc thư mục thật.

---

## Tạo Path object

```python
from pathlib import Path

# Từ string
p1 = Path("config.py")
p2 = Path("/usr/local/bin")
p3 = Path("C:\\Users\\Dell\\project")     # Windows OK
p4 = Path("C:/Users/Dell/project")        # cũng OK — Path tự chuẩn hoá

# Path hiện tại của file đang chạy (CỰC PHỔ BIẾN)
p5 = Path(__file__)                       # path đến file .py đang chạy

# Working directory
p6 = Path.cwd()                           # current working directory

# Home directory
p7 = Path.home()                          # ~/  hoặc C:\Users\Username

# Path tương đối
p8 = Path(".")                            # thư mục hiện tại
p9 = Path("..")                           # thư mục cha
```

---

## `Path(__file__).parent` — pattern phổ biến nhất

Đây là pattern dùng trong `config.py` của bạn:

```python
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
    )
```

### Giải nghĩa từng phần

| Biểu thức | Ý nghĩa |
|---|---|
| `__file__` | Đường dẫn (string) đến **file Python hiện tại** (vd: `E:\...\lms_backend\core\config.py`) |
| `Path(__file__)` | Wrap thành `Path` object để dùng API của pathlib |
| `Path(__file__).parent` | Thư mục **chứa** file hiện tại (vd: `E:\...\lms_backend\core\`) |
| `Path(__file__).parent / ".env"` | Path đến `.env` **trong cùng thư mục** với `config.py` |

### Vì sao dùng pattern này thay vì `env_file=".env"`?

```python
# ❌ Cách 1: relative path
env_file=".env"
```
→ Pydantic đọc theo **working directory** (nơi chạy `python`/`uvicorn`).
- Chạy `uvicorn main:app` từ `lms_backend/` → đọc `lms_backend/.env` ✅
- Chạy từ thư mục khác (vd: `cd .. && python lms_backend/main.py`) → tìm `.env` ở thư mục `..` → **không thấy** ❌
- Chạy trong Docker/PyCharm/VSCode debugger với cwd khác → cũng không thấy ❌

```python
# ✅ Cách 2: absolute path qua __file__
env_file=Path(__file__).parent / ".env"
```
→ Path **tính từ vị trí file `config.py`**, không phụ thuộc working dir.
- Dù chạy từ đâu, dù trong Docker, dù từ IDE → vẫn tìm đúng `.env` ✅

**Pattern này là best practice** cho mọi config liên quan đến file trong project.

---

## Các thuộc tính (attributes) quan trọng

Giả sử `p = Path("E:/lms_backend/core/config.py")`:

| Thuộc tính | Kết quả | Ý nghĩa |
|---|---|---|
| `p.name` | `"config.py"` | Tên file (gồm extension) |
| `p.stem` | `"config"` | Tên file (KHÔNG có extension) |
| `p.suffix` | `".py"` | Extension |
| `p.suffixes` | `[".py"]` | List các extension (cho file `.tar.gz`) |
| `p.parent` | `Path("E:/lms_backend/core")` | Thư mục cha |
| `p.parents[0]` | `Path("E:/lms_backend/core")` | parent (giống `.parent`) |
| `p.parents[1]` | `Path("E:/lms_backend")` | parent của parent |
| `p.parents[2]` | `Path("E:/")` | ông |
| `p.parts` | `('E:\\', 'lms_backend', 'core', 'config.py')` | Tuple các thành phần |
| `p.anchor` | `"E:\\"` | Root/drive |
| `p.drive` | `"E:"` | Drive letter (chỉ Windows) |
| `p.root` | `"\\"` | Root separator |
| `p.is_absolute()` | `True` | Có phải absolute path? |

### Ví dụ thực tế

```python
file = Path("E:/lms_backend/core/config.py")

print(file.name)          # "config.py"
print(file.stem)          # "config"
print(file.suffix)        # ".py"
print(file.parent)        # E:\lms_backend\core
print(file.parent.parent) # E:\lms_backend  (đi lên 2 cấp)
```

---

## Toán tử `/` — Join path

`/` là cú pháp đặc trưng của pathlib, tương đương `os.path.join()`:

```python
base = Path("E:/project")

# 1 thành phần
config = base / "config.py"
# → E:\project\config.py

# Nhiều thành phần (chain)
data = base / "data" / "users" / "profile.json"
# → E:\project\data\users\profile.json

# Đi lên + đi xuống
sibling = base.parent / "other_project"
# → E:\other_project

# Trộn Path và string
mix = Path.home() / "Documents" / "notes" / "todo.md"
# → C:\Users\Dell\Documents\notes\todo.md
```

**Lưu ý:** Phía bên trái `/` phải là `Path` object, phía bên phải có thể là string hoặc `Path`. Ngược lại không hoạt động:

```python
# ❌ SAI
path = "E:/project" / "config.py"
# TypeError: unsupported operand type(s) for /: 'str' and 'str'

# ✅ ĐÚNG
path = Path("E:/project") / "config.py"
```

---

## Các method phổ biến

### Kiểm tra tồn tại / loại

```python
p = Path("E:/lms_backend/.env")

p.exists()        # True/False — có tồn tại?
p.is_file()       # True nếu là file (và tồn tại)
p.is_dir()        # True nếu là directory
p.is_symlink()    # True nếu là symbolic link
```

### Đọc / ghi file (text)

```python
# Đọc toàn bộ file thành string
content = Path("config.json").read_text(encoding="utf-8")

# Ghi string vào file (ghi đè)
Path("output.txt").write_text("Hello World", encoding="utf-8")

# Đọc/ghi binary
data = Path("image.png").read_bytes()
Path("copy.png").write_bytes(data)
```

→ Gọn hơn nhiều so với `open(...) as f: f.read()`. Tự đóng file luôn.

### Tạo / xoá thư mục

```python
# Tạo thư mục (lỗi nếu đã tồn tại)
Path("data").mkdir()

# Tạo + bỏ qua nếu đã tồn tại
Path("data").mkdir(exist_ok=True)

# Tạo cả parent (giống `mkdir -p`)
Path("data/users/profiles").mkdir(parents=True, exist_ok=True)

# Xoá file
Path("temp.txt").unlink()
Path("temp.txt").unlink(missing_ok=True)   # không lỗi nếu không tồn tại

# Xoá thư mục RỖNG
Path("empty_dir").rmdir()

# Xoá thư mục có file (phải dùng shutil)
import shutil
shutil.rmtree("dir_with_files")
```

### Liệt kê file trong thư mục

```python
folder = Path("E:/lms_backend")

# Chỉ liệt kê trực tiếp (không recursive)
for item in folder.iterdir():
    print(item)

# Glob pattern (1 cấp)
for py in folder.glob("*.py"):
    print(py)

# Glob recursive (** = bất kỳ depth)
for py in folder.rglob("*.py"):
    print(py)

# Lọc chỉ file (bỏ thư mục)
files_only = [p for p in folder.iterdir() if p.is_file()]
```

### Chuyển đổi

```python
p = Path("E:/lms_backend/core/config.py")

# Sang string (cho lib cũ chỉ nhận str)
str(p)                    # "E:\\lms_backend\\core\\config.py"
p.as_posix()              # "E:/lms_backend/core/config.py" (forward slash, dùng cho URL)

# Sang absolute
Path("config.py").resolve()
# → C:\Users\Dell\current_dir\config.py

# Sang relative
p.relative_to(Path("E:/lms_backend"))
# → core\config.py
```

---

## Common pitfall

### 1. Quên rằng `Path` không tự tạo file/thư mục

```python
p = Path("/some/path/file.txt")
# p chỉ là object đại diện — file CHƯA tồn tại trên disk

p.exists()  # False
p.write_text("hello")  # Lỗi nếu parent dir không tồn tại
```

→ Phải tạo parent trước:
```python
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("hello")
```

### 2. So sánh Path bằng `==` có thể sai khi case-insensitive (Windows)

```python
# Windows
Path("C:/Project") == Path("C:/project")   # ❌ False (case khác)

# Đúng cách trên Windows
Path("C:/Project").resolve() == Path("C:/project").resolve()
```

### 3. `__file__` không có khi chạy interactive (REPL/Jupyter)

```python
# Trong file .py: OK
print(Path(__file__))  # đường dẫn file

# Trong Python REPL: NameError
# Trong Jupyter: __file__ có thể không có hoặc trỏ sai chỗ
```

→ Code production luôn ở dạng file `.py` nên không phải lo. Chỉ cần biết khi test thử.

### 4. `Path("...").parent` của file ở root sẽ trả về chính nó

```python
Path("/").parent       # Path("/")
Path("E:/").parent     # Path("E:/")
# → Không có cha của root
```

### 5. Trộn `/` và `\` trên Windows — tự pathlib chuẩn hoá nhưng vẫn nên thống nhất

```python
# Cả 2 cùng OK trên Windows
Path("E:/lms_backend/core")
Path("E:\\lms_backend\\core")
Path(r"E:\lms_backend\core")   # raw string, tránh escape

# Forward slash `/` được khuyến nghị vì code chạy được trên cả Linux
```

---

## So sánh nhanh `pathlib` vs `os.path`

| Tác vụ | `os.path` (cũ) | `pathlib` (mới) |
|---|---|---|
| Join | `os.path.join(a, b, c)` | `a / b / c` |
| Get parent | `os.path.dirname(p)` | `p.parent` |
| Get name | `os.path.basename(p)` | `p.name` |
| Get extension | `os.path.splitext(p)[1]` | `p.suffix` |
| Check exists | `os.path.exists(p)` | `p.exists()` |
| Check is file | `os.path.isfile(p)` | `p.is_file()` |
| Absolute path | `os.path.abspath(p)` | `p.resolve()` |
| Read text | `open(p).read()` | `p.read_text()` |
| List dir | `os.listdir(p)` | `p.iterdir()` |
| Glob | `glob.glob(...)` | `p.glob("*.py")` |

→ **Khuyến nghị:** dùng `pathlib` cho code mới. Chỉ động đến `os.path` khi tích hợp lib cũ yêu cầu string.

---

## Use case trong project hiện tại

### 1. Config — đọc `.env` cùng thư mục với file config.py

```python
# lms_backend/core/config.py
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
    )
```

### 2. Lấy project root (đi lên nhiều cấp)

```python
# lms_backend/core/config.py
PROJECT_ROOT = Path(__file__).parent.parent   # lên 2 cấp → lms_backend/

# Hoặc dùng parents
PROJECT_ROOT = Path(__file__).parents[1]      # tương đương
WORKSPACE_ROOT = Path(__file__).parents[2]    # lên 3 cấp → LMS_project/
```

### 3. Đường dẫn dynamic theo OS

```python
LOG_DIR = Path.home() / ".lms" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

log_file = LOG_DIR / f"app-{date.today()}.log"
log_file.write_text("...")
```

### 4. Tích hợp với FastAPI (StaticFiles)

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
```

---

## Rút gọn `.parent.parent.parent` — 4 cách

Khi file cần đi lên nhiều cấp (vd: `config.py` ở `LMS_project/lms_backend/core/` cần lên `LMS_project/` để đọc `.env`), cú pháp `.parent.parent.parent` khó đọc và dễ đếm sai. 4 cách rút gọn:

### Cách 1: `parents[N]` (gọn nhất, không thêm code)

`Path.parents` là sequence các thư mục tổ tiên, có thể index:

```python
Path(__file__).parents[2] / ".env"
```

**Tương đương:**
| Cú pháp | Cấp đi lên |
|---|---|
| `Path(__file__).parent` | 1 (= `parents[0]`) |
| `Path(__file__).parent.parent` | 2 (= `parents[1]`) |
| `Path(__file__).parent.parent.parent` | 3 (= `parents[2]`) |
| `Path(__file__).parent.parent.parent.parent` | 4 (= `parents[3]`) |

→ `parents[N]` đếm số cấp rõ ràng hơn, không phải đếm số `.parent`.

### Cách 2: Hằng số `BASE_DIR` ở đầu file (recommended)

```python
# config.py
BASE_DIR = Path(__file__).resolve().parents[2]   # LMS_project/

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
    )
```

**Lợi ích:**
- Đọc dễ hiểu hơn: `BASE_DIR / ".env"` rõ nghĩa hơn `parents[2] / ".env"`
- Dùng lại cho path khác: `LOG_DIR = BASE_DIR / "logs"`, `UPLOAD_DIR = BASE_DIR / "uploads"`
- Khi restructure project, chỉ sửa 1 dòng

### Cách 3: Tách module `paths.py` riêng (cho project lớn)

```python
# lms_backend/core/paths.py
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR / "lms_backend"
ENV_FILE = BASE_DIR / ".env"
LOG_DIR = BASE_DIR / "logs"
```

```python
# config.py
from core.paths import ENV_FILE
```

→ Mọi file `from core.paths import BASE_DIR` — không cần đếm `.parent` ở từng chỗ.

### Cách 4: Tự tìm root bằng marker file (clever, hiếm dùng)

```python
def find_project_root(marker: str = ".env") -> Path:
    """Đi lên từ file hiện tại tìm thư mục chứa marker."""
    for parent in Path(__file__).resolve().parents:
        if (parent / marker).exists():
            return parent
    raise FileNotFoundError(f"Không tìm thấy {marker}")

BASE_DIR = find_project_root(".env")
```

**Ưu:** Không phụ thuộc số cấp → di chuyển file đi đâu cũng OK.
**Nhược:** Code nhiều, có magic. Chỉ dùng khi cấu trúc project hay thay đổi.

### Vì sao thêm `.resolve()`?

`Path(__file__)` đôi khi là **relative path** (vd: khi chạy `python ./config.py`).
`.resolve()` chuyển sang **absolute path** + resolve symlink → an toàn 100%.

```python
BASE_DIR = Path(__file__).resolve().parents[2]   # ✅ luôn absolute
BASE_DIR = Path(__file__).parents[2]             # có thể relative
```

→ Luôn thêm `.resolve()` khi tính BASE_DIR.

### So sánh nhanh

| Cách | Code | Khi nào dùng |
|---|---|---|
| `parents[N]` | 1 dòng | Path đơn giản, dùng 1 lần |
| `BASE_DIR` constant ở `config.py` | 2 dòng | **Recommended** — đa số case |
| `paths.py` riêng | Module riêng | Project lớn, nhiều path cần share |
| `find_project_root()` | Function helper | Cấu trúc project hay thay đổi |

---

## Tip — Path constants ở đầu file config

Pattern dùng nhiều trong production:

```python
# lms_backend/core/paths.py
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # lms_backend/
ENV_FILE = BASE_DIR / ".env"
STATIC_DIR = BASE_DIR / "static"
MEDIA_DIR = BASE_DIR / "media"
LOG_DIR = BASE_DIR / "logs"
TEMPLATE_DIR = BASE_DIR / "templates"

# Tạo các dir cần thiết lúc khởi động
for d in [STATIC_DIR, MEDIA_DIR, LOG_DIR]:
    d.mkdir(exist_ok=True)
```

→ Mọi nơi khác chỉ cần `from core.paths import BASE_DIR, ENV_FILE` — không lặp logic resolve path.

---

## 🔗 References

- [Python docs — pathlib](https://docs.python.org/3/library/pathlib.html)
- [Real Python — Pathlib guide](https://realpython.com/python-pathlib/)
- [PEP 428 — The pathlib module](https://peps.python.org/pep-0428/)
- Module liên quan: M1 (project setup, config FastAPI)
- Related notes: `[[bien-moi-truong-python]]` (sử dụng `Path(__file__).parent / ".env"`)
