# 🐍 FastAPI Roadmap — Từ Basic đến Advanced

Roadmap đầy đủ để học FastAPI từ "biết viết CRUD API" đến mức **production-ready cho dự án thực tế**.
Chia theo **7 giai đoạn**. Mỗi giai đoạn nên dành **1–4 tuần** thực hành trước khi sang giai đoạn kế.

> Bạn đã ở **Giai đoạn 1.5** (biết CRUD basic). Có thể skim Phase 0–1, focus từ Phase 2 trở đi.

---

## 🟢 GIAI ĐOẠN 0 — NỀN TẢNG (Python + HTTP)

Nếu thiếu nền này, học FastAPI sẽ chỉ là copy-paste.

### Python 3.10+ — bắt buộc thành thạo
- **Type hints**: `list[int]`, `dict[str, Any]`, `Optional`, `Union`, `Literal`, `TypeVar`, `Generic`
- **Async/await**: hiểu event loop, `async def`, `await`, `asyncio.gather`, `asyncio.create_task`
- **Decorator**: viết được custom decorator, hiểu `functools.wraps`
- **Context manager**: `with`, `async with`, viết được class có `__enter__`/`__exit__`
- **Dataclass / Pydantic model**: phân biệt khi nào dùng
- **Generator, yield**: lazy evaluation
- **Comprehension**: list/dict/set/generator comprehension
- **Exception**: custom exception class, `raise from`, `try/except/else/finally`
- **`pathlib`** thay cho `os.path`
- **f-string** advanced: `f"{value:>10.2f}"`

### HTTP & REST
- HTTP methods: GET/POST/PUT/PATCH/DELETE/OPTIONS/HEAD
- Status code: 2xx/3xx/4xx/5xx (đặc biệt 401 vs 403, 422 vs 400)
- Headers: Content-Type, Authorization, CORS headers
- Cookie vs Header, httpOnly cookie
- Idempotency (PUT vs POST)
- RESTful URL design (`/users/{id}/posts` vs `/get_user_posts?id=...`)
- JSON, multipart/form-data, application/x-www-form-urlencoded
- CORS — vì sao tồn tại, preflight request

### Công cụ
- **Package manager**: `pip` → `poetry` hoặc **`uv`** (mới, cực nhanh, recommend)
- **Virtual env**: `venv`, `.venv` convention
- **Linter/Formatter**: **`ruff`** (thay cho black + flake8 + isort, cực nhanh)
- **Type checker**: `mypy` hoặc **`pyright`**
- **API testing tool**: Postman / **Bruno** / Insomnia / Thunder Client (VS Code) / **HTTPie** (CLI)
- VS Code extensions: Python, Pylance, Ruff, REST Client

---

## 🟢 GIAI ĐOẠN 1 — FASTAPI CƠ BẢN (bạn đã ở đây)

### Setup project
- `uv init` hoặc `poetry init`
- Cài: `fastapi[standard]` (đi kèm uvicorn + dev tools)
- Run: `fastapi dev main.py` (auto-reload, debug)

### Core concepts
- **Path operations**: `@app.get/post/put/delete/patch`
- **Path parameters**: `/items/{item_id}` + type hint = auto validation
- **Query parameters**: default value, Optional, list, alias
- **Request body**: Pydantic model
- **Response model**: `response_model=...` (filter output, type-safe)
- **Status code**: `status_code=201`, `status.HTTP_201_CREATED`
- **APIRouter**: tách route theo module (`/users`, `/courses`, ...)
- **Dependency Injection (DI)** cơ bản: `Depends(get_db)`, `Depends(get_current_user)`
- **Auto Swagger UI** tại `/docs`, ReDoc tại `/redoc`

