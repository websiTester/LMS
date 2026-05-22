# 🗺️ React Roadmap — Từ Basic đến Advanced

Roadmap đầy đủ để học React từ con số 0 đến mức tham gia được dự án thực tế (production-level).
Chia theo **6 giai đoạn**. Mỗi giai đoạn nên dành **1–3 tuần** làm project thực hành trước khi sang giai đoạn kế.

---

## 🟢 GIAI ĐOẠN 0 — NỀN TẢNG BẮT BUỘC (trước khi học React)

React không phải là điểm bắt đầu. Nếu thiếu nền này, bạn sẽ học React kiểu "học vẹt".

### HTML & CSS
- Semantic HTML, form, accessibility cơ bản (label, aria-*)
- CSS: Flexbox, Grid, Position, Box model, Responsive (media query)
- CSS preprocessor (SCSS) hoặc utility-first (Tailwind CSS)

### JavaScript (ES6+) — quan trọng nhất
- `let` / `const`, scope, hoisting, temporal dead zone
- Arrow function, `this` binding
- Destructuring, spread/rest operator
- Template literal
- Array methods: `map`, `filter`, `reduce`, `find`, `some`, `every`, `forEach`
- Object methods: `Object.keys/values/entries`
- Optional chaining `?.`, nullish coalescing `??`
- Promise, `async/await`, `try/catch`
- ES Modules: `import` / `export` (default vs named)
- `fetch` API, JSON
- Closure, callback, higher-order function
- Event loop cơ bản (vì sao `setTimeout` chạy sau)

### Công cụ
- Git & GitHub (clone, branch, commit, push, pull request)
- Terminal cơ bản, npm/yarn/pnpm
- VS Code + extensions (ESLint, Prettier, ES7 React snippets)
- Chrome DevTools (Console, Network, Elements)

---

## 🟢 GIAI ĐOẠN 1 — REACT CƠ BẢN

### Setup
- Tạo project với **Vite** (`npm create vite@latest` hoặc `npx create-next-app@latest`) — KHÔNG dùng Create React App nữa, nó đã deprecated
- Cấu trúc thư mục, file `.jsx` / `.tsx`

### Core concepts
- JSX: cú pháp, expression `{}`, conditional rendering (`&&`, ternary), list rendering với `map` + `key`
- Component: function component (chỉ học function, bỏ qua class component)
- Props: truyền data, `children`, default props, prop destructuring
- State với `useState`
- Event handling (`onClick`, `onChange`, `onSubmit`)
- Form: controlled vs uncontrolled component
- Conditional rendering & List rendering
- Styling: CSS Modules, Tailwind, hoặc styled-components

### Hooks cơ bản
- `useState` — quản lý state local
- `useEffect` — side effect, cleanup function, dependency array
- `useRef` — truy cập DOM, lưu giá trị không trigger re-render

### Project gợi ý
- Todo App (CRUD)
- Weather App (gọi API)
- Calculator
- Quiz App

---

## 🟡 GIAI ĐOẠN 2 — REACT TRUNG CẤP

### Hooks nâng cao
- `useContext` — chia sẻ state cross-component (tránh prop drilling)
- `useReducer` — state phức tạp, logic giống Redux
- `useMemo` — cache giá trị tính toán nặng
- `useCallback` — cache function reference
- `useLayoutEffect` — chạy đồng bộ sau DOM mutation
- **Custom hooks** — tách logic tái sử dụng (vd: `useFetch`, `useDebounce`, `useLocalStorage`)

### Routing
- **React Router v6+**: `<BrowserRouter>`, `<Routes>`, `<Route>`, nested route, dynamic param (`:id`), `useNavigate`, `useParams`, `useSearchParams`
- Protected route (auth guard)
- Lazy loading route với `React.lazy` + `Suspense`

### Forms chuyên nghiệp
- **React Hook Form** (chuẩn industry, nhẹ và performant)
- Validation với **Zod** hoặc **Yup**

### Data fetching đúng cách
- **TanStack Query (React Query)** — caching, refetch, mutation, optimistic update
- Hiểu vì sao không dùng `useEffect` để fetch trong dự án thật

### TypeScript với React ⭐ (gần như bắt buộc cho job thật)
- Type cho props, state, event, ref
- Generic component
- Utility types: `Partial`, `Pick`, `Omit`, `Record`

### Project gợi ý
- Movie database app (TMDB API) có search + pagination + filter
- Blog với auth (login/register) + CRUD post
- E-commerce mini (cart, checkout) dùng Context hoặc Zustand

---

## 🟡 GIAI ĐOẠN 3 — STATE MANAGEMENT & ARCHITECTURE

### Global state — chọn 1 trong các option sau theo nhu cầu
- **Zustand** — đơn giản, ít boilerplate, đang rất phổ biến (KHUYẾN NGHỊ học đầu tiên)
- **Redux Toolkit + RTK Query** — chuẩn enterprise, nhiều job yêu cầu
- **Jotai** / **Recoil** — atomic state
- **TanStack Query** cho server state (KHÁC với client state)

> ⚠️ Nguyên tắc quan trọng: phân biệt **server state** (data từ API — dùng React Query) vs **client state** (UI state — dùng Zustand/Context).

