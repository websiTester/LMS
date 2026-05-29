---
tags: [ui, shadcn, tailwind, frontend, components]
module_refs: [M3, M4]
related: [tailwindcss]
---

# shadcn/ui

> Một bộ sưu tập các UI component có thể tái sử dụng, được xây dựng dựa trên Radix UI và Tailwind CSS. Điểm đặc biệt nhất: Nó **không phải** là một thư viện component (component library) cài qua npm.

---

## shadcn/ui là gì?

### Khái niệm
Khác với Ant Design, Material UI hay Bootstrap (nơi bạn cài thư viện bằng `npm install antd` và sử dụng như một hộp đen), **shadcn/ui KHÔNG cài qua npm**.

Thay vào đó, shadcn/ui cung cấp một CLI (Command Line Interface). Khi bạn chạy lệnh thêm một component (ví dụ: nút bấm Button), nó sẽ **copy trực tiếp mã nguồn (source code) của Button đó paste thẳng vào dự án của bạn** (thường vào thư mục `src/components/ui/button.tsx`).

### Bản chất hoạt động
shadcn/ui là sự kết hợp của 2 thứ:
1. **Radix UI (Unstyled):** Cung cấp logic hoạt động cực chuẩn (accessibility, focus, keyboard navigation, popover logic...) nhưng giao diện xấu (không có CSS).
2. **Tailwind CSS:** Cung cấp style (CSS classes) để đắp lên bộ khung của Radix UI cho đẹp.

CLI của shadcn/ui chỉ đơn giản là đi lấy mã nguồn đã được tác giả (shadcn) code sẵn sự kết hợp trên, và thả vào source code dự án của bạn.

---

## 3 Đặc điểm cốt lõi (Sự khác biệt)

### 1. Quyền sở hữu (Ownership)
- **Thư viện truyền thống:** Code của Button nằm trong `node_modules`. Bạn không thể sửa được thẻ `<button>` bên trong nó.
- **shadcn/ui:** Code của Button nằm trong thư mục `src/components/ui/button.tsx` của bạn. **Nó là code CỦA BẠN**. Bạn toàn quyền thêm thẻ `div`, đổi tên biến, thêm hiệu ứng tùy thích.

### 2. Tùy biến cực hạn (Extreme Customization)
Vì bạn sở hữu mã nguồn, bạn có thể dễ dàng sửa một `Button` thành màu hồng viền xanh lá, hoặc ép mọi `Button` trong hệ thống phải có thêm icon mặc định. Bạn chỉ cần mở file `button.tsx` ra và sửa trực tiếp Tailwind class ở đó.

### 3. Không phình to (Zero bloat)
Bạn cần dùng component nào (ví dụ Accordion), bạn chỉ copy code của đúng Accordion đó. Không có chuyện phải tải nguyên một thư viện khổng lồ 5MB vào dự án như các thư viện truyền thống.

---

## Ví dụ quy trình sử dụng

### Khởi tạo (Init)
Chạy lệnh trong terminal (thường cấu hình sẵn đường dẫn lưu component):
```bash
npx shadcn-ui@latest init  //deprecate

npx shadcn@latest init
```

### Thêm Component
Nếu bạn muốn dùng một cái nút (Button):
```bash
npx shadcn-ui@latest add button
```
Sau lệnh này, thư mục `src/components/ui/button.tsx` sẽ tự động xuất hiện trong dự án của bạn. File này chứa toàn bộ code React và Tailwind CSS cấu thành nên cái nút.

### Import và Sử dụng
Sau khi đã thêm, bạn dùng nó như một component do chính bạn tự viết:
```tsx
// Nhập từ thư mục nội bộ của DỰ ÁN CỦA BẠN (không phải từ node_modules)
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div>
      <Button variant="outline" size="lg">
        Bấm vào đây
      </Button>
    </div>
  )
}
```

---

## Common pitfall (Lỗi thường gặp)

