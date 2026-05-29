---
tags: [vite, react, assets, public, images]
module_refs: [M5]
---

# Quản lý hình ảnh và Assets trong Vite

> Hướng dẫn cách hiển thị hình ảnh tĩnh (như avatar, logo) trong các dự án dùng Vite + React, đặc biệt là cách sử dụng thư mục `public`.

---

## Sử dụng thư mục `public` (Khuyên dùng cho ảnh tĩnh)

### Khái niệm
Thư mục `public` ở thư mục gốc của dự án (cùng cấp với `src`) là nơi chứa các tài nguyên tĩnh không bao giờ thay đổi, hoặc các file cần được giữ nguyên tên và không đi qua quá trình bundle (đóng gói) của Vite.

Khi Vite chạy hoặc build dự án, toàn bộ file trong thư mục `public` sẽ được copy y nguyên ra ngoài thư mục gốc (`/`). Do đó, bạn gọi ảnh bằng đường dẫn tuyệt đối bắt đầu từ root (`/`).

### Ví dụ code
Giả sử bạn có file `doraemon.jpg` đặt tại `public/doraemon.jpg` (hoặc `public/images/doraemon.jpg`).

```tsx
export default function UserProfile() {
  return (
    <div>
      {/* Gọi ảnh trực tiếp từ thư mục public (KHÔNG dùng import) */}
      <img src="/doraemon.jpg" alt="Avatar" />
      
      {/* Nếu để trong public/images/ thì gọi như sau: */}
      <img src="/images/doraemon.jpg" alt="Avatar" />
    </div>
  );
}
```

### Common pitfall
- **Dùng đường dẫn tương đối:** Viết `<img src="../../public/doraemon.jpg" />` là **SAI**. Trình duyệt sẽ không hiểu đường dẫn này khi build ra production. Bắt buộc phải dùng `/doraemon.jpg`.
- **Dùng `import` cho file trong public:** Không ai import file từ thư mục `public` cả. `import` chỉ dùng cho thư mục `src`.

### Khi nào dùng
Dùng cho ảnh Avatar mặc định, Logo công ty, file `robots.txt`, `favicon.ico`, hoặc những hình ảnh lớn không cần Vite nén hay can thiệp.

---

## Sử dụng thư mục `src/assets` (Cách thứ 2)

### Khái niệm
Nếu bạn đặt ảnh bên trong thư mục `src` (ví dụ `src/assets/logo.png`), Vite sẽ xử lý các file này. Vite có thể nén ảnh, thêm mã hash vào tên file (vd: `logo-8b3d.png`) để chống cache của trình duyệt. 

Để dùng cách này, bạn **BẮT BUỘC PHẢI IMPORT** ảnh vào file JS/TS.

### Ví dụ code
```tsx
// Phải import ảnh như một biến Javascript
import logoImg from '../assets/logo.png';

export default function Header() {
  return (
    <div>
      {/* Truyền biến ảnh vào thẻ src */}
      <img src={logoImg} alt="Logo công ty" />
    </div>
  );
}
```

### Common pitfall
- Chép ảnh vào `src/assets` nhưng lại gõ đường dẫn `<img src="../assets/logo.png" />` (React sẽ không hiển thị được ảnh vì đường dẫn này bị đổi tên sau khi build). Nhớ nguyên tắc: Cứ để trong `src` thì phải `import`.

### Khi nào dùng
Dùng cho các icon nhỏ, hình background nhỏ, hoặc những hình ảnh mà bạn muốn Vite tự động tối ưu hóa và chống cache (cache-busting).

---

## 🔗 References
- [Vite Official Docs - Static Asset Handling](https://vitejs.dev/guide/assets.html)
- Related notes: [[tailwindcss]]
