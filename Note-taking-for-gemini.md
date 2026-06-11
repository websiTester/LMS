# GEMINI.md — Project Context & Conventions

> File này được GEMINI Code load tự động mỗi conversation. Chứa context project + convention làm việc.

---

## 📌 Project context

**Tên:** Website dạy ngôn ngữ (Course Platform SaaS)

**Tech stack chính:**
- Frontend (web): React + Vite + TypeScript + Tailwind + shadcn/ui
- Frontend (mobile, phase 7): React Native + Expo
- Backend: FastAPI + PostgreSQL + Redis
- Infra: Cloudflare Stream (video), Cloudflare R2 (object storage), VNPay/MoMo (payment)

**Mục tiêu user:** Vừa học React + FastAPI vừa build website SaaS thực tế. Module ordering theo learning curve (basic → advanced), không phải product priority.

**Trình độ user:**
- React: cơ bản (đang học theo `Ly_thuyet/react/react_roadmap.md`)
- FastAPI: cơ bản, đủ viết CRUD (đang học theo `Ly_thuyet/fastapi/fastapi_roadmap.md`)
- Đang ở giai đoạn đầu — Phase 1 của `Ly_thuyet/website_roadmap.md`

**Ngôn ngữ giao tiếp:** **Tiếng Việt** (kèm thuật ngữ tiếng Anh chuẩn trong ngoặc khi cần).

---

## 📁 File structure quan trọng

```
React_roadmap/
├── .claude/
│   ├── CLAUDE.md                         ← FILE NÀY (context + convention)
│   └── specs/project_description/
│       └── spec.md                       ← Yêu cầu + 14 câu Q&A phản biện
└── Ly_thuyet/                            ← Roadmaps + TAKE NOTE kiến thức
    ├── website_roadmap.md                ← 26 module project chi tiết (với màn hình & UI)
    ├── fastapi/                          ← FastAPI core (note user học)
    │   └── fastapi_roadmap.md            ← FastAPI roadmap basic → advanced
    ├── react/                            ← React core (note user học)
    │   └── react_roadmap.md              ← React roadmap basic → advanced
    ├── react_fastapi_interaction/        ← Tương tác FE-BE (note user học)
    └── khac/                             ← Mọi thứ khác (xem rule bên dưới)
```

**Lưu ý:**
- 3 roadmap file (`react_roadmap.md`, `fastapi_roadmap.md`, `website_roadmap.md`) đã được di chuyển vào trong `Ly_thuyet/` — KHÔNG còn ở root project.
- 3 file roadmap này là REFERENCE/PLAN, KHÔNG phải take-note user học. Đừng nhầm với file note.
- Các file note user học mới sẽ được tạo trong `Ly_thuyet/{fastapi,react,react_fastapi_interaction,khac}/` theo rule "Take note convention" bên dưới.

---

## 📝 Take note convention (BẮT BUỘC tuân thủ)

### Khi nào tạo/update note (TRIGGER)

**Chỉ tạo/update note khi user EXPLICIT yêu cầu.** Ví dụ:
- "ghi chú lại cái này"
- "lưu vào note"
- "tạo file note về useState"
- "update note hooks"

**KHÔNG được:**
- Tự động tạo note sau khi giải thích concept
- Đề xuất "tôi sẽ ghi note" mỗi lần giải thích
- Auto-tạo note khi user hoàn thành module

### Folder phân loại — quyết định ngay khi tạo

| Folder | Chứa kiến thức về |
|---|---|
| `Ly_thuyet/react/` | React core: hooks, JSX, component, props, state, lifecycle, custom hook, context, performance, RHF + Zod, TanStack Query, React Router, i18n, testing FE, React Native (phase 7) |
| `Ly_thuyet/fastapi/` | FastAPI core: routing, Pydantic, Depends, OAuth2, WebSocket, middleware, async, background task (ARQ/Celery), testing BE, error handling |
| `Ly_thuyet/react_fastapi_interaction/` | Tương tác FE-BE: REST API call pattern, auth flow JWT cookie, CORS, file upload flow, WebSocket end-to-end, payment webhook flow, optimistic update, type-sharing (OpenAPI codegen) |
| `Ly_thuyet/khac/` | **Mọi thứ khác**: PostgreSQL, SQLAlchemy, Alembic, Redis, Tailwind, shadcn, TypeScript, Vite, Docker, CI/CD, Git, Cloudflare Stream/R2, VNPay/MoMo, Resend, monorepo, Expo, etc. |

**Quy tắc quyết định folder:**
1. Là React-specific concept? → `react/`
2. Là FastAPI-specific concept? → `fastapi/`
3. Cần BOTH FE và BE để hiểu (vd: auth flow, payment flow)? → `react_fastapi_interaction/`
4. Còn lại → `khac/`

### Naming convention

- **kebab-case**: `hooks-co-ban.md`, `bao-mat-jwt.md`, `cau-hinh-cors.md`
- **Tiếng Việt** (theo preference user), nhưng giữ thuật ngữ kỹ thuật tiếng Anh: `tanstack-query.md`, `react-hook-form.md`, `pydantic-v2.md`
- **KHÔNG numeric prefix** (vd: KHÔNG `01-jsx.md`) — dùng theme grouping thay vì order số
- **KHÔNG date prefix** — kiến thức không phải log time-based