- **Cố gắng tìm trong `node_modules`:** Rất nhiều người mới dùng tìm thư viện `shadcn/ui` trong file `package.json`. Nó không tồn tại ở đó. (Nó chỉ có `class-variance-authority`, `clsx`, `tailwind-merge` và các package của `radix-ui` được cài làm công cụ phụ trợ).
- **Ngại sửa file `ui/button.tsx`:** Tư duy cũ làm developer sợ đụng vào file thư viện. Với shadcn, file trong `components/ui` sinh ra LÀ ĐỂ CHO BẠN SỬA. Hãy mạnh dạn mở file đó ra, thay đổi padding `px-4` thành `px-6` nếu design của công ty bạn yêu cầu nút bấm phải to hơn bình thường.
- **Xung đột class (Class clash):** shadcn sử dụng thư viện `tailwind-merge` (thường được bọc trong hàm `cn()`) để gộp các class lại với nhau an toàn. Luôn dùng hàm `cn()` khi muốn ghi đè class từ bên ngoài truyền vào.
- **Lỗi cài đặt "Validating import alias":** Xảy ra khi chạy `npx shadcn@latest init` trên dự án Vite mới. Nguyên nhân là Vite mặc định chưa cấu hình alias `@/*`. 
  - **Cách fix:** 
    1. Thêm `"baseUrl": ".", "paths": { "@/*": ["./src/*"] }` vào `compilerOptions` trong `tsconfig.app.json` (và `tsconfig.json`).
    2. Cài `@types/node` (`npm i -D @types/node`).
    3. Cấu hình `resolve.alias` trong `vite.config.ts` trỏ `@` về `./src`.

---

## 🎨 2 Cách để tạo/lấy các Component phức tạp (Ví dụ: Table Skeleton)

Trong shadcn/ui, không có sẵn các component phức tạp đóng gói sẵn (ví dụ không có lệnh `npx shadcn add table-skeleton`). Triết lý của shadcn là cung cấp các "viên gạch gốc" (primitives), và bạn có 2 cách để tạo ra các component phức tạp:

### Cách 1: Tự ghép (Compose) từ các Primitives (🔥 Khuyên dùng)
Đây là cách đúng với triết lý của shadcn nhất. Bạn tải các viên gạch gốc về và tự viết code lồng chúng vào nhau.

**Ví dụ: Tạo Table Skeleton**

**1. Tải component gốc:**
```bash
npx shadcn@latest add skeleton table
```

**2. Lắp ráp TableSkeleton:**
```tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]"><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-4/5" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Cách 2: Copy-paste từ hệ sinh thái Cộng đồng (Blocks / Community)
Nếu bạn cần một Data Table quá phức tạp (có filter, pagination, skeleton sẵn) và không muốn tự code, bạn có thể tận dụng nguồn tài nguyên của cộng đồng.
- Vào phần **Blocks** trên trang chủ shadcn/ui để copy các layout mẫu.
- Lên các kho mã nguồn mở như `shadcn-table.com` để copy toàn bộ component phức tạp của họ về paste vào dự án.
- **Lưu ý:** Copy về sẽ tiết kiệm thời gian, nhưng bạn sẽ phải mất công đọc hiểu code của họ nếu muốn tinh chỉnh (customize). Do đó Cách 1 vẫn luôn được ưu tiên hơn.

---

## Khi nào dùng?

- **Rất khuyên dùng:** Cho các dự án từ tầm trung đến cực lớn, nơi Designer có bộ Design System riêng và yêu cầu bạn phải tùy biến giao diện khắt khe (Pixel perfect).
- **Không nên dùng:** Cho các dự án làm gấp (hackathon, MVP) cần có sẵn một Dashboard với các theme có sẵn. Lúc này xài Ant Design hay Mantine sẽ làm ra sản phẩm nhanh hơn (nhưng khó tùy biến hơn sau này).

---

## 🔗 References
- [shadcn/ui Official Docs](https://ui.shadcn.com/)
- Related notes: [[tailwindcss]]
