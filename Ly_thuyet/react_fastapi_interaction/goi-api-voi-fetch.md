---
tags: [api, fetch, react, frontend, backend]
related: [kien-truc-api-va-validation]
module_refs: [M2, M6]
---

# Gọi API với Fetch API

> Hướng dẫn cách sử dụng Fetch API mặc định của trình duyệt để thực hiện các yêu cầu HTTP (GET, POST, PUT, DELETE) từ Frontend lên Backend và cách tích hợp vào component React.

---

## Fetch API Cơ Bản (GET Request)

### Khái niệm
`fetch()` là một API chuẩn được tích hợp sẵn trong các trình duyệt hiện đại dùng để thực hiện các HTTP requests bất đồng bộ. Nó trả về một `Promise` chứa đối tượng `Response`.

### Ví dụ code
```javascript
// Sử dụng async/await trong JavaScript/TypeScript
async function fetchUserData(email) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/users/get/${email}`);
    
    // BẮT BUỘC: Check status code vì fetch không tự ném lỗi khi gặp mã 4xx hoặc 5xx
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json(); // Parse body dạng JSON
    console.log("Dữ liệu nhận về:", data);
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
}
```

### Common pitfall
- **Fetch không tự động throw error đối với mã HTTP lỗi (như 404, 500, 401)**. Lỗi mạng hoặc block CORS mới làm `fetch` bị reject. Do đó, luôn phải kiểm tra `response.ok` (hoặc `response.status` nằm trong khoảng 200-299).
- **Quên dùng `await` khi gọi `response.json()`**: Hàm `response.json()` cũng trả về một Promise chứ không trả về dữ liệu trực tiếp.

### Khi nào dùng
Dùng cho các request lấy dữ liệu đơn giản (GET) từ client mà không muốn cài đặt thêm các thư viện bên thứ ba như Axios.

---

## Gửi Dữ Liệu (POST/PUT/DELETE Request)

### Khái niệm
Để gửi dữ liệu lên server (như đăng ký, đăng nhập hoặc cập nhật thông tin), ta cần chỉ định thuộc tính `method`, cấu hình `headers` (thông dụng nhất là `'Content-Type': 'application/json'`) và chuyển dữ liệu JavaScript thành chuỗi JSON qua `JSON.stringify()` trong phần `body`.

### Ví dụ code
```typescript
// Gửi request POST để đăng ký thành viên
async function registerUser(userData) {
  try {
    const response = await fetch('http://127.0.0.1:8000/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData) // Chuyển object thành string JSON
    });

    const data = await response.json();

    if (!response.ok) {
      // Trường hợp backend trả về chi tiết lỗi (ví dụ cấu trúc lỗi của FastAPI)
      throw new Error(data.detail?.message || "Đăng ký thất bại");
    }

    return data;
  } catch (error: any) {
    console.error("Lỗi đăng ký:", error.message);
    throw error;
  }
}
```

### Common pitfall
- **Quên header `Content-Type: application/json`**: Khi gửi body dạng JSON mà không cấu hình header này, Backend (ví dụ FastAPI) sẽ không hiểu kiểu dữ liệu nhận được và trả về lỗi `422 Unprocessable Entity`.
- **Truyền trực tiếp đối tượng JavaScript vào `body`** mà không qua `JSON.stringify()`.

### Khi nào dùng
Dùng khi cần gửi dữ liệu tạo mới (POST), cập nhật (PUT/PATCH), hoặc xóa dữ liệu (DELETE) lên Backend API.

---

## Sử Dụng Fetch Trong React Component

### Khái niệm
Khi gọi API trong React, chúng ta thường thực hiện bên trong hook `useEffect` khi component được mount, đồng thời quản lý các trạng thái `data` (dữ liệu), `loading` (trạng thái đang tải), và `error` (lỗi nếu có).

### Ví dụ code
```tsx
import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
}