### Granularity per file — Group theo theme (MỨC VỪA)

**Mỗi file = 1 nhóm concept liên quan**, KHÔNG phải 1 concept đơn lẻ.

✅ Ví dụ ĐÚNG (group theme, ~15-25 file/folder):
- `react/hooks-co-ban.md` — useState + useEffect + useRef (basic, dùng cùng nhau)
- `react/hooks-nang-cao.md` — useReducer + useMemo + useCallback + useImperativeHandle
- `react/forms.md` — React Hook Form + Zod + validation pattern
- `react/tanstack-query.md` — useQuery + useMutation + queryKey + invalidate
- `fastapi/dependency-injection.md` — Depends + sub-dep + yield + parameterized
- `khac/postgresql.md` — types + index + EXPLAIN + transaction

❌ Ví dụ SAI (quá granular):
- `react/useState.md`, `react/useEffect.md`, `react/useRef.md` — split không cần thiết

❌ Ví dụ SAI (quá lớn):
- `react/react-all.md` — gom hết → khó tìm

### Append vs Create

**Khi user yêu cầu ghi note về concept X:**

1. **Check file existing** — có file nào trong folder relevant đã chứa concept tương tự không?
   - Có file liên quan → **APPEND** vào section mới trong file đó
   - Không có → **CREATE** file mới với tên kebab-case phù hợp

2. **Khi append:** thêm section mới với heading `## <Tên concept>` ở cuối, KHÔNG trộn vào section đang có (trừ khi enhance content cùng concept).

3. **Khi concept gặp lại ở complexity cao hơn (spiral learning):** thêm section `## <Tên concept> — Nâng cao` hoặc `## <Tên concept> (lần 2)` trong cùng file, KHÔNG tạo file mới.

### Split thành subfolder khi file quá lớn

Khi 1 chủ đề lớn (vd: SQLAlchemy, PostgreSQL, FastAPI advanced) có nhiều khía cạnh (khái niệm, kết nối DB, ORM, migration, bug setup...), file flat có thể phình to khó navigate. Khi đó **split file thành subfolder**.

#### Ngưỡng kích hoạt split (BẮT BUỘC cả 2 đều đo được)

Split khi file vượt **MỘT TRONG HAI** ngưỡng:
- **≥ 4 concept lớn** (đếm số H2 section `## <concept>`, KHÔNG đếm section `🔗 References` cuối file)
- **> 400 dòng** tổng

#### Quy tắc reactive — KHÔNG split sớm

- **Mặc định tạo file flat trước** (vd: `khac/sqlalchemy.md`), kể cả với chủ đề biết trước sẽ lớn.
- Chỉ split khi file thực sự vượt ngưỡng — tránh over-engineer khi chủ đề còn nhỏ.
- KHÔNG được proactive tạo subfolder ngay từ lần ghi note đầu tiên.

#### Khi phát hiện file vượt ngưỡng — đề xuất + chờ confirm

KHÔNG được tự ý migrate. Phải đề xuất user trước:

```
File `khac/sqlalchemy.md` đã đạt 5 concept / 450 dòng — vượt ngưỡng split.
Đề xuất tách thành `khac/sqlalchemy/`:
- _index.md          ← mục lục
- khai-niem.md       ← từ H2 "## Khái niệm cơ bản"
- ket-noi-db.md      ← từ H2 "## Kết nối database"
- orm.md             ← từ H2 "## ORM (Session, Model)"
- migration.md       ← từ H2 "## Migration với Alembic"
- bug-setup.md       ← từ H2 "## Bug khi setup"

Confirm để mình migrate?
```

Chỉ migrate sau khi user xác nhận.

#### Cấu trúc subfolder sau khi split

```
khac/sqlalchemy/
├── _index.md           ← BẮT BUỘC — mục lục liệt kê các sub-file
├── khai-niem.md
├── ket-noi-db.md
├── orm.md
├── migration.md
└── bug-setup.md
```

**Quy tắc:**
- Tên subfolder = tên file cũ (không đuôi `.md`). Vd: `sqlalchemy.md` → `sqlalchemy/`.
- Mỗi H2 section trong file cũ → 1 sub-file `.md`, tên kebab-case theo concept.
- Section `🔗 References` cuối file cũ → merge vào `_index.md`.
- Sub-file vẫn theo template chuẩn (có `# <Tên concept>` ở đầu, `## Khái niệm`, `### Ví dụ code`, ...).
- Cross-reference giữa sub-file dùng `[[ket-noi-db]]` (wikilink tên file, không kèm path).

#### Template `_index.md`

```markdown
# <Tên chủ đề> — Mục lục

> 1-2 câu summary chủ đề tổng quát

## Nội dung

- [[khai-niem]] — Khái niệm cơ bản, vì sao cần, so sánh alternative
- [[ket-noi-db]] — Connection string, engine, pool, async vs sync
- [[orm]] — Session, Model declarative, query, relationship
- [[migration]] — Alembic setup, autogenerate, downgrade strategy
- [[bug-setup]] — Common errors khi cài đặt + fix

## 🔗 References
- [Official docs](url)
- Module liên quan: M2 (auth), M5 (course CRUD)
```

