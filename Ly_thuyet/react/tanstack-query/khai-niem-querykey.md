# Khái niệm bản chất của Query Key

> Query Key là gì? Nó lưu giá trị gì và tại sao lại dùng Array?

---

## 1. Query Key là gì?
Hãy tưởng tượng bộ đệm (Cache) của TanStack Query giống như một **Cái Tủ Hồ Sơ (Filing Cabinet)** khổng lồ.

Khi `useQuery` gọi API lấy dữ liệu về, nó cần cất đống dữ liệu đó vào một ngăn tủ nào đó. Làm sao để lần sau biết đống dữ liệu đó nằm ở đâu mà lấy ra? Nó cần một cái **Nhãn Dán (Label)** dán bên ngoài ngăn tủ.

**`queryKey` chính là cái Nhãn Dán đó.**

*(Lưu ý: Bản thân cái biến `queryKey` không lưu data. Nó chỉ đóng vai trò là Định danh (Unique ID) / Tên thư mục. Giá trị thực sự được cất bên dưới cái `queryKey` đó chính là kết quả trả về của hàm `queryFn`)*.

---

## 2. Ý nghĩa của Array trong Query Key

TanStack Query bắt buộc `queryKey` phải là một **Mảng (Array)** để dễ dàng tạo ra tính phân cấp (giống như thư mục mẹ, thư mục con).

### Ví dụ 1: Query Key Đơn (List)
```tsx
queryKey: ['teacherCourses']
```
- **Nghĩa là:** *"Cất dữ liệu này vào ngăn tủ có dán nhãn là 'teacherCourses'"*.
- **Giá trị lưu:** Lưu toàn bộ danh sách khóa học (Array các objects).
- **Cách hoạt động:** Khi user mở trang Danh sách khóa học, React Query tìm ngăn tủ tên `['teacherCourses']`. Nếu tủ có đồ, nó lôi ra dùng ngay. Nếu tủ trống, nó chạy đi gọi API lấy data về nhét vào.

### Ví dụ 2: Query Key Phân Cấp (Detail)
```tsx
queryKey: ['course', courseId] // VD courseId = 1
```
- **Nghĩa là:** *"Cất dữ liệu này vào ngăn tủ tên 'course', và bỏ vào cái kẹp hồ sơ số '1'"*. 
- **Cách hoạt động:** Tại sao phải có `courseId`? Giả sử bạn vào xem khóa học số 1, data lưu vào `['course', 1]`. Sau đó chuyển sang khóa số 2. Nếu `queryKey` chỉ là `['course']` chung chung, nó sẽ bị đè mất data khóa 1. Nhờ có `courseId`, TanStack Query tạo ra hàng loạt các "ngăn tủ con":
  - `['course', 1]` -> Lưu data khóa 1
  - `['course', 2]` -> Lưu data khóa 2
  - Nhờ vậy, khi bạn quay ngược lại khóa 1, nó load ra ngay lập tức vì đệm vẫn còn giữ.

---

## 3. Sức mạnh của Prefix Matching (Di truyền họ hàng)

Vì `queryKey` là Mảng, nó tạo ra cấp bậc. Tính năng này tỏa sáng khi bạn cần Invalidate (xóa cache).

Khi bạn ra lệnh:
```tsx
queryClient.invalidateQueries({ queryKey: ['course'] })
```
TanStack Query sẽ chạy vào tủ hồ sơ, tìm **tất cả** những ngăn tủ nào có chữ `course` đứng đầu mảng và xóa sạch.
Vậy là `['course', 1]`, `['course', 2]`, `['course', 99]` đều bị xóa đệm cùng lúc. Đó là lý do cốt lõi tại sao thư viện bắt buộc `queryKey` phải là một Mảng!