### Pydantic v2 — phải vững
- **BaseModel**: define schema
- **Field**: default, alias, validation (`gt`, `lt`, `min_length`, `regex`)
- **Validator**: `@field_validator`, `@model_validator`
- **Computed field**: `@computed_field`
- **Config**: `model_config = ConfigDict(...)`
- Pattern: tách **3 schema** cho mỗi resource:
  - `UserCreate` (input)
  - `UserUpdate` (input, all optional)
  - `UserRead` / `UserResponse` (output, không có password)

### Folder structure (đề xuất production-ready)
```
app/
├── main.py              # FastAPI app instance
├── core/
│   ├── config.py        # Settings (pydantic-settings)
│   ├── security.py      # JWT, hash password
│   └── exceptions.py    # Custom exceptions
├── db/
│   ├── session.py       # DB session, engine
│   └── base.py          # Base model
├── models/              # SQLAlchemy/SQLModel models
│   └── user.py
├── schemas/             # Pydantic schemas
│   └── user.py
├── routers/             # API endpoints
│   ├── auth.py
│   ├── users.py
│   └── courses.py
├── services/            # Business logic
│   └── user_service.py
├── repositories/        # DB queries (optional layer)
│   └── user_repo.py
└── dependencies/        # Reusable Depends
    └── auth.py
tests/
alembic/                 # Migrations
.env
pyproject.toml
```

### Project gợi ý (nếu chưa làm)
- Todo API (CRUD + filter + pagination)
- Blog API (post + comment + author)
- Movie API gọi TMDB

---

## 🟡 GIAI ĐOẠN 2 — DATABASE & ORM (đây là bottleneck của hầu hết dev)

### PostgreSQL — bắt buộc dùng (không SQLite cho production)
- Install local hoặc dùng **Docker** (`docker run -d postgres:16`)
- Hiểu: connection, transaction, ACID
- Index, EXPLAIN ANALYZE, query plan
- JSON/JSONB column
- ENUM, ARRAY type
- Common pattern: `created_at`, `updated_at`, soft delete (`deleted_at`)

### ORM — chọn 1 trong 2
- **SQLModel** (recommend cho beginner): tác giả FastAPI tạo, wrap SQLAlchemy + Pydantic
  - Pro: 1 model dùng cho cả DB + API schema, ít boilerplate
  - Con: ít tài liệu, edge case khó debug, async support còn yếu hơn
- **SQLAlchemy 2.x** thuần (recommend cho production): standard, mature
  - Pro: ecosystem lớn, async first-class, control tốt
  - Con: verbose hơn, cần học DSL

### SQLAlchemy 2.x core concepts
- `Mapped[Type]`, `mapped_column()` (style mới của 2.x)
- Relationship: `relationship()`, `back_populates`, `cascade`
- Query: `select(User).where(User.email == ...)`
- Async: `AsyncSession`, `await session.execute(stmt)`, `await session.commit()`
- Eager loading: `selectinload`, `joinedload`
- **N+1 problem** — phải biết detect và fix (90% performance bug đến từ đây)

### Migration với Alembic — bắt buộc
- `alembic init`, `alembic.ini`, `env.py` setup
- `alembic revision --autogenerate -m "msg"` 
- `alembic upgrade head`, `alembic downgrade -1`
- Manual edit migration khi autogenerate sai (vd: ENUM, data migration)
- **Branch + merge** migration (khi nhiều dev cùng làm)
- **Data migration** (vd: backfill column mới)

### Database session pattern
- Tạo session per request (dùng `Depends(get_db)`)
- Async session: `async with AsyncSessionLocal() as session: yield session`
- Transaction: `try/except + rollback`
- Connection pool: `pool_size`, `max_overflow`

### Project gợi ý
- Migrate Todo API từ in-memory → PostgreSQL + Alembic
- Build blog API với relationship (User → Post → Comment)
- Tự tay tạo + fix 1 N+1 problem (xem query log)

---

## 🟡 GIAI ĐOẠN 3 — AUTHENTICATION & AUTHORIZATION