#### Sau khi split — rule append vẫn áp dụng

Khi ghi note mới về chủ đề đã split:
1. Tìm sub-file relevant trong subfolder → APPEND vào đó.
2. Nếu concept mới không thuộc sub-file nào → tạo sub-file mới + update `_index.md`.
3. Nếu sub-file lại vượt ngưỡng → KHÔNG split tiếp tầng 2 (subfolder lồng nhau), thay vào đó tách concept ra sub-file riêng cùng cấp.

### File template

Mỗi file note nên có cấu trúc:

```markdown
# <Tên chủ đề chính>

> Brief 1-2 câu summary về chủ đề

---

## <Concept 1>

### Khái niệm
<Giải thích ngắn gọn>

### Ví dụ code
```<language>
<code minimal, focused>
```

### Common pitfall
- <pitfall 1>
- <pitfall 2>

### Khi nào dùng
<use case>

---

## <Concept 2>
...

---

## 🔗 References
- [Official docs](url)
- Module liên quan: M2 (auth), M6 (tanstack query)
- Related notes: [[hooks-nang-cao]], [[forms]]
```

**Frontmatter (OPTIONAL nhưng khuyến khích):**
```markdown
---
tags: [hooks, basic, state]
related: [hooks-nang-cao, forms]
module_refs: [M2, M4, M5]
---
```

### Code examples trong note

- **Ngắn gọn, focus 1 concept** — không paste full file
- **Có comment giải thích** "vì sao" (không phải "làm gì")
- **Comment tiếng Việt OK**
- Nếu code dài → split thành nhiều block với heading giải thích

---

## 🎯 Behavior conventions (cho mọi conversation)

### Communication
- **Tiếng Việt mặc định** + thuật ngữ tiếng Anh trong ngoặc khi cần
- Ngắn gọn, đi thẳng vấn đề — user là người đang học, không cần fluff
- Khi giải thích concept: ưu tiên **ví dụ code thực tế** > lý thuyết
- Mention file path + line number (`file:line`) để user dễ navigate

### Trước khi suggest/recommend
- Nếu là quyết định kiến trúc lớn → đóng vai phản biện, hỏi clarifying question trước
- Nếu là detail code → đề xuất luôn, không hỏi vặt vãnh

### Khi user hỏi "X là gì" / "giải thích X"
- Giải thích — KHÔNG tự động ghi note
- Nếu concept lớn (vd: useReducer, TanStack Query, OAuth flow), có thể nói cuối câu: "_Nếu muốn lưu vào note, nói 'ghi note đi'._"

### Khi user hỏi về project hiện tại
- Tham khảo `.claude/specs/project_description/spec.md` cho yêu cầu + decision đã chốt
- Tham khảo `Ly_thuyet/website_roadmap.md` cho module breakdown + màn hình UI mỗi module
- KHÔNG suggest feature đã decided ngược (vd: KHÔNG suggest subscription khi đã chốt pay-per-course ở Q4)

### Khi user đang ở 1 module cụ thể
- Refer module trong `Ly_thuyet/website_roadmap.md` (vd: "đây là phần của M10 Quiz engine")
- Bring up relevant pitfall + acceptance criteria từ roadmap để user tránh
- Refer concept React/FastAPI cần học từ `Ly_thuyet/react/react_roadmap.md` và `Ly_thuyet/fastapi/fastapi_roadmap.md`

---

## 🚫 Things to AVOID

- Tự động tạo note khi user chưa yêu cầu
- Tạo file `.md` ngoài folder `Ly_thuyet/*` cho mục đích note (nếu cần plan/draft → dùng conversation, không tạo file)
- Override decision trong `spec.md` mà không flag là conflict
- Đề xuất tech stack khác đã chốt (Stripe khi đã chốt VNPay, Subscription khi đã chốt Pay-per-course)
- Comment dư thừa trong code example (chỉ giữ comment WHY, không WHAT)

---

## 📚 Quick reference

| Khi user nói... | Thì... |
|---|---|
| "ghi note về X" / "lưu vào note" | Tạo/append vào `Ly_thuyet/{fastapi,react,react_fastapi_interaction,khac}/` theo rule |
| "X là gì?" / "giải thích X" | Giải thích, KHÔNG tự ghi note |
| "mình đang ở module N" | Refer `Ly_thuyet/website_roadmap.md` section module đó |
| "có vấn đề Y" | Check `.claude/specs/project_description/spec.md` xem đã decide chưa, check pitfall trong `Ly_thuyet/website_roadmap.md` |
| "đề xuất tech cho Z" | Check `spec.md` decision trước, đề xuất phù hợp với stack đã chốt |
| "concept React/FastAPI X" | Refer `Ly_thuyet/react/react_roadmap.md` hoặc `Ly_thuyet/fastapi/fastapi_roadmap.md` theo phase phù hợp |
