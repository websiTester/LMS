# Routing & APIRouter — Mục lục

> Cách tổ chức endpoint trong FastAPI thành nhiều file router độc lập thay vì gom hết vào `main.py`. Pattern này scale tốt khi project lớn.

## Nội dung

- [[vi-sao-can]] — Vì sao cần `APIRouter` thay vì gom hết vào `main.py`.
- [[pattern-co-ban]] — Khai báo router trong feature folder và wire vào `main.py`.
- [[cau-truc-folder]] — Cấu trúc folder feature-based và phân chia 4 file per feature.
- [[common-pitfall]] — Các lỗi thường gặp như prefix trùng, circular import, thiếu tags...
- [[version-prefix]] — Khi nào cần thêm version prefix (`/api/v1`).
- [[nested-router]] — Gom nhóm theo domain (Nested router).
- [[bao-ve-router]] — **Bảo vệ tất cả API bên trong 1 router** (Sử dụng Dependency chung).

## 🔗 References
- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [APIRouter API ref](https://fastapi.tiangolo.com/reference/apirouter/)
- Module liên quan: M2 (auth — user router), M3 (course CRUD), M5 (lesson nested router)
- Related notes: [[pydantic-schemas]], [[setup]]