### Password hashing
- **bcrypt** (legacy, vẫn ok) hoặc **argon2** (modern, recommend)
- `passlib[bcrypt]` hoặc `argon2-cffi`
- KHÔNG bao giờ lưu password plaintext
- Pattern: `verify_password(plain, hashed)`, `hash_password(plain)`

### JWT (JSON Web Token)
- `python-jose[cryptography]` hoặc `pyjwt`
- Hiểu: header.payload.signature, HS256 vs RS256
- Access token (short-lived 15min) + Refresh token (long-lived 7-30 ngày)
- Lưu refresh token ở: DB (revocable) hoặc httpOnly cookie
- **CRITICAL**: KHÔNG lưu JWT vào localStorage (XSS) → dùng httpOnly cookie

### OAuth2 (đăng nhập bằng Google/Facebook/GitHub)
- **Authlib** (recommend): clean API, support nhiều provider
- Hoặc dùng provider SDK riêng (google-auth, etc.)
- Flow: redirect → callback → exchange code → user info → tạo JWT của app
- Có sẵn ví dụ Google OAuth trong FastAPI docs

### Authorization patterns
- **Role-Based Access Control (RBAC)**:
  - User có 1+ role: `admin`, `teacher`, `student`
  - Check ở dependency: `Depends(require_role("admin"))`
- **Permission-based** (granular hơn):
  - Permission: `course:create`, `course:delete`, `user:read_all`
  - Role có nhiều permission
- **Scope-based** (OAuth2 style): scope trong token
- **Resource-based**: vd user A chỉ sửa được course của chính mình

### Dependency injection cho auth (FastAPI pattern)
```python
async def get_current_user(token: str = Depends(oauth2_scheme), 
                          db: AsyncSession = Depends(get_db)) -> User:
    ...

async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin": raise HTTPException(403)
    return user

@router.delete("/users/{id}")
async def delete_user(id: int, _: User = Depends(require_admin)):
    ...
```

### Security best practice
- HTTPS only (cookie phải có `secure=True`)
- CSRF protection nếu dùng cookie auth
- Rate limit login endpoint (chống brute force)
- Account lockout sau N lần fail
- Password reset flow qua email token (1 lần dùng, có expiry)
- Audit log: login, password change, role change

---

## 🟠 GIAI ĐOẠN 4 — ARCHITECTURE & PATTERNS

### Dependency Injection sâu hơn
- Sub-dependency: dependency chain (`A depends on B depends on C`)
- DI với parameter: `Depends(get_pagination_params)`
- Class-based dependency
- `yield` dependency: cleanup sau request (close DB, close file)
- `dependencies=[]` ở router level: apply cho tất cả route trong router

### Layered architecture
- **Router (Controller)**: HTTP concern, validate input, return response
- **Service**: business logic, không biết về HTTP
- **Repository**: DB query (optional layer — nếu project nhỏ có thể skip)
- **Model**: ORM model, schema
- **Schema**: Pydantic input/output

Tránh: viết hết logic trong router → khó test, khó reuse.

### Pydantic v2 advanced
- `BaseSettings` (pydantic-settings) cho config từ env
- Discriminated union (nested polymorphic schema)
- Custom serializer/deserializer
- `model_validator(mode="before")` để transform input
- `Annotated[int, Field(gt=0)]` style (modern Python)

### Error handling
- Custom exception: `class CourseNotFoundError(Exception)`
- Exception handler: `@app.exception_handler(CourseNotFoundError)`
- Global handler cho `ValidationError`, `IntegrityError`
- Structured error response: `{ "error": { "code": "COURSE_NOT_FOUND", "message": "..." } }`
- KHÔNG leak stacktrace ra client ở production

### Middleware
- CORS (`CORSMiddleware`)
- GZip (`GZipMiddleware`)
- Custom middleware: log request/response time, request ID, trace
- Khác middleware vs dependency: middleware chạy với tất cả request kể cả 404

