---
tags: [npm, npx, nodejs, package-manager, cli]
module_refs: [M1, M3]
---

# Phân biệt `npm` và `npx`

> Hai công cụ cốt lõi của hệ sinh thái Node.js. Hiểu rõ sự khác biệt giữa chúng giúp bạn quản lý dependency sạch sẽ và sử dụng các công cụ CLI đúng chuẩn.

---

## `npm` (Node Package Manager) — Dùng để CÀI ĐẶT

### Khái niệm
`npm` có nhiệm vụ **tải (download) và lưu trữ** một thư viện mã nguồn mở vào dự án của bạn. Nó sẽ lưu thư viện vào thư mục `node_modules` và ghi nhận phiên bản vào file `package.json`.

Thư viện được cài bằng `npm` sẽ trở thành một phần vĩnh viễn của dự án (Dependency). Bất cứ ai clone dự án về, hay khi build đưa lên server, hệ thống đều phải tải lại các thư viện này để ứng dụng có thể chạy được.

### Ví dụ code
```bash
npm install react
npm install axios
```
Ứng dụng web của bạn bắt buộc phải có `react` và `axios` thì code mới chạy, nếu thiếu ứng dụng sẽ sập ngay lập tức.

---

## `npx` (Node Package Execute) — Dùng để THỰC THI

### Khái niệm
`npx` có nhiệm vụ **chạy (execute)** một công cụ dòng lệnh (CLI). Nó sẽ tải công cụ đó vào bộ nhớ tạm, chạy lệnh bạn yêu cầu, và sau khi chạy xong thì **tự động xóa bỏ** (không lưu vào `node_modules`, không ghi vào `package.json`).

Nếu công cụ đó đã được cài sẵn trên máy, `npx` sẽ dùng luôn bản có sẵn thay vì tải mới.

### Ví dụ code
```bash
npx create-vite@latest
npx shadcn-ui@latest add button
```

### Tại sao lại dùng `npx` cho Vite hay shadcn?
Các công cụ như Vite khởi tạo dự án (`create-vite`) hay shadcn (`shadcn-ui`) chỉ là những "Cỗ máy sinh code". 
Nhiệm vụ của chúng chỉ là chạy một lần duy nhất để tạo ra cấu trúc thư mục, hoặc copy đoạn code Button thả vào source của bạn. Sau khi sinh code xong, ứng dụng web của bạn chạy dựa trên mã nguồn vừa được sinh ra, hoàn toàn không cần sự hiện diện của "Cỗ máy" kia nữa.

Việc dùng `npx` giống như bạn gọi thợ đến sửa nhà (chạy 1 lần rồi về), thay vì bắt người thợ đó ở luôn trong nhà bạn vĩnh viễn (`npm install`).

---

## Common pitfall (Lỗi thường gặp)

- **Dùng `npm install` thay vì `npx` cho các CLI tạo dự án**: Viết `npm install -g create-react-app` hoặc `npm install shadcn-ui`. Hậu quả là bạn tự làm phình to bộ nhớ máy tính, cài cắm những công cụ không bao giờ dùng đến lần thứ 2, và nguy hiểm hơn là lần sau dùng nó sẽ gọi phiên bản cũ kỹ đã cài từ năm ngoái thay vì bản mới nhất (`@latest`).
- **Gõ sai cú pháp cài thư viện**: Bạn muốn cài `lucide-react` để lấy icon, bạn gõ `npx lucide-react`. Dẫn đến lỗi không tìm thấy package executable. Nhớ kỹ: Cài thư viện để code (dùng nhiều lần) -> `npm install`.

---

## Tóm tắt nguyên tắc (Rule of thumb)

1. Cần cài thư viện để `import` vào trong file code JS/TS (`react`, `axios`, `zustand`) ➔ Dùng **`npm install`**.
2. Cần chạy một lệnh công cụ sinh code 1 lần rồi bỏ (`create-vite`, `shadcn-ui`, `prisma studio`) ➔ Dùng **`npx`**.

---

## 🔗 References
- [npm Docs - npx](https://docs.npmjs.com/cli/v10/commands/npx)
- Related notes: [[shadcn]], [[setup]]
