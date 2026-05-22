---
tags: [tailwind, css, vite, setup]
related: [shadcn-ui]
module_refs: [M1]
---

# Tailwind CSS — Cài đặt cho dự án React + Vite

> Hướng dẫn cài Tailwind CSS v4 vào dự án `LMS_project/lms_frontend` (Vite 8 + React 19 + TypeScript).
> Tailwind v4 dùng plugin `@tailwindcss/vite` thay vì config PostCSS — gọn hơn nhiều so với v3.

---

## Bối cảnh dự án hiện tại

- **Vị trí:** `E:\React_Tutorial\React_roadmap\LMS_project\lms_frontend`
- **Stack:** Vite 8, React 19.2, TypeScript
- **Trạng thái:** `vite.config.ts` chỉ có plugin `react()`, chưa có CSS file nào trong `src/`
- **Convention:** Mọi `npm install` phải chạy **bên trong** `lms_frontend/`, KHÔNG ở thư mục cha (xem ghi chú về lỗi duplicate React đã gặp).

---

## Bước 1 — Cài package

Mở terminal trong thư mục `lms_frontend`:

```powershell
cd E:\React_Tutorial\React_roadmap\LMS_project\lms_frontend
npm install tailwindcss @tailwindcss/vite
```

Sau khi cài, `package.json` sẽ có thêm 2 dependency:

```json
"dependencies": {
  "@tailwindcss/vite": "^4.x.x",
  "tailwindcss": "^4.x.x"
}
```

---

## Bước 2 — Thêm plugin vào `vite.config.ts`

Sửa file `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   // ← thêm dòng này

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),                              // ← thêm plugin
  ],
})
```

### Vì sao dùng `@tailwindcss/vite` thay vì PostCSS?

Tailwind v4 chuyển sang Rust-based engine + Vite plugin native, không cần file `tailwind.config.js` và `postcss.config.js` như v3. Build nhanh hơn, setup đơn giản hơn.

---

## Bước 3 — Tạo file CSS entry và import Tailwind

Tạo file `src/index.css` (chưa có):

```css
@import "tailwindcss";
```

Đây là toàn bộ nội dung cần thiết — chỉ 1 dòng. Tailwind v4 không cần `@tailwind base; @tailwind components; @tailwind utilities;` như v3 nữa.

---

## Bước 4 — Import CSS vào entry point

Sửa `src/main.tsx`, thêm dòng import ở đầu file:

```tsx
import './index.css'                          // ← thêm dòng này (đầu tiên)
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

**Lưu ý thứ tự:** import CSS đầu tiên để utility class apply đúng thứ tự cascade.

---

## Bước 5 — Test thử

Sửa `src/App.tsx` để verify Tailwind đã chạy:

```tsx
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'

function App() {
  return (
    <>
      <h2 className="text-3xl font-bold text-blue-600 p-4">
        Welcome to the LMS Application
      </h2>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  )
}

export default App
```

Chạy `npm run dev`, mở `http://localhost:5173/`. Nếu thấy chữ "Welcome..." màu xanh dương, đậm, size lớn → Tailwind đã hoạt động ✅.

---

## Bước 6 (tùy chọn) — VS Code IntelliSense

Cài extension **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) để có autocomplete class trong JSX.

Tạo file `.vscode/settings.json` trong `lms_frontend/` nếu chưa có:

```json
{
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.quickSuggestions": {
    "strings": "on"
  }
}
```

---

## Customize theme (khi cần)

Tailwind v4 customize theme bằng cách thêm `@theme` block trong file CSS, **không qua `tailwind.config.js`** nữa:

```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #2563eb;
  --color-brand-secondary: #f59e0b;
  --font-display: "Inter", sans-serif;
}
```

Dùng trong JSX:
```tsx
<h1 className="text-brand-primary font-display">LMS</h1>
```

---

## Common pitfall

- ❌ **Cài Tailwind ở thư mục cha** (`E:\React_Tutorial\React_roadmap`) → sẽ gây ra cùng vấn đề như case `react-router-dom` trước đây (duplicate dependency, module resolution leak). **Luôn cài trong `lms_frontend/`**.
- ❌ **Quên import `./index.css` trong `main.tsx`** → tailwind không inject CSS → class không có effect, không có lỗi rõ ràng.
- ❌ **Vẫn dùng cú pháp v3** (`@tailwind base/components/utilities`) → v4 không nhận, nên dùng `@import "tailwindcss";`.
- ❌ **Tạo file `tailwind.config.js` cho v4** → không cần, v4 zero-config. Chỉ tạo nếu cần plugin v3-style (hiếm khi cần ở giai đoạn đầu).
- ❌ **Class tailwind nằm trong string động** (vd: `const cls = "text-" + color + "-500"`) → tree-shake không detect được class → class bị purge ở build. Phải viết full class literal hoặc dùng `safelist`.

---

## Khi nào dùng

- **Ngay từ M1** (Auth UI) của project — landing page, login/signup form cần style ngay.
- Trước khi cài **shadcn/ui** (M1 acceptance) — vì shadcn build trên Tailwind, phải có Tailwind chạy trước.

---

## 🔗 References

- [Tailwind v4 docs — Vite installation](https://tailwindcss.com/docs/installation/using-vite)
- [Tailwind v4 blog post](https://tailwindcss.com/blog/tailwindcss-v4)
- Module liên quan: M1 (Auth + Landing page) trong `website_roadmap.md`
- Related notes: `[[shadcn-ui]]` (sẽ tạo khi cài shadcn)
