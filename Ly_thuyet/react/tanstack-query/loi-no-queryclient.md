# Lỗi No QueryClient set (Common Pitfall)

## Khái niệm
Lỗi `Uncaught Error: No QueryClient set, use QueryClientProvider to set one` xảy ra khi một component gọi hook của TanStack Query nhưng component đó nằm ngoài tầm vực (scope) của `QueryClientProvider`.

## Common pitfall
- **Đặt Provider sai vị trí**: Đặt `<QueryClientProvider>` ở bên dưới router khiến cho các trang (pages) được quản lý bởi Router không nhận được context của Query Client.
- **Nhiều instance của thư viện**: Cài đặt sai phiên bản của `@tanstack/react-query` ở nhiều nơi trong dự án monorepo (ví dụ: một phiên bản ở root, một phiên bản ở app) khiến React Context bị nhận diện nhầm.

## Cách khắc phục
- Đảm bảo thẻ `<Providers>` (hoặc `<QueryClientProvider>`) bọc ngoài cùng của ứng dụng, bao bọc cả thẻ `<RouterProvider>` ở entry point.