### Component pattern
- Container/Presentational
- Compound component (vd: `<Tabs><Tab/></Tabs>`)
- Render props
- Higher-Order Component (HOC) — biết là chính, ít dùng
- Controlled vs Uncontrolled

### Folder structure cho project lớn
- Feature-based (theo tính năng) vs Layer-based (theo loại file)
- Atomic Design (atoms, molecules, organisms)

### Error handling
- Error Boundary
- Suspense cho async component
- Toast notification (react-hot-toast / sonner)

---

## 🟠 GIAI ĐOẠN 4 — PERFORMANCE & TESTING

### Performance optimization
- `React.memo`, `useMemo`, `useCallback` — DÙNG KHI NÀO (không phải lúc nào cũng dùng)
- Code splitting, lazy load, `React.lazy` + `Suspense`
- Virtualization với `react-window` / `tanstack-virtual` cho list dài
- Profiler trong React DevTools
- Bundle analysis (vite-bundle-visualizer)
- Image optimization, lazy load image
- Debounce / throttle event

### Testing
- **Vitest** hoặc Jest — unit test
- **React Testing Library** — component test (test theo user behavior, không test implementation)
- **Playwright** hoặc **Cypress** — E2E test
- MSW (Mock Service Worker) để mock API

---

## 🔴 GIAI ĐOẠN 5 — ADVANCED & FRAMEWORK

### Meta-framework — bắt buộc nếu muốn làm dự án production
- **Next.js** (App Router) — SSR, SSG, ISR, Server Component, Server Action, route handler, middleware
- Hoặc **Remix** — fullstack web framework
- Hiểu CSR vs SSR vs SSG vs ISR

### React Server Components (RSC)
Paradigm mới, rất quan trọng từ 2024+

### Authentication & Authorization
- JWT, refresh token, OAuth
- NextAuth.js / Auth.js, Clerk, Supabase Auth
- Protected route, role-based access

### Real-world skills
- WebSocket / Socket.io (real-time)
- File upload (multipart, presigned URL)
- Internationalization (i18next, next-intl)
- SEO (meta tag, sitemap, Open Graph)
- Accessibility (a11y) chuẩn WCAG
- Animation: **Framer Motion**
- UI library: **shadcn/ui** (đang hot), Radix UI, Material UI, Ant Design
- Drag & drop: dnd-kit
- Chart: Recharts, Visx

### DevOps cơ bản cho frontend
- Deploy: Vercel, Netlify, Cloudflare Pages
- Docker hóa app React
- CI/CD với GitHub Actions
- Environment variables (`.env`)
- Monorepo: Turborepo, pnpm workspace

### React internals (để hiểu sâu)
- Virtual DOM, reconciliation, Fiber
- Concurrent rendering, `useTransition`, `useDeferredValue`
- Tại sao state update là batched
- Tại sao key trong list lại quan trọng

---

## 🚀 GIAI ĐOẠN 6 — SẴN SÀNG ĐI LÀM

### Capstone project gợi ý (làm 1–2 cái tử tế hơn 10 cái dở)
1. **Trello clone** — drag & drop, real-time, auth
2. **E-commerce fullstack** — Next.js + Stripe + dashboard admin
3. **SaaS dashboard** — multi-tenant, role, analytics chart
4. **Chat app real-time** — Socket.io, file upload, notification

### Kỹ năng "mềm" cho dự án thật
- Đọc & viết code review
- Conventional Commits (`feat:`, `fix:`, `chore:`)
- Đọc tài liệu tiếng Anh (React docs, MDN)
- Git workflow: feature branch, rebase, resolve conflict
- Debug production bug từ Sentry/log

---

## 📚 NGUỒN HỌC TỐT NHẤT

| Mục đích | Nguồn |
|---|---|
| Docs chính thức (BẮT BUỘC) | https://react.dev |
| Khóa miễn phí có depth | The Odin Project, freeCodeCamp |
| Khóa có phí chất lượng cao | Frontend Masters, Epic React (Kent C. Dodds), Total TypeScript |
| YouTube tiếng Việt | Easy Frontend, F8 (Sơn Đặng), Anonystick |
| YouTube tiếng Anh | Theo, Jack Herrington, Web Dev Simplified, ByteGrad |
| Luyện thuật toán JS | LeetCode, frontendmentor.io (luyện UI) |

---

## ⏱️ LỘ TRÌNH THỜI GIAN THAM KHẢO

- **Học fulltime (6–8h/ngày)**: 4–6 tháng đến level junior
- **Học part-time (2–3h/ngày)**: 8–12 tháng
- Quan trọng: **code mỗi ngày**, đừng chỉ xem video. Tỉ lệ vàng: **20% xem — 80% tự code**.

---

## ✅ CHECKLIST TIẾN ĐỘ

- [ ] Giai đoạn 0 — Nền tảng HTML/CSS/JS/Git
- [ ] Giai đoạn 1 — React cơ bản (JSX, props, state, useState, useEffect)
- [ ] Giai đoạn 2 — React trung cấp (Router, Forms, React Query, TypeScript)
- [ ] Giai đoạn 3 — State management & Architecture
- [ ] Giai đoạn 4 — Performance & Testing
- [ ] Giai đoạn 5 — Next.js, Auth, Real-time, Deploy
- [ ] Giai đoạn 6 — Capstone project & sẵn sàng đi làm
