# Hàm `watch` (React Hook Form)

## Khái niệm
Hàm `watch` (và hook `useWatch`) dùng để theo dõi (subscribe) sự thay đổi giá trị của một hoặc nhiều trường trong Form theo thời gian thực (real-time). Đây là giải pháp thay thế hoàn hảo cho `useState` khi muốn làm Conditional Rendering (ẩn/hiện UI dựa trên dữ liệu nhập vào) trong React Hook Form.

## Ví dụ code
```tsx
import { useForm, useWatch } from 'react-hook-form';

function WatchExample() {
  const { register, watch, control } = useForm();
  
  // Cách 1: Dùng hàm watch (Render lại toàn bộ component)
  const isFree = watch('is_free');
  
  // Cách 2: Dùng hook useWatch (Tối ưu hiệu năng, giới hạn re-render)
  const isFreeOptimized = useWatch({
    control,
    name: 'is_free',
    defaultValue: false
  });

  return (
    <form>
      <input type="checkbox" {...register('is_free')} /> Khóa học miễn phí
      
      {/* Ẩn hiện input giá tiền phụ thuộc vào checkbox is_free */}
      {!isFree && (
        <input type="number" {...register('price')} placeholder="Giá tiền" />
      )}
    </form>
  );
}
```

## Common pitfall
- **Ghi đè sự kiện của React Hook Form:** Nếu dùng `useState` kết hợp với thẻ input có `register`, việc gán thêm `onChange={(e) => setState(e.target.checked)}` có nguy cơ ghi đè và làm mất cơ chế theo dõi nội bộ của `register`. Luôn ưu tiên dùng `watch` để đảm bảo RHF quản lý toàn vẹn dữ liệu (Single Source of Truth).
- **Vấn đề hiệu năng (Performance):** Hàm `watch` sẽ làm toàn bộ component chứa `useForm` bị re-render mỗi khi giá trị thay đổi. Với form cực lớn, điều này làm giảm hiệu năng. Khi đó, hãy dùng hook `useWatch` bên trong một component con để cô lập việc re-render.

## Khi nào dùng
Dùng để ẩn/hiện các ô input khác dựa trên điều kiện của một ô input (Conditional Rendering), tính toán logic hiển thị, hoặc validate các trường phụ thuộc lẫn nhau một cách trực tiếp trên UI.