### Background tasks
- `BackgroundTasks` của FastAPI — đơn giản, in-process, không retry
- Phù hợp: gửi email confirmation sau khi response
- KHÔNG phù hợp: long-running, cần retry, cần concurrency → dùng Celery/ARQ

### Configuration
- `pydantic-settings` để load từ `.env`
- Tách config theo env: `dev`, `staging`, `prod`
- KHÔNG commit `.env` (gitignore)
- Secrets: dùng provider thật ở prod (AWS Secrets Manager, Doppler, ...)

---

## 🟠 GIAI ĐOẠN 5 — ASYNC, CACHING, PERFORMANCE

### Async fundamentals
- Hiểu khi nào dùng `async def` route vs `def` route (FastAPI handle cả 2)
- Sync route → chạy trong thread pool (1 worker = N thread)
- Async route → chạy trên event loop (cần async stack toàn bộ chain)
- KHÔNG mix: gọi sync blocking I/O trong async route → block event loop
- `await asyncio.gather()` để chạy parallel

### Async DB
- Driver: `asyncpg` (PostgreSQL)
- `create_async_engine`, `AsyncSession`, `async_sessionmaker`
- Tất cả query phải `await`
- Common bug: quên `await` → return Coroutine object

### Redis (caching + pub/sub + rate limit)
- Client: `redis-py` (có async support)
- Use case:
  - **Cache**: response cache, query result cache
  - **Rate limit**: token bucket / sliding window
  - **Session store**: lưu session nếu không dùng JWT
  - **Pub/Sub**: fanout WebSocket message khi scale ngang
  - **Distributed lock**: chống race condition
  - **Sorted set**: leaderboard real-time
- Strategy: cache-aside, write-through, write-behind
- TTL: phải set, tránh memory leak

### Rate limiting
- `slowapi` (wrap `limits` library, FastAPI integration)
- Redis-backed cho multi-server
- Pattern: per IP, per user, per endpoint
- Endpoint quan trọng phải có: login, signup, password reset, payment

### Performance
- **Connection pooling** PostgreSQL (`pool_size`, `max_overflow`)
- **Query optimization**: index, EXPLAIN, avoid N+1
- **Response pagination**: cursor-based > offset-based cho list lớn
- **Eager loading** với `selectinload` cho relationship
- **Response compression** (GZip middleware)
- **HTTP caching**: `ETag`, `Cache-Control` header
- Profile: `py-spy`, `cProfile`, FastAPI Profiler middleware

---

## 🔴 GIAI ĐOẠN 6 — REAL-WORLD SKILLS

### WebSocket
- FastAPI WebSocket native: `@app.websocket("/ws")`
- Connection manager pattern (giữ list connection)
- Channel/room: 1 user 1 channel, broadcast theo room
- Authentication WebSocket (qua query param token hoặc cookie)
- **Scale ngang**: Redis pub/sub fanout (1 server → tất cả server)
- Reconnect logic, ping/pong heartbeat
- Lib khác: `python-socketio` (Socket.IO server) nếu cần feature đầy đủ

### Background job queue
- **ARQ** (async, lightweight, Redis-backed) — recommend cho FastAPI
- **Celery** (mature, nhiều feature, hơi cồng kềnh)
- **RQ** (simple, sync)
- Use case: gửi email, generate PDF, video transcode, scheduled job (cron)
- **Celery Beat** hoặc ARQ cron cho scheduled job
- Pattern: API trả về `task_id` ngay → client poll status

### Email
- **Resend** (modern, dev-friendly, free tier) — recommend
- **SendGrid** (mature, enterprise)
- **Mailgun**, **Postmark** (alternatives)
- Template: Jinja2 → render HTML email
- Transactional: signup confirm, password reset, receipt
- Test local: **MailHog** / **Mailpit** (Docker, bắt email local)

