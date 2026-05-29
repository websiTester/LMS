---
tags: [javascript, typescript, es6, syntax]
related: [kien-truc-api-va-validation]
module_refs: [M1, M2]
---

# Destructuring và Rest Operator trong ES6+

> Cú pháp phân rã đối tượng (Destructuring Assignment) và thu thập thuộc tính còn lại (Rest Syntax) trong JavaScript/TypeScript giúp viết code ngắn gọn, sạch sẽ và an toàn.

---

## Phân Rã Đối Tượng (Destructuring Assignment)

### Khái niệm
Phân rã đối tượng là cú pháp cho phép trích xuất các thuộc tính từ một Object hoặc các phần tử từ một Array thành các biến riêng biệt một cách nhanh chóng.

### Ví dụ code
```typescript
const user = {
  id: 1,
  username: 'giahuy',
  email: 'huy@example.com',
  role: 'student'
};

// Trích xuất username và email ra làm biến độc lập
const { username, email } = user;

console.log(username); // 'giahuy'
console.log(email);    // 'huy@example.com'
```

---

## Cú Pháp Còn Lại (Rest Syntax)

### Khái niệm
Rest operator (sử dụng ký hiệu ba dấu chấm `...`) dùng để thu thập tất cả các thuộc tính còn lại của một đối tượng hoặc mảng sau khi đã phân rã một số thuộc tính cụ thể. Kết quả thu được là một Object hoặc một Array mới độc lập.

### Ví dụ code
```typescript
const configuration = {
  theme: 'dark',
  language: 'vi',
  showSidebar: true,
  animations: false
};

// Bóc tách theme và language để cấu hình riêng
// Gom showSidebar và animations vào object cấu hình UI (restUiConfigs)
const { theme, language, ...restUiConfigs } = configuration;

console.log(theme);         // 'dark'
console.log(restUiConfigs); // { showSidebar: true, animations: false }
```

---

## Ứng Dụng Thực Tế Trong API Client

### Khái niệm
Trong quá trình thiết kế API Client, cú pháp Destructuring kết hợp Rest Operator thường được sử dụng để tách biệt các tùy chọn cấu hình tùy chỉnh (như `params`) ra khỏi cấu hình chuẩn của Fetch API (như `method`, `headers`, `body`), tránh truyền tham số không hợp lệ vào trình duyệt.

### Ví dụ code
```typescript
interface CustomFetchOptions extends RequestInit {
  params?: Record<string, string>; // Tùy chỉnh thêm
}

export const apiClient = async (endpoint: string, options: CustomFetchOptions = {}) => {
  // Tách params và headers ra xử lý riêng, gom mọi tùy chọn fetch chuẩn vào restOptions
  const { params, headers, ...restOptions } = options;

  console.log(params);      // Dùng để xử lý chuỗi query string
  console.log(headers);     // Dùng để merge với default headers
  console.log(restOptions); // Truyền trực tiếp vào fetch() của trình duyệt
};
```

---

## 🔗 References
- [MDN Web Docs - Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN Web Docs - Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- Related notes: [[kien-truc-api-va-validation]]
