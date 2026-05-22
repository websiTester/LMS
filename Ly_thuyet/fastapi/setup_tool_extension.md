### Công cụ
- **Package manager**: `pip` → `poetry` hoặc **`uv`** (mới, cực nhanh, recommend)
- **Virtual env**: `venv`, `.venv` convention
- **Linter/Formatter**: **`ruff`** (thay cho black + flake8 + isort, cực nhanh)
- **Type checker**: `mypy` hoặc **`pyright`**


1. Linter & Formatter: ruff
Hãy tưởng tượng Linter là người dò lỗi ngữ pháp, còn Formatter là người thợ trang điểm cho code của bạn.

Linter: Sẽ soi từng dòng code để tìm ra những lỗi logic tiềm ẩn hoặc những đoạn code "bốc mùi" (code smell). Ví dụ: bạn khai báo một biến nhưng không bao giờ dùng đến, hoặc gọi sai tên một hàm.

Formatter: Sẽ tự động căn lề, thêm bớt khoảng trắng, chuẩn hóa dấu ngoặc đơn/kép để toàn bộ project có chung một phong cách viết (rất quan trọng khi làm việc nhóm).

Tại sao ruff lại là "ngôi sao" hiện nay?
Trước đây, lập trình viên Python phải cài một "combo" 3 công cụ riêng biệt: flake8 (để lint code), black (để format code) và isort (để sắp xếp các dòng import thư viện cho gọn gàng).

ruff là một công cụ mới được viết bằng ngôn ngữ Rust. Nó gộp tính năng của cả 3 công cụ trên lại làm một và có tốc độ xử lý nhanh gấp 10 đến 100 lần. Nó nhanh đến mức bạn gần như không cảm nhận được độ trễ khi lưu file.


2. Type Checker: mypy và pyright
Bản chất Python là ngôn ngữ kiểu động (dynamic typing). Bạn có thể gán biến x = 5, sau đó lại đổi x = "Hello", Python vẫn chạy bình thường cho đến khi nó... văng lỗi ngớ ngẩn ở đâu đó.

Type Checker (Công cụ kiểm tra kiểu dữ liệu) sinh ra để giải quyết vấn đề này. Nó sẽ đọc các gợi ý kiểu (Type hints) trong code của bạn và báo lỗi ngay cả khi bạn chưa chạy chương trình.

Ví dụ: Hàm của bạn yêu cầu nhận vào một số (id: int), nhưng bạn lỡ truyền vào một chuỗi ("abc"), Type Checker sẽ gạch dưới màu đỏ báo lỗi ngay lập tức.

mypy: Là công cụ kiểm tra kiểu dữ liệu lâu đời và phổ biến nhất của Python. Nó rất chuẩn mực và nghiêm ngặt.

pyright: Là công cụ do Microsoft phát triển (tốc độ cũng cực nhanh vì viết bằng TypeScript). Nếu bạn đang dùng VS Code, công cụ này thực chất đã được tích hợp sẵn ngầm bên dưới phần mở rộng Pylance để giúp Editor gợi ý code thông minh cho bạn.

Tóm lại để dễ nhớ:
Dùng ruff để code luôn đẹp và đúng chuẩn. Dùng pyright (hoặc mypy) để code không bị sập vì truyền sai dữ liệu.


### Cách cài đặt và cấu hình ruff, pyright trong VS Code

Dưới đây là các bước thiết lập chuẩn mực cho dự án FastAPI của bạn:
#### Cài đặt các Extensions (Tiện ích mở rộng):
Mở tab Extensions trong VS Code (phím tắt Ctrl + Shift + X hoặc Cmd + Shift + X trên Mac) và tìm cài đặt 2 tiện ích sau: 
 1. Ruff (Tác giả: Astral Software): Giúp VS Code hiểu và chạy Ruff linter/formatter.
 2. Pylance (Tác giả: Microsoft): Cung cấp gợi ý code thông minh và kiểm tra kiểu dữ liệu (Type checker) dựa trên Pyright.


#### Cấu hình VS Code (settings.json)
Thiết lập để Ruff tự động format và Pylance bắt lỗi.Mở thanh tìm kiếm lệnh của VS Code bằng Ctrl + Shift + P (hoặc Cmd + Shift + P), gõ Open Settings (JSON) và chọn Preferences: Open User Settings (JSON) (để áp dụng cho mọi dự án) hoặc Preferences: Open Workspace Settings (JSON) (chỉ áp dụng cho thư mục hiện tại).Thêm đoạn cấu hình sau vào trong cặp ngoặc nhọn {} của file:

