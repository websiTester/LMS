# React Hook Form + Zod (Chuẩn Doanh Nghiệp / Enterprise Standard)

## Khái niệm
Đây là giải pháp tối ưu hàng đầu được các doanh nghiệp lựa chọn nhờ sự kết hợp giữa:
1. **React Hook Form (RHF):** Thư viện quản lý form dựa trên Uncontrolled Components (sử dụng ref ngầm), giúp tối ưu hóa hiệu năng (chỉ re-render ô input đang thay đổi) nhưng vẫn cung cấp đầy đủ API để quản lý state dễ dàng.
2. **Zod:** Thư viện kiểm tra định dạng dữ liệu (Schema Validation) cực kỳ mạnh mẽ, giúp định nghĩa kiểu dữ liệu (TypeScript) và luật kiểm tra (validation rules) tại một nơi duy nhất.

## Ví dụ code
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Định nghĩa Schema Validation bằng Zod
const signupSchema = z.object({
  email: z.string().email('Email không đúng định dạng').min(5, 'Email tối thiểu 5 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"], // Xác định lỗi sẽ hiển thị ở ô Confirm Password
});

// 2. Trích xuất kiểu TypeScript tự động từ Zod Schema
type SignupFormData = z.infer<typeof signupSchema>;

function EnterpriseForm() {
  // 3. Khởi tạo React Hook Form kết hợp Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    // Giả lập gọi API đăng ký
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Dữ liệu hợp lệ gửi lên Server:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="border p-2 rounded w-full"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <input
          {...register('password')}
          type="password"
          placeholder="Mật khẩu"
          className="border p-2 rounded w-full"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <input
          {...register('confirmPassword')}
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="border p-2 rounded w-full"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded w-full disabled:bg-slate-400"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  );
}
```

## Chi tiết cấu hình khởi tạo `useForm`

Dưới đây là ý nghĩa chi tiết của từng thuộc tính cấu hình và các đối tượng lấy ra từ hook `useForm<T>`:

### 1. Cấu hình bên trong `useForm`
- **`useForm<SignupFormData>`**: Khai báo Generic Type cho form. RHF sẽ dựa vào kiểu này để tự động kiểm tra lỗi cú pháp và tự gợi ý trường (autocomplete) khi viết code.
- **`resolver: zodResolver(signupSchema)`**: Cấu hình sử dụng Zod làm bộ kiểm tra tính hợp lệ của dữ liệu. Form sẽ chạy validation của `signupSchema` trước khi cho phép submit.
- **`defaultValues`**: Khai báo giá trị ban đầu cho các ô nhập liệu. Giúp React tránh cảnh báo *"Controlled to Uncontrolled"* và dọn sạch bộ nhớ đệm ban đầu của form.

### 2. Các hàm và thuộc tính lấy ra
- **`register`**: Hàm bắt buộc của RHF dùng để đăng ký thẻ input vào hệ thống quản lý của thư viện.
  - *Lưu ý ý nghĩa:* Từ `register` ở đây là thuật ngữ kỹ thuật mang ý nghĩa "đăng ký một phần tử DOM với RHF", **không liên quan đến nghiệp vụ đăng ký tài khoản (Sign up/Register account)**. Do đó, hàm này được dùng cho **MỌI loại form** (Login, Đổi mật khẩu, Tạo khóa học, Tìm kiếm, v.v.).
  - *Cơ chế hoạt động:* Ví dụ `<input {...register('email')} />` sẽ tự động gán các thuộc tính `name`, `value`, `onChange`, `onBlur`, và `ref` lên thẻ input đó để RHF quản lý ngầm mà không gây re-render liên tục khi gõ phím.

- **`handleSubmit`**: Hàm xử lý sự kiện submit form. Khi gọi `handleSubmit(onSubmit)`, nó sẽ tự động chạy `preventDefault()`, kích hoạt Zod validate. Nếu hợp lệ, nó mới truyền dữ liệu sạch đã kiểm tra cho hàm `onSubmit` của bạn.
- **`formState: { isSubmitting }`**: Trạng thái gửi form (biến Boolean).
  - *Cơ chế tự động:* RHF tự theo dõi và chuyển `isSubmitting` thành `true` ngay khi hàm submit dạng bất đồng bộ (`async/await` hoặc trả về `Promise`) bắt đầu chạy, và tự chuyển lại thành `false` sau khi Promise hoàn thành (dù thành công hay thất bại).
  - *Cách đổi tên biến (Alias):* Bạn có thể đổi tên biến mặc định này bằng cú pháp destructuring của JavaScript, ví dụ: `formState: { isSubmitting: isLoading }`. Khi đó, bạn có thể sử dụng `isLoading` trong component của mình thay cho `isSubmitting`.


### 3. Đối tượng lỗi `errors` (Kiểu dữ liệu từ đâu ra?)
- **Về mặt cấu trúc thuộc tính lỗi (Hệ thống định nghĩa):** Thư viện React Hook Form tự định nghĩa sẵn kiểu dữ liệu `FieldError` gồm các trường cố định như `message` (thông báo lỗi dạng string), `type` (loại lỗi), `ref` (tham chiếu DOM).
- **Về mặt các trường lỗi (Bạn định nghĩa):** Do bạn quyết định thông qua việc truyền kiểu Generic `<SignupFormData>`. TypeScript sẽ tự động ánh xạ (map) ra các trường lỗi tương ứng. Ví dụ: `errors.email`, `errors.password` được gợi ý và kiểm soát chặt chẽ bởi TypeScript; việc truy cập `errors.username` (không tồn tại trong schema) sẽ bị báo lỗi đỏ ngay lập tức.

## Tại sao đây là chuẩn doanh nghiệp thực tế?
1. **Hiệu năng vượt trội:** RHF không re-render lại toàn bộ form khi người dùng nhập dữ liệu, giúp UI mượt mà ngay cả với các form cực lớn.
2. **Schema-based Validation:** Tách biệt hoàn toàn logic xác thực dữ liệu ra khỏi tầng giao diện (UI) giúp code sạch sẽ, dễ bảo trì và dễ viết unit test.
3. **Tích hợp hoàn hảo với TypeScript:** Zod tự động suy luận ra kiểu dữ liệu đầu vào (Type Inference), tránh việc phải viết lại Interface/Type thủ công.
4. **Hỗ trợ tối đa bởi hệ sinh thái UI:** Các bộ component nổi tiếng như **shadcn/ui** đều sử dụng React Hook Form + Zod làm xương sống quản lý form.

## Khi nào dùng
Dùng cho mọi form từ trung bình đến phức tạp, các form cần kiểm tra dữ liệu nghiêm ngặt ở phía Client trước khi gửi lên API Backend.