### File upload + Object storage
- FastAPI `UploadFile`, `File()`
- Validate: mime type, size, dimension (cho image)
- Storage: **Cloudflare R2** (S3-compatible, free egress, rẻ) / S3 / MinIO (self-host)
- Client: `boto3` (sync) hoặc `aioboto3` (async)
- Pattern **presigned URL**: BE generate URL → client upload trực tiếp (không qua BE) → tiết kiệm bandwidth + thời gian
- Image processing: `Pillow`, `pillow-heif` cho HEIC

### Payment integration (Stripe-style pattern, áp dụng được cho VNPay/MoMo)
- **Webhook handling**: BE expose endpoint cho gateway callback
- **Idempotency key**: chống duplicate khi gateway retry
- **State machine** order: `pending → paid → fulfilled` (hoặc `failed`, `refunded`)
- **Verify signature** webhook (HMAC) — chống forge
- **Reconciliation**: cron job daily đối soát với gateway
- Logging: lưu raw request/response của mỗi payment
- Test mode trước, prod sau

### Logging
- **`loguru`** (modern, simple) hoặc **`structlog`** (structured logging)
- Structured log (JSON) — dễ search ở Elasticsearch/Datadog
- Log level: DEBUG/INFO/WARNING/ERROR/CRITICAL
- Request ID: trace mỗi request qua nhiều service
- KHÔNG log password, JWT, credit card

### Monitoring & Observability
- **Sentry**: error tracking (free tier ok cho startup)
- **Prometheus + Grafana**: metrics (request rate, latency, error rate)
- **OpenTelemetry**: distributed tracing (chuẩn industry)
- Health check endpoint: `/health` (DB connection, Redis, external dependency)

### Internationalization (i18n) backend
- Email template multi-language
- Error message dịch theo user's locale (header `Accept-Language` hoặc DB preference)
- Date/number format theo locale
- Library: `Babel`, `python-i18n`

---

## 🔴 GIAI ĐOẠN 7 — TESTING

### pytest fundamentals
- `pytest`, `pytest-asyncio` (cho async test)
- Fixture: `@pytest.fixture`, scope (`function`, `module`, `session`)
- Parametrize: `@pytest.mark.parametrize` để test nhiều case
- Marker: `@pytest.mark.slow`, run riêng `pytest -m slow`
- Coverage: `pytest-cov` (target >70% là realistic)

### FastAPI testing
- **TestClient** (sync, dựa trên httpx) — đơn giản
- **AsyncClient** (`httpx.AsyncClient(transport=ASGITransport(app=app))`) — async, recommend
- Override dependency: `app.dependency_overrides[get_db] = override_get_db` → mock DB

### Database testing
- Pattern 1: **Test database riêng** + transaction rollback (fast, isolated)
- Pattern 2: **Test container** (`testcontainers`) — chạy PostgreSQL trong Docker mỗi test session
- Pattern 3: SQLite in-memory (nhanh nhưng khác behavior với Postgres, KHÔNG recommend)
- Factory pattern: **`factory-boy`** hoặc **`polyfactory`** (Pydantic-aware) để tạo test data

### Mock external service
- **`respx`**: mock HTTP call (cho httpx)
- **`vcr.py`**: record real call, replay (snapshot testing)
- **`unittest.mock`**: mock function/method

### Test pyramid
- Unit test (service, util): nhiều, nhanh
- Integration test (router + DB): vừa, chậm hơn
- E2E test: ít, slow nhất

### CI integration
- Run test trong GitHub Actions với PostgreSQL service
- Pre-commit hook: chạy ruff + mypy + pytest --ff (fail fast)

---

## 🚀 GIAI ĐOẠN 8 — DEVOPS & PRODUCTION

### Docker
- `Dockerfile` cho FastAPI app (multi-stage build để image nhẹ)
- `.dockerignore`
- `docker-compose.yml` local dev (app + postgres + redis + mailpit)
- Image base: `python:3.12-slim` hoặc `python:3.12-alpine`