{
  "[python]": {
    "editor.defaultFormatter": "astral-sh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "python.analysis.typeCheckingMode": "standard",
  "python.analysis.inlayHints.functionReturnTypes": true,
  "python.analysis.inlayHints.variableTypes": true
}

Giải thích: Đoạn này bảo VS Code dùng Ruff làm formatter mặc định, tự động làm đẹp code và sắp xếp lại các dòng import khi lưu file. Đồng thời bật chế độ kiểm tra type của Pylance ở mức độ tiêu chuẩn (standard).


---

## Troubleshooting: `Import "fastapi" could not be resolved`

### Triệu chứng
- Đã cài `fastapi` vào `.venv` (verify bằng `pip list` hoặc chạy `python -c "import fastapi"` thành công).
- Mở file `.py` trong VS Code, `Pylance` vẫn gạch đỏ dưới `from fastapi import FastAPI` với message **`Import "fastapi" could not be resolved`**.

### Root cause (3 nguyên nhân phổ biến)

**1. Chưa thực sự chọn interpreter `.venv`**

Khi mở Quick Pick "Select a Python Environment" (Ctrl+Shift+P → `Python: Select Interpreter`), VS Code chỉ **hiển thị** danh sách option — dòng `.venv (3.12.4) ... Recommended` chưa được áp dụng cho đến khi bạn **click vào nó**. Nếu chỉ đóng dialog mà không click, Pylance vẫn dùng Python global → không thấy package trong `.venv`.

**2. Workspace chưa lưu interpreter path**

Nếu project không có `.vscode/settings.json` chỉ định `python.defaultInterpreterPath`, mỗi lần mở lại VS Code sẽ phải chọn interpreter lại từ đầu. Pylance có thể fallback về Python global trước khi user kịp chọn.

**3. Mở sai folder làm workspace root**

Nếu `.venv` nằm ở `e:\React_Tutorial\React_roadmap\.venv` nhưng bạn `File → Open Folder` vào subfolder `LMS_project\lms_backend\`, thì:
- `${workspaceFolder}` trong settings sẽ trỏ vào subfolder.
- Pylance không tự dò ngược lên parent để tìm `.venv`.
- Kết quả: không tìm thấy site-packages.

### Cách fix

**Bước 1 — Verify package thực sự có trong `.venv`:**
```powershell
e:/React_Tutorial/React_roadmap/.venv/Scripts/python.exe -c "import fastapi; print(fastapi.__file__)"
```
Phải in ra đường dẫn dạng `...\.venv\Lib\site-packages\fastapi\__init__.py`. Nếu lỗi → cài lại: `.\.venv\Scripts\pip install fastapi`.

**Bước 2 — Chọn interpreter đúng cách:**
- `Ctrl+Shift+P` → gõ `Python: Select Interpreter` → Enter.
- **Click trực tiếp** vào dòng có path `.venv\Scripts\python.exe` (không phải Browse, không phải Create).
- Status bar dưới cùng phải hiện `Python 3.12.4 ('.venv': venv)`.

**Bước 3 — Lưu interpreter vào workspace** (để khỏi chọn lại mỗi lần mở):

Tạo file `.vscode/settings.json` ở **root workspace** (cùng cấp với `.venv`):
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/Scripts/python.exe",
  "python.analysis.extraPaths": ["${workspaceFolder}/.venv/Lib/site-packages"]
}
```

**Bước 4 — Reload Pylance:**
- `Ctrl+Shift+P` → `Developer: Reload Window` → Enter.
- Hoặc nhẹ hơn: `Python: Restart Language Server`.

**Bước 5 — Verify workspace root đúng:**
- Title bar VS Code phải hiện folder chứa `.venv` (vd: `React_roadmap`), không phải subfolder con.
- Nếu sai → `File → Open Folder` mở đúng root.

### Common pitfall

- **Mở nhiều `.venv` trong cùng workspace**: monorepo có `.venv` ở mỗi service (vd: `lms_backend/.venv`, `worker/.venv`) → VS Code chỉ chọn được 1 interpreter cho workspace. Giải pháp: dùng **Multi-root workspace** (`.code-workspace` file), mỗi root có settings riêng.
- **Quên activate venv trong terminal**: Terminal tích hợp VS Code thường tự activate, nhưng nếu mở terminal trước khi chọn interpreter thì phải mở terminal mới hoặc chạy `.\.venv\Scripts\Activate.ps1` thủ công.
- **Path có dấu cách hoặc ký tự Unicode**: Pylance đôi khi parse sai. Tránh đặt project trong `C:\Users\Tên Có Dấu\...`.
- **`.venv` bị gitignore nhưng `python.defaultInterpreterPath` dùng relative path tuyệt đối**: dùng `${workspaceFolder}` để portable giữa các máy.

### Khi nào cần `python.analysis.extraPaths`?

Bình thường chỉ cần `python.defaultInterpreterPath` là đủ — Pylance tự đọc site-packages của interpreter đó. Chỉ thêm `extraPaths` khi:
- Có thư viện cài ở vị trí non-standard (vd: editable install với path tự custom).
- Project có local package import bằng path tương đối (vd: `from shared.models import ...` mà `shared/` ở ngoài root).

---

## 🔗 References
- [VS Code Python: Select Interpreter](https://code.visualstudio.com/docs/python/environments#_working-with-python-interpreters)
- [Pylance settings reference](https://github.com/microsoft/pylance-release/blob/main/docs/settings.md)

