# 🗺️ Website Roadmap — Language Learning SaaS

Roadmap chi tiết cho **website dạy ngôn ngữ** (Course platform, FastAPI + React + cross-platform), gồm **26 module** sắp xếp theo learning curve.

> **Tham chiếu:**
> - [`spec.md`](.claude/specs/project_description/spec.md) — yêu cầu và quyết định kiến trúc (14 câu Q&A)
> - [`roadmap.md`](./roadmap.md) — React roadmap basic→advanced
> - [`fastapi-roadmap.md`](./fastapi-roadmap.md) — FastAPI roadmap basic→advanced

---

## 📋 Mục lục

- [Nguyên tắc thiết kế roadmap](#-nguyên-tắc-thiết-kế-roadmap)
- [Tech stack tổng quan](#-tech-stack-tổng-quan)
- [Cấu trúc thư mục (Frontend + Backend)](#-cấu-trúc-thư-mục-frontend--backend)
- [Database schema overview](#-database-schema-overview)
- [Phase grouping (7 phase)](#-phase-grouping)
- [Dependency graph](#-dependency-graph)
- [**26 module chi tiết**](#-26-module-chi-tiết)
  - [Phase 1: Foundation (M1–3)](#phase-1--foundation-m1m3)
  - [Phase 2: Core Content (M4–8)](#phase-2--core-content-m4m8)
  - [Phase 3: Learning Experience (M9–11)](#phase-3--learning-experience-m9m11)
  - [Phase 4: Monetization (M12–14)](#phase-4--monetization-m12m14)
  - [Phase 5: Engagement (M15–19)](#phase-5--engagement-m15m19)
  - [Phase 6: Production-ready (M20–23)](#phase-6--production-ready-m20m23)
  - [Phase 7: Mobile + Deploy (M24–26)](#phase-7--mobile--deploy-m24m26)
- [Checklist tiến độ](#-checklist-tiến-độ)

---

## 🎯 Nguyên tắc thiết kế roadmap

1. **Module-driven, not topic-driven** — Module là sản phẩm; concept là phương tiện. Mỗi module pick 1–2 concept "headline" mới + reuse concept đã học.
2. **Just-in-time learning** — Concept được giới thiệu **ngay trước** module dùng nó. KHÔNG học hết React/FastAPI rồi mới build.
3. **Spiral learning** — Concept gặp lại nhiều lần ở complexity tăng dần (vd: `useState` xuất hiện M2 → M5 → M10).
4. **Anchor + Stretch** — Mỗi module có anchor goal (must-have) + stretch goal (optional challenge).
5. **Concept lock 2–3 module** — Khi giới thiệu concept mới, dùng nó 2–3 module liên tiếp để thuần thục trước khi sang cái khác.

---

## 🧰 Tech stack tổng quan

### Frontend (Web)
| Layer | Choice | Note |
|---|---|---|
| Build tool | **Vite** | Hot reload nhanh, ESM native |
| Framework | **React 18+** | Hook-based |
| Routing | **react-router-dom v6** | |
| Styling | **Tailwind CSS + shadcn/ui** | Utility-first + component library |
| State (client) | **Zustand** (sau M6) | Lightweight, tránh boilerplate Redux |
| State (server) | **TanStack Query** | Cache, refetch, optimistic |
| Form | **React Hook Form + Zod** | Performance + type-safe validation |
| i18n | **react-i18next** | Standard cho immersion feature |
| Drag-drop | **@dnd-kit/core** | Modern, accessible |
| Video | **HLS.js + Cloudflare Stream** | Adaptive bitrate streaming |
| Chart | **Recharts** | Đủ cho admin analytics |
| Animation | **Framer Motion** | Cho gamification level-up, achievement |
| Notification | **sonner** | Toast modern, light |
| Testing | **Vitest + React Testing Library + Playwright** | |

### Frontend (Mobile, phase 7)
| Layer | Choice |
|---|---|
| Framework | **React Native + Expo** |
| Navigation | **React Navigation** |
| Storage | **AsyncStorage / SecureStore** |
| Push | **Expo Notifications** |
| IAP | **expo-in-app-purchases** / RevenueCat |
| Monorepo | **Turborepo / pnpm workspace** |

### Backend
| Layer | Choice | Note |
|---|---|---|
| Framework | **FastAPI** | Async first, OpenAPI auto |
| Package manager | **uv** | Cực nhanh, replace pip/poetry |
| Linter/Formatter | **ruff** | Replace black + flake8 + isort |
| ORM | **SQLAlchemy 2.x** (hoặc SQLModel) | Recommend SQLAlchemy 2.x cho prod |
| Migration | **Alembic** | |
| Validation | **Pydantic v2** | Native trong FastAPI |
| Auth | **python-jose** (JWT) + **passlib[argon2]** + **Authlib** (Google OAuth) | |
| Background job | **ARQ** (async) hoặc **Celery** | ARQ nhẹ hơn, hợp FastAPI async |
| Cache + Pub/sub | **Redis** | Sorted set cho leaderboard, pub/sub cho WS scale |
| Database | **PostgreSQL 15+** | |
| Email | **Resend** | Modern, dev-friendly |
| Object storage | **Cloudflare R2** | Audio + image (S3-compatible, free egress) |
| Video hosting | **Cloudflare Stream** | DRM signed URL, adaptive bitrate |
| Testing | **pytest + pytest-asyncio + httpx + factory-boy** | |

### Infrastructure
| Layer | Choice |
|---|---|
| Deploy FE web | **Vercel** |
| Deploy BE | **Railway / Fly.io / Render** |
| Postgres managed | **Neon / Supabase** |
| Redis managed | **Upstash** |
| CDN | **Cloudflare** |
| DNS | **Cloudflare** |
| CI/CD | **GitHub Actions** |
| Error tracking | **Sentry** (free tier) |
| Uptime | **BetterUptime** |
| Local dev | **Docker Compose** (postgres + redis + mailpit) |

---

## 📂 Cấu trúc thư mục (Frontend + Backend)

### Quyết định nền

| # | Quyết định | Lựa chọn |
|---|---|---|
| 1 | Monorepo strategy | **Monorepo-ready** từ M1 (`apps/` + `packages/`), CHƯA dùng Turborepo cho đến M24 |
| 2 | FE architecture style | **Feature-based** (`features/auth/`, `features/course/`, ...) |
| 3 | BE architecture style | **Domain-driven** (`app/auth/`, `app/course/`, ...) — sync với FE |
| 4 | App separation | Cùng app `apps/web/` cho Student/Teacher/Admin, phân chia qua route guard + layout |

### Root layout

```
React_roadmap/
├── .claude/                    # CLAUDE.md + spec.md (đã có)
├── Ly_thuyet/                  # Roadmaps + take note (đã có)
├── apps/                       # ← MỚI: ứng dụng deploy được
│   ├── web/                    # React + Vite (Student/Teacher/Admin)
│   └── backend/                # FastAPI
├── packages/                   # ← MỚI: shared package (trống MVP, fill từ M24)
│   ├── api-client/             #   (M24) OpenAPI codegen TS types + hooks
│   ├── schemas/                #   (M24) Shared Zod schemas
│   └── business-logic/         #   (M24) Pure functions share FE/RN (quiz grade, XP calc)
├── infra/                      # ← MỚI: Docker, nginx, scripts deploy
│   ├── docker-compose.yml      # Local dev: postgres + redis + mailpit
│   ├── docker-compose.prod.yml
│   └── nginx/
│       └── nginx.conf
├── .github/
│   └── workflows/              # CI/CD (M26)
│       ├── lint.yml
│       ├── test.yml
│       └── deploy.yml
├── .gitignore
├── .editorconfig
└── README.md
```

> 🟡 **Lưu ý:** CHƯA có `package.json` ở root + CHƯA có `turbo.json` — sẽ thêm tại **M24** khi setup Turborepo cho mobile.

---

### `apps/web/` — Frontend React (Feature-based)

```
apps/web/
├── public/
│   ├── favicon.ico
│   └── locales/                # M7 — i18n files
│       ├── vi/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── course.json
│       │   └── ...
│       ├── en/
│       └── ja/
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component
│   │
│   ├── app/                    # App-level (router, providers, layouts, guards)
│   │   ├── router.tsx          # React Router config
│   │   ├── providers.tsx       # QueryClient + i18n + Theme provider
│   │   ├── layouts/
│   │   │   ├── StudentLayout.tsx
│   │   │   ├── TeacherLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── PublicLayout.tsx
│   │   └── guards/             # Route guards
│   │       ├── RequireAuth.tsx
│   │       ├── RequireRole.tsx  # admin/teacher
│   │       └── RequirePurchase.tsx  # M13 — course access
│   │
│   ├── features/               # 🎯 FEATURE DOMAINS (sync với app/ BE)
│   │   ├── auth/               # M2-M3
│   │   │   ├── components/     # LoginForm, SignupForm, GoogleSignInButton
│   │   │   ├── hooks/          # useAuth, useGoogleOAuth
│   │   │   ├── api.ts          # TanStack Query hooks (useLogin, useSignup)
│   │   │   ├── schemas.ts      # Zod (loginSchema, signupSchema)
│   │   │   ├── store.ts        # Zustand auth state (optional)
│   │   │   ├── types.ts
│   │   │   └── index.ts        # Public API export
│   │   ├── course/             # M4-M5-M8
│   │   │   ├── components/     # CourseCard, FilterSidebar, SearchBox, CourseDetail
│   │   │   ├── hooks/          # useCourses, useCourseFilters
│   │   │   ├── api.ts
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   ├── lesson/             # M9 — Video player
│   │   │   ├── components/     # VideoPlayer, LessonSidebar, ResumeModal
│   │   │   ├── hooks/          # useLessonProgress, useHlsPlayer
│   │   │   └── ...
│   │   ├── quiz/               # M10-M11
│   │   │   ├── components/
│   │   │   │   ├── QuizPlayer.tsx
│   │   │   │   ├── QuizResult.tsx
│   │   │   │   ├── QuizBuilder.tsx
│   │   │   │   └── questions/  # Variant per question type
│   │   │   │       ├── MultipleChoice.tsx
│   │   │   │       ├── FillInBlank.tsx
│   │   │   │       ├── Matching.tsx
│   │   │   │       ├── Reorder.tsx
│   │   │   │       └── Listening.tsx
│   │   │   ├── reducer.ts      # useReducer — quiz state machine
│   │   │   ├── grading.ts      # Pure function chấm điểm (testable)
│   │   │   ├── api.ts
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   ├── payment/            # M12
│   │   │   ├── components/     # CheckoutForm, CouponInput, PaymentMethodSelector
│   │   │   ├── api.ts
│   │   │   └── ...
│   │   ├── gamification/       # M15+M18
│   │   │   ├── components/     # StreakWidget, XPBar, Leaderboard, LevelUpOverlay
│   │   │   ├── hooks/          # useUserStats, useLeaderboard
│   │   │   └── ...
│   │   ├── notification/       # M16
│   │   │   ├── components/     # NotificationBell, NotificationDropdown
│   │   │   ├── hooks/          # useNotifications (WS)
│   │   │   └── ...
│   │   ├── chat/               # M17 — discussion + support
│   │   │   ├── components/     # DiscussionTab, SupportChatWidget, ChatMessage
│   │   │   ├── hooks/          # useWebSocket, useChatRoom
│   │   │   └── ...
│   │   ├── review/             # M19
│   │   ├── teacher/            # M8, M14 — Teacher-specific UI
│   │   │   ├── components/     # CourseEditor, QuizBuilder, SubmitForReviewModal
│   │   │   └── ...
│   │   ├── admin/              # M14, M19, M23 — Admin-specific
│   │   │   ├── components/     # ReviewQueue, AuditLogTable, AnalyticsCards
│   │   │   └── ...
│   │   └── i18n/               # M7
│   │       ├── components/     # LanguageSwitcher, ImmersionPromptModal
│   │       └── hooks/
│   │
│   ├── shared/                 # Cross-feature reusable
│   │   ├── components/
│   │   │   ├── ui/             # shadcn primitives (button, dialog, input, ...)
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── Paywall.tsx     # M13
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useWebSocket.ts # M16 core
│   │   │   └── useMediaQuery.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts   # Axios/fetch wrapper với auth interceptor
│   │   │   ├── query-client.ts # TanStack Query config
│   │   │   ├── i18n.ts         # i18next setup
│   │   │   ├── utils.ts        # cn(), formatDate, formatPrice VND
│   │   │   └── constants.ts
│   │   └── types/
│   │       └── common.ts
│   │
│   ├── pages/                  # 🎯 ROUTE ENTRY POINTS (THIN — chỉ orchestrate feature)
│   │   ├── public/             # Visitor + auth
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── CourseListPage.tsx
│   │   │   └── CourseDetailPage.tsx
│   │   ├── student/            # /me/* and /learn/*
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LessonPage.tsx
│   │   │   ├── QuizPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   ├── AchievementsPage.tsx
│   │   │   ├── PurchasesPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   └── EmailPreferencesPage.tsx
│   │   ├── teacher/            # /teacher/*
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── MyCoursesPage.tsx
│   │   │   ├── CourseEditPage.tsx
│   │   │   ├── SupportInboxPage.tsx
│   │   │   └── SubmissionsPage.tsx
│   │   ├── admin/              # /admin/*
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ReviewQueuePage.tsx
│   │   │   ├── ReviewDetailPage.tsx
│   │   │   ├── AuditLogPage.tsx
│   │   │   ├── CouponsPage.tsx
│   │   │   ├── EmailsPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── payment/
│   │   │   ├── PaymentSuccessPage.tsx
│   │   │   └── PaymentFailedPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── styles/
│   │   └── globals.css         # Tailwind imports + CSS vars
│   └── vite-env.d.ts
│
├── tests/                      # Vitest (M22)
│   ├── setup.ts
│   └── ...                     # Co-locate test với feature: features/auth/__tests__/
│
├── e2e/                        # Playwright (M22)
│   ├── auth.spec.ts
│   ├── course.spec.ts
│   └── ...
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js            # Flat config
├── components.json             # shadcn config
└── index.html
```

**Quy tắc feature folder:**
1. **`features/X/`** chứa MỌI thứ liên quan X — `components/`, `hooks/`, `api.ts`, `schemas.ts`, `types.ts`, `index.ts`.
2. **`features/X/index.ts`** là **public API** — chỉ export những gì feature khác cần. Không export internal component.
3. **Cross-feature import**: chỉ import qua `index.ts` (`import { useAuth } from '@/features/auth'`), KHÔNG deep import (`@/features/auth/hooks/useAuth`).
4. **`shared/`** chỉ chứa thứ DÙNG Ở ≥2 FEATURE. Nếu mới dùng ở 1 feature → để trong feature đó.
5. **`pages/`** mỏng — chỉ orchestrate feature components, KHÔNG có logic business.

---

### `apps/backend/` — Backend FastAPI (Domain-driven)

```
apps/backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app instance + register routers
│   │
│   ├── core/                   # Infrastructure layer (cross-domain)
│   │   ├── __init__.py
│   │   ├── config.py           # pydantic-settings — load .env
│   │   ├── security.py         # JWT encode/decode, hash password
│   │   ├── db.py               # AsyncEngine + AsyncSession + get_db()
│   │   ├── redis.py            # Redis client + get_redis()
│   │   ├── logging.py          # loguru config
│   │   ├── exceptions.py       # AppException, NotFoundError, ...
│   │   ├── middleware.py       # CORS, GZip, request_id middleware
│   │   └── dependencies.py     # Common Depends (get_current_user, ...)
│   │
│   ├── auth/                   # 🎯 DOMAIN: Auth (M2-M3)
│   │   ├── __init__.py
│   │   ├── router.py           # /auth/* endpoints
│   │   ├── service.py          # signup, login, verify, refresh
│   │   ├── schemas.py          # Pydantic (UserCreate, UserLogin, TokenResponse)
│   │   ├── models.py           # SQLAlchemy (User, RefreshToken, OAuthAccount)
│   │   ├── dependencies.py     # require_auth, require_role
│   │   └── oauth_google.py     # M3 — Authlib Google flow
│   │
│   ├── user/                   # User profile, preferences (M7 ui_locale)
│   │   ├── router.py           # /me/*
│   │   ├── service.py
│   │   ├── schemas.py
│   │   └── models.py           # TeacherProfile, StudentProfile
│   │
│   ├── course/                 # 🎯 DOMAIN: Course (M4-M8)
│   │   ├── router.py           # /courses/* (public) + /teacher/courses/*
│   │   ├── service.py          # list_courses, get_course, create_course
│   │   ├── schemas.py          # CourseCreate, CourseUpdate, CourseRead
│   │   ├── models.py           # Course, Chapter, Enrollment
│   │   └── dependencies.py     # require_course_owner (teacher's own)
│   │
│   ├── lesson/                 # 🎯 DOMAIN: Lesson (M9)
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py           # Lesson, LessonProgress
│   │   └── cloudflare_stream.py # Adapter cho Cloudflare Stream API
│   │
│   ├── quiz/                   # 🎯 DOMAIN: Quiz (M10-M11)
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py          # Discriminated union (MC, FillIn, Matching, ...)
│   │   ├── models.py           # Quiz, QuizAttempt
│   │   └── grading.py          # Pure function chấm điểm (testable)
│   │
│   ├── payment/                # 🎯 DOMAIN: Payment (M12)
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py           # Payment, Purchase
│   │   ├── webhooks.py         # Webhook handler (VNPay/MoMo/ZaloPay)
│   │   └── adapters/           # Provider adapters
│   │       ├── __init__.py
│   │       ├── base.py         # PaymentProvider interface (ABC)
│   │       ├── vnpay.py
│   │       ├── momo.py
│   │       └── zalopay.py
│   │
│   ├── coupon/                 # 🎯 DOMAIN: Coupon (M19)
│   │   ├── router.py           # /coupons/validate + admin CRUD
│   │   ├── service.py
│   │   ├── schemas.py
│   │   └── models.py
│   │
│   ├── review/                 # 🎯 DOMAIN: Course review (M19)
│   │
│   ├── gamification/           # 🎯 DOMAIN: Gamification (M15+M18)
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py           # UserStats, Achievement, XPTransaction, League
│   │   ├── streak.py           # Streak logic
│   │   ├── xp.py               # XP rules
│   │   └── leaderboard.py      # Redis sorted set operations
│   │
│   ├── notification/           # 🎯 DOMAIN: Notification (M16)
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py
│   │   └── websocket.py        # WS endpoint /ws/notifications
│   │
│   ├── chat/                   # 🎯 DOMAIN: Chat (M17) — discussion + support
│   │   ├── router.py           # REST: fetch history, create room
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py           # DiscussionThread, SupportChatRoom, Messages
│   │   ├── websocket.py        # WS endpoints (in-lesson + support)
│   │   └── connection_manager.py # WS connection pool + Redis pub/sub
│   │
│   ├── admin/                  # 🎯 DOMAIN: Admin (M14)
│   │   ├── router.py           # /admin/* (course review, invite teacher)
│   │   ├── service.py
│   │   ├── audit_log.py        # AuditLog model + decorator
│   │   └── ...
│   │
│   ├── analytics/              # 🎯 DOMAIN: Analytics (M23)
│   │   ├── router.py           # /admin/analytics/*
│   │   ├── service.py          # Aggregation queries
│   │   └── ...
│   │
│   ├── email/                  # 🎯 DOMAIN: Email (M20)
│   │   ├── service.py          # Resend client + send_*
│   │   ├── jobs.py             # ARQ tasks (gửi email async)
│   │   ├── models.py           # EmailLog
│   │   └── templates/          # Jinja2 templates
│   │       ├── base.html
│   │       ├── welcome.html
│   │       ├── purchase_receipt.html
│   │       ├── streak_reminder.html
│   │       └── password_reset.html
│   │
│   ├── storage/                # Cloudflare R2 client (image, audio upload)
│   │   ├── __init__.py
│   │   └── r2.py               # Upload, presigned URL
│   │
│   ├── tasks/                  # Background jobs (ARQ)
│   │   ├── __init__.py
│   │   ├── worker.py           # ARQ worker entry point
│   │   ├── streak_check.py     # Cron daily 00:00 (M15)
│   │   ├── leaderboard_reset.py # Cron weekly Sunday 23:59 (M18)
│   │   ├── email_send.py       # Send email async
│   │   └── payment_reconcile.py # Cron daily (M12)
│   │
│   └── api/                    # Optional: aggregate routers cho /v1
│       └── v1.py               # APIRouter(prefix='/v1') include all domain routers
│
├── alembic/                    # Database migrations
│   ├── env.py                  # Async setup
│   ├── script.py.mako
│   └── versions/               # Auto-generated migration files
│
├── tests/                      # pytest (M22)
│   ├── conftest.py             # Fixtures (db, client, factories)
│   ├── factories.py            # factory-boy / polyfactory
│   ├── auth/
│   │   ├── test_router.py
│   │   └── test_service.py
│   ├── course/
│   ├── quiz/
│   │   └── test_grading.py     # Pure function — unit test
│   ├── payment/
│   │   └── test_webhooks.py    # Critical
│   └── ...
│
├── scripts/
│   ├── seed.py                 # Seed demo data
│   ├── create_admin.py         # Tạo admin user đầu tiên
│   └── ...
│
├── .env.example
├── .env                        # gitignore
├── alembic.ini
├── pyproject.toml              # uv config (dependencies, ruff, mypy)
├── uv.lock
├── Dockerfile                  # Multi-stage build (M26)
└── README.md
```

**Quy tắc domain folder:**
1. **Mỗi domain** = 1 folder với `router.py` + `service.py` + `schemas.py` + `models.py` (+ optionally `dependencies.py`, `websocket.py`, ...).
2. **`router.py`** — HTTP concern: validate input, gọi service, return response. KHÔNG chứa business logic.
3. **`service.py`** — Business logic + DB query. Không biết về HTTP/request.
4. **`schemas.py`** — Pydantic models cho input/output (KHÔNG nhầm với `models.py` ORM).
5. **`models.py`** — SQLAlchemy ORM models.
6. **`core/`** — Cross-cutting concern (config, security, DB, redis, logging). KHÔNG chứa domain logic.
7. **Cross-domain import** OK nhưng chú ý circular dependency: `auth` → `user` OK, nhưng `user` → `auth` thì cần xem lại.
8. **`tasks/`** — ARQ background jobs. Import service từ domain (vd: `tasks/email_send.py` import `app.email.service`).

---

### Khi nào tạo folder mới

| Khi build module... | Tạo folder mới ở... |
|---|---|
| M1 Setup | `apps/web/` + `apps/backend/` + `infra/docker-compose.yml` |
| M2 Auth | `apps/web/src/features/auth/` + `apps/backend/app/auth/` |
| M3 Google OAuth | Mở rộng `auth/` cả 2 side, thêm `oauth_google.py` BE |
| M4 Course | `features/course/` (FE) + `app/course/` (BE) |
| M5 Filter | Mở rộng `course/` (thêm `FilterSidebar`, `SearchBox` component) |
| M6 TanStack Query | KHÔNG folder mới — refactor `api.ts` mỗi feature |
| M7 i18n | `features/i18n/` + `public/locales/` (FE) |
| M8 Teacher dashboard | `features/teacher/` (FE) + mở rộng `course/` BE |
| M9 Video | `features/lesson/` + `app/lesson/` + `lesson/cloudflare_stream.py` |
| M10 Quiz | `features/quiz/` + `app/quiz/` |
| M11 Listening | Mở rộng `quiz/` (thêm `Listening.tsx` variant) |
| M12 Payment | `features/payment/` + `app/payment/` + `payment/adapters/` |
| M13 Authz | `app/guards/RequirePurchase.tsx` + cross-cut tất cả lesson/quiz check |
| M14 Admin | `features/admin/` + `app/admin/` + `app/admin/audit_log.py` |
| M15 Gamify basic | `features/gamification/` + `app/gamification/` + `tasks/streak_check.py` |
| M16 WS notify | `features/notification/` + `app/notification/` + `app/notification/websocket.py` |
| M17 WS chat | `features/chat/` + `app/chat/` + `app/chat/connection_manager.py` (Redis pub/sub) |
| M18 Gamify full | Mở rộng `gamification/` (thêm leaderboard, league) + `tasks/leaderboard_reset.py` |
| M19 Preview+Review+Coupon | `features/review/` + `app/review/` + `app/coupon/` |
| M20 Email | `app/email/` + `app/email/templates/` + `tasks/email_send.py` |
| M21 Performance | KHÔNG folder mới — optimize existing |
| M22 Testing | `apps/web/tests/`, `apps/web/e2e/`, `apps/backend/tests/` mỗi domain |
| M23 Admin analytics | `app/analytics/` + mở rộng `features/admin/` |
| M24 React Native | `apps/mobile/` (Expo) + `packages/api-client/` + `packages/business-logic/` + setup Turborepo |
| M25 Mobile push+IAP | Mở rộng `apps/mobile/` |
| M26 Deploy | `.github/workflows/` + Dockerfile + production configs |

---

## 🗄️ Database schema overview

Liệt kê các table chính (chi tiết column thêm dần qua từng module):

### Auth & User
```
User (id, email, hashed_password?, role[admin/teacher/student],
      native_language, ui_locale, is_active, email_verified_at,
      created_at, updated_at)
TeacherProfile (user_id FK, bio, avatar_url, expertise, ...)
OAuthAccount (id, user_id FK, provider, provider_user_id, ...)
RefreshToken (id, user_id FK, token_hash, expires_at, revoked_at)
```

### Content
```
Course (id, teacher_id FK, slug, title, description, target_language,
        level, price, is_free, thumbnail_url, status[draft/pending/published/rejected],
        published_at, created_at)
Chapter (id, course_id FK, title, order)
Lesson (id, chapter_id FK, title, video_id, duration_seconds,
        is_free_preview, requires_premium, order)
Quiz (id, lesson_id FK, title, schema_json, passing_score)
QuizAttempt (id, user_id FK, quiz_id FK, score, answers_json,
             started_at, completed_at)
```

### Enrollment & Payment
```
Enrollment (id, user_id FK, course_id FK, enrolled_at)
LessonProgress (id, user_id FK, lesson_id FK, watched_seconds,
                completed_at)
Payment (id, user_id FK, provider[vnpay/momo/zalopay], provider_txn_id,
         amount, currency='VND', status[pending/paid/failed/refunded],
         idempotency_key UNIQUE, raw_request_json, raw_response_json,
         created_at)
Purchase (id, user_id FK, course_id FK, payment_id FK, amount,
          purchased_at)
Coupon (id, code UNIQUE, discount_percent, discount_amount,
        max_uses, used_count, expires_at, is_active)
CouponUsage (id, coupon_id FK, user_id FK, payment_id FK, used_at)
```

### Gamification
```
UserStats (user_id PK, current_streak, longest_streak, total_xp,
           level, last_activity_date)
XPTransaction (id, user_id FK, amount, source[lesson/quiz/streak/achievement],
               source_id, created_at)
Achievement (id, code, name, description, criteria_json, icon_url,
             xp_reward)
UserAchievement (id, user_id FK, achievement_id FK, unlocked_at)
LeaderboardEntry (week_start, user_id FK, xp, rank, league_tier,
                  PRIMARY KEY (week_start, user_id))
League (id, name, tier, min_xp_to_promote, max_xp_to_demote)
```

### Communication
```
Notification (id, user_id FK, type, payload_json, read_at, created_at)
DiscussionThread (id, lesson_id FK, created_at)
DiscussionMessage (id, thread_id FK, user_id FK, content, created_at)
SupportChatRoom (id, student_id FK, teacher_id FK, last_message_at,
                 created_at)
SupportChatMessage (id, room_id FK, user_id FK, content, attachments_json,
                    created_at)
```

### Review & Admin
```
CourseReview (id, course_id FK, user_id FK, rating[1-5], comment,
              created_at)
CourseReviewQueue (id, course_id FK, submitted_at, reviewed_by FK,
                   reviewed_at, status, notes)
AuditLog (id, actor_user_id FK, action, entity_type, entity_id,
          changes_json, ip, created_at)
EmailLog (id, user_id FK, template, status, provider_message_id,
          sent_at, error)
```

### Mobile
```
DeviceToken (id, user_id FK, platform[ios/android], token, app_version,
             created_at, last_used_at)
IAPReceipt (id, user_id FK, platform, transaction_id UNIQUE,
            product_id, raw_receipt, verified_at, status)
```

---

## 📦 Phase grouping

### Phase 1 — Foundation (M1–3)
**Theme:** "Get to Hello World + Login working"
- React: JSX, component, props, useState, Router, Context
- FastAPI: project setup, Pydantic, JWT, OAuth2 basic
- **Milestone:** User có thể signup/login email + Google, vào dashboard rỗng

### Phase 2 — Core Content (M4–8)
**Theme:** "Course platform có thể browse + Teacher quản lý"
- React: useEffect, list/key, TanStack Query, React Hook Form, i18n
- FastAPI: CRUD, query params, file upload, R2 storage
- **Milestone:** Public course list/detail + Teacher tạo/sửa course

### Phase 3 — Learning Experience (M9–11)
**Theme:** "Học sinh thực sự học được"
- React: video player, useReducer, dnd-kit, complex state
- FastAPI: Cloudflare Stream API, webhook, JSON schema validation
- **Milestone:** Student xem video + làm quiz + làm listening quiz

### Phase 4 — Monetization (M12–14)
**Theme:** "Có thể trả tiền + Admin duyệt"
- React: HOC pattern, route guard, paywall
- FastAPI: payment webhook, idempotency, state machine, RBAC, audit log
- **Milestone:** Mua course bằng VNPay/MoMo, Admin duyệt teacher submission

### Phase 5 — Engagement (M15–19)
**Theme:** "Giữ user quay lại"
- React: WebSocket, animation, useReducer, virtualized list
- FastAPI: ARQ cron, Redis sorted set, WebSocket connection manager, Redis pub/sub
- **Milestone:** Streak + XP + leaderboard + chat support + review/rating

### Phase 6 — Production-ready (M20–23)
**Theme:** "Sẵn sàng cho user thật"
- React: lazy load, Suspense, profiler, Vitest, Playwright
- FastAPI: query optimization, ARQ queue, Resend email, pytest async
- **Milestone:** Email tự động, performance đo được, test coverage, admin analytics

### Phase 7 — Mobile + Deploy (M24–26)
**Theme:** "Ra App Store + Live production"
- React Native + Expo, monorepo
- FastAPI: receipt validation IAP, push notification server
- Docker, CI/CD, deploy
- **Milestone:** App trong Play Store / TestFlight, web prod live

---

## 🔗 Dependency graph

```
                          M1 (Setup)
                              │
                              ▼
                          M2 (Auth email)
                              │
                              ▼
                          M3 (Google OAuth)
                              │
                              ▼
                          M4 (Course list/detail public)
                              │
                              ▼
                          M5 (Filter/search/pagination)
                              │
                              ▼
                          M6 (TanStack Query migration)
                          ┌───┴────┐
                          ▼        ▼
                          M7       M8 (Teacher dashboard CRUD)
                          (i18n)         │
                                          ▼
                                          M9 (Video player)
                                          │
                                          ▼
                                          M10 (Quiz engine)
                                          │
                                          ▼
                                          M11 (Listening quiz)
                                          │
                                          ▼
                                          M12 (Payment)
                                          │
                                          ▼
                                          M13 (Freemium tier check)
                                          │
                                          ▼
                                          M14 (Admin review workflow)
                                          │
                                          ▼
                                          M15 (Gamification basic)
                                          │
                                          ▼
                                          M16 (WS notification)
                                          │
                                          ▼
                                          M17 (WS discussion + support chat)
                                          │
                                          ▼
                                          M18 (Gamification full)
                                          │
                                          ▼
                                          M19 (Preview + Review + Coupon)
                                          │
                                          ▼
                                          M20 (Email transactional)
                                          │
                                          ▼
                                          M21 (Performance)
                                          │
                                          ▼
                                          M22 (Testing)
                                          │
                                          ▼
                                          M23 (Admin analytics)
                                          │
                                          ▼
                                          M24 (React Native app)
                                          │
                                          ▼
                                          M25 (Mobile push + IAP)
                                          │
                                          ▼
                                          M26 (Deploy + CI/CD)
```

> M7 (i18n) độc lập với M8 — có thể swap order tùy thích.

---

# 📦 26 Module chi tiết

---

## Phase 1 — Foundation (M1–M3)

---

### Module 1 — Setup + Landing page

**🎯 Mục tiêu sản phẩm:** Project setup chạy được, landing page giới thiệu app, dev environment local đầy đủ.

**🔗 Dependencies:** _none_ | **🔓 Unlocks:** M2

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang chủ Landing** (`/`)
- Mục đích: Giới thiệu app cho visitor chưa đăng ký, dẫn dắt signup.
- UI: Header (logo + nav + theme toggle + button Login/Signup); Hero section (heading + sub + CTA "Bắt đầu học miễn phí"); danh sách feature cards; testimonial placeholder; footer (About/Privacy/Terms).
- Chức năng:
  - Button "Bắt đầu học" → navigate `/signup`
  - Button "Đăng nhập" → navigate `/login`
  - Theme toggle → dark/light mode + lưu localStorage
  - Logo → về `/`

**[Student] Trang 404 Not Found**
- Mục đích: Fallback khi route không tồn tại.
- UI: Illustration + message "Trang không tồn tại"
- Chức năng: Button "Về trang chủ" → navigate `/`

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Vite** — build tool, hot reload, ESM
  - **JSX** — cú pháp, expression `{}`, fragment `<>`
  - **Function component + Props** — composition, destructuring
  - **Tailwind CSS + shadcn/ui** — utility class, theme, dark mode
- **Reuse:** _none_ (module đầu)
- **Lib mới:** `react`, `react-dom`, `vite`, `tailwindcss`, `class-variance-authority`, `clsx`, `lucide-react`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Project structure** (router/service/repo layered)
  - **FastAPI app instance + Uvicorn**
  - **CORS middleware**
  - **Settings management** với `pydantic-settings`
  - **Logging setup** (loguru)
- **Reuse:** _none_
- **Lib mới:** `fastapi[standard]`, `uvicorn`, `pydantic`, `pydantic-settings`, `loguru`, `uv` (package manager), `ruff`, `mypy`

#### 🗄️ Database changes
- Chưa cần DB ở module này.

#### 🌐 API endpoints
- `GET /health` — health check (return `{"status": "ok"}`)

#### 📖 Pre-reading (~2–3h)
- [react.dev/learn](https://react.dev/learn) — đọc lướt section "Quick Start"
- [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite)
- [ui.shadcn.com/docs/installation/vite](https://ui.shadcn.com/docs/installation/vite)
- [fastapi.tiangolo.com/tutorial/first-steps](https://fastapi.tiangolo.com/tutorial/first-steps/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] `npm run dev` (FE) start tại :5173, hot reload work
- [ ] `fastapi dev main.py` (BE) start tại :8000, `/docs` UI mở được
- [ ] Landing page hiển thị: logo, hero section, CTA "Đăng ký", footer
- [ ] FE gọi được `GET /health` từ BE, hiển thị status "ok"
- [ ] Dark mode toggle work (shadcn theme provider)

**Code quality:**
- [ ] Folder structure rõ ràng (theo template ở [`fastapi-roadmap.md`](./fastapi-roadmap.md))
- [ ] Ruff + Mypy không lỗi (`uv run ruff check && uv run mypy app/`)
- [ ] `.env.example` có sẵn, `.env` trong `.gitignore`
- [ ] README cơ bản với command setup

#### 🚀 Stretch goals
- Animation hero text với Framer Motion preview
- Light/dark/system theme switcher

#### ⚠️ Common pitfall
- **Tailwind v3 vs v4** — Tailwind v4 (12/2024+) có config khác, đọc kỹ docs version
- **CORS** không config đúng → FE gọi BE bị block (set `allow_origins=["http://localhost:5173"]`)

---

### Module 2 — Authentication (Email + Password)

**🎯 Mục tiêu sản phẩm:** User signup → login → giữ session qua JWT cookie → logout.

**🔗 Dependencies:** M1 | **🔓 Unlocks:** M3, M4

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang Đăng ký** (`/signup`)
- Mục đích: Tạo tài khoản mới bằng email/password.
- UI: Form (input email, password, confirm password, checkbox đồng ý terms).
- Chức năng:
  - Validate inline (email format, password ≥8 ký tự, match confirm)
  - Button "Đăng ký" → POST `/auth/signup` → set JWT cookie → redirect `/dashboard`
  - Link "Đã có tài khoản?" → `/login`
  - Error toast khi email đã tồn tại

**[Student] Trang Đăng nhập** (`/login`)
- Mục đích: User đã đăng ký login lại.
- UI: Form email + password, checkbox "Ghi nhớ tôi".
- Chức năng:
  - Button "Đăng nhập" → POST `/auth/login` → set cookie → redirect `/dashboard`
  - Link "Quên mật khẩu?" → `/forgot-password`
  - Link "Tạo tài khoản mới" → `/signup`

**[Student] Trang Quên mật khẩu** (`/forgot-password`)
- Mục đích: User yêu cầu link reset password.
- UI: Form 1 input email + button "Gửi link reset".
- Chức năng: Submit → POST `/auth/password-reset-request` → hiện success state "Đã gửi email".

**[Student] Trang Reset Password** (`/reset-password/{token}`)
- Mục đích: Đặt mật khẩu mới sau khi click link trong email.
- UI: Form password mới + confirm.
- Chức năng:
  - Submit → POST `/auth/password-reset` → redirect `/login`
  - Token invalid/expired → error message + link request lại

**[Student] Trang Verify Email** (`/verify-email/{token}`)
- Mục đích: Xác thực email từ link trong email signup.
- UI: Loading state → success/fail message.
- Chức năng: Auto POST `/auth/verify-email` khi mount → render kết quả + button "Vào dashboard".

**[Student] Dashboard rỗng** (`/dashboard`)
- Mục đích: Trang sau login (placeholder, sẽ fill nội dung ở M4+).
- UI: Header với avatar + tên user + dropdown logout, welcome message.
- Chức năng:
  - Click avatar → dropdown "Hồ sơ" / "Đăng xuất"
  - "Đăng xuất" → POST `/auth/logout` → clear cookie → redirect `/`

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`useState`** — controlled form input
  - **React Router v6** — `BrowserRouter`, `Routes`, `Route`, `useNavigate`, `Link`, `Outlet`
  - **`useContext`** — AuthContext provider cho global user state
  - **Form handling cơ bản** (sẽ refactor sang RHF ở M8)
- **Reuse:** JSX, props, conditional render
- **Lib mới:** `react-router-dom`, `axios` (hoặc native fetch)

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Pydantic schema separation** (Create/Update/Read pattern)
  - **SQLAlchemy 2.x** model + Alembic init
  - **`passlib[argon2]`** — hash password
  - **`python-jose`** — JWT encode/decode
  - **Dependency Injection** (`Depends`)
  - **`OAuth2PasswordBearer`** — token from header/cookie
  - **HTTP-only cookie pattern** cho JWT
- **Reuse:** Settings, logging
- **Lib mới:** `sqlalchemy`, `asyncpg`, `alembic`, `passlib[argon2]`, `python-jose[cryptography]`, `python-multipart`

#### 🗄️ Database changes
- Tạo `User` table với columns: `id, email UNIQUE, hashed_password, role, native_language, ui_locale, is_active, email_verified_at, created_at, updated_at`
- Tạo `RefreshToken` table: `id, user_id FK, token_hash, expires_at, revoked_at, created_at`
- Tạo enum `UserRole` (`admin`, `teacher`, `student`)

#### 🌐 API endpoints
- `POST /auth/signup` — tạo user mới, return JWT
- `POST /auth/login` — verify password, return JWT (set httpOnly cookie)
- `POST /auth/refresh` — rotate refresh token
- `POST /auth/logout` — revoke refresh token, clear cookie
- `GET /me` — get current user info

#### 📖 Pre-reading (~3h)
- [react.dev/learn/managing-state](https://react.dev/learn/managing-state)
- [react.dev/reference/react/useContext](https://react.dev/reference/react/useContext)
- [reactrouter.com/start/library/installation](https://reactrouter.com/start/library/installation)
- [fastapi.tiangolo.com/tutorial/security/oauth2-jwt](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [JWT.io](https://jwt.io) — hiểu cấu trúc token

#### ✅ Acceptance criteria
**Functional:**
- [ ] Signup tạo user trong DB, password được hash (kiểm tra DB)
- [ ] Login set JWT cookie (httpOnly + secure ở prod)
- [ ] Reload trang vẫn giữ login (hydrate AuthContext từ `/me`)
- [ ] Logout clear cookie + revoke refresh token
- [ ] Wrong password trả về 401, không leak thông tin
- [ ] Protected route (vd `/dashboard`) redirect về `/login` nếu chưa auth

**Code quality:**
- [ ] Password được hash với Argon2, không lưu plaintext
- [ ] JWT secret từ env, không hard-code
- [ ] AuthContext không gây re-render toàn app (split context nếu cần)
- [ ] Pydantic schema tách Create/Update/Read

#### 🚀 Stretch goals
- Remember me checkbox (extend refresh token lifetime)
- Password strength meter (zxcvbn-ts)
- Rate limit login endpoint (max 5 lần/phút)

#### ⚠️ Common pitfall
- **CRITICAL: KHÔNG lưu JWT trong localStorage** → XSS attack có thể đọc được. Dùng httpOnly cookie.
- Quên CSRF protection khi dùng cookie auth → cần SameSite=Strict hoặc CSRF token
- Refresh token rotation: phải revoke token cũ ngay khi cấp token mới (chống token theft)

---

### Module 3 — Google OAuth

**🎯 Mục tiêu sản phẩm:** User signup/login bằng Google account (1 click).

**🔗 Dependencies:** M2 | **🔓 Unlocks:** _none nghiêm ngặt, but nice-to-have trước M4_

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang Đăng nhập + Đăng ký (UPDATE)**
- Thêm button "Đăng nhập bằng Google" (kèm icon Google) ở cả 2 trang.
- Chức năng: Click → `window.location.href = '/auth/google/login'` → redirect Google consent.

**[Student] OAuth callback page** (`/auth/google/callback`)
- Mục đích: Page trung gian khi Google redirect về với code.
- UI: Loading spinner + "Đang xử lý đăng nhập Google...".
- Chức năng:
  - Auto: BE đã set cookie ở callback, FE chỉ cần fetch `/me` → set AuthContext → redirect `/dashboard`
  - Error → redirect `/login` với toast error

**[Student] Account linking modal**
- Mục đích: Hiện khi email Google trùng tài khoản email/password đã có.
- UI: Modal "Email <x> đã có tài khoản. Link Google với tài khoản đó?" + 2 button.
- Chức năng:
  - "Có, link" → confirm + login → `/dashboard`
  - "Không" → close modal, hủy OAuth flow

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`useEffect`** — side effect, dependency array, cleanup
  - **Custom hook** (`useAuth`) — abstract auth logic
  - **`window.location.href` redirect** — OAuth flow
- **Reuse:** useContext, useState, React Router
- **Lib mới:** _không có (dùng native fetch + redirect)_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Authlib** — OAuth2 client cho Google
  - **OAuth2 redirect flow** (authorization code grant)
  - **Account linking** (Google → existing email)
  - **`HTTPException` + redirect response**
- **Reuse:** JWT, dependency injection
- **Lib mới:** `authlib`, `itsdangerous` (state validation)

#### 🗄️ Database changes
- Tạo `OAuthAccount` table: `id, user_id FK, provider, provider_user_id, email_at_connect, created_at`
- Unique index: `(provider, provider_user_id)`
- User table cho phép `hashed_password = NULL` (user signup qua Google không có password)

#### 🌐 API endpoints
- `GET /auth/google/login` — redirect to Google consent
- `GET /auth/google/callback` — handle code, exchange token, create/link user, set JWT cookie
- `POST /auth/google/unlink` — disconnect Google account (optional)

#### 📖 Pre-reading (~2h)
- [react.dev/reference/react/useEffect](https://react.dev/reference/react/useEffect)
- [docs.authlib.org/en/latest/client/fastapi.html](https://docs.authlib.org/en/latest/client/fastapi.html)
- [developers.google.com/identity/protocols/oauth2/web-server](https://developers.google.com/identity/protocols/oauth2/web-server)
- Custom hook pattern: [react.dev/learn/reusing-logic-with-custom-hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Click "Đăng nhập bằng Google" → redirect Google consent → callback → login thành công
- [ ] Lần đầu: tạo user mới với email từ Google
- [ ] Lần sau: tìm user theo email, link OAuthAccount nếu chưa có
- [ ] Edge case: email đã tồn tại (signup email trước) → link tự động hoặc prompt confirm
- [ ] `state` parameter để chống CSRF trong OAuth flow

**Code quality:**
- [ ] Google client_id + client_secret từ env
- [ ] Redirect URI whitelist (chỉ accept URL của app)
- [ ] Custom hook `useAuth()` clean, không gọi API trong component trực tiếp

#### 🚀 Stretch goals
- Thêm Facebook OAuth (chỉ cần thêm adapter)
- "Sign in with Apple" cho mobile (chuẩn bị M24)

#### ⚠️ Common pitfall
- **Account hijacking**: nếu chỉ link bằng email match mà không verify → attacker có thể chiếm account. Cần verify email trước hoặc require login email cũ.
- Google trả về email chưa verified (rare) → check `email_verified` field
- Localhost callback: phải add `http://localhost:5173/auth/callback` vào Google Console

---

## Phase 2 — Core Content (M4–M8)

---

### Module 4 — Course list + detail (public, read-only)

**🎯 Mục tiêu sản phẩm:** Visitor (chưa login) xem được danh sách course + detail từng course (không nội dung paid).

**🔗 Dependencies:** M2 | **🔓 Unlocks:** M5, M8

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang danh sách course** (`/courses`)
- Mục đích: Catalog public, ai cũng xem được (kể cả chưa login).
- UI: Grid course card 3-4 col responsive; mỗi card có thumbnail, title, teacher avatar + name, level badge, price hoặc "Miễn phí".
- Chức năng:
  - Click card → navigate `/courses/{slug}`
  - Pagination next/prev (cơ bản, sẽ upgrade ở M5)
  - Loading skeleton khi đang fetch
  - Empty state khi không có course
  - Image lazy load với placeholder

**[Student] Trang chi tiết course** (`/courses/{slug}`)
- Mục đích: Sales/info page + curriculum của 1 course.
- UI:
  - Hero top: thumbnail lớn, title, description ngắn, teacher info (avatar + name), level badge, price/Free
  - Tabs nội dung: Overview / Curriculum / Instructor (Reviews + Discussion sẽ thêm ở M17/M19)
  - Tab Curriculum: list chapter expandable, mỗi chapter expand ra list lesson (title + duration)
  - "What you'll learn" bullet list section
- Chức năng:
  - Button "Đăng ký miễn phí" (course free) → POST enrollment → redirect lesson đầu
  - Button "Mua ngay" (course paid) — placeholder ở M4, sẽ active ở M12
  - Click lesson → mở lesson page (M9) hoặc paywall (M13)
  - Expand/collapse chapter

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`useEffect` for data fetching** (sẽ migrate ở M6 — tạm thời học pattern này)
  - **List rendering + `key` prop** — vì sao cần unique key
  - **Loading & error state**
  - **Image lazy load** (`loading="lazy"`)
  - **Skeleton placeholder** (shadcn Skeleton)
- **Reuse:** React Router, useState, props
- **Lib mới:** _none_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **CRUD endpoint pattern** (read-only for now)
  - **`response_model`** — filter output (vd: không trả `teacher_id`, trả `teacher: TeacherRead`)
  - **Pagination** (skip/limit params)
  - **Relationship loading** (`selectinload` cho `chapters`, `lessons`)
  - **Seed data script** (vd: `scripts/seed.py`)
- **Reuse:** Pydantic, SQLAlchemy
- **Lib mới:** _none_

#### 🗄️ Database changes
- Tạo `Course` table: `id, teacher_id FK, slug UNIQUE, title, description, target_language, level, price, is_free, thumbnail_url, status, published_at, created_at`
- Tạo `Chapter` table: `id, course_id FK, title, order`
- Tạo `Lesson` table: `id, chapter_id FK, title, video_id NULL, duration_seconds, is_free_preview, requires_premium, order`
- Tạo enum `CourseStatus` (`draft`, `pending`, `published`, `rejected`)
- Tạo enum `Language` (vd: `vi`, `en`, `ja`, `ko`, `zh`) — hoặc table riêng nếu mở rộng

#### 🌐 API endpoints
- `GET /courses` — list course published (pagination), include teacher info, count lessons
- `GET /courses/{slug}` — detail course, list chapters + lessons (title only, không lesson content)

#### 📖 Pre-reading (~2h)
- [react.dev/learn/rendering-lists](https://react.dev/learn/rendering-lists)
- [react.dev/learn/conditional-rendering](https://react.dev/learn/conditional-rendering)
- [fastapi.tiangolo.com/tutorial/response-model](https://fastapi.tiangolo.com/tutorial/response-model/)
- [SQLAlchemy relationship loading](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html)

#### ✅ Acceptance criteria
**Functional:**
- [ ] `/courses` list 10 course có sẵn (seed data), pagination work
- [ ] Click course → `/courses/{slug}` detail page với title, description, teacher, chapter list
- [ ] Loading state hiển thị skeleton, error state hiển thị message
- [ ] Image course thumbnail lazy load, có placeholder khi chưa load xong
- [ ] Browser back/forward giữ scroll position

**Code quality:**
- [ ] `key={course.id}` (không dùng index)
- [ ] Không có N+1 query (kiểm tra log) — dùng `selectinload`
- [ ] Type cho API response (tự tạo TS interface hoặc dùng OpenAPI codegen)

#### 🚀 Stretch goals
- Course card hover effect, transition smooth
- Infinite scroll (chuẩn bị cho M6)
- Hiển thị "X students enrolled" và "Y lessons"

#### ⚠️ Common pitfall
- N+1 query khi loop course → query teacher → query chapter → query lesson. Dùng `selectinload` từ đầu.
- Quên `key` prop trong list → React render sai khi reorder/filter
- `useEffect` không có dependency array → fetch loop vô tận

---

### Module 5 — Filter / Search / Pagination nâng cao

**🎯 Mục tiêu sản phẩm:** User filter course theo target_language + level + price, search theo title, pagination giữ state trên URL.

**🔗 Dependencies:** M4 | **🔓 Unlocks:** M6

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang danh sách course (UPDATE)** (`/courses?q=...&...`)
- Mục đích: Thêm filter/search/pagination nâng cao cho course list M4.
- UI thêm:
  - Sidebar trái (desktop): filter sections (Target language dropdown, Level dropdown phụ thuộc language, Price range slider/checkbox Free/Paid, Sort dropdown)
  - Topbar: search box với debounce 300ms + active filter chips (close X)
  - Pagination: page numbers + "Showing X-Y of Z"
- Chức năng:
  - Filter change → URL params update → TanStack Query refetch (ở M6)
  - Search input → debounce 300ms → fetch
  - Click filter chip X → remove filter đó
  - Button "Clear all filters" → reset toàn bộ
  - Share URL giữ nguyên filter

**[Student] Filter drawer mobile**
- Mục đích: Filter UI cho mobile (responsive thay sidebar).
- UI: Bottom-drawer slide từ phải khi click button "Filter" trên topbar mobile.
- Chức năng: Same filter logic, button "Apply" → close drawer + apply.

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`useSearchParams`** — URL state (filter giữ qua reload + share link)
  - **`useMemo`** — cache filter computation
  - **`useCallback`** — stable function reference cho child component
  - **Custom hook** (`useDebounce`) — search input debounce
  - **Controlled vs Uncontrolled input**
- **Reuse:** useState, useEffect, list render
- **Lib mới:** _none (useDebounce viết tay)_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Query params validation** với `Query()` + type hint
  - **Dynamic filter** (SQLAlchemy `where()` chain conditionally)
  - **Search** với PostgreSQL ILIKE hoặc full-text search basic
  - **Pagination với total count** (return `{items, total, page, page_size}`)
  - **Sort** (multiple field, asc/desc)
- **Reuse:** response_model, Depends
- **Lib mới:** _none_

#### 🗄️ Database changes
- Index trên các filter columns: `target_language`, `level`, `is_free`, `published_at`
- Optional: `tsvector` column cho full-text search

#### 🌐 API endpoints
- `GET /courses?q=...&target_language=...&level=...&price_min=...&price_max=...&sort=...&page=...&page_size=...`
- `GET /languages` — return list ngôn ngữ đang dạy (cho filter dropdown)
- `GET /levels?target_language=...` — return level system phù hợp (CEFR/JLPT/HSK)

#### 📖 Pre-reading (~3h)
- [reactrouter.com/start/library/url-values#search-parameters](https://reactrouter.com/start/library/url-values#search-parameters)
- [react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo)
- [react.dev/reference/react/useCallback](https://react.dev/reference/react/useCallback)
- [Custom hook pattern](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [SQLAlchemy 2.x dynamic filtering](https://docs.sqlalchemy.org/en/20/tutorial/data_select.html)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Apply filter → URL update (`?target_language=ja&level=N5`)
- [ ] Share URL → người khác mở thấy đúng filter
- [ ] Search debounce 300ms (không gọi API mỗi keystroke)
- [ ] Pagination next/prev work, hiển thị "Showing 1-10 of 247"
- [ ] Clear all filter button

**Code quality:**
- [ ] `useMemo` chỉ dùng cho computation expensive thật sự (không lạm dụng)
- [ ] `useCallback` chỉ cho function pass xuống memo component
- [ ] Backend không có SQL injection (dùng parameterized query — SQLAlchemy đã làm tự động)
- [ ] Index DB cho filter columns

#### 🚀 Stretch goals
- Filter sidebar collapsible
- Save filter preset (lưu vào localStorage)
- "X courses found" với active filter chips

#### ⚠️ Common pitfall
- `useMemo`/`useCallback` lạm dụng → tốn memory, không tăng perf (mỗi optimization phải đo)
- URL state không sync với UI state → 2 source of truth
- Pagination offset lớn → slow (sẽ giải quyết bằng cursor pagination ở phase advanced)

---

### Module 6 — Migrate sang TanStack Query

**🎯 Mục tiêu sản phẩm:** Refactor toàn bộ data fetching dùng TanStack Query — cache, refetch, optimistic update.

**🔗 Dependencies:** M4, M5 | **🔓 Unlocks:** _enables_ M8+

#### 🖥️ Màn hình & UI chức năng

**Không có màn hình end-user mới** — module này là refactor data fetching layer (chuyển từ `useEffect + useState` sang TanStack Query). Behavior từ ngoài nhìn không đổi, chỉ cache + UX mượt hơn (no refetch khi navigate back, optimistic update).

**(Dev only) React Query Devtools panel** — auto active trong dev environment, hiện danh sách query/mutation + cache state. Không phải UI cho user.

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Server state vs Client state** — mindset shift
  - **`useQuery`** — queryKey, queryFn, staleTime, cacheTime
  - **`useMutation`** — invalidate queries on success
  - **`useInfiniteQuery`** — infinite scroll
  - **`QueryClient` config**
  - **DevTools** — debug cache
  - **Optimistic update** pattern
- **Reuse:** useState, useEffect (so sánh anti-pattern)
- **Lib mới:** `@tanstack/react-query`, `@tanstack/react-query-devtools`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **HTTP cache header** (`ETag`, `Cache-Control`, `Last-Modified`)
  - **Cursor-based pagination** (alternative cho offset)
  - **Conditional request** (`If-None-Match` → 304)
- **Reuse:** CRUD pattern
- **Lib mới:** _none_

#### 🗄️ Database changes
- _none_

#### 🌐 API endpoints
- Same endpoints as M4-5, thêm:
  - Response headers: `ETag`, `Cache-Control: max-age=60, stale-while-revalidate=300`
  - Optional: `GET /courses?cursor=...&limit=...`

#### 📖 Pre-reading (~4h)
- [tkdodo.eu/blog/practical-react-query](https://tkdodo.eu/blog/practical-react-query) — series cực hay
- [tanstack.com/query/latest/docs/framework/react/overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Navigate course list → detail → back → KHÔNG refetch (cached)
- [ ] DevTools mở được, hiển thị cache hit/miss
- [ ] Mutation (vd: future) auto-invalidate liên quan query
- [ ] Background refetch khi data stale (>5min)
- [ ] Loading state phân biệt: initial load vs refetch (skeleton vs spinner nhỏ)

**Code quality:**
- [ ] KHÔNG còn `useEffect + useState` pattern cho server state
- [ ] queryKey có cấu trúc thống nhất: `['courses', { filters }]`
- [ ] Custom hook wrap query: `useCourses(filters)`, `useCourse(slug)`
- [ ] Type-safe (queryFn return type)

#### 🚀 Stretch goals
- `useInfiniteQuery` cho course list
- Prefetch on hover (`queryClient.prefetchQuery`)
- Persist cache vào IndexedDB (`@tanstack/query-async-storage-persister`)

#### ⚠️ Common pitfall
- Dùng `useEffect` song song với `useQuery` → duplicate state
- queryKey không stable → cache miss liên tục (vd: object literal mỗi render)
- `staleTime: 0` (default) → refetch quá thường xuyên, tăng cost BE

---

### Module 7 — i18n UI (Immersion learning feature)

**🎯 Mục tiêu sản phẩm:** User switch UI sang ngôn ngữ đang học (vd: học tiếng Nhật → UI tiếng Nhật) để tạo môi trường immersion.

**🔗 Dependencies:** M2 | **🔓 Unlocks:** _independent — can do anytime after M2_

#### 🖥️ Màn hình & UI chức năng

**[Student] Language switcher dropdown** (component trong header navbar)
- Mục đích: Đổi ngôn ngữ UI bất cứ lúc nào.
- UI: Dropdown trigger là flag + tên locale hiện tại (vd: 🇻🇳 Tiếng Việt); menu mở ra list locale (vi/en/ja/ko/zh) với flag + tên native.
- Chức năng:
  - Click locale → `i18n.changeLanguage(code)` → UI refresh ngay (không reload page)
  - Lưu vào localStorage + PATCH `/me/preferences` (nếu logged in)

**[Student] Immersion prompt modal**
- Mục đích: Đề xuất switch UI sang target language khi user vào course mới (immersion learning).
- UI: Modal hiện sau khi user click "Bắt đầu học" course tiếng X lần đầu, message "Bạn đang học tiếng Nhật. Đổi UI sang tiếng Nhật để immersion?"
- Chức năng:
  - Button "Có, đổi UI" → switch locale → close
  - Button "Không, giữ tiếng Việt" → close
  - Checkbox "Không hỏi lại cho course này" → lưu preference per-course

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`react-i18next`** setup — `i18n.init`, `I18nextProvider`
  - **`useTranslation` hook** — `t('key')`
  - **`<Trans>` component** — interpolation với JSX
  - **Namespace** — tổ chức locale files (`common`, `auth`, `course`)
  - **Lazy load locale** — chỉ load locale đang dùng
  - **Language switcher component**
  - **Pluralization & interpolation**
- **Reuse:** useContext (i18n provider internally)
- **Lib mới:** `i18next`, `react-i18next`, `i18next-http-backend` (lazy load), `i18next-browser-languagedetector`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **`Accept-Language` header** parsing
  - **Error message i18n** (return key + locale, FE dịch — hoặc BE dịch sẵn)
  - **User preference** (`ui_locale` field)
- **Reuse:** middleware, dependency
- **Lib mới:** `babel` (optional, cho date/number format)

#### 🗄️ Database changes
- Đảm bảo `User.ui_locale` đã tồn tại (đã có từ M2)
- Endpoint update: `PATCH /me { ui_locale: 'ja' }`

#### 🌐 API endpoints
- `PATCH /me/preferences` — update ui_locale, native_language
- Error response: `{ "error": { "code": "INVALID_CREDENTIALS", "message_key": "auth.invalid_credentials" } }`

#### 📖 Pre-reading (~3h)
- [react.i18next.com](https://react.i18next.com)
- [i18next.com/translation-function/essentials](https://www.i18next.com/translation-function/essentials)
- [Best practice i18n keys structure](https://www.i18next.com/principles/namespaces)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Support tối thiểu: `vi` (default), `en`, + 1–2 ngôn ngữ đang dạy (vd: `ja`)
- [ ] Language switcher trên header, dropdown với flag + tên ngôn ngữ
- [ ] Reload page giữ locale (lưu localStorage + sync với BE)
- [ ] Khi vào course tiếng Nhật, prompt "Switch UI to Japanese for immersion?" (chỉ hỏi 1 lần)
- [ ] Date/number format theo locale
- [ ] Auth pages (login/signup) giữ locale tiếng Việt mặc định (không immersion ở đó)

**Code quality:**
- [ ] Locale files tổ chức theo namespace, không 1 file giant
- [ ] Lazy load locale (chỉ load khi cần)
- [ ] KHÔNG hard-code text trong component
- [ ] Type-safe key (nếu dùng TypeScript: `i18next.t` augmentation)

#### 🚀 Stretch goals
- Auto-detect browser locale lần đầu vào (cẩn thận: chỉ default, không override user choice)
- RTL support (cho Arabic, Hebrew — chuẩn bị mở rộng)
- Translation management tool integration (Lokalise, Crowdin)

#### ⚠️ Common pitfall
- Key namespacing lẫn lộn → conflict, khó maintain
- Plural rule cho VN khác EN khác JA → dùng i18next plural API thay vì ternary
- Server-rendered date không match client locale → hydration mismatch (nếu sau này dùng Next.js)

---

### Module 8 — Teacher dashboard (CRUD course)

**🎯 Mục tiêu sản phẩm:** Teacher (đã được Admin invite) đăng nhập, tạo/sửa/xóa course, upload thumbnail, sắp xếp chapter/lesson.

**🔗 Dependencies:** M2, M6 | **🔓 Unlocks:** M9, M14

#### 🖥️ Màn hình & UI chức năng

**[Teacher] Teacher dashboard home** (`/teacher`)
- Mục đích: Overview cho teacher đăng nhập (riêng layout khác Student).
- UI: Stats card row (tổng course, published, pending review, total students); quick action buttons; biểu đồ enrollment 7 ngày gần nhất.
- Chức năng:
  - Button "Tạo course mới" → wizard step 1
  - Button "Xem submissions" → `/teacher/submissions`
  - Click stats card → navigate page tương ứng

**[Teacher] My courses list** (`/teacher/courses`)
- Mục đích: Danh sách course của teacher hiện tại.
- UI: Table cột: thumbnail, title, status (draft/pending/published/rejected), students count, created_at, action menu.
- Chức năng:
  - Filter dropdown theo status
  - Click row → edit page
  - Button "Tạo course mới" → wizard
  - Action menu (3-dots): Edit / Submit for review / Delete (chỉ draft)

**[Teacher] Create course wizard - Step 1: Basic info** (`/teacher/courses/new`)
- Mục đích: Nhập thông tin cơ bản của course.
- UI: Progress bar wizard 2 steps; form: title input, description rich text (TipTap), dropdown target_language + level + price, drag-drop upload thumbnail.
- Chức năng:
  - Drag-drop thumbnail → preview + upload R2 → URL set vào form
  - Validate RHF + Zod (title min, price ≥0, ...)
  - Button "Tiếp theo" → save draft + step 2
  - Button "Lưu nháp" → POST `/teacher/courses` với status=draft

**[Teacher] Create course wizard - Step 2: Chapter & Lesson builder**
- Mục đích: Build curriculum cho course.
- UI: List chapter với drag handle để reorder; mỗi chapter có nested list lesson; modal popup "Thêm chapter/lesson".
- Chức năng:
  - Button "Thêm chapter" → modal nhập title → tạo chapter
  - Button "Thêm lesson" trong chapter → modal nhập title → tạo lesson
  - Drag-drop reorder (dnd-kit) chapter & lesson
  - Inline edit title (click → input edit)
  - Button "Quay lại" / "Hoàn tất" → quay course edit page

**[Teacher] Course edit page** (`/teacher/courses/{id}/edit`)
- Mục đích: Sửa course đã tồn tại (cả draft + rejected để resubmit).
- UI: Tabs Basic info / Curriculum / Settings — form như wizard nhưng all-in-one.
- Chức năng:
  - Auto-save draft mỗi 30s (debounce)
  - Button "Submit for review" → modal confirm
  - Button "Delete course" (chỉ draft) → confirm modal

**[Teacher] Submit for review modal**
- Mục đích: Confirm + checklist trước khi submit.
- UI: Modal với checklist tiêu chí (≥3 chapter, có thumbnail, description ≥100 ký tự, ...) + textarea note gửi cho admin.
- Chức năng:
  - Validate checklist (disabled submit nếu chưa đủ)
  - Button "Submit" → POST `/teacher/courses/{id}/submit-for-review` → status=pending
  - Button "Hủy"

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **React Hook Form** — performance form (uncontrolled), `register`, `handleSubmit`, `formState`
  - **Zod resolver** — schema validation
  - **Multi-step form** (Course info → Chapter → Lesson)
  - **File upload component** với drag-drop
  - **Rich text editor** (TipTap hoặc simpler)
  - **`useMutation` from TanStack Query** — sync với BE
  - **Authenticated route guard** component
- **Reuse:** useState, useContext, React Router, TanStack Query
- **Lib mới:** `react-hook-form`, `@hookform/resolvers`, `zod`, `@tiptap/react`, `@tiptap/starter-kit`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Role-based dependency** (`require_teacher`)
  - **Ownership check** (teacher chỉ sửa course của mình)
  - **`UploadFile` + `File()`** — multipart upload
  - **File validation** (mime type, size, dimension cho image)
  - **Image processing** với Pillow (resize, optimize)
  - **Cloudflare R2 / S3 upload** với `boto3` hoặc `aioboto3`
  - **Presigned URL** (nếu dùng direct upload từ client)
- **Reuse:** CRUD pattern, Pydantic, auth
- **Lib mới:** `boto3` (hoặc `aioboto3`), `Pillow`, `python-multipart`

#### 🗄️ Database changes
- Course: đảm bảo `status` enum và workflow draft → pending → published
- Tạo bucket R2: `lang-app-uploads` (cho thumbnail, audio, attachments)

#### 🌐 API endpoints
- `GET /teacher/courses` — list course của teacher hiện tại
- `POST /teacher/courses` — tạo course mới (status=draft)
- `PATCH /teacher/courses/{id}` — update
- `DELETE /teacher/courses/{id}` — soft delete (nếu chưa publish)
- `POST /teacher/courses/{id}/chapters` — add chapter
- `PATCH /teacher/chapters/{id}` — update chapter (title, order)
- `POST /teacher/courses/{id}/submit-for-review` — chuyển status sang `pending`
- `POST /uploads/image` — upload thumbnail, return URL

#### 📖 Pre-reading (~4h)
- [react-hook-form.com/get-started](https://react-hook-form.com/get-started)
- [react-hook-form.com/get-started#SchemaValidation](https://react-hook-form.com/get-started#SchemaValidation)
- [zod.dev](https://zod.dev)
- [fastapi.tiangolo.com/tutorial/request-files](https://fastapi.tiangolo.com/tutorial/request-files/)
- [developers.cloudflare.com/r2/api/s3/api](https://developers.cloudflare.com/r2/api/s3/api/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Teacher login → vào `/teacher/dashboard` → thấy danh sách course của mình
- [ ] Create course với form multi-step: basic info → upload thumbnail → add chapters/lessons
- [ ] Drag-drop reorder chapter/lesson
- [ ] Validation FE + BE đồng bộ (Zod schema có thể share)
- [ ] Upload thumbnail → R2, preview ngay
- [ ] Submit for review → status `pending`, teacher không sửa được nữa (until rejected)
- [ ] Student không access được `/teacher/*` route (route guard)

**Code quality:**
- [ ] Schema validation share giữa FE (Zod) và BE (Pydantic) — viết Zod, tạo Pydantic tương ứng
- [ ] File validation cả FE (UX) và BE (security)
- [ ] Image resize thumbnail (vd: max 1200x800, < 200KB)
- [ ] Authorization check ở dependency, không scatter trong endpoint logic

#### 🚀 Stretch goals
- Auto-save draft (debounce, lưu mỗi 30s)
- Image crop trước upload (react-image-crop)
- Preview course như student sẽ thấy
- Direct upload R2 qua presigned URL (giảm tải BE)

#### ⚠️ Common pitfall
- Quên ownership check → teacher A sửa được course teacher B
- Upload không validate mime/size → bị abuse upload malware/huge file
- Không xử lý image orientation (EXIF) → ảnh xoay sai trên iPhone
- React Hook Form `defaultValues` không update khi data load async → dùng `reset()`

---

## Phase 3 — Learning Experience (M9–M11)

---

### Module 9 — Lesson player (Cloudflare Stream video)

**🎯 Mục tiêu sản phẩm:** Student xem video lesson với player tùy chỉnh (speed control, captions, progress tracking).

**🔗 Dependencies:** M8 | **🔓 Unlocks:** M10

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang lesson player** (`/courses/{slug}/learn/{lesson_slug}`)
- Mục đích: Trang học chính của student (xem video lesson).
- UI:
  - Sidebar trái collapsible: list chapter + lesson, checkmark đã hoàn thành, lesson hiện tại highlight, progress % toàn course
  - Main: video player (Cloudflare Stream + HLS.js) với controls play/pause, seek bar, volume, speed (0.5x/0.75x/1x/1.25x/1.5x/2x), fullscreen, captions toggle
  - Below video: tabs Overview / Resources (download PDF) / Notes (M19); button "Lesson trước" / "Lesson sau"
- Chức năng:
  - Auto-save watched_seconds mỗi 5s (debounce) → POST `/lessons/{id}/progress`
  - Lesson hoàn thành (≥90%) → checkmark + auto suggest lesson kế
  - Speed control persist user preference
  - Keyboard shortcut: Space (play/pause), ←/→ (seek 5s), F (fullscreen), M (mute), C (captions)
  - Locked lesson (chưa mua) → render Paywall (M13)

**[Student] Continue resume modal**
- Mục đích: Hiện khi user mở lại lesson đã xem dở.
- UI: Modal "Tiếp tục từ 05:23?" với 2 button.
- Chức năng:
  - "Tiếp tục" → video.seek(last_position) + play
  - "Bắt đầu lại" → video.seek(0)

**[Teacher] Lesson video upload page** (`/teacher/lessons/{id}/video`)
- Mục đích: Teacher upload video cho lesson.
- UI: Drag-drop zone video, progress bar upload (% + speed); sau upload: preview player + status (encoding/ready/failed).
- Chức năng:
  - Upload → BE proxy file lên Cloudflare Stream → poll status mỗi 10s
  - Button "Replace video" (xóa video cũ, upload mới)
  - Button "Generate captions" (optional - dùng AI/Cloudflare auto)

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **HLS.js** — adaptive bitrate streaming
  - **`<video>` element + ref**
  - **`useRef`** — DOM ref, persist value không trigger re-render
  - **Video events** (`timeupdate`, `ended`, `play`, `pause`, `seeking`)
  - **Progress tracking** với debounce upload
  - **Fullscreen API**
  - **Keyboard shortcut** (space play/pause, ←→ seek)
  - **Captions/Subtitle** (WebVTT)
- **Reuse:** useState, useEffect cleanup
- **Lib mới:** `hls.js`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Cloudflare Stream API client** (upload, get signed URL)
  - **Webhook handler** (video ready/error event from CF)
  - **Signed URL generation** với JWT (CF Stream signed URL)
  - **Progress save endpoint** (idempotent — update LessonProgress)
- **Reuse:** dependency, async client
- **Lib mới:** `httpx` (async HTTP client cho CF API), `pyjwt`

#### 🗄️ Database changes
- Lesson: `video_id` (CF Stream ID), `duration_seconds`, `video_status` (pending/ready/failed)
- Tạo `LessonProgress`: `id, user_id FK, lesson_id FK, watched_seconds, completed_at, last_position_seconds, updated_at`
- Unique constraint: `(user_id, lesson_id)`

#### 🌐 API endpoints
- `POST /teacher/lessons/{id}/video` — Teacher upload video → CF Stream → save video_id
- `POST /webhooks/cloudflare-stream` — nhận event ready/error
- `GET /lessons/{id}/playback` — return signed URL (require enrolled hoặc is_free_preview)
- `POST /lessons/{id}/progress` — save watched_seconds, last_position (debounced 5s)
- `GET /lessons/{id}/progress` — get current progress

#### 📖 Pre-reading (~4h)
- [react.dev/reference/react/useRef](https://react.dev/reference/react/useRef)
- [github.com/video-dev/hls.js](https://github.com/video-dev/hls.js)
- [developers.cloudflare.com/stream](https://developers.cloudflare.com/stream)
- [developers.cloudflare.com/stream/viewing-videos/securing-your-stream/](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Teacher upload video → BE gọi CF Stream API → lưu video_id → status `pending`
- [ ] CF webhook báo ready → cập nhật `video_status='ready'`, `duration_seconds`
- [ ] Student xem video: signed URL có TTL 2h
- [ ] Progress lưu mỗi 5s (debounce), không spam BE
- [ ] Resume từ `last_position` khi mở lại
- [ ] Speed control 0.5x/0.75x/1x/1.25x/1.5x/2x
- [ ] Captions toggle (nếu có WebVTT)
- [ ] Mobile-friendly (responsive, touch event)
- [ ] Lesson `requires_premium` + user chưa mua → return 403, FE hiện paywall (chuẩn bị M13)

**Code quality:**
- [ ] Cleanup HLS.js instance khi unmount (`useEffect` return)
- [ ] Không leak signed URL trong client logs
- [ ] Webhook verify signature từ CF
- [ ] Progress save idempotent

#### 🚀 Stretch goals
- Note taking + bookmark timestamp (click → jump)
- Picture-in-picture
- Auto-play next lesson khi `ended`
- Quality selector (manual override adaptive)

#### ⚠️ Common pitfall
- **Memory leak**: HLS.js instance không destroy → tích lũy mỗi lần navigate
- Signed URL TTL quá ngắn → user xem giữa chừng bị expire (refresh URL khi gần hết)
- Progress endpoint không debounce → spam BE
- Webhook không idempotent (CF retry) → duplicate state

---

### Module 10 — Quiz engine (text-based)

**🎯 Mục tiêu sản phẩm:** Student làm quiz với 4 question type: multiple choice, fill-in-blank, matching (drag-drop), reorder words.

**🔗 Dependencies:** M9 | **🔓 Unlocks:** M11

#### 🖥️ Màn hình & UI chức năng

**[Student] Quiz instruction modal**
- Mục đích: Hướng dẫn trước khi vào quiz (lần đầu user vào quiz).
- UI: Modal hiện title quiz, số câu, passing score, "Đọc kỹ câu hỏi, có thể retry sau".
- Chức năng: Button "Bắt đầu" → chuyển Quiz play page.

**[Student] Trang chơi Quiz** (`/courses/{slug}/quiz/{quiz_id}`)
- Mục đích: UI làm bài quiz với 4 question type.
- UI:
  - Progress bar top (1/10)
  - Question card center, variant theo type:
    - Multiple choice: list radio button options
    - Fill-in-blank: text input inline trong prompt
    - Matching: 2 column drag-drop pair items
    - Reorder: list draggable words/sentences
  - Button "Câu trước" / "Câu sau" hoặc "Nộp bài" (câu cuối)
- Chức năng:
  - Lưu answer state cho mỗi question (useReducer)
  - Esc → confirm "Thoát quiz? Tiến độ sẽ mất" modal
  - Drag-drop work cả desktop + mobile (dnd-kit pointer + touch sensor)
  - Keyboard: 1/2/3/4 chọn nhanh MC, Enter next question

**[Student] Trang kết quả quiz**
- Mục đích: Hiển thị điểm + breakdown.
- UI: Big score (8/10), pass/fail message với animation (Framer Motion), breakdown list từng câu với icon ✓/✗.
- Chức năng:
  - Button "Xem lại câu sai" → Wrong answers review page
  - Button "Làm lại" → Retry confirm modal
  - Button "Tiếp tục course" → lesson kế

**[Student] Wrong answers review page**
- Mục đích: Xem chi tiết câu sai + đáp án đúng + giải thích (nếu teacher add).
- UI: List câu sai với: đề bài, đáp án user, đáp án đúng (highlight green), giải thích (nếu có).
- Chức năng: Button "Quay lại kết quả".

**[Student] Retry confirm modal**
- Mục đích: Confirm trước retry.
- UI: "Làm lại sẽ tạo attempt mới (vẫn lưu attempt cũ). Tiếp tục?"
- Chức năng: Button "Có" / "Hủy".

**[Teacher] Quiz builder page** (`/teacher/lessons/{id}/quiz/edit`)
- Mục đích: Tạo/sửa quiz cho lesson.
- UI: 
  - Sidebar trái: list question hiện có (có drag handle reorder) + button "Thêm câu hỏi"
  - Main: form chỉnh 1 question (dropdown question type ở top, form thay đổi theo type)
  - Pane phải: live preview như student sẽ thấy
- Chức năng:
  - Add/Edit/Delete question
  - Drag-drop reorder
  - Live preview real-time
  - Button "Lưu" / "Preview as student" (mở quiz play test mode)

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`useReducer`** — quiz state machine (current question, answers, submitted, score)
  - **Compound component pattern** — `<Quiz><Question/><Question/></Quiz>`
  - **dnd-kit** — `DndContext`, `useSortable`, `useDroppable`
  - **`useImperativeHandle`** (optional, cho parent control child)
  - **Discriminated union state** (typed question types)
- **Reuse:** useState, React Hook Form, custom hook
- **Lib mới:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Pydantic discriminated union** — type-safe quiz schema
  - **JSON schema validation** cho quiz config (input từ Teacher)
  - **Auto-grade endpoint** — pure function, type-aware
  - **Attempt history** — store answers JSON
  - **`@field_validator` advanced** — custom validation
- **Reuse:** CRUD, Pydantic
- **Lib mới:** _none (Pydantic v2 đã đủ)_

#### 🗄️ Database changes
- Tạo `Quiz` table: `id, lesson_id FK, title, schema_json, passing_score, created_at`
- `schema_json` structure ví dụ:
  ```json
  {
    "questions": [
      {"id": "q1", "type": "multiple_choice", "prompt": "...", "options": [...], "correct": "a"},
      {"id": "q2", "type": "fill_in_blank", "prompt": "I ___ to school", "correct": ["go", "went"]},
      {"id": "q3", "type": "matching", "pairs": [...]},
      {"id": "q4", "type": "reorder", "words": [...], "correct_order": [...]}
    ]
  }
  ```
- Tạo `QuizAttempt`: `id, user_id FK, quiz_id FK, answers_json, score, max_score, passed, started_at, completed_at`

#### 🌐 API endpoints
- `GET /quizzes/{id}` — return quiz (KHÔNG include `correct` field cho student!)
- `POST /quizzes/{id}/attempts` — submit answers, auto-grade, return score + feedback
- `GET /quizzes/{id}/attempts` — list attempt của user
- `GET /quizzes/{id}/attempts/{attempt_id}` — detail (xem lại câu sai)
- Teacher endpoints: `POST /teacher/lessons/{id}/quiz`, `PATCH /teacher/quizzes/{id}`

#### 📖 Pre-reading (~5h)
- [react.dev/reference/react/useReducer](https://react.dev/reference/react/useReducer)
- [Compound component pattern (Kent C. Dodds)](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [docs.dndkit.com](https://docs.dndkit.com)
- [docs.pydantic.dev/latest/concepts/unions/#discriminated-unions](https://docs.pydantic.dev/latest/concepts/unions/#discriminated-unions)

#### ✅ Acceptance criteria
**Functional:**
- [ ] 4 question type render đúng UI tương ứng
- [ ] Submit → BE chấm điểm, return score + which-correct
- [ ] Có thể retry attempt (lưu lịch sử)
- [ ] Drag-drop work trên cả desktop + mobile (touch sensor)
- [ ] Keyboard accessible (Tab, Enter, Arrow keys)
- [ ] Teacher có thể tạo quiz qua dashboard với form builder

**Code quality:**
- [ ] Quiz state là 1 reducer, không scatter useState
- [ ] BE auto-grade là pure function, dễ test
- [ ] `correct` field KHÔNG bao giờ leak sang client (response_model loại bỏ)
- [ ] Schema validation cả Teacher input (BE) và Student answer (BE)

#### 🚀 Stretch goals
- Animation transition giữa question (Framer Motion preview)
- Hint system (3 hint per question, tốn XP)
- Time limit per question (countdown)
- Feedback chi tiết: "Bạn sai vì..." (explanation field từ Teacher)

#### ⚠️ Common pitfall
- Logic chấm điểm trong component → khó test → tách thành pure function
- Leak `correct` answer trong API response → student inspect network thấy đáp án
- Reducer action type không discriminated → type unsafe
- dnd-kit không config sensor → mobile không drag được

---

### Module 11 — Listening quiz (audio)

**🎯 Mục tiêu sản phẩm:** Quiz có audio: nghe rồi chọn đáp án / điền từ nghe được.

**🔗 Dependencies:** M10 | **🔓 Unlocks:** M12

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang chơi Quiz (UPDATE)** — thêm Listening question variant
- Mục đích: Question type mới có audio.
- UI: Audio player trên đầu câu hỏi (play/pause/replay), speed control (0.5x/0.75x/1x), counter "Replay còn lại: 2/3"; below audio là answer area (MC hoặc fill-in giống M10).
- Chức năng:
  - Replay limit (configurable per question, vd: 3 lần)
  - Sau khi hết lần replay → button replay disabled
  - Audio preload để play mượt

**[Teacher] Quiz builder page (UPDATE)** — thêm option Listening question type
- Thêm UI: Drag-drop zone audio (mp3/m4a), preview audio player, input "Max replay count", textarea "Transcript" (optional, hidden cho student).
- Chức năng: Upload audio → R2 → URL save vào quiz schema; validate file size ≤5MB, mime audio/*.

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **HTML5 audio API** (`<audio>`, ref control)
  - **Audio player component** (play/pause, replay, speed)
  - **Visualizer/waveform** (optional, dùng `wavesurfer.js`)
  - **Pre-load audio** strategy
- **Reuse:** useRef, useReducer (quiz state)
- **Lib mới:** _none (hoặc `wavesurfer.js` cho waveform)_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **File upload audio** (mp3, m4a) với validate
  - **Duration extract** với `mutagen`
  - **R2 storage** cho audio (giống image)
- **Reuse:** UploadFile, R2 client
- **Lib mới:** `mutagen` (audio metadata)

#### 🗄️ Database changes
- Quiz `schema_json` thêm question type `listening`:
  ```json
  {"type": "listening", "audio_url": "...", "prompt": "What did you hear?", "options": [...]}
  ```

#### 🌐 API endpoints
- `POST /teacher/uploads/audio` — upload audio, return URL + duration
- (Existing quiz endpoints — đã hỗ trợ thêm question type mới qua discriminated union)

#### 📖 Pre-reading (~2h)
- [developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [wavesurfer-js.org](https://wavesurfer-js.org) (optional)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Teacher upload audio mp3/m4a → R2 → preview ngay
- [ ] Student nghe audio (play/pause/replay/speed 0.5x-1x)
- [ ] Replay tối thiểu 3 lần (configurable per question)
- [ ] Audio không auto-play (UX)
- [ ] Buffer/loading indicator khi load audio chậm

**Code quality:**
- [ ] Validate audio mime + max size (vd: 5MB)
- [ ] Audio URL signed (chống hot-link)
- [ ] Cleanup audio instance khi unmount

#### 🚀 Stretch goals
- Waveform visualization
- "Slow audio" (0.5x) button riêng (UX cho language learner)
- Transcript hidden, reveal khi user fail 3 lần

#### ⚠️ Common pitfall
- Audio không pause khi navigate → tiếp tục chạy trang sau
- Quên cleanup → memory leak
- iOS Safari: phải user gesture mới play được (không auto-play được)

---

## Phase 4 — Monetization (M12–M14)

---

### Module 12 — Payment (VNPay + MoMo)

**🎯 Mục tiêu sản phẩm:** User mua course bằng VNPay hoặc MoMo, nhận được course ngay sau khi thanh toán thành công.

**🔗 Dependencies:** M4 | **🔓 Unlocks:** M13

#### 🖥️ Màn hình & UI chức năng

**[Student] Trang Checkout** (`/checkout/{course_id}`)
- Mục đích: Trang thanh toán cho course.
- UI:
  - Section 1: Course summary (thumbnail nhỏ, title, teacher, price)
  - Section 2: Coupon input + button "Apply" (hiện discount nếu valid)
  - Section 3: Tổng tiền (giá gốc + discount + tiền cần trả)
  - Section 4: Chọn payment method (radio: VNPay / MoMo / ZaloPay) — mỗi option có icon + ghi chú
  - Button "Thanh toán [amount]" + button "Hủy"
- Chức năng:
  - Input coupon → click "Apply" → POST `/coupons/validate` → hiện discount hoặc error
  - Click "Thanh toán" → POST `/payments/create` → return `redirect_url` → `window.location.href = redirect_url`
  - Button "Hủy" → quay lại course detail

**[Student] Payment success page** (`/payment/success?txn=...`)
- Mục đích: Trang sau khi gateway redirect về thành công.
- UI: Confetti animation, big checkmark icon, message "Mua thành công!", course thumbnail + title đã mua.
- Chức năng:
  - Auto verify status với BE (poll `/payments/{id}/status` mỗi 2s, max 30s) — chờ webhook
  - Button "Bắt đầu học" → navigate course detail (đã unlock)
  - Button "Xem hóa đơn" → `/me/purchases`

**[Student] Payment failed page** (`/payment/failed?reason=...`)
- Mục đích: Trang khi thanh toán fail.
- UI: Error icon + message theo reason (timeout / insufficient / canceled by user / ...).
- Chức năng:
  - Button "Thử lại" → quay lại `/checkout/{course_id}`
  - Button "Liên hệ hỗ trợ" → mở support chat (sẽ active từ M17)

**[Student] My purchases page** (`/me/purchases`)
- Mục đích: Lịch sử mua course của user.
- UI: Table cột: thumbnail, title, ngày mua, giá trả, payment method (VNPay/MoMo/ZaloPay), status. Filter date range.
- Chức năng:
  - Click row → navigate course detail (đã unlock)
  - Button "Download receipt" (optional, generate PDF)

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Checkout flow** (multi-step nếu cần coupon, summary, confirm)
  - **Payment status polling** (sau redirect về)
  - **Payment redirect handling** (URL với query params từ gateway)
  - **Pending UI** — "Đang xử lý thanh toán..." spinner
- **Reuse:** TanStack Query mutation, route guard, form
- **Lib mới:** _none_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Payment adapter pattern** — abstract interface + VNPay/MoMo adapter
  - **Webhook handler** — nhận callback từ gateway
  - **Signature verification** (HMAC) — chống forge webhook
  - **Idempotency key** — chống duplicate khi gateway retry
  - **State machine** — `pending → paid → fulfilled` (hoặc `failed`)
  - **Database transaction** — atomic update Payment + Purchase + Enrollment
  - **Reconciliation cron** — daily đối soát với gateway
  - **Audit log** — lưu raw request/response của mỗi payment
- **Reuse:** background task, ARQ (cho reconcile cron)
- **Lib mới:** _none thêm (cả VNPay/MoMo dùng HTTPS + HMAC chuẩn)_

#### 🗄️ Database changes
- Tạo `Payment`: `id, user_id FK, provider, provider_txn_id, amount, currency='VND', status, idempotency_key UNIQUE, raw_request_json, raw_response_json, created_at, paid_at`
- Tạo `Purchase`: `id, user_id FK, course_id FK, payment_id FK, amount_paid, purchased_at`
- Unique: `(user_id, course_id)` — KHÔNG cho phép mua 2 lần
- Index: `idempotency_key`, `provider_txn_id`

#### 🌐 API endpoints
- `POST /payments/create` — body `{course_id, provider, coupon_code?}` → return `{payment_id, redirect_url}`
- `POST /webhooks/vnpay` — verify signature, update Payment, create Purchase + Enrollment
- `POST /webhooks/momo` — tương tự
- `GET /payments/{id}/status` — FE polling sau redirect (in case webhook chậm)
- `GET /me/purchases` — list course đã mua
- Internal cron: `reconcile_payments_daily` (so sánh với gateway API)

#### 📖 Pre-reading (~6h — phase quan trọng nhất)
- [VNPay docs (Sandbox)](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)
- [MoMo Developer docs](https://developers.momo.vn)
- [stripe.com/docs/idempotency](https://stripe.com/docs/idempotency) — pattern chuẩn industry
- [Webhook security best practices](https://stripe.com/docs/webhooks/best-practices)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Sandbox test thành công cả VNPay + MoMo
- [ ] User click "Mua course" → redirect gateway → trả tiền → redirect back → thấy course unlock
- [ ] Webhook signature verify đúng, fake webhook bị reject
- [ ] Idempotency: gateway retry webhook → KHÔNG duplicate Purchase
- [ ] Payment failed → user thấy error rõ ràng, có thể retry
- [ ] Reconciliation cron chạy daily, alert nếu discrepancy
- [ ] Coupon code áp dụng đúng (giảm giá hiện trên UI lẫn server-side check)

**Code quality:**
- [ ] **NEVER trust client-side payment success** — chỉ webhook + reconcile mới authoritative
- [ ] Transaction atomic (Payment + Purchase + Enrollment cùng commit hoặc rollback)
- [ ] Raw request/response lưu lại debug (KHÔNG log card info, token sensitive)
- [ ] Adapter pattern: thêm gateway mới không phải sửa core logic
- [ ] Status state machine: invalid transition → exception

#### 🚀 Stretch goals
- Refund flow (admin trigger)
- Subscription upgrade nếu sau này mở (data model đã ready)
- Email receipt (chuẩn bị M20)
- ZaloPay adapter

#### ⚠️ Common pitfall (CRITICAL — đọc kỹ)
- **Webhook không verify signature** → attacker gửi fake webhook unlock course free
- **Idempotency**: không có → user bị charge 2 lần hoặc app duplicate purchase
- **Race condition**: 2 webhook đồng thời → DB constraint phải bắt được
- **Webhook timeout**: gateway expect response <30s → KHÔNG block, trả 200 ngay rồi process async
- **Test mode → Prod**: forget switch URL/secret → fail prod silently
- **Log sensitive info** (card, secret) → security incident

---

### Module 13 — Authorization + Freemium tier check

**🎯 Mục tiêu sản phẩm:** Free user xem free course + preview lesson; Premium user (đã mua) xem được full course đã mua.

**🔗 Dependencies:** M12 | **🔓 Unlocks:** _enables full freemium UX_

#### 🖥️ Màn hình & UI chức năng

**[Student] Paywall overlay component** (in lesson page khi user chưa mua course)
- Mục đích: Block content + CTA mua course.
- UI: Overlay che video player (gradient blur), icon lock 🔒 + message "Lesson này chỉ dành cho học viên đã mua course", button CTA + price.
- Chức năng:
  - Button "Mua course - 199,000đ" → navigate `/checkout/{course_id}`
  - Link "Xem các lesson preview free" → scroll xuống/highlight lesson preview trong sidebar

**[Student] Upgrade prompt modal** (cho feature khác cần premium)
- Mục đích: Hiện khi user click feature premium chưa unlock (vd: download PDF, certificate).
- UI: Modal nhỏ với icon lock + message giải thích + button CTA.
- Chức năng: Button "Mua course" → checkout; "Hủy" → close.

**[Student] Lesson preview indicator (UPDATE Course detail / Curriculum tab)**
- Mục đích: Đánh dấu lesson nào free preview, nào cần premium.
- UI: Trong curriculum list, mỗi lesson có:
  - Icon 🔓 + badge "Preview free" cho `is_free_preview=true`
  - Icon 🔒 cho lesson premium (khi user chưa mua)
  - Icon ✓ (đã hoàn thành) khi user enrolled
- Chức năng:
  - Click preview lesson → vào lesson page (xem được)
  - Click premium lesson (chưa mua) → render Paywall component

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **HOC pattern** (`withPremium(Component)`) — wrap component cần premium check
  - **Route guard component** (`<RequirePurchase courseId={id}>`)
  - **Paywall component** — locked content overlay với CTA "Mua course"
  - **Upgrade prompt** modal
  - **Conditional rendering nâng cao** (combine multiple checks)
- **Reuse:** useContext (AuthContext), TanStack Query (purchase status), React Router
- **Lib mới:** _none_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Granular authorization dependency** (`require_course_access(course_id)`)
  - **Resource-based permission** (user A access course X chỉ nếu has_purchased OR is_free)
  - **Decorator/Dependency composition**
  - **403 vs 404** strategy (không leak existence)
- **Reuse:** Depends, auth
- **Lib mới:** _none_

#### 🗄️ Database changes
- Lesson: đảm bảo `is_free_preview` và `requires_premium` đã có (từ M4)
- View hoặc computed property `user_has_access(user_id, lesson_id)`

#### 🌐 API endpoints
- Tất cả `GET /lessons/{id}/...` và `GET /quizzes/{id}/...` thêm check
- `GET /me/access` — return list course đã có access (cho FE cache)

#### 📖 Pre-reading (~2h)
- [HOC pattern (React docs legacy)](https://legacy.reactjs.org/docs/higher-order-components.html) — concept vẫn dùng
- [FastAPI dependencies with parameters](https://fastapi.tiangolo.com/advanced/advanced-dependencies/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Free course: ai cũng xem được toàn bộ
- [ ] Paid course với `is_free_preview` lesson: ai cũng xem preview lesson đó
- [ ] Paid course, lesson không preview, user chưa mua: thấy paywall, không play được video
- [ ] User đã mua: xem được full course
- [ ] Admin/Teacher của course: bypass check (preview content của mình)
- [ ] FE giấu button "Continue" của lesson lock, hiện "Mua course"
- [ ] BE return 403 với message rõ, không phải 404

**Code quality:**
- [ ] Authorization check ở dependency, không scatter trong endpoint
- [ ] FE check + BE check (FE cho UX, BE cho security — KHÔNG trust FE)
- [ ] DRY: 1 helper `useCourseAccess(courseId)` dùng nhiều nơi

#### 🚀 Stretch goals
- Time-limited preview (vd: free preview 5 ngày sau khi enroll)
- Different tier (Free / Premium / Pro với feature matrix)
- A/B test paywall design

#### ⚠️ Common pitfall
- Check chỉ ở FE → user thay route, gọi API direct → access content paid
- HOC over-nest → component tree khó debug
- Cache access status quá lâu → user mua xong vẫn thấy paywall (invalidate query!)

---

### Module 14 — Admin review workflow (course approval)

**🎯 Mục tiêu sản phẩm:** Admin xem queue course Teacher submitted, approve hoặc reject với note, audit log mọi action.

**🔗 Dependencies:** M8, M13 | **🔓 Unlocks:** _enables content moderation_

#### 🖥️ Màn hình & UI chức năng

**[Admin] Admin dashboard home** (`/admin`)
- Mục đích: Overview cho admin (layout riêng cho admin).
- UI: Stats card row (course pending review, total users, today's revenue, active courses), quick action buttons.
- Chức năng:
  - Button "Review queue" → `/admin/courses/pending`
  - Button "Manage users" → users page
  - Click stats card → drill-down

**[Admin] Course review queue** (`/admin/courses/pending`)
- Mục đích: Danh sách course đang chờ duyệt.
- UI: Table course pending: title, teacher, submitted_at, ngôn ngữ, level.
- Chức năng:
  - Click row → review detail page
  - Filter theo teacher, ngày submit
  - Sort theo oldest first (FIFO)

**[Admin] Course review detail page** (`/admin/courses/{id}/review`)
- Mục đích: Xem course như student để approve/reject.
- UI: Layout 2 cột — Left main (3/4 width): preview course content (curriculum, video, quiz); Right sidebar (1/4): form action (textarea note, button Approve / Reject).
- Chức năng:
  - Preview lesson video, quiz, attachments
  - Button "Approve" → Approve confirmation modal
  - Button "Reject" → Reject reason modal

**[Admin] Reject reason modal**
- Mục đích: Form lý do reject course.
- UI: Modal với checkbox category (Vi phạm policy / Chất lượng kém / Thiếu thumbnail / Tên không phù hợp / Khác) + textarea note (required min 20 chars).
- Chức năng:
  - Submit → POST `/admin/courses/{id}/reject` với note → notify teacher
  - Button "Hủy"

**[Admin] Approve confirmation modal**
- Mục đích: Confirm trước khi approve (vì sẽ public ngay).
- UI: "Approve course này? Course sẽ public ngay cho student."
- Chức năng: Button "Approve" → POST `/admin/courses/{id}/approve` / "Hủy".

**[Admin] Audit log page** (`/admin/audit-log`)
- Mục đích: Xem log mọi action admin/teacher.
- UI: Table cột: actor (admin/teacher), action, entity (course/user/coupon), timestamp, IP; filter sidebar (date range, actor, action type, entity).
- Chức năng:
  - Click row → modal hiện changes_json diff (before/after)
  - Export CSV (optional)

**[Admin] Invite teacher modal**
- Mục đích: Admin mời 1 user thành teacher (RBAC).
- UI: Modal: search user (autocomplete email/name), preview user info, textarea note welcome, button submit.
- Chức năng: Submit → POST `/admin/users/{id}/invite-as-teacher` → update role + gửi email.

**[Teacher] My submissions status page** (`/teacher/submissions`)
- Mục đích: Teacher tracker submissions của mình.
- UI: List course đã submit với status (pending/approved/rejected) + reviewed_at + admin note nếu rejected.
- Chức năng: Button "Resubmit" (nếu rejected) → quay lại course edit page.

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **TanStack Table** — data grid với sort/filter/pagination
  - **Modal/Dialog** (shadcn `<Dialog>`)
  - **Timeline UI** (audit log display)
  - **Confirmation dialog** pattern
  - **Admin layout** (separate từ Student layout)
- **Reuse:** route guard, TanStack Query, RHF + Zod
- **Lib mới:** `@tanstack/react-table`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **State machine cho Course** (`draft → pending → published / rejected → resubmit`)
  - **Admin-only RBAC**
  - **Audit log decorator/middleware** — log mọi admin action
  - **Soft delete pattern**
  - **Transactional update** (course status + audit log + notify teacher)
- **Reuse:** RBAC, transaction
- **Lib mới:** _none_

#### 🗄️ Database changes
- Tạo `CourseReviewQueue`: `id, course_id FK, submitted_at, reviewed_by FK NULL, reviewed_at NULL, status, notes`
- Tạo `AuditLog`: `id, actor_user_id FK, action, entity_type, entity_id, changes_json, ip, user_agent, created_at`
- Index `AuditLog (entity_type, entity_id, created_at DESC)`

#### 🌐 API endpoints
- `GET /admin/courses/pending` — queue review
- `POST /admin/courses/{id}/approve` — set status=published, notify teacher
- `POST /admin/courses/{id}/reject` — set status=rejected với notes, notify teacher
- `GET /admin/audit-log?entity_type=...&entity_id=...` — view audit
- `POST /admin/users/{id}/invite-as-teacher` — invite user thành teacher (đã chốt invite-only)

#### 📖 Pre-reading (~3h)
- [tanstack.com/table/v8/docs/introduction](https://tanstack.com/table/v8/docs/introduction)
- [ui.shadcn.com/docs/components/dialog](https://ui.shadcn.com/docs/components/dialog)
- [State machine pattern](https://xstate.js.org/docs/) — read concept, không nhất thiết dùng XState

#### ✅ Acceptance criteria
**Functional:**
- [ ] Teacher submit course → status `pending`, vào queue admin
- [ ] Admin xem list pending, click vào xem detail course
- [ ] Approve → status `published`, course visible public, teacher nhận notification
- [ ] Reject với note → status `rejected`, teacher thấy note, có thể sửa rồi submit lại
- [ ] Audit log ghi nhận: ai approve/reject, khi nào, note gì
- [ ] Teacher có thể view audit log của course mình
- [ ] Invalid state transition (vd: approve course đã rejected) → 400

**Code quality:**
- [ ] State transition validate ở 1 chỗ (state machine function)
- [ ] Audit log decorator clean (không spam trong logic)
- [ ] RBAC `require_admin` reuse từ M2
- [ ] Notification gửi async (không block response)

#### 🚀 Stretch goals
- Bulk approve
- Auto-assign reviewer (round-robin nếu nhiều admin)
- Quality checklist trong UI (admin tick các tiêu chí trước approve)
- Email notify teacher

#### ⚠️ Common pitfall
- State machine không enforce → invalid status transition gây bug
- Audit log thiếu context (chỉ action, không có "before/after") → khó debug
- Quên invalidate cache `/courses` khi approve → public list không update

---

## Phase 5 — Engagement (M15–M19)

---

### Module 15 — Gamification basic (Streak + Badge)

**🎯 Mục tiêu sản phẩm:** Đếm streak (số ngày liên tục học), unlock badge milestone (7-day streak, first course done, ...).

**🔗 Dependencies:** M9 (cần lesson tracking) | **🔓 Unlocks:** M18

#### 🖥️ Màn hình & UI chức năng

**[Student] Streak widget** (component trong header navbar)
- Mục đích: Hiển thị streak hiện tại, motivate user duy trì.
- UI: Icon 🔥 + số ngày streak (vd: "🔥 7"); màu thay đổi theo milestone (xám <3 ngày, cam 3-29 ngày, đỏ 30+).
- Chức năng: Click → mở Streak detail modal.

**[Student] Streak detail modal**
- Mục đích: Chi tiết streak + lịch heat map.
- UI: Modal hiện current streak, longest streak, lịch 30 ngày dạng heat map (ô xanh = active, xám = miss).
- Chức năng: "Học hôm nay để duy trì streak!" + button CTA "Tiếp tục học" → quay lại lesson dang dở.

**[Student] Badge unlock toast** (sonner)
- Mục đích: Notify ngay khi unlock badge.
- UI: Toast right-bottom với icon badge + tên badge + "+10 XP" + close.
- Chức năng: Click toast → đến achievement gallery; auto-dismiss sau 5s.

**[Student] Achievement gallery page** (`/me/achievements`)
- Mục đích: Bộ sưu tập badge của user.
- UI: Grid badge cards: unlocked (color + checkmark + unlocked_at) / locked (gray + lock icon + "?"); group theo category (Streak/Course/Quiz/Special).
- Chức năng:
  - Click badge → modal mô tả criteria + progress (vd: "Streak 7 ngày — bạn đang ở ngày 5/7")
  - Filter unlocked/locked

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Streak widget** (header)
  - **Badge collection UI** (grid + unlock animation)
  - **Toast notification** khi unlock badge (sonner)
  - **`useEffect` side effect tracking** (gọi BE record activity sau lesson done)
- **Reuse:** TanStack Query, component composition
- **Lib mới:** `sonner` (toast notification)

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **ARQ scheduled job** (cron-like) — daily 00:00 reset streak nếu yesterday inactive
  - **Badge unlock service** — check criteria sau mỗi activity
  - **Transactional update** UserStats + UserAchievement
  - **Timezone handling** (user ở VN, server có thể UTC)
- **Reuse:** background task, transaction
- **Lib mới:** `arq`

#### 🗄️ Database changes
- Tạo `UserStats`: `user_id PK, current_streak, longest_streak, total_xp, level, last_activity_date, timezone`
- Tạo `Achievement`: `id, code UNIQUE, name, description, criteria_json, icon_url, xp_reward`
- Tạo `UserAchievement`: `id, user_id FK, achievement_id FK, unlocked_at`
- Seed achievement: "First Lesson", "7-Day Streak", "30-Day Streak", "First Course Complete", ...

#### 🌐 API endpoints
- `POST /me/activities/lesson-completed` — gọi sau khi user complete lesson (idempotent — đã có thì skip)
- `GET /me/stats` — return UserStats
- `GET /me/achievements` — list achievement unlocked
- `GET /achievements` — public list (cho gallery)
- Internal cron: `streak_check_daily` (mỗi ngày 00:00 theo VN timezone)

#### 📖 Pre-reading (~3h)
- [arq-docs.helpmanual.io](https://arq-docs.helpmanual.io) — async task queue
- [FastAPI background tasks vs Celery vs ARQ](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Timezone in PostgreSQL](https://wiki.postgresql.org/wiki/Working_with_TimeZones)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Complete lesson lần đầu trong ngày → streak +1
- [ ] Cron daily 00:00: nếu user không có activity hôm trước → reset streak về 0
- [ ] Unlock badge "First Lesson" → toast + animation, badge xuất hiện gallery
- [ ] Unlock badge "7-Day Streak" sau 7 ngày liên tục
- [ ] Streak widget hiển thị correctly trên header (🔥 7)
- [ ] Timezone đúng (user VN → 00:00 VN, không phải UTC)

**Code quality:**
- [ ] Activity record idempotent (gọi 2 lần không double-count)
- [ ] Badge criteria là JSON schema flexible (không hard-code if/else cho mỗi badge)
- [ ] Cron job logged, có alert nếu fail
- [ ] Transaction: UserStats update + UserAchievement insert atomic

#### 🚀 Stretch goals
- Streak freeze (skip 1 day mỗi tuần không reset)
- Streak reminder push notification (chuẩn bị M16)
- Achievement có rarity (common/rare/epic/legendary) với color khác

#### ⚠️ Common pitfall
- Timezone bug: user ở VN, server UTC, streak reset sai giờ
- Race condition: 2 request đồng thời → double increment streak (dùng row lock hoặc atomic UPDATE)
- Cron miss day (server down) → user mất streak oan → cần "grace period" 24h

---

### Module 16 — WebSocket Real-time Notification

**🎯 Mục tiêu sản phẩm:** Real-time push notification trong app (chuông + toast): teacher trả lời, course mới, streak reminder, ...

**🔗 Dependencies:** M2 | **🔓 Unlocks:** M17

#### 🖥️ Màn hình & UI chức năng

**[Student] Notification bell** (component trong header navbar)
- Mục đích: Indicator + quick access notification.
- UI: Icon chuông 🔔 + red badge count nếu có unread (vd: "3").
- Chức năng:
  - Click → dropdown popover hiện 10 notification gần nhất (icon theo type, content, timestamp relative)
  - Click 1 notification → mark read + navigate target (vd: course, lesson, comment)
  - Link "Xem tất cả" bottom dropdown → navigate `/me/notifications`

**[Student] Notifications page** (`/me/notifications`)
- Mục đích: Full list notification với filter.
- UI: Tabs filter (All / Unread / Mentions); list notification card (icon, content, timestamp, dot unread).
- Chức năng:
  - Button "Mark all as read" top right
  - Click notification → mark read + navigate
  - Infinite scroll load thêm khi scroll xuống
  - Auto-update real-time qua WebSocket (notification mới hiện ngay top)

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **WebSocket native API** (`new WebSocket(...)`)
  - **`useEffect` cleanup** — close WS khi unmount
  - **Reconnect logic** (exponential backoff)
  - **`useReducer` cho message queue**
  - **Notification bell** + dropdown + toast
  - **`useSyncExternalStore`** (advanced — subscribe to WS as external source) — optional
  - **Custom hook** (`useWebSocket`, `useNotifications`)
- **Reuse:** useContext, TanStack Query (fetch lịch sử)
- **Lib mới:** _none (native) hoặc `react-use-websocket` cho convenience_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **FastAPI WebSocket endpoint** (`@app.websocket("/ws")`)
  - **ConnectionManager class** — quản lý active connection
  - **Channel-based dispatch** (vd: `user:{id}` channel)
  - **WebSocket authentication** (qua query token hoặc cookie)
  - **JSON message protocol** (`{type, payload, timestamp}`)
  - **Async iteration** receive
- **Reuse:** dependency auth, JWT
- **Lib mới:** _none (FastAPI native)_

#### 🗄️ Database changes
- Tạo `Notification`: `id, user_id FK, type, payload_json, read_at NULL, created_at`
- Index `(user_id, created_at DESC)`, `(user_id, read_at)` cho unread count

#### 🌐 API endpoints
- `WS /ws/notifications` — connect với token, subscribe channel `user:{id}`
- `GET /notifications?unread_only=true` — list (cũng dùng cho initial load)
- `POST /notifications/{id}/read` — mark as read
- `POST /notifications/mark-all-read`

#### 📖 Pre-reading (~4h)
- [fastapi.tiangolo.com/advanced/websockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [react.dev/learn/synchronizing-with-effects](https://react.dev/learn/synchronizing-with-effects)
- [react.dev/reference/react/useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) (advanced)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Mở 2 tab → BE push notification → cả 2 tab nhận được
- [ ] Notification bell có badge unread count
- [ ] Click → mark as read, count giảm
- [ ] Disconnect WS (vd: tắt wifi) → auto-reconnect khi online lại
- [ ] WebSocket auth: invalid token → close connection ngay
- [ ] Notification persist DB (offline user mở lại thấy)
- [ ] Initial load qua REST, sau đó update qua WS

**Code quality:**
- [ ] Cleanup WS khi unmount (return từ useEffect)
- [ ] Reconnect với exponential backoff (1s, 2s, 4s, 8s, max 30s)
- [ ] ConnectionManager thread-safe (async lock nếu cần)
- [ ] Message schema validated (Pydantic cả 2 chiều)

#### 🚀 Stretch goals
- Browser Push Notification API (notify khi tab không focus)
- Sound notification
- Group notification ("3 new comments on your lesson")

#### ⚠️ Common pitfall
- KHÔNG cleanup → tab cũ vẫn nhận message → state lệch
- WS không heartbeat → proxy/firewall đóng silent → user nghĩ vẫn online
- Authentication trong handshake: cookie work tốt nhất, token query có risk log
- Single server: scale ngang fail (sẽ giải quyết ở M17 với Redis)

---

### Module 17 — WebSocket Discussion + Support Chat

**🎯 Mục tiêu sản phẩm:** In-lesson discussion (Q&A real-time mọi người xem được), Support chat 1-1 với Teacher.

**🔗 Dependencies:** M16 | **🔓 Unlocks:** _enables community_

#### 🖥️ Màn hình & UI chức năng

**[Student] In-lesson Discussion tab** (within lesson page — tab thứ 4)
- Mục đích: Q&A real-time với học sinh khác trong cùng lesson.
- UI: Tab "Discussion" trong lesson page, list message stack (avatar + name + content + timestamp); input bottom (textarea + button gửi); typing indicator + online presence dots.
- Chức năng:
  - Send message → optimistic UI hiện ngay (gray) + WS publish, confirm thành full color
  - Typing indicator (debounce 1s): "User X đang gõ..."
  - Online presence: green dot bên cạnh avatar user đang online
  - Reply trong thread (nested, parent_id)
  - Load older message khi scroll lên (infinite scroll lên trên)

**[Student] Support chat widget** (floating bubble bottom-right toàn site)
- Mục đích: Quick access support chat từ mọi page.
- UI: Floating FAB bubble góc phải dưới; click → expand chat panel (300x500px) bên góc; collapse trở lại bubble.
- Chức năng:
  - Lần đầu: hiện list teacher có thể chat → chọn teacher
  - Sau đó: hiện thread message với teacher đã chọn
  - Input + send + attach file (image, PDF)
  - Badge count unread trên bubble khi panel collapsed

**[Student] Support chat full-screen page** (`/support`)
- Mục đích: Full-screen view (alternative widget cho UX tốt hơn trên mobile).
- UI: Layout 2 cột — Left sidebar: list room (với teacher), main: chat thread của room đang chọn.
- Chức năng: Tương tự widget nhưng UX rộng rãi hơn, support nhiều room.

**[Teacher] Support inbox page** (`/teacher/support`)
- Mục đích: Teacher xem & reply mọi support chat của student.
- UI: Layout 2 cột — Sidebar trái: list room (student avatar + last message preview + unread badge + timestamp); Main: chat thread của room đang chọn.
- Chức năng:
  - Search student trong sidebar
  - Filter All / Unread / Resolved
  - Click room → mở thread
  - Reply message + attach
  - Button "Mark as resolved" (đóng room)

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Chat UI** (message bubble, auto-scroll, typing indicator)
  - **Virtualized list** (`@tanstack/react-virtual`) — list message dài
  - **Presence** (online dot)
  - **Read receipt**
  - **Optimistic message send** (hiện ngay, confirm sau)
  - **Infinite scroll lên trên** (load older message)
- **Reuse:** WebSocket hook (M16), TanStack Query (history)
- **Lib mới:** `@tanstack/react-virtual`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Room-based WebSocket** (`lesson:{id}`, `support:{room_id}`)
  - **Redis pub/sub** — fanout message giữa nhiều worker/server (chuẩn bị scale)
  - **Message persistence** + pagination
  - **Presence trong Redis** (TTL key per user-room)
  - **Rate limit** message (max 10 msg/sec/user)
- **Reuse:** ConnectionManager, WebSocket auth
- **Lib mới:** `redis[hiredis]` (async client)

#### 🗄️ Database changes
- Tạo `DiscussionThread`: `id, lesson_id FK, created_at`
- Tạo `DiscussionMessage`: `id, thread_id FK, user_id FK, content, parent_id NULL, edited_at, deleted_at, created_at`
- Tạo `SupportChatRoom`: `id, student_id FK, teacher_id FK, last_message_at, created_at`, UNIQUE `(student_id, teacher_id)`
- Tạo `SupportChatMessage`: `id, room_id FK, user_id FK, content, attachments_json, read_at, created_at`
- Index `(thread_id, created_at DESC)`, `(room_id, created_at DESC)`

#### 🌐 API endpoints
- `WS /ws/lessons/{id}/discussion` — connect room
- `WS /ws/support/{room_id}` — connect support chat
- `GET /lessons/{id}/discussion?cursor=...` — paginated history
- `POST /lessons/{id}/discussion` — send message (fallback nếu WS fail)
- `GET /support/rooms` — list room (cho teacher inbox)
- `POST /support/rooms` — student tạo room với teacher
- `POST /support/rooms/{id}/messages` — fallback REST send

#### 📖 Pre-reading (~5h)
- [redis.io/docs/manual/pubsub](https://redis.io/docs/manual/pubsub/)
- [Scaling WebSocket with Redis](https://websockets.readthedocs.io/en/stable/howto/django.html) (concept)
- [@tanstack/react-virtual docs](https://tanstack.com/virtual/latest)
- [Optimistic update pattern](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

#### ✅ Acceptance criteria
**Functional:**
- [ ] In-lesson discussion: 2 user mở cùng lesson → typing thấy nhau, send message thấy ngay
- [ ] Support chat: student tạo room với teacher → 2 bên chat real-time
- [ ] Message persist DB, reload thấy lại lịch sử
- [ ] Typing indicator (debounce 1s)
- [ ] Online presence (green dot)
- [ ] Optimistic send: message hiện ngay (gray), turn full color khi confirm
- [ ] Virtualized list cho >100 message không lag
- [ ] Rate limit: spam >10 msg/s bị throttle

**Code quality:**
- [ ] Redis pub/sub setup đúng (chuẩn bị deploy multi-worker)
- [ ] Message validate length + sanitize (chống XSS)
- [ ] Presence TTL refresh (heartbeat 30s)
- [ ] Room access check (student chỉ join room của mình)

#### 🚀 Stretch goals
- File attachment trong chat (image, PDF)
- Reply thread (parent_id đã có)
- Mention `@user` với notification (combine M16)
- Markdown support trong message
- Voice message (Web Audio recording)

#### ⚠️ Common pitfall
- Quên Redis pub/sub → deploy 2 server, message không sync giữa server
- Presence TTL quên refresh → user vẫn online nhưng hiện offline
- XSS: render message raw → injection script
- Optimistic update conflict: server reject (vd: bad word) → phải rollback UI

---

### Module 18 — Gamification full (XP + Leaderboard + League)

**🎯 Mục tiêu sản phẩm:** XP cho mỗi activity, weekly leaderboard với league system (Bronze → Silver → Gold → ...), animation level-up.

**🔗 Dependencies:** M15 | **🔓 Unlocks:** _completes gamification_

#### 🖥️ Màn hình & UI chức năng

**[Student] Leaderboard page** (`/leaderboard`)
- Mục đích: Bảng xếp hạng XP tuần.
- UI:
  - Top: tab "Current league" / "Friends" (optional); countdown đến reset Chủ Nhật 23:59 (vd: "Reset trong 2 ngày 14:23")
  - Main: table top 50 user trong league (rank, avatar, name, XP), my position highlighted (sticky row nếu out of top 50)
  - League badge top page (Bronze/Silver/Gold/Platinum/Diamond)
- Chức năng:
  - Click user row → profile page public (optional)
  - Auto-update qua WS khi XP change (real-time animation row di chuyển)
  - Click "?" icon → mở League info modal

**[Student] My XP history page** (`/me/xp`)
- Mục đích: Chart XP của user over time.
- UI: 
  - Date range picker (preset 7d/30d/all)
  - Line chart XP per day (Recharts)
  - Breakdown by source (pie chart: lesson/quiz/streak/achievement)
  - Table chi tiết XP transaction
- Chức năng: Hover chart show tooltip; click breakdown segment → filter transaction list.

**[Student] League info modal**
- Mục đích: Giải thích league system cho user lần đầu.
- UI: Modal hiện hierarchy badges (Bronze → Silver → Gold → Platinum → Diamond) với min XP/promote criteria; rule "Top 10% promote, bottom 20% demote mỗi tuần".
- Chức năng: Mở từ leaderboard "?" icon hoặc lần đầu user vào leaderboard.

**[Student] Level up overlay** (full-screen)
- Mục đích: Celebration khi user level up (XP đạt ngưỡng).
- UI: Full-screen overlay với confetti animation (react-confetti) + big text "🎉 Lên Level 5!" + reward (vd: badge mới, +50 XP bonus).
- Chức năng: Button "Tiếp tục" → close overlay; auto-trigger khi level update từ WS hoặc API response.

**[Student] XP gain toast** (mini animation)
- Mục đích: Hiển thị "+X XP" floating sau mỗi activity.
- UI: Number float từ activity (vd: lesson done button) lên header XP bar, fade out trong 2s.
- Chức năng: Auto-trigger khi server confirm XP transaction; queue nếu nhiều cùng lúc.

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Framer Motion** — animation level-up, XP gain, achievement reveal
  - **TanStack Table** advanced (leaderboard với rank, sort, filter)
  - **Real-time chart** (Recharts cho XP history)
  - **Confetti animation** khi level up (react-confetti)
- **Reuse:** TanStack Query, WebSocket (notify level up)
- **Lib mới:** `framer-motion`, `react-confetti`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Redis sorted set** (ZADD, ZREVRANGE) — leaderboard O(log N)
  - **Weekly cron** (Sunday 23:59 VN) — reset leaderboard, promote/demote league
  - **XP calculation** rules (lesson=10xp, quiz pass=20xp, streak=5xp/day, ...)
  - **League algorithm** (top 10% promote, bottom 20% demote)
  - **Background job pattern** — heavy aggregation async
- **Reuse:** ARQ scheduled, Redis client
- **Lib mới:** _none thêm_

#### 🗄️ Database changes
- Tạo `XPTransaction`: `id, user_id FK, amount, source, source_id, created_at`
- Tạo `LeaderboardEntry`: `week_start, user_id FK, xp, rank, league_tier, PRIMARY KEY (week_start, user_id)`
- Tạo `League`: `id, name, tier, min_xp_to_promote, max_xp_to_demote, icon_url`
- Update UserStats: thêm `current_league_id` FK

#### 🌐 API endpoints
- `GET /leaderboard/weekly?league=gold` — top 50 hiện tại
- `GET /me/league` — current league, position, XP cần để promote
- `GET /me/xp/history?period=week` — line chart
- Internal: cron `leaderboard_reset_weekly` (Sunday 23:59)

#### 📖 Pre-reading (~4h)
- [redis.io/commands/zadd](https://redis.io/commands/zadd/) — sorted set
- [www.framer.com/motion](https://www.framer.com/motion/)
- [Recharts examples](https://recharts.org/en-US/examples)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Complete lesson → +10 XP, animation "+10 XP" floating
- [ ] Pass quiz score 100% → +30 XP
- [ ] Streak daily bonus → +5 XP
- [ ] Level up animation (Framer Motion + confetti)
- [ ] Leaderboard live update (XP của user khác)
- [ ] Weekly Sunday 23:59: reset, top 10% promote, bottom 20% demote, notification
- [ ] User mới start ở Bronze league
- [ ] Leaderboard chỉ hiện user cùng league (giới hạn 50 user/league)

**Code quality:**
- [ ] Redis sorted set update atomic (ZINCRBY)
- [ ] Cron có retry + alert nếu fail
- [ ] Animation không trigger re-render performance hit
- [ ] XPTransaction là source of truth (Redis chỉ là cache, có thể rebuild)

#### 🚀 Stretch goals
- Daily league snapshot (cho user xem history)
- Friend leaderboard (riêng cho follow list)
- Seasonal event (double XP weekend)
- Achievement rare cho top 1% league

#### ⚠️ Common pitfall
- Redis là cache, KHÔNG là source of truth → rebuild được từ XPTransaction nếu Redis down
- Cron race condition (reset chưa xong → user mới đã có data tuần mới) → lock hoặc grace period
- Animation lag: trigger nhiều cùng lúc → debounce hoặc queue

---

### Module 19 — Course Preview + Review/Rating + Coupon

**🎯 Mục tiêu sản phẩm:** User xem 1-2 lesson preview free, để lại 5-star review sau khi học, apply coupon code lúc checkout.

**🔗 Dependencies:** M12, M13 | **🔓 Unlocks:** _completes monetization features_

#### 🖥️ Màn hình & UI chức năng

**[Student] Reviews section** (within Course detail page — tab "Reviews")
- Mục đích: Hiển thị review của user khác về course.
- UI:
  - Top: average rating big (vd: "4.8 ★") + breakdown bar chart (5⭐ X%, 4⭐ Y%, ...) + total review count
  - Filter: sort by Most Recent / Most Helpful, filter by star rating
  - List review card: avatar + name, star, comment, date, button "Helpful" (count)
  - Pagination/load more
- Chức năng:
  - Sort + filter → query
  - Button "Viết review" top (chỉ enrolled user — disabled với tooltip nếu chưa enroll)
  - Click "Helpful" → +1 vote

**[Student] Review form modal**
- Mục đích: User viết hoặc edit review của mình.
- UI: Modal với star rating input (5 stars click chọn) + textarea comment (placeholder "Chia sẻ trải nghiệm học course này...") + char counter.
- Chức năng:
  - Submit → POST `/courses/{id}/reviews` (hoặc PATCH nếu đã có)
  - Edit/Delete own review (button bên review của mình)

**[Admin] Coupon management page** (`/admin/coupons`)
- Mục đích: CRUD coupon code marketing.
- UI: Table coupon: code, discount type (%/fixed VND), amount, max uses, used count, expires_at, active toggle.
- Chức năng:
  - Button "Tạo coupon mới" → coupon create/edit modal
  - Click row → edit modal
  - Toggle active/inactive inline
  - Filter active/expired/all

**[Admin] Coupon create/edit modal**
- Mục đích: Form CRUD 1 coupon.
- UI: Form: code (input + button auto-generate), discount type (radio % off / fixed VND), amount (number), max uses, per-user limit, expires_at (date picker), active toggle.
- Chức năng: Validate RHF + Zod; submit → POST/PATCH.

(**Course preview UI** đã có ở M13 — module này chỉ enable thêm "free preview lesson" cho non-enrolled user xem được)

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Star rating component** (interactive)
  - **Review form** với Zod validation
  - **Coupon input** + real-time validate
  - **Feature flag pattern** (preview vs locked)
- **Reuse:** RHF + Zod, TanStack Query mutation, conditional render
- **Lib mới:** _none (star rating tự build hoặc dùng shadcn variant)_

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Coupon validation logic** (active, not expired, usage limit, user limit)
  - **Apply discount** atomic với payment creation
  - **Review CRUD** với check (user phải đã enroll mới review)
  - **Aggregation** average rating (cron hoặc compute on read)
- **Reuse:** CRUD, transaction
- **Lib mới:** _none_

#### 🗄️ Database changes
- Tạo `CourseReview`: `id, course_id FK, user_id FK, rating (1-5), comment, created_at, updated_at`, UNIQUE `(course_id, user_id)` (mỗi user 1 review/course)
- Tạo `Coupon`: `id, code UNIQUE, discount_percent NULL, discount_amount NULL, max_uses, used_count, per_user_limit, expires_at, is_active, created_at`
- Tạo `CouponUsage`: `id, coupon_id FK, user_id FK, payment_id FK, discount_applied, used_at`
- Course: thêm `average_rating`, `review_count` (denormalize, update via trigger hoặc cron)

#### 🌐 API endpoints
- `GET /courses/{slug}/reviews?page=...` — list review
- `POST /courses/{slug}/reviews` — create (require enrolled)
- `PATCH /reviews/{id}` — edit own review
- `DELETE /reviews/{id}` — delete own
- `POST /coupons/validate` — body `{code, course_id}` → return discount amount or error
- Admin: `POST /admin/coupons` — create coupon

#### 📖 Pre-reading (~2h)
- [zod.dev/?id=basic-usage](https://zod.dev/?id=basic-usage)
- [Star rating accessible pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] User chưa enroll → KHÔNG thấy form review (chỉ xem review của người khác)
- [ ] User enroll rồi → form 5-star + textarea, submit OK
- [ ] Course detail hiển thị average rating, count, distribution (5⭐ X%, 4⭐ Y%, ...)
- [ ] Coupon valid → giảm giá hiện ngay tại checkout
- [ ] Coupon expired/used up/wrong → error rõ ràng
- [ ] Per-user limit: 1 user dùng coupon 1 lần (config)
- [ ] Review có moderation flag (hide nếu rating <2 + spam pattern) — optional

**Code quality:**
- [ ] Coupon validate atomic (race: 2 user dùng coupon last use cùng lúc)
- [ ] Review xóa: soft delete để moderation tham khảo
- [ ] Average rating denormalize: update sau mỗi review (trigger hoặc service)

#### 🚀 Stretch goals
- Review reply (teacher reply review của mình)
- Helpful vote (đánh giá review)
- Coupon BOGO (Buy One Get One)
- Bulk coupon import (CSV)

#### ⚠️ Common pitfall
- Quên enrolled check → fake review từ user chưa mua
- Coupon validation chỉ FE → user bypass discount
- Average rating recompute mỗi request → slow → denormalize hoặc cache
- 2 user dùng coupon last use cùng lúc → over-redeem (dùng SELECT FOR UPDATE)

---

## Phase 6 — Production-ready (M20–M23)

---

### Module 20 — Email transactional (Welcome, Receipt, Reminder)

**🎯 Mục tiêu sản phẩm:** Email tự động cho events: signup welcome, password reset, purchase receipt, streak reminder.

**🔗 Dependencies:** M2, M12, M15 | **🔓 Unlocks:** _completes user lifecycle_

#### 🖥️ Màn hình & UI chức năng

**[Admin] Email log page** (`/admin/emails`)
- Mục đích: Xem mọi email đã gửi (status, error, provider message id).
- UI: Table cột: recipient, template (welcome/receipt/streak-reminder/...), status (sent/failed/bounced/complained), sent_at, error message; filter sidebar (template, status, date range, user search).
- Chức năng:
  - Click row → detail modal hiện rendered HTML email
  - Button "Resend" cho failed email
  - Export CSV

**[Admin] Email template preview page** (`/admin/emails/templates`)
- Mục đích: Preview template trước go-live, test send.
- UI: Dropdown chọn template; form fill test data (vd: user name, course name, amount); pane preview rendered HTML (responsive viewport switcher).
- Chức năng:
  - Auto-render preview khi data thay đổi
  - Button "Send test to me" → gửi sample đến email admin
  - Edit template inline (optional - advanced)

**[Student] Email preferences page** (`/me/preferences/emails`)
- Mục đích: User opt-in/out từng loại email.
- UI: List checkbox group:
  - Essential (không tắt được): welcome, password reset, purchase receipt
  - Engagement: streak reminder, weekly digest
  - Marketing: new course alert, promo
- Chức năng: Toggle → PATCH `/me/preferences/emails` → save settings.

**Lưu ý:** Email transactional (welcome, receipt, reset password) gửi tự động ở background, KHÔNG có UI Student-facing trực tiếp (chỉ hiện trong inbox email của user).

#### ⚛️ React (Frontend)
- **Headline (mới):** _ít React new — focus BE_
  - **Email preview tool** (admin xem preview email trước khi send) — optional
- **Reuse:** form (cho admin)
- **Lib mới:** `react-email` (optional — viết email template bằng React)

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Resend client** (modern email API)
  - **Jinja2 template** rendering
  - **ARQ background job** — send email async (KHÔNG block request)
  - **Retry logic** với exponential backoff
  - **EmailLog** tracking (sent/failed/bounced)
  - **Webhook Resend** — bounce, complaint (cho list hygiene)
- **Reuse:** ARQ (đã có từ M15)
- **Lib mới:** `resend`, `jinja2`

#### 🗄️ Database changes
- Tạo `EmailLog`: `id, user_id FK, template, subject, status, provider_message_id, sent_at, error, created_at`
- Index `(user_id, sent_at DESC)`, `(template, sent_at)`

#### 🌐 API endpoints
- Internal services (không expose public):
  - `send_welcome_email(user)`
  - `send_password_reset(user, token)`
  - `send_purchase_receipt(user, purchase)`
  - `send_streak_reminder(user)` (cron daily)
- `POST /webhooks/resend` — bounce/complaint handler
- Admin: `POST /admin/email-test` — gửi test email

#### 📖 Pre-reading (~3h)
- [resend.com/docs](https://resend.com/docs)
- [jinja.palletsprojects.com](https://jinja.palletsprojects.com)
- [Email best practices (HTML + plain text fallback)](https://kinsta.com/blog/html-email/)
- [mailpit.axllent.org](https://mailpit.axllent.org) — local mail testing

#### ✅ Acceptance criteria
**Functional:**
- [ ] Local dev: email gửi vào Mailpit (Docker), không spam Resend
- [ ] Signup → welcome email (with i18n theo locale user)
- [ ] Password reset request → email với reset link (token 1-time, expire 1h)
- [ ] Purchase complete → receipt email với invoice PDF (optional) hoặc HTML
- [ ] Cron daily: gửi streak reminder cho user có streak >3 và chưa active hôm nay
- [ ] User can opt-out (preference page) — exclude khỏi non-essential email
- [ ] Bounce webhook → flag email invalid trong DB

**Code quality:**
- [ ] Email gửi qua ARQ queue, KHÔNG block request
- [ ] Template Jinja2 inheritance (base layout + per-email block)
- [ ] Plain text + HTML version
- [ ] Retry on transient failure (network, rate limit)
- [ ] KHÔNG log email content (PII)

#### 🚀 Stretch goals
- React Email templates (TSX-based)
- A/B test subject line
- Personalization tags
- Unsubscribe link required (CAN-SPAM compliance — quan trọng nếu mở rộng)

#### ⚠️ Common pitfall
- Block request để send email → timeout, slow signup
- Quên opt-out → spam user, list bị flag
- Hard-code subject/content → khó i18n
- Template không escape HTML → injection
- Send từ domain chưa verify DKIM/SPF → vào spam

---

### Module 21 — Performance optimization

**🎯 Mục tiêu sản phẩm:** App load nhanh (LCP <2.5s), interaction mượt (INP <200ms), không jank khi list dài.

**🔗 Dependencies:** M20 | **🔓 Unlocks:** _production-ready perf_

#### 🖥️ Màn hình & UI chức năng

**Không có màn hình end-user mới** — module này là refactor performance (lazy load, memoize, virtualize, code split, query optimization). User chỉ cảm nhận app **nhanh hơn**, không có UI mới.

**(Dev only)** Bundle analyzer (vite-bundle-visualizer) chạy local dev, hiện treemap bundle size — không phải UI app.

**(Internal monitoring)** Web Vitals (LCP/INP/CLS) gửi lên analytics provider — không có dashboard riêng (xem trong M23 admin analytics).

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **`React.lazy` + `Suspense`** — code splitting per-route
  - **Vite bundle analyzer** (`vite-bundle-visualizer`)
  - **`React.memo`** — đúng cách (chỉ khi đo có ích)
  - **`useMemo`/`useCallback`** revisit — khi nào, khi nào KHÔNG
  - **TanStack Virtual** — virtualize long list (leaderboard, lesson list)
  - **Image optimization** (WebP, srcset, lazy load native)
  - **Debounce/throttle** event (scroll, resize)
  - **React Profiler** — measure render
- **Reuse:** TanStack Query (cache strategy)
- **Lib mới:** `@tanstack/react-virtual`, `vite-bundle-visualizer` (dev), `web-vitals`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Query optimization** — EXPLAIN ANALYZE, index, N+1 fix
  - **Connection pool tuning** (`pool_size`, `max_overflow`)
  - **Response cache** với Redis (cache per endpoint với TTL)
  - **GZip middleware** (auto compress response)
  - **Background heavy work** (move sync logic vào ARQ)
- **Reuse:** Redis, ARQ
- **Lib mới:** _none (FastAPI native + Redis)_

#### 🗄️ Database changes
- Add index cho các slow query (đo bằng `pg_stat_statements`)
- Optional: materialized view cho analytics

#### 🌐 API endpoints
- _không endpoint mới — optimize existing_

#### 📖 Pre-reading (~5h)
- [react.dev/learn/render-and-commit](https://react.dev/learn/render-and-commit)
- [tkdodo.eu/blog/the-uphill-battle-of-memoization](https://tkdodo.eu/blog/the-uphill-battle-of-memoization)
- [web.dev/vitals](https://web.dev/vitals) — LCP, INP, CLS
- [PostgreSQL query optimization](https://use-the-index-luke.com)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Lighthouse score >90 trên trang chính
- [ ] LCP <2.5s, INP <200ms, CLS <0.1
- [ ] Bundle size: main chunk <200KB gzipped
- [ ] Leaderboard 1000 entries scroll smooth (virtualized)
- [ ] Image lazy load với placeholder blur
- [ ] All slow API (`> 500ms`) đã index/optimize

**Code quality:**
- [ ] Memoization có lý do rõ (đo profiler, không bừa bãi)
- [ ] Route-level code splitting (mỗi page lazy load)
- [ ] Database query có EXPLAIN, không N+1
- [ ] Web Vitals đo + gửi lên analytics

#### 🚀 Stretch goals
- Service Worker pre-cache (PWA basic)
- HTTP/2 push (nếu Cloudflare CDN)
- Critical CSS inline
- Read replica cho heavy read

#### ⚠️ Common pitfall
- `React.memo` bừa bãi: tăng compare cost, không giảm render
- Premature optimization: optimize trước khi đo
- `useMemo` cho primitive value: tốn hơn không dùng
- Index quá nhiều: chậm write

---

### Module 22 — Testing (Unit + Integration + E2E)

**🎯 Mục tiêu sản phẩm:** Test coverage >60%, có thể refactor không sợ regression.

**🔗 Dependencies:** _xuyên suốt — bắt đầu test từ M2, M22 là consolidate + E2E_

#### 🖥️ Màn hình & UI chức năng

**Không có màn hình end-user** — module này là testing infrastructure thuần (Vitest + RTL + Playwright + pytest). KHÔNG ảnh hưởng UI runtime.

**(Internal CI)** Test report hiện trong GitHub Actions PR check, không phải UI app.

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Vitest** setup
  - **React Testing Library** — test theo user behavior (NOT implementation)
  - **MSW (Mock Service Worker)** — mock API call
  - **Playwright** — E2E test (login → mua course → học lesson)
  - **Custom render** helper (wrap providers)
  - **Test pyramid** philosophy
- **Reuse:** _testing concepts apply to all modules_
- **Lib mới:** `vitest`, `@testing-library/react`, `@testing-library/user-event`, `msw`, `@playwright/test`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **pytest + pytest-asyncio**
  - **httpx.AsyncClient + ASGITransport** — test async endpoint
  - **Database fixture** với transaction rollback
  - **factory-boy** / **polyfactory** — generate test data
  - **respx** — mock HTTP calls
  - **Override dependencies** (`app.dependency_overrides`)
- **Reuse:** _xuyên suốt_
- **Lib mới:** `pytest`, `pytest-asyncio`, `pytest-cov`, `httpx`, `factory-boy`, `respx`, `pytest-xdist` (parallel)

#### 🗄️ Database changes
- Test DB riêng (vd: `lang_app_test`)
- Migration tự động ở fixture setup

#### 🌐 API endpoints
- _no new — test existing_

#### 📖 Pre-reading (~6h)
- [testing-library.com/docs/guiding-principles](https://testing-library.com/docs/guiding-principles)
- [kentcdodds.com/blog/common-mistakes-with-react-testing-library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [playwright.dev/docs/intro](https://playwright.dev/docs/intro)
- [pytest-asyncio docs](https://pytest-asyncio.readthedocs.io)
- [fastapi.tiangolo.com/advanced/async-tests](https://fastapi.tiangolo.com/advanced/async-tests/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] FE: critical component có test (LoginForm, CourseCard, QuizEngine, Paywall)
- [ ] BE: critical service có test (auth, payment, gamification, quiz grade)
- [ ] E2E: 3 happy path (signup → learn lesson, browse → buy course, teacher → create course)
- [ ] CI: tests chạy trong GitHub Actions, fail block merge

**Code quality:**
- [ ] Test theo user behavior (`getByRole`, không `getByTestId` trừ khi cần)
- [ ] Mock external (Resend, VNPay) — KHÔNG hit real API trong test
- [ ] DB test isolated (transaction rollback hoặc separate test DB)
- [ ] Coverage >60% (target realistic, không obsess 100%)
- [ ] Tests chạy <2 phút (parallel với pytest-xdist)

#### 🚀 Stretch goals
- Visual regression (Chromatic, Percy)
- Mutation testing (mutmut, stryker)
- Contract testing (Pact) nếu sau này split microservice
- Load test (locust, k6) cho /payment endpoint

#### ⚠️ Common pitfall
- Test implementation chi tiết → brittle, fail mỗi refactor
- Mock quá nhiều → test không phản ánh reality
- Test DB không rollback → state leak giữa test
- Test slow do hit real API → mock với respx/MSW

---

### Module 23 — Admin analytics dashboard

**🎯 Mục tiêu sản phẩm:** Admin xem business metrics: DAU/MAU, revenue, top course, completion rate, churn.

**🔗 Dependencies:** M12, M15 | **🔓 Unlocks:** _data-driven decisions_

#### 🖥️ Màn hình & UI chức năng

**[Admin] Analytics dashboard** (`/admin/analytics`)
- Mục đích: Overview business metrics.
- UI:
  - Top: date range picker (preset 7d/30d/90d/custom)
  - Grid 6 KPI cards: DAU, MAU, daily revenue, new users, active courses, completion rate (mỗi card có sparkline mini + delta % so với period trước)
  - Revenue line chart (last 30 days)
- Chức năng:
  - Date range change → refetch tất cả data
  - Click KPI card → drill-down page tương ứng
  - Auto-refresh mỗi 5 phút (optional)

**[Admin] Revenue chart page** (`/admin/analytics/revenue`)
- Mục đích: Detail revenue analytics.
- UI:
  - Line chart with toggle group by (day/week/month)
  - Table breakdown by course (top 10 by revenue)
  - Pie chart by payment provider (VNPay/MoMo/ZaloPay)
- Chức năng:
  - Toggle group by → re-render chart
  - Button "Export CSV" → download data
  - Click course row → course analytics page

**[Admin] Course analytics page** (`/admin/analytics/courses`)
- Mục đích: Per-course performance.
- UI: Table top courses theo metric chọn (revenue / enrollment / completion rate / rating); sort by column; search course.
- Chức năng:
  - Click course → drill-down chi tiết course đó (enrollment trend, completion funnel, rating distribution)
  - Filter date range, language, teacher

**[Admin] Funnel page** (`/admin/analytics/funnel`)
- Mục đích: Conversion funnel của user.
- UI: Funnel chart hierarchy: signup → first lesson → first purchase → course complete; conversion rate giữa các step (vd: "Signup → first lesson: 65%").
- Chức năng:
  - Date range picker
  - Segment dropdown (organic / paid / referral) — optional advanced

#### ⚛️ React (Frontend)
- **Headline (mới):**
  - **Recharts** — line, bar, pie, area chart
  - **Date range picker** (shadcn DatePicker)
  - **Dashboard layout** (grid, responsive)
  - **Real-time chart update** (poll hoặc WS)
  - **Export CSV/PDF**
- **Reuse:** TanStack Query, TanStack Table
- **Lib mới:** `recharts`, `date-fns`

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **Aggregation queries** (SUM, AVG, COUNT, window functions)
  - **GROUP BY date** với generate_series
  - **Materialized view** (cho heavy aggregation)
  - **Scheduled refresh** materialized view (ARQ cron)
  - **Caching aggregate** (Redis với TTL 5-10 min)
- **Reuse:** Redis, ARQ
- **Lib mới:** _none_

#### 🗄️ Database changes
- Materialized view (optional, cho heavy):
  - `mv_daily_revenue (date, revenue, transaction_count)`
  - `mv_course_stats (course_id, enrollment_count, completion_rate, average_rating)`
- Refresh cron daily

#### 🌐 API endpoints
- `GET /admin/analytics/overview?period=7d` — DAU, MAU, revenue, new users
- `GET /admin/analytics/revenue?from=&to=&group_by=day` — chart data
- `GET /admin/analytics/courses/top?limit=10` — top by revenue/enrollment
- `GET /admin/analytics/funnel` — signup → enroll → complete funnel
- `GET /admin/analytics/cohort` — retention cohort

#### 📖 Pre-reading (~3h)
- [recharts.org/en-US/examples](https://recharts.org/en-US/examples)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html)
- [PostgreSQL materialized view](https://www.postgresql.org/docs/current/sql-creatematerializedview.html)
- [Cohort analysis basics](https://amplitude.com/blog/cohort-analysis)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Dashboard overview: 6 KPI card (DAU, MAU, MRR / Daily Revenue, New users, Active courses, Completion rate)
- [ ] Revenue chart (last 30 days, daily)
- [ ] Top 10 course by revenue/enrollment
- [ ] Funnel: signup → first lesson → first purchase → first course complete
- [ ] Date range picker (preset: 7d, 30d, 90d, custom)
- [ ] Export CSV
- [ ] Page load <2s (materialized view + cache)

**Code quality:**
- [ ] Admin-only RBAC
- [ ] Aggregation cache Redis 5-10min
- [ ] Materialized view refresh cron logged
- [ ] Date timezone đúng (VN)

#### 🚀 Stretch goals
- Real-time WS update (number active user right now)
- Drill-down (click chart → detail table)
- Custom dashboard (user pin metric của mình)
- Anomaly detection (alert nếu revenue drop >30% so với trung bình)

#### ⚠️ Common pitfall
- Query full table mỗi load → slow → materialized view
- Aggregate fresh data critical → cache TTL phải reasonable
- Number format không locale → confused (123,456.78 vs 123.456,78)

---

## Phase 7 — Mobile + Deploy (M24–M26)

---

### Module 24 — React Native app (cùng business logic)

**🎯 Mục tiêu sản phẩm:** Mobile app iOS + Android với core feature (course browse, lesson play, quiz). Share business logic với web qua monorepo.

**🔗 Dependencies:** M19, M22 | **🔓 Unlocks:** M25

#### 🖥️ Màn hình & UI chức năng

**Mobile screens DEFER** — theo lựa chọn của user, mobile screens chưa list chi tiết ở roadmap này. Mobile app sẽ **mirror** core web screens với UX native khác:

- Bottom tab navigation thay vì top navbar (Home / Learn / Leaderboard / Profile)
- Native gesture (swipe to navigate, pull-to-refresh)
- Native components (FlatList thay List, BottomSheet thay Modal, Native StackNavigator)
- Mobile-specific: SafeAreaView, status bar handling, biometric auth (optional), camera permission (cho upload avatar)

**Core screens cần build cho mobile MVP** (sẽ detail khi vào phase này):
1. Bottom tab: Home → Course list, Learn → Current course với resume, Leaderboard, Profile (settings + logout)
2. Course detail screen (curriculum + buy)
3. Lesson player screen (native video, Expo AV hoặc react-native-video)
4. Quiz player screen
5. Streak/XP widget
6. Notification screen

#### ⚛️ React Native (Frontend mobile)
- **Headline (mới):**
  - **Expo SDK 51+** — managed workflow
  - **React Navigation v6** — Stack/Tab/Drawer
  - **Native styling** (StyleSheet) vs Tailwind (NativeWind)
  - **FlatList** — performant list
  - **SafeAreaView** + insets
  - **AsyncStorage** / **SecureStore** — persistent state
  - **Expo Image** — optimized image
  - **Gesture & Animation** (`react-native-reanimated`, `react-native-gesture-handler`)
  - **Deep linking**
- **Reuse:** Business logic from web (queryFn, validation schema, types)
- **Lib mới:** `expo`, `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `expo-secure-store`, `nativewind`, `react-native-reanimated`

#### 🏗️ Monorepo
- **Headline (mới):**
  - **Turborepo** hoặc **pnpm workspace**
  - Folder structure:
    ```
    apps/
      web/        # React Vite
      mobile/     # Expo
      backend/    # FastAPI
    packages/
      api-client/    # Shared API calls (TanStack Query hooks)
      types/         # Shared TS types (codegen từ OpenAPI)
      schemas/       # Shared Zod schemas
      business-logic/  # Pure functions (quiz grade, XP calc)
    ```
  - **OpenAPI codegen** (`openapi-typescript`) — type-safe API client từ FastAPI schema
- **Lib mới:** `turbo`, `openapi-typescript`

#### 🐍 FastAPI (Backend)
- _Hầu hết không đổi_ — same API serve cả web + mobile
- Có thể thêm: `/v1` prefix cho mobile-specific behavior nếu cần

#### 🗄️ Database changes
- _none_

#### 🌐 API endpoints
- _reuse existing_

#### 📖 Pre-reading (~10h — phase lớn)
- [docs.expo.dev/get-started/introduction](https://docs.expo.dev/get-started/introduction/)
- [reactnavigation.org/docs/getting-started](https://reactnavigation.org/docs/getting-started)
- [docs.swmansion.com/react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [turbo.build/repo/docs](https://turbo.build/repo/docs)
- [nativewind.dev](https://nativewind.dev) — Tailwind cho RN

#### ✅ Acceptance criteria
**Functional:**
- [ ] App run trên iOS Simulator + Android Emulator
- [ ] Bottom tab: Home (course list), Learn (current course), Leaderboard, Profile
- [ ] Login/Signup work (email + Google OAuth qua Expo AuthSession)
- [ ] Course list + detail render đúng
- [ ] Lesson play video (Expo AV hoặc react-native-video)
- [ ] Quiz core (MC, fill-in) work
- [ ] Offline: ít nhất xem được course đã enrolled (cache TanStack Query)
- [ ] Streak widget + XP hiển thị đồng bộ với web

**Code quality:**
- [ ] Business logic share `packages/business-logic` — web + mobile import cùng module
- [ ] API client shared (TanStack Query hooks)
- [ ] Type-safe API (codegen từ FastAPI OpenAPI)
- [ ] Platform-specific code dùng `.ios.tsx` / `.android.tsx` extension

#### 🚀 Stretch goals
- Offline-first (sync queue)
- Dark mode + system theme
- Haptic feedback (Expo Haptics)
- Sharing course (Expo Sharing)

#### ⚠️ Common pitfall
- Mix concept web (DOM) vào RN code → fail (RN không có `<div>`, `<button>`)
- shadcn/ui KHÔNG dùng được cho RN (chỉ web)
- Animation performance khác web — phải dùng Reanimated (native thread)
- Expo SDK upgrade phải đồng bộ tất cả lib
- iOS Simulator chỉ chạy được trên Mac

---

### Module 25 — Mobile push + IAP

**🎯 Mục tiêu sản phẩm:** Push notification native, In-App Purchase qua Apple/Google (bắt buộc cho digital goods trong app).

**🔗 Dependencies:** M24 | **🔓 Unlocks:** _monetization mobile_

#### 🖥️ Màn hình & UI chức năng

**Mobile-specific, DEFER** — sẽ detail khi vào phase. Brief list:

- **Notification permission prompt** (1st app open): native dialog của iOS/Android
- **Settings → Notifications screen**: toggle các loại notification (giống email preferences nhưng cho push)
- **IAP product list screen**: hiện course có thể mua qua IAP với giá đã convert theo Apple/Google billing
- **IAP purchase flow**: native sheet của App Store / Play Store (không build, là system UI)
- **IAP receipt validating screen**: loading + result sau khi mua

#### ⚛️ React Native (Frontend)
- **Headline (mới):**
  - **Expo Notifications** — register device, handle notification
  - **Deep linking** từ notification
  - **`react-native-iap`** hoặc **Expo IAP** — purchase UI
  - **Receipt validation client → server** flow
- **Reuse:** AsyncStorage, navigation
- **Lib mới:** `expo-notifications`, `react-native-iap` (hoặc `expo-in-app-purchases`)

#### 🐍 FastAPI (Backend)
- **Headline (mới):**
  - **APNs + FCM** push (qua Expo Push Service hoặc trực tiếp)
  - **Apple receipt validation** (App Store Server API)
  - **Google Play receipt validation** (Google Play Developer API)
  - **Server-side IAP unlock** — KHÔNG trust client
  - **DeviceToken management** (register, unregister)
- **Reuse:** background job (gửi push async)
- **Lib mới:** `exponent-server-sdk-python` (Expo Push), `google-api-python-client` (Play), Apple uses HTTPS

#### 🗄️ Database changes
- Tạo `DeviceToken`: `id, user_id FK, platform, token, app_version, locale, created_at, last_used_at`
- Tạo `IAPReceipt`: `id, user_id FK, platform, transaction_id UNIQUE, product_id, raw_receipt, verified_at, status (verified/failed), created_at`

#### 🌐 API endpoints
- `POST /me/device-tokens` — register device
- `DELETE /me/device-tokens/{token}` — unregister
- `POST /iap/apple/verify` — body `{receipt}` → verify Apple → unlock
- `POST /iap/google/verify` — body `{purchase_token, product_id}` → verify Google → unlock
- `POST /webhooks/apple-server-notifications` — subscription event (renewal, cancel)
- `POST /webhooks/google-rtdn` — Google Real-time Developer Notifications

#### 📖 Pre-reading (~6h)
- [docs.expo.dev/push-notifications/overview](https://docs.expo.dev/push-notifications/overview/)
- [github.com/dooboolab-community/react-native-iap](https://github.com/dooboolab-community/react-native-iap)
- [developer.apple.com/documentation/appstoreserverapi](https://developer.apple.com/documentation/appstoreserverapi)
- [developer.android.com/google/play/billing/integrate](https://developer.android.com/google/play/billing/integrate)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Lần đầu mở app: request notification permission
- [ ] Token register lên BE
- [ ] BE trigger push (vd: streak reminder) → user nhận trên device
- [ ] Click notification → deep link đến screen đúng
- [ ] IAP: list product (course) → mua → Apple/Google verify → BE verify lại → unlock course
- [ ] Restore purchase work (user reinstall app)
- [ ] Subscription (nếu mở rộng sau): handle renewal, cancel qua webhook

**Code quality:**
- [ ] **NEVER trust client IAP** — always server-side verify
- [ ] Token revoked → unregister khỏi BE
- [ ] Deep link map clear: `lang-app://course/123` → CourseDetail
- [ ] Webhook idempotent

#### 🚀 Stretch goals
- RevenueCat integration (đơn giản hóa IAP cross-platform)
- Promotional offers (Apple subscription)
- Family sharing support

#### ⚠️ Common pitfall (CRITICAL)
- **Apple cắt 30%** — phải tính vào price hoặc UI hiển thị giá khác web
- **Apple cấm**: link sang web để mua (vi phạm guideline 3.1.1, app bị reject)
- Quên verify receipt server-side → user fake unlock
- iOS Simulator KHÔNG test IAP được — phải device thật + sandbox tester
- Test với sandbox account (StoreKit) trước prod

---

### Module 26 — Deploy + CI/CD

**🎯 Mục tiêu sản phẩm:** Live production: web trên Vercel, API trên Railway/Fly, mobile app build qua EAS, CI/CD auto deploy khi push main.

**🔗 Dependencies:** M22 | **🔓 Unlocks:** _LIVE_

#### 🖥️ Màn hình & UI chức năng

**Không có màn hình end-user** — module này là infrastructure & CI/CD thuần (Docker, GitHub Actions, deploy provider).

**(Internal)** Các dashboard third-party không phải UI build:
- Vercel dashboard (deployment + analytics)
- Railway/Fly.io dashboard (server logs + metrics)
- Sentry dashboard (error tracking)
- BetterUptime dashboard (uptime monitoring)
- GitHub Actions runs

**(Backend endpoints không UI)** `/health` và `/ready` chỉ return JSON cho monitoring/load balancer probe.

#### 🏗️ Infrastructure
- **Headline (mới):**
  - **Docker** — multi-stage build cho FastAPI image
  - **docker-compose** — local dev (postgres + redis + mailpit)
  - **GitHub Actions** — workflow lint → test → build → deploy
  - **Environment secrets** management (GitHub Secrets, Doppler, Vault)
  - **Deploy strategies:**
    - FE web: **Vercel** (auto deploy from git, preview URL per PR)
    - BE: **Railway** / **Fly.io** / **Render**
    - Postgres: **Neon** / **Supabase** (managed)
    - Redis: **Upstash** (serverless)
    - Mobile: **EAS Build + Submit** (Expo)
  - **Domain + TLS** (Cloudflare)
  - **Sentry** error tracking
  - **BetterUptime** uptime monitor
  - **Migration in production** (alembic upgrade head trong deploy step)

#### 🌐 API endpoints
- `GET /health` — liveness check
- `GET /ready` — readiness (DB + Redis connection)

#### 📖 Pre-reading (~6h)
- [docs.docker.com/get-started](https://docs.docker.com/get-started/)
- [vercel.com/docs/concepts/git](https://vercel.com/docs/concepts/git)
- [docs.github.com/en/actions](https://docs.github.com/en/actions)
- [fly.io/docs/elixir/getting-started/working-with-fly-postgres](https://fly.io/docs/elixir/getting-started/working-with-fly-postgres/)
- [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/)

#### ✅ Acceptance criteria
**Functional:**
- [ ] Push to `main` → CI run lint + test → build → deploy
- [ ] Web: `https://app.<domain>` live, HTTPS work
- [ ] API: `https://api.<domain>` live, `/docs` accessible (hoặc disable ở prod)
- [ ] Database migration chạy tự động trong deploy
- [ ] Zero downtime deploy (rolling deploy)
- [ ] Rollback strategy: previous version reachable trong 1 click
- [ ] Mobile: TestFlight (iOS) + Internal Testing (Android) build qua EAS
- [ ] Sentry catch error tự động
- [ ] Uptime monitor alert nếu down
- [ ] Backup database daily (Neon/Supabase auto)

**Code quality:**
- [ ] `.env.example` chuẩn, không miss biến nào
- [ ] Secrets KHÔNG commit code
- [ ] Dockerfile multi-stage (final image <200MB)
- [ ] CI cache `uv` / `npm` để build nhanh
- [ ] Pre-commit hook (lint + format + type check)

#### 🚀 Stretch goals
- Preview environment per PR (Vercel làm sẵn cho web)
- Feature flag (Unleash, GrowthBook)
- Canary deploy
- Database read replica
- CDN cho static asset

#### ⚠️ Common pitfall
- Migration fail giữa deploy → app start với schema cũ → 500 error
- Quên set CORS origin prod → FE block API
- DEBUG=True ở prod → leak stacktrace
- Secret leak qua log
- Image registry expensive (free tier limit)
- Mobile cert/provisioning profile expire — rebuild fail

---

# ✅ Checklist tiến độ

## Phase 1 — Foundation
- [ ] M1: Setup + Landing page
- [ ] M2: Auth email + JWT
- [ ] M3: Auth Google OAuth

## Phase 2 — Core Content
- [ ] M4: Course list + detail (public)
- [ ] M5: Filter + Search + Pagination
- [ ] M6: TanStack Query migration
- [ ] M7: i18n UI (immersion)
- [ ] M8: Teacher dashboard (CRUD course)

## Phase 3 — Learning Experience
- [ ] M9: Lesson player (Cloudflare Stream)
- [ ] M10: Quiz engine (MC, fill-in, drag-drop)
- [ ] M11: Listening quiz (audio)

## Phase 4 — Monetization
- [ ] M12: Payment (VNPay + MoMo)
- [ ] M13: Authorization + Freemium tier check
- [ ] M14: Admin review workflow

## Phase 5 — Engagement
- [ ] M15: Gamification basic (streak + badge)
- [ ] M16: WebSocket notification
- [ ] M17: WebSocket discussion + support chat
- [ ] M18: Gamification full (XP + leaderboard + league)
- [ ] M19: Course preview + review/rating + coupon

## Phase 6 — Production-ready
- [ ] M20: Email transactional (Resend)
- [ ] M21: Performance optimization
- [ ] M22: Testing (Vitest + RTL + Playwright + pytest)
- [ ] M23: Admin analytics dashboard

## Phase 7 — Mobile + Deploy
- [ ] M24: React Native app
- [ ] M25: Mobile push + IAP
- [ ] M26: Deploy + CI/CD

---

## 📖 Cách dùng roadmap này

1. **Đừng đọc 1 lần hết** — chỉ đọc module sắp làm + module sau (để context)
2. **Pre-reading TRƯỚC khi code** — không nhảy vào build mà chưa hiểu concept
3. **Tick acceptance criteria** — không qua module sau nếu chưa pass
4. **Sau mỗi phase: refactor + nghỉ** — không build streak quá nhanh dẫn đến debt
5. **Stretch goal là OPTIONAL** — chỉ làm nếu thấy hứng và còn pace
6. **Common pitfall** — đọc TRƯỚC khi code, không phải sau khi gặp bug
7. **Cập nhật roadmap** — nếu thực tế khác plan, update lại file (đây là living doc)

---

## 🔗 Tham chiếu

- [`spec.md`](.claude/specs/project_description/spec.md) — yêu cầu chi tiết + 14 câu Q&A
- [`roadmap.md`](./roadmap.md) — React roadmap basic → advanced
- [`fastapi-roadmap.md`](./fastapi-roadmap.md) — FastAPI roadmap basic → advanced

> 📝 **Note**: Roadmap này là living document. Khi build, sẽ phát sienss thêm edge case → update lại file. Đừng treat như bản thiết kế final.
