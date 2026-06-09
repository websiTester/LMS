# Thiết lập QueryClient và QueryClientProvider

## Khái niệm
Để sử dụng các hooks của TanStack Query (`useQuery`, `useMutation`), ứng dụng React cần có một `QueryClient` để quản lý cache và cấu hình, đồng thời được bao bọc bởi `QueryClientProvider` ở tầng cao nhất của ứng dụng.

## Ví dụ code
Cấu hình nhà cung cấp tại `apps/web/src/app/providers.tsx`:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Khởi tạo client chứa các thiết lập cache toàn cục
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động gọi lại API khi user click chuyển tab
      staleTime: 5 * 60 * 1000,    // Dữ liệu được coi là mới (fresh) trong 5 phút
    },
  },
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

Bọc ứng dụng tại entry point `apps/web/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Providers phải bọc ngoài cùng để QueryClientContext có hiệu lực trong Router */}
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);
```

## Khi nào dùng
Bắt buộc phải thiết lập khi bắt đầu chuyển từ cơ chế fetch dữ liệu thủ công (`useState` + `useEffect`) sang quản lý dữ liệu tập trung qua server state (thường từ Module 6 trong roadmap).
