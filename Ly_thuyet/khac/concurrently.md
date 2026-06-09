# Concurrently

> Thư viện Node.js giúp chạy nhiều tiến trình (commands) đồng thời trên cùng một cửa sổ terminal. Rất hữu ích khi phát triển các ứng dụng Fullstack (chạy cả Frontend và Backend bằng 1 lệnh).

---

## Khái niệm cơ bản

### Khái niệm
`concurrently` là một công cụ dòng lệnh (CLI tool) và thư viện npm, cho phép thực thi nhiều script npm hoặc các lệnh shell cùng một lúc thay vì phải mở nhiều tab terminal riêng biệt. Nó sẽ tự động thu thập log của tất cả các tiến trình và hiển thị chung trên một màn hình.

### Ví dụ code
Dưới đây là cách cấu hình `concurrently` trong file `package.json`:

```json
{
  "scripts": {
    "dev:frontend": "cd lms_frontend && npm run dev",
    "dev:backend": "cd lms_backend && uvicorn main:app --reload",
    "dev": "concurrently -c \"cyan,magenta\" -n \"FRONTEND,BACKEND\" \"npm run dev:frontend\" \"npm run dev:backend\""
  }
}
```

**Giải thích các tham số (flags):**
- `-c "cyan,magenta"` (color): Quy định màu sắc cho tiền tố (prefix) của từng tiến trình (trong ví dụ trên là Frontend màu xanh cyan, Backend màu hồng magenta).
- `-n "FRONTEND,BACKEND"` (name): Đặt tên tiền tố sẽ được hiển thị trước mỗi dòng log.
- `"npm run dev:frontend" "npm run dev:backend"`: Danh sách các lệnh sẽ được thực thi song song.

### Common pitfall
- **Log bị nhiễu:** Vì log của tất cả các tiến trình bị trộn lẫn vào nhau, nên khi có lỗi phức tạp, bạn có thể khó tìm được thông báo lỗi chính xác vì nó đã bị trôi đi bởi log của tiến trình khác.
- **Lỗi cổng (Port in use) do tắt không đúng cách:** Nếu bạn đóng thẳng cửa sổ terminal thay vì nhấn `Ctrl + C`, các tiến trình con (như `uvicorn` hay `vite`) có thể vẫn chạy ngầm, dẫn đến lỗi xung đột cổng khi chạy lại lần sau.

### Khi nào dùng
- Sử dụng trong các dự án Fullstack / Monorepo cần chạy nhiều service (ví dụ: Frontend, Backend, Redis worker, v.v.) cùng một lúc.
- Khi muốn tối ưu hóa quy trình làm việc để các thành viên khác trong team chỉ cần gõ đúng 1 lệnh (như `npm run dev`) là có thể bắt đầu code.

---

## 🔗 References
- [NPM concurrently](https://www.npmjs.com/package/concurrently)
