1. Tạo môi trường ảo (Virtual Environment):Bắt buộc để tránh xung đột thư viện giữa các dự án Python khác nhau.Trong terminal, chạy lệnh sau để tạo một môi trường ảo có tên là .venv:

python -m venv .venv

2. Kích hoạt môi trường ảo:Tùy thuộc vào hệ điều hành của bạn, hãy chạy lệnh tương ứng để kích hoạt:

Windows (Command Prompt): .venv\Scripts\activate.bat
Windows (PowerShell): .venv\Scripts\Activate.ps1
macOS / Linux: source .venv/bin/activate

Dấu hiệu thành công: Bạn sẽ thấy chữ (.venv) xuất hiện ở đầu dòng lệnh trong terminal.4.Cài đặt FastAPI:Chạy lệnh sau để cài đặt FastAPI cùng với các công cụ tiêu chuẩn đi kèm (bao gồm cả server Uvicorn dùng để chạy app):
pip install "fastapi[standard]"


3. Viết đoạn code API đầu tiên:Tạo một file có tên main.py ở cùng cấp với thư mục .venv và dán đoạn code cơ bản sau vào:
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


4. Chạy Server: Tại terminal, gõ lệnh sau để khởi động server ở chế độ phát triển (tự động cập nhật mỗi khi bạn lưu file):Bash
`fastapi dev main.py` hoặc
`uvicorn main:app --reload `