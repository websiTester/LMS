# Lỗi hiển thị data cũ (Stale Data) khi kết hợp với React Hook Form

> Tránh tình trạng update data thành công nhưng khi quay lại form edit vẫn hiển thị data cũ.

---

## 1. Nguyên nhân gây lỗi

Khi kết hợp **TanStack Query** (dùng `useQuery` để fetch detail) và **React Hook Form** (dùng `defaultValues` để fill form), lỗi Stale Data thường xảy ra do sự kết hợp của 2 nguyên nhân sau:

1. **Quên Invalidate Cache của Detail Query:**
   - Trong `useMutation`, khi update thành công, developer thường chỉ nhớ gọi `queryClient.invalidateQueries(['danh-sach-item'])` mà quên mất không xóa cache của chính item đó `queryClient.invalidateQueries(['item-detail', id])`.
   - Kết quả: Khi user quay lại trang Edit, TanStack Query vẫn còn giữ cache cũ của `['item-detail', id]` và trả về nó ngay lập tức.

2. **Hành vi chỉ chạy 1 lần của `defaultValues`:**
   - Thuộc tính `defaultValues` trong `useForm` **chỉ khởi tạo đúng một lần** vào lần render đầu tiên của Component.
   - Khi trang Edit bật lên, nó lấy ngay cục cache cũ từ TanStack Query làm giá trị khởi tạo.
   - Vài mili-giây sau, TanStack Query tự động gọi lại API ngầm (background refetch) và lấy được data mới. Nhưng React Hook Form đã "chốt" sổ `defaultValues`, nên UI vẫn kẹt ở data cũ.
   - Lúc này user ấn update lần 2 mới thấy data của lần 1, do lúc này cache đã lưu đợt refetch trước đó.

---

## 2. Cách giải quyết triệt để

Cần áp dụng đồng thời cả 2 phương pháp sau:

### Bước 1: Xóa cache chính xác tại `useMutation`
Trong `onSuccess` của hàm mutation (file API), hãy bắt cả `variables` được truyền vào và invalidate luôn query detail của item đó.

```tsx
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCourseRequest,
    onSuccess: (data, variables) => { // variables chính là object { courseId, courseData }
      // 1. Invalidate list để ra bảng thấy data mới
      queryClient.invalidateQueries({ queryKey: ['teacherCourses'] }); 
      
      // 2. CHÚ Ý: Invalidate luôn detail query để lần sau mở form edit load data mới
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
    }
  });
};
```

### Bước 2: Thay `defaultValues` bằng `values` trong form
Thay vì dùng `defaultValues` (chỉ ăn 1 lần), sử dụng tính năng **`values`** (từ React Hook Form v7.43+) để tự động đồng bộ (reset) input mỗi khi biến `courseData` thay đổi.

```tsx
// Trong file Component Form
const { data: courseData } = useGetCourseById(id, isEditMode);

const { register, handleSubmit } = useForm<CreateCourseFormData>({
  resolver: zodResolver(schema),
  // DÙNG values THAY VÌ defaultValues
  values: courseData ? {
    title: courseData.title,
    level: courseData.level,
    // ...
  } : { title: '', level: 'beginner' } // Cung cấp giá trị default cho chế độ Create
});
```

*(Lưu ý: Nếu dùng React Hook Form bản cũ < v7.43, bạn bắt buộc phải dùng `useEffect` lắng nghe `courseData` thay đổi để gọi hàm `reset(courseData)`).*
