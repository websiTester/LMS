---
tags: [react, forms, react-hook-form, zod, validation]
related: [goi-api-voi-fetch]
module_refs: [M2, M8]
---

# Quản lý Form trong React — Mục lục

> Hướng dẫn các phương pháp thu thập và cập nhật dữ liệu từ Form trong React, từ các cách cơ bản như Controlled/Uncontrolled Components đến chuẩn doanh nghiệp (React Hook Form + Zod).

## Nội dung

- [[controlled-components]] — Quản lý form bằng useState (Single Source of Truth).
- [[uncontrolled-components]] — Lấy dữ liệu form bằng useRef hoặc FormData.
- [[react-hook-form-zod]] — Chuẩn doanh nghiệp quản lý form, kết hợp schema validation.
- [[zod-optional-nullable]] — Cách xử lý các trường không bắt buộc hoặc có thể null.
- [[checkbox-behavior]] — Bản chất và cách lấy giá trị từ checkbox.
- [[watch-function]] — Conditional rendering và theo dõi giá trị realtime từ React Hook Form.
- [[hien-thi-loi-validation]] — Hướng dẫn cách hiển thị lỗi validation từ Zod (`.refine` và field errors).

## 🔗 References
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod GitHub Repository](https://github.com/colinhacks/zod)
- Module liên quan: M2 (Auth email - dùng cho màn đăng ký/đăng nhập), M8 (Teacher dashboard - dùng cho form tạo khóa học)
- Related notes: [[goi-api-voi-fetch]]