### CI/CD
- **GitHub Actions** (free cho public repo)
- Workflow: lint → test → build image → push registry → deploy
- Secret: dùng GitHub Secrets
- Cache `pip`/`uv` để build nhanh
- Matrix: test trên nhiều Python version

### Deployment options (từ dễ → khó)
| Platform | Pros | Cons |
|---|---|---|
| **Railway** | Setup 5 phút, có Postgres + Redis managed | Đắt khi scale |
| **Fly.io** | Edge deployment, generous free tier | Cần đọc docs |
| **Render** | UI dễ dùng, free tier | Sleep sau 15 phút (free) |
| **DigitalOcean App Platform** | Stable, predictable price | Không có CDN built-in |
| **AWS ECS/Fargate** | Full control, scale | Complex, đắt nếu sai cấu hình |
| **Self-host VPS** | Rẻ nhất | Tự quản lý hết |

### Production essentials
- **Reverse proxy**: Nginx hoặc Caddy (TLS auto)
- **Process manager**: `uvicorn --workers 4` hoặc Gunicorn + UvicornWorker
- **Graceful shutdown**: handle SIGTERM, close DB connection
- **Health check**: `/health`, `/ready` (Kubernetes-style)
- **Migration in production**: chạy alembic trước khi start app
- **Zero-downtime deploy**: rolling deploy (2+ instance, deploy từng cái)
- **Backup database** daily (managed DB thường có sẵn)
- **Log aggregation**: gửi log lên service (Better Stack, Logtail, Datadog)
- **Uptime monitoring**: BetterUptime, UptimeRobot

### Secrets management
- Local: `.env` + `.env.example` (commit example, gitignore real)
- Production: provider riêng (Doppler, AWS Secrets Manager, Vault)
- KHÔNG hard-code secret trong code dù chỉ 1 lần

### Domain & DNS
- Cloudflare DNS (free, fast)
- TLS: Let's Encrypt qua Caddy / Nginx-certbot

---

## 🌟 GIAI ĐOẠN 9 — ADVANCED & SCALE

> Chỉ học khi đã có sản phẩm chạy và có vấn đề scale thực sự. ĐỪNG học sớm.

### Microservices vs Monolith
- **Modular Monolith** là sweet spot cho 90% project (recommend)
- Microservice chỉ khi: team >10 người, có domain rõ tách biệt, cần deploy độc lập

### Message Queue
- **RabbitMQ** — mature, AMQP standard
- **Redis Streams** — light, đủ cho phần lớn case
- **Apache Kafka** — high throughput, complex setup
- Use case: event-driven, decouple service, async processing

### Caching strategies
- Cache-aside (lazy), Read-through, Write-through, Write-behind
- Cache invalidation strategies (TTL, manual, tag-based)
- Multi-level cache (L1 in-memory + L2 Redis)

### Database scale
- **Index optimization**: composite index, partial index, covering index
- **Query plan**: `EXPLAIN (ANALYZE, BUFFERS)`
- **Partitioning**: theo time, theo tenant
- **Read replica**: split read/write
- **Connection pooler**: PgBouncer (giảm số connection thực tế)
- **Materialized view** cho aggregate queries
- **Full-text search**: PostgreSQL FTS hoặc tách MeiliSearch/Elasticsearch

### API versioning
- URL path: `/v1/users` vs `/v2/users` (đơn giản nhất)
- Header: `Accept: application/vnd.api.v2+json` (REST-ful)
- Phải có deprecation policy rõ ràng

### GraphQL (alternative)
- **Strawberry** — modern, Pythonic, async
- Khi nào dùng: client cần linh hoạt chọn field (mobile + web khác nhau), over-fetching/under-fetching nghiêm trọng
- Trade-off: phức tạp hơn REST, khó cache

### Event-driven architecture
- Domain event, event sourcing (advanced — chỉ khi thực sự cần)
- Saga pattern (distributed transaction)
- CQRS (Command Query Responsibility Segregation)