function UserProfile({ email }: { email: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sử dụng AbortController để hủy request cũ nếu prop email thay đổi nhanh
    const controller = new AbortController();
    const signal = controller.signal;

    const loadUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/users/get/${email}`, { signal });
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin người dùng');
        }
        
        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Có lỗi xảy ra');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Cleanup function: Hủy request nếu component unmount hoặc email thay đổi
    return () => {
      controller.abort();
    };
  }, [email]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!user) return <div>Không tìm thấy người dùng</div>;

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold">Thông tin tài khoản</h2>
      <p>Email: {user.email}</p>
      <p>Vai trò: {user.role}</p>
    </div>
  );
}
```

### Common pitfall
- **Race Conditions (Tranh chấp kết quả)**: Khi props/state thay đổi nhanh làm kích hoạt nhiều request gọi đồng thời, kết quả trả về sau cùng có thể đè lên kết quả đúng. Cần sử dụng `AbortController` ở hàm cleanup để hủy request trước đó.
- **Infinite Loops (Vòng lặp vô tận)**: Gọi fetch trực tiếp trong thân component (không để trong `useEffect` hoặc event handler), hoặc cập nhật state gây re-render liên tục.

### Khi nào dùng
Dùng để nạp dữ liệu (data fetching) khi component vừa hiển thị trên màn hình.

---

## Đối tượng Response trong Fetch API

### Khái niệm
Khi bạn gọi `const response = await fetch(...)`, thực thể `response` nhận về là một instance của class **`Response`** - đây là interface chuẩn của Web API trình duyệt.

**Đối tượng `Response` có định dạng chung đồng nhất cho MỌI loại request (GET, POST, PUT, DELETE...)** vì nó được trình duyệt định nghĩa sẵn. Sự khác biệt giữa các request chỉ nằm ở dữ liệu chứa bên trong phần thân phản hồi (Body Payload) do Backend trả về.

Các thuộc tính quan trọng của đối tượng `Response`:
- **`response.ok`** (boolean): Trả về `true` nếu status code nằm trong khoảng `200 - 299` (thành công), ngược lại trả về `false`.
- **`response.status`** (number): Mã trạng thái HTTP (ví dụ: `200`, `201`, `400`, `401`, `422`, `500`).
- **`response.statusText`** (string): Chuỗi thông điệp đi kèm (ví dụ: `"OK"`, `"Created"`, `"Unauthorized"`, `"Unprocessable Entity"`).
- **`response.headers`** (Headers): Chứa danh sách các headers phản hồi từ server.
- **`response.url`** (string): URL của request gốc.

Các phương thức đọc dữ liệu từ Body (lưu ý: chỉ được gọi một lần vì stream dữ liệu sẽ bị tiêu thụ):
- **`await response.json()`**: Đọc dữ liệu dưới dạng JSON (trả về JS Object hoặc Array).
- **`await response.text()`**: Đọc dữ liệu thô dưới dạng chuỗi văn bản (Plain Text).
- **`await response.blob()`**: Đọc dữ liệu nhị phân (dùng khi download file, ảnh).

### Ví dụ code
```typescript
// Hàm tổng quát minh họa cấu trúc đồng nhất của đối tượng Response
async function inspectResponse(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  // 1. Kiểm tra các thuộc tính chung luôn luôn có
  console.log("Status Code:", response.status);       // Ví dụ: 200, 422
  console.log("Is Success (2xx):", response.ok);     // Ví dụ: true, false
  console.log("Status Text:", response.statusText);   // Ví dụ: "OK"
  console.log("Content-Type:", response.headers.get("content-type")); 

  // 2. Phân tích Body tùy thuộc vào dữ liệu thực tế từ Server trả về
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const jsonBody = await response.json(); // Dữ liệu JSON thực tế từ Backend
    console.log("JSON Payload:", jsonBody);
  } else {
    const textBody = await response.text();
    console.log("Text Payload:", textBody);
  }
}
```

### Common pitfall
- **Không thể gọi các phương thức đọc Body nhiều lần**: Ví dụ gọi `await response.json()` rồi gọi tiếp `await response.text()` trên cùng một đối tượng `response` sẽ báo lỗi `TypeError: body stream already read` (luồng dữ liệu đã bị tiêu thụ).
- **Nhầm lẫn giữa cấu trúc đối tượng Response của trình duyệt và cấu trúc JSON của Backend**: Đối tượng `response` là vỏ bọc của trình duyệt. Dữ liệu thực tế bạn cần lấy từ API nằm ở kết quả sau khi chạy `await response.json()`.

### Khi nào dùng
Dùng để kiểm soát mã trạng thái, kiểm tra tính hợp lệ của response trước khi parse dữ liệu từ server, hoặc đọc thông tin trong Headers.

---

## Xử lý Lỗi và Định dạng Error trong Block `catch`

### Khái niệm
Khi gọi API bằng `fetch`, có hai nhóm lỗi chính bạn sẽ bắt (catch) được trong block `catch (error: any)`:

1. **Lỗi mạng & Trình duyệt (Network Error / CORS Block / Aborted):**
   - Xảy ra khi thiết bị mất kết nối internet, sai IP/domain của server, CORS bị chặn, hoặc server bị sập hoàn toàn.
   - Lúc này, trình duyệt sẽ tự động **từ chối (reject)** Promise của `fetch`.
   - Đối tượng nhận được trong block `catch` là một instance của **`TypeError`** (hoặc `DOMException` nếu dùng `AbortController`), có thuộc tính `error.message` tiêu chuẩn (ví dụ: `"Failed to fetch"`).
2. **Lỗi logic nghiệp vụ của Server (HTTP Error Codes 4xx, 5xx):**
   - Trình duyệt vẫn nhận được phản hồi HTTP từ server bình thường (không bị reject, Promise của `fetch` được resolve).
   - Tuy nhiên, dữ liệu không hợp lệ hoặc không có quyền truy cập nên `response.ok = false`.
   - **Mặc định, `fetch` KHÔNG tự động ném lỗi này vào block `catch`.** Bạn phải tự kiểm tra `if (!response.ok)` và tự `throw new Error(...)` để đưa luồng xử lý vào block `catch`.

**Định dạng (Format) của `error` trong block `catch` KHÔNG cố định:**
- Nếu là lỗi mạng/trình duyệt: Định dạng là đối tượng `Error` chuẩn của JavaScript (thường là `TypeError`) có thuộc tính `name` và `message`.
- Nếu là lỗi HTTP do bạn tự `throw`: Định dạng hoàn toàn phụ thuộc vào việc bạn ném đi cái gì (ném chuỗi string, đối tượng `Error` thường, hoặc một class lỗi tự định nghĩa như `APIError` chứa mã lỗi từ Backend).

### Ví dụ code
Dưới đây là cấu trúc xử lý lỗi chuẩn doanh nghiệp khi gọi API, giúp phân biệt rõ lỗi mạng và lỗi nghiệp vụ từ backend:

```typescript
// 1. Định nghĩa class lỗi tùy chỉnh kế thừa từ Error chuẩn
class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

// 2. Hàm gọi API có xử lý lỗi chi tiết
async function registerUserWithFullErrorHandling(userData: any) {
  try {
    const response = await fetch("http://127.0.0.1:8000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // A. Xử lý lỗi HTTP (4xx, 5xx) từ Server
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json(); // Đọc lỗi chi tiết dạng JSON từ server
      } catch {
        // Dự phòng trường hợp server trả về lỗi không phải JSON (ví dụ lỗi 502 Nginx)
      }
      
      // Tự ném lỗi tùy chỉnh để bắt lại ở block catch
      throw new APIError(
        errorData?.detail?.message || `Lỗi hệ thống (${response.status})`,
        response.status,
        errorData
      );
    }

    return await response.json(); // Trả về dữ liệu thành công khi 2xx

  } catch (error: any) {
    // B. Block catch: Nhận diện và phân loại lỗi
    if (error instanceof APIError) {
      // Đây là lỗi nghiệp vụ từ Backend (trùng email, mật khẩu không khớp, v.v.)
      console.error(`[API Error ${error.status}]:`, error.message, error.data);
      alert(`Lỗi đăng ký: ${error.message}`);
    } else if (error.name === "AbortError") {
      // Request bị hủy chủ động bởi AbortController
      console.log("Request bị hủy");
    } else {
      // Lỗi mạng hoặc lỗi hệ thống (mất mạng, server sập hoàn toàn)
      console.error("[Network/Browser Error]:", error.message);
      alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!");
    }
    
    throw error; // Ném tiếp lỗi ra ngoài nếu component cần sử dụng tiếp
  }
}
```

### Common pitfall
- **Chỉ tin tưởng block `catch` mà quên check `response.ok`**: Dẫn đến việc khi server trả về lỗi `401 Unauthorized` hoặc `500 Internal Error`, client vẫn coi là thành công và cố đọc dữ liệu `undefined`, gây crash ứng dụng.
- **Sử dụng sai định dạng lỗi của Axios**: Trong Axios, lỗi được cấu trúc dưới dạng `error.response.data`. Đối với Fetch API, nếu là lỗi mạng, đối tượng `error` **không** có thuộc tính `response`, cố truy cập sẽ gây ra lỗi `Cannot read properties of undefined`.
- **Không hiển thị lỗi chi tiết từ backend**: Nếu backend trả về thông tin lỗi chi tiết (ví dụ: `"Email đã tồn tại"`), nhưng bạn chỉ hiển thị thông điệp chung chung từ status text (`"Bad Request"`), trải nghiệm người dùng sẽ rất tệ.

### Khi nào dùng
Áp dụng mô hình phân loại lỗi này cho tất cả các hàm gọi API dịch vụ trong hệ thống để đảm bảo ứng dụng hoạt động ổn định và thông báo lỗi rõ ràng.

---

## Hiển thị Lỗi Xuống Dòng trên Giao diện (Frontend)

### Khái niệm
Khi bạn nối các thông báo lỗi bằng ký tự xuống dòng `\n` (ví dụ: `errorMsg += err.message + '\n'`) để hiển thị lên trang web, mặc định trình duyệt HTML sẽ **tự động gộp (collapse) ký tự `\n` thành một khoảng trắng duy nhất**. Điều này khiến các lỗi hiển thị dính liền nhau trên một dòng.

Để hiển thị xuống dòng chính xác cho các thông điệp lỗi, bạn có hai cách tiếp cận chính:
1. **CSS `white-space`:** Cấu hình cho thẻ chứa văn bản tôn trọng ký tự `\n`.
2. **Mảng JSX (Array rendering):** Lưu danh sách lỗi thành mảng và render thành các thẻ riêng biệt.

### Ví dụ code
#### Cách 1: Sử dụng CSS `white-space: pre-line` (Nhanh nhất)
```tsx
// CSS style yêu cầu trình duyệt xuống dòng khi gặp \n
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="text-red-500 whitespace-pre-line bg-red-50 p-3 rounded">
      {message}
    </div>
  );
}
```
*Lưu ý:* `whitespace-pre-line` là class có sẵn trong Tailwind CSS. Nếu dùng CSS thuần, bạn viết: `white-space: pre-line;`.

#### Cách 2: Render dạng mảng (Khuyên dùng cho React)
Thay vì ghép chuỗi với `\n`, hãy lưu danh sách thông điệp lỗi vào mảng (Array) và lặp qua để render.
```tsx
import { useState } from 'react';

function RegisterForm() {
  const [errors, setErrors] = useState<string[]>([]);

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8000/users/register", { /*...*/ });
      const data = await response.json();
      
      if (!response.ok) {
        // Lưu mảng các message lỗi
        const errorMsgs = data.errors.map((err: any) => err.message);
        setErrors(errorMsgs);
      }
    } catch (err) {
      setErrors(["Không thể kết nối đến máy chủ."]);
    }
  };

  return (
    <div>
      {/* Hiển thị danh sách lỗi đẹp mắt */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg space-y-1">
          {errors.map((msg, index) => (
            <p key={index} className="text-sm">
              • {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Common pitfall
- **Sử dụng sai `white-space: pre`**: Thuộc tính `pre` sẽ giữ nguyên cả `\n` và khoảng trắng, nhưng **không tự động xuống dòng** khi dòng quá dài vượt quá khung màn hình (gây tràn layout). Nên dùng `pre-line` hoặc `pre-wrap` để chữ tự động xuống dòng khi hết màn hình.
- **Ghép chuỗi trực tiếp trong React** mà không bọc thẻ: Rất khó để tùy chỉnh UI cho từng dòng lỗi riêng biệt.

### Khi nào dùng
- Sử dụng **Cách 1** khi nhận về một chuỗi văn bản lớn từ server có chứa sẵn các ký tự `\n` (ví dụ: mô tả khóa học, điều khoản).
- Sử dụng **Cách 2** khi xử lý danh sách validation errors từ form để có giao diện chuyên nghiệp và dễ định dạng CSS.

---

## 🔗 References
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [FastAPI Error Handling](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- Module liên quan: M2 (Auth email), M6 (TanStack Query)



