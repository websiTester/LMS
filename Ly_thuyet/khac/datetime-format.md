# Xử lý và Format Thời gian (DateTime) trong JS/React

> Tổng hợp các cách xử lý chuỗi thời gian trả về từ Backend (như định dạng chuẩn ISO 8601) thành dạng dễ nhìn, thân thiện với người dùng trên giao diện UI.

---

## 1. Bản chất chuỗi thời gian từ Backend

### Khái niệm
Khi Backend (ví dụ FastAPI kết nối PostgreSQL) trả dữ liệu thời gian qua API, nó thường ở định dạng chuẩn **ISO 8601**.
Ví dụ: `2026-05-29T08:03:02.032218Z`
- `T`: Chữ cái ngăn cách giữa Ngày và Giờ.
- `Z`: Đại diện cho múi giờ UTC (Zulu Time) - giờ chuẩn quốc tế.

Định dạng này máy tính rất thích vì dễ tính toán, nhưng người dùng nhìn vào sẽ thấy rất xấu và khó hiểu.

---

## 2. Format thời gian thuần (Vanilla JS) với `toLocaleDateString`

Cách phổ biến, không cần cài thêm thư viện (Zero dependencies) và được hỗ trợ sẵn trong mọi trình duyệt.

### Ví dụ code
```javascript
const isoString = "2026-05-29T08:03:02.032218Z";

// Bước 1: Parse (Chuyển) chuỗi thành đối tượng Date của Javascript
const dateObj = new Date(isoString);

// Bước 2: Format thành dạng tiếng Việt
const formattedDate = dateObj.toLocaleDateString('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

console.log(formattedDate); 
// Output: "29/05/2026, 15:03" (Đã tự động cộng 7 tiếng theo múi giờ Việt Nam)
```

### Cách áp dụng trực tiếp trong React JSX
Thay vì viết một hàm rườm rà, bạn có thể gọi trực tiếp trong thẻ JSX (rất hay dùng khi render Table hoặc List):

```tsx
<span className="text-sm text-gray-500">
  {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A'}
</span>
```

### Common pitfall
- **Hydration Error (Nếu dùng SSR như Next.js):** Cẩn thận khi render `toLocaleDateString` trực tiếp ở server, vì server có thể ở múi giờ Mỹ (Múi giờ UTC), còn Client ở Việt Nam (UTC+7). Lúc này Server trả về `08:03` nhưng trình duyệt tính ra `15:03` → Lỗi Hydration. Giải pháp là chỉ render date sau khi component đã mount (Dùng `useEffect`), hoặc luôn bắt buộc render ở múi giờ cố định bằng cách truyền thêm `{ timeZone: 'Asia/Ho_Chi_Minh' }`. Tuy nhiên trong Vite (Client Side Rendering) thì không lo lỗi này.
- **Dữ liệu Null/Undefined:** Luôn nhớ check `if (dateString)` (như ví dụ dùng toán tử 3 ngôi `? :`) trước khi parse `new Date(dateString)`, nếu không sẽ nhận về chuỗi `Invalid Date`.

---

## 3. Dùng thư viện: `date-fns` (Khuyên dùng cho dự án lớn)

Nếu dự án có các yêu cầu phức tạp như: "Cách đây 5 phút", "2 ngày trước", cộng trừ ngày tháng... thì các hàm thuần của Javascript sẽ không đủ. Lúc này nên dùng thư viện `date-fns` (Nhẹ hơn `moment.js` rất nhiều).

### Cài đặt
```bash
npm install date-fns
```

### Ví dụ code
```tsx
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const dateString = "2026-05-29T08:03:02.032218Z";
const dateObj = new Date(dateString);

// 1. Format cứng ngày tháng
const hardFormat = format(dateObj, 'dd/MM/yyyy HH:mm'); 
// "29/05/2026 15:03"

// 2. Format tương đối (Kiểu mạng xã hội Facebook)
const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true, locale: vi }); 
// "5 phút trước" hoặc "khoảng 1 tiếng trước"
```

### Khi nào dùng thư viện?
- Chỉ dùng `new Date().toLocaleDateString()` cho dự án đơn giản hoặc các trang Admin nội bộ.
- Dùng `date-fns` khi làm giao diện hướng tới User (B2C) cần hiển thị thời gian tương đối ("vừa xong", "1 giờ trước") để tăng tính thân thiện.

---

## 🔗 References
- [MDN Web Docs: Date.prototype.toLocaleDateString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString)
- [Thư viện date-fns](https://date-fns.org/)