### Security advanced
- OWASP Top 10 (SQL injection, XSS, CSRF, SSRF, ...)
- Penetration test
- Dependency scanning (`pip-audit`, Snyk, Dependabot)
- Security headers (Helmet equivalent)

---

## 📚 NGUỒN HỌC TỐT NHẤT

| Mục đích | Nguồn |
|---|---|
| Docs chính thức (CHẤT LƯỢNG CỰC CAO) | https://fastapi.tiangolo.com |
| Pydantic docs | https://docs.pydantic.dev |
| SQLAlchemy 2.x docs | https://docs.sqlalchemy.org |
| Khóa có depth | testdriven.io (FastAPI courses) |
| Pattern + best practice | https://github.com/zhanymkanov/fastapi-best-practices |
| Real-world example | https://github.com/nsidnev/fastapi-realworld-example-app |
| YouTube tiếng Anh | ArjanCodes, mCoding, Patrick Loeber, freeCodeCamp |
| YouTube tiếng Việt | Đào Quang Trung, F8 (có khóa Python) |
| Podcast | Talk Python To Me, Python Bytes |
| Newsletter | Python Weekly, PyCoder's Weekly |
| Book | "Architecture Patterns with Python" (Harry Percival) |

---

## ⏱️ LỘ TRÌNH THỜI GIAN THAM KHẢO

- **Fulltime (6–8h/ngày)**:
  - Phase 0–2: ~4 tuần
  - Phase 3–4: ~4 tuần
  - Phase 5–7: ~6 tuần
  - Phase 8: ~2 tuần
  - **Tổng: 4 tháng** đến mức làm được production app
- **Parttime (2–3h/ngày)**:
  - ~8–10 tháng
- Phase 9 chỉ học khi gặp problem thật

---

## ✅ CHECKLIST TIẾN ĐỘ

- [ ] Phase 0 — Python + HTTP nền tảng
- [x] Phase 1 — FastAPI cơ bản (CRUD, Pydantic, Router) ← bạn đang ở đây
- [ ] Phase 2 — Database (PostgreSQL + SQLAlchemy/SQLModel + Alembic)
- [ ] Phase 3 — Authentication & Authorization (JWT, OAuth, RBAC)
- [ ] Phase 4 — Architecture (DI sâu, layered, error handling, middleware)
- [ ] Phase 5 — Async, Redis, caching, performance
- [ ] Phase 6 — Real-world (WebSocket, background job, payment, email, file upload, monitoring)
- [ ] Phase 7 — Testing (pytest, integration, mock)
- [ ] Phase 8 — DevOps (Docker, CI/CD, deploy production)
- [ ] Phase 9 — Advanced & Scale (chỉ khi cần)

---

## 💡 GỢI Ý CHO PROJECT NGÔN NGỮ HIỆN TẠI

Mapping phase → các module trong spec.md:

| Project module | FastAPI phase cần học |
|---|---|
| M2 Auth email + Google | Phase 3 (Auth, JWT, OAuth) |
| M4–6 Course list/detail/search | Phase 2 (DB, ORM, query) |
| M8 Teacher dashboard | Phase 4 (DI, layered, error handling) |
| M9 Video player | Phase 6 (file upload, presigned URL) |
| M10–11 Quiz engine | Phase 2 + 4 (complex schema, validation) |
| M12 Payment (VNPay/MoMo) | Phase 6 (webhook, idempotency, state machine) |
| M14 Admin review workflow | Phase 4 (RBAC, audit log) |
| M15+M18 Gamification | Phase 5 (Redis sorted set, Celery cron, background job) |
| M16–17 WebSocket | Phase 5 + 6 (async, WebSocket, Redis pub/sub) |
| M20 Email transactional | Phase 6 (Resend/SendGrid, template, queue) |
| M22 Testing | Phase 7 |
| M26 Deploy + CI/CD | Phase 8 |
